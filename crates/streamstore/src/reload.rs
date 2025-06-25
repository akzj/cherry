use anyhow::{Context, Result};
use core::hash;
use std::{
    collections::{HashMap, VecDeque, hash_map},
    fs::{File, OpenOptions},
    io::Seek,
    path::PathBuf,
    rc::Rc,
    sync::{Arc, Mutex},
    vec,
};

use crate::{
    entry::Decoder,
    errors,
    mem_table::{GetStreamOffset, MemTable},
    segments::Segment, StreamId,
};

pub fn reload_segments(segment_path: &str, check_crc: bool) -> Result<VecDeque<Arc<Segment>>> {
    // Check if the segment path exists
    if !std::path::Path::new(segment_path).exists() {
        // create the segment path if it does not exist
        std::fs::create_dir_all(segment_path).context("Failed to create segment directory")?;
        log::info!("Segment directory created: {}", segment_path);
    }

    let mut segment_files = VecDeque::new();
    for entry in std::fs::read_dir(&segment_path).context("Failed to read segment directory")? {
        let entry = entry.map_err(errors::new_io_error)?;
        if !entry.file_type().map_err(errors::new_io_error)?.is_file() {
            continue;
        }
        //segment path join file name
        let filename = std::path::Path::new(&segment_path).join(entry.file_name());
        // check if file name is valid
        if !filename.extension().map_or(false, |ext| ext == "seg") {
            log::warn!("Invalid segment file name: {:?}", filename);
            continue;
        }

        let segment = Segment::open(&filename)?;

        if check_crc {
            // check crc
            let begin = std::time::Instant::now();
            segment.check_crc().context(format!(
                "Failed to check CRC for segment file: {:?}",
                filename
            ))?;
            log::info!(
                "CRC check passed for segment file: {:?} elapsed seconds {}",
                filename,
                begin.elapsed().as_secs()
            );
        }

        segment_files.push_back(std::sync::Arc::new(segment));
    }

    segment_files
        .make_contiguous()
        .sort_by(|a, b| -> std::cmp::Ordering { a.entry_index().0.cmp(&b.entry_index().0) });

    Ok(segment_files)
}

fn list_wal_files(wal_path: &str) -> Result<Vec<(String, u64)>> {
    let mut wals = vec![];

    // read file from wal dir
    for entry in std::fs::read_dir(&wal_path).context("read wals dir failed")? {
        let entry = entry.context("read dir entry")?;
        if !entry
            .file_type()
            .context("read dir entry file_type")?
            .is_file()
        {
            continue;
        }
        //segment path join file name
        if let Some(filename) = std::path::Path::new(&wal_path)
            .join(entry.file_name())
            .to_str()
        {
            // check if file name is valid
            if !filename.ends_with(".wal") {
                // println!("Invalid wal file name: {}", filename);
                log::warn!("Invalid wal file name: {}", filename);
                continue;
            }

            // Open the WAL file
            let mut file = File::open(filename).map_err(errors::new_io_error)?;

            // check file is empty
            if file.metadata().map_err(errors::new_io_error)?.len() == 0 {
                drop(file);
                log::warn!("WAL file is empty: {}. delete it", filename);
                std::fs::remove_file(filename).context("Failed to remove empty WAL file")?;
                continue;
            }

            let mut entry_index = 0;
            // Decode the entries from the WAL file
            file.decode(Box::new(|entry| {
                // Handle the entry
                log::debug!("decode {} first entry id {}", filename, entry.id);
                entry_index = entry.id;
                Ok(false)
            }))?;

            wals.push((filename.to_string(), entry_index));
        }
    }
    wals.sort_by(|a, b| a.1.cmp(&b.1));

    log::debug!("list wals success,files {:?}", wals);
    Ok(wals)
}

pub fn reload_wals(
    wal_path: &str,
    last_segment_entry_index: u64,
    max_table_size: u64,
    offset_map: &mut hash_map::HashMap<StreamId, u64>,
) -> Result<(
    VecDeque<Rc<MemTable>>,
    HashMap<u64, PathBuf>,
    (File, PathBuf),
)> {
    // Check if the WAL path exists
    if !std::path::Path::new(wal_path).exists() {
        // create the wal path if it does not exist
        std::fs::create_dir_all(wal_path).context("Failed to create WAL directory")?;
        log::info!("WAL directory created: {}", wal_path);
    }

    let offset_map = Arc::new(Mutex::new(offset_map.clone()));

    // Create a closure to get the stream offset
    let make_stream_offset_fn = || -> _ {
        let offset_map = offset_map.clone();
        Box::new({
            move |stream_id| match offset_map.lock().unwrap().get(&stream_id) {
                Some(offset) => {
                    log::debug!("Get stream offset for stream_id {}: {}", stream_id, offset);
                    Ok(*offset)
                }
                None => Ok(0), // Default to 0 if not found
            }
        })
    };

    let wals = list_wal_files(wal_path)?;
    let mut files = HashMap::new();
    let mut entry_index = 0;
    let mut table = Rc::new(MemTable::new(make_stream_offset_fn()));
    let mut tables = VecDeque::new();
    // Reload the WAL files
    for (filename, _entry_index) in &wals {
        log::debug!("Reloading WAL file: {}", filename);
        let mut file = File::open(&filename).map_err(errors::new_io_error)?;
        let mut count = 0;

        file.decode(Box::new(|entry| {
            count += 1;
            // Handle the entry
            if entry.id <= last_segment_entry_index {
                return Ok(true);
            }

            let _ = table.append(&entry).unwrap();
            // check table size > max_table_size
            if table.get_size() > max_table_size {
                log::info!(
                    "Table size {} is greater than max table size {}, creating new table",
                    table.get_size(),
                    max_table_size
                );

                for stream_id in table.get_stream_ids() {
                    let (_begin, end) = table.get_stream_range(stream_id).unwrap();
                    log::debug!(
                        "Stream ID {} range: begin {}, end {}",
                        stream_id,
                        _begin,
                        end
                    );
                    offset_map.lock().unwrap().insert(stream_id, end);
                }

                tables.push_back(table.clone());
                // create new segment
                table = Rc::new(MemTable::new(make_stream_offset_fn()));
            }
            entry_index = entry.id;
            Ok(true)
        }))?;

        if entry_index < last_segment_entry_index {
            log::info!(
                "WAL file {} all entries before the last segment entry index {}. delete it.",
                filename,
                last_segment_entry_index
            );
            std::fs::remove_file(filename).context("Failed to remove WAL file")?;
            log::info!("Deleted WAL file: {} success", filename);
            continue;
        }
        files.insert(entry_index, PathBuf::from(filename).to_path_buf());
        log::debug!("Reloaded {} entries from WAL file: {}", count, filename);
    }

    // remove the last entry index from files
    files.remove(&entry_index);

    tables.push_back(table.clone());
    log::info!("Reloaded {} tables from WAL files", tables.len());

    let file_name = if wals.is_empty() {
        std::path::Path::new(&wal_path).join(format!("{}.wal", entry_index + 1))
    } else {
        std::path::Path::new(&wals.last().unwrap().0).to_path_buf()
    };

    // open wal for writing
    let mut file = OpenOptions::new()
        .write(true)
        .create(true)
        .open(file_name.clone())
        .map_err(errors::new_io_error)?;

    // seek to the end of the file
    file.seek(std::io::SeekFrom::End(0))
        .map_err(errors::new_io_error)?;

    Ok((tables, files, (file, file_name)))
}
