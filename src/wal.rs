use crate::{
    entry::{Encoder, Entry},
    errors::{self},
    metrics,
};
use anyhow::{Context, Error, Result};

use std::{
    cell::RefCell,
    collections::HashMap,
    fs::File,
    io::Write,
    path::PathBuf,
    sync::{
        Arc, Mutex, atomic,
        mpsc::{Receiver, SyncSender},
    },
    thread,
};

pub struct WalInner {
    file: Mutex<(File, PathBuf)>,
    dir: String,
    max_size: u64,
    file_size: atomic::AtomicU64,
    last_entry: atomic::AtomicU64,
    next: RefCell<Option<SyncSender<Vec<Entry>>>>,
    receiver: Mutex<Receiver<Entry>>,
    wal_files: Mutex<HashMap<u64, PathBuf>>,
    err_handler: std::sync::Mutex<Box<dyn Fn(anyhow::Error) + Send + Sync>>,
}

impl WalInner {
    pub fn batch_write(&self, items: &[Entry]) -> Result<()> {
        assert!(!items.is_empty(), "Items cannot be empty");
        assert!(
            items[0].id == self.last_entry.load(atomic::Ordering::Relaxed) + 1,
            "Items must be in order"
        );
        self.try_to_rotate()?;

        let begin_ts = std::time::Instant::now();
        // Append data to the stream
        let mut buffer = Vec::new();
        for item in items {
            let data = item.encode();
            buffer.extend_from_slice(&data);
            self.last_entry.store(item.id, atomic::Ordering::SeqCst);
        }

        let mut file_guard = self.file.lock().unwrap();
        match file_guard.0.write_all(&buffer) {
            Ok(_) => {
                // Update the file size
                let _ = self
                    .file_size
                    .fetch_add(buffer.len() as u64, atomic::Ordering::Relaxed);
            }
            Err(e) => {
                return Err(errors::new_io_error(e));
            }
        }
        // Flush the file to ensure all data is written
        file_guard.0.flush().map_err(errors::new_io_error)?;

        let elapsed = begin_ts.elapsed();
        metrics::wal_write_file_seconds.observe(elapsed.as_secs_f64());

        Ok(())
    }

    // Rotate the WAL file
    pub fn try_to_rotate(&self) -> Result<()> {
        let file_size = self.file_size.load(atomic::Ordering::Relaxed);
        if file_size < self.max_size {
            return Ok(());
        }

        let mut file_guard = self.file.lock().unwrap();

        file_guard.0.sync_all().map_err(errors::new_io_error)?;

        let filename = file_guard.1.clone();

        self.wal_files
            .lock()
            .unwrap()
            .insert(self.last_entry.load(atomic::Ordering::Relaxed), filename);

        let filename = std::path::Path::new(&self.dir).join(format!(
            "{}.wal",
            self.last_entry.load(atomic::Ordering::Relaxed) + 1
        ));

        // Close the current file
        *file_guard = (
            File::create(&filename).map_err(errors::new_io_error)?,
            filename.clone(),
        );

        self.file_size.store(0, atomic::Ordering::Relaxed);

        println!("WAL file rotated to {}", filename.display());

        Ok(())
    }

    pub fn gc(&self, last_entry_id: u64) -> Result<()> {
        log::info!(
            "Performing garbage collection on WAL files, last_entry_id: {}",
            last_entry_id
        );
        // Perform garbage collection on the WAL files
        let mut to_removes = vec![];
        let mut wal_files = self.wal_files.lock().unwrap();
        for (id, path) in wal_files.iter() {
            if *id <= last_entry_id {
                // Remove files that are no longer needed
                if let Err(e) = std::fs::remove_file(path) {
                    return Err(errors::new_io_error(e)
                        .context(format!("Failed to remove WAL file: {}", path.display())));
                } else {
                    log::info!("Removed WAL file: {}, last_entry_id {}", path.display(), id);
                }
                to_removes.push(*id);
            }
        }
        for id in to_removes {
            wal_files.remove(&id);
        }
        Ok(())
    }

    pub fn drop_next_sender(&self) {
        self.next.borrow_mut().take();
    }

    pub fn run(&self) -> Result<()> {
        // Start the WAL thread

        let receiver = self.receiver.lock().unwrap();
        loop {
            let begin_ts = std::time::Instant::now();
            let item = match receiver.recv() {
                Ok(item) => item,
                Err(e) => {
                    log::info!("senders are dropped");
                    self.drop_next_sender();
                    return Ok(());
                }
            };

            let mut items = Vec::with_capacity(128);
            items.push(item);
            loop {
                match receiver.try_recv() {
                    Ok(item) => {
                        items.push(item);
                        if items.len() >= 128 {
                            break;
                        }
                    }
                    Err(_) => {
                        break;
                    }
                }
            }
            metrics::wal_recv_entry_seconds.observe(begin_ts.elapsed().as_secs_f64());

            // Write the items to the file
            match self.batch_write(&items) {
                Ok(_) => {}
                Err(e) => {
                    // Handle the error
                    self.err_handler.lock().unwrap()(e);
                    //log.warn!("Error writing to WAL: {:?}", e);
                }
            }

            match self.next.borrow().as_ref().unwrap().send(items) {
                Ok(_) => {}
                Err(e) => {
                    // Handle the error
                    println!("Error sending to next: {:?}", e);
                    self.err_handler.lock().unwrap()(anyhow::anyhow!(
                        "Error sending to next: {:?}",
                        e
                    ));
                }
            }
        }
    }
}

unsafe impl Sync for WalInner {}
unsafe impl Send for WalInner {}

#[derive(Clone)]
pub struct Wal {
    inner: Arc<WalInner>,
    sender: SyncSender<Entry>,
}

impl std::ops::Deref for Wal {
    type Target = WalInner;

    fn deref(&self) -> &Self::Target {
        &self.inner
    }
}

impl Wal {
    pub fn new(
        file: (File, PathBuf),
        dir: String,
        max_size: u64,
        last_entry: u64,
        next: SyncSender<Vec<Entry>>,
        wal_files: HashMap<u64, PathBuf>,
        err_handler: Box<dyn Fn(Error) + Send + Sync>,
    ) -> Self {
        let (sender, receiver) = std::sync::mpsc::sync_channel(1024);
        let file_size = file.0.metadata().expect("Failed to get file metadata").len();
        Wal {
            inner: Arc::new(WalInner {
                dir,
                max_size,
                file: Mutex::new(file),
                next: RefCell::new(Some(next)),
                wal_files: Mutex::new(wal_files),
                receiver: Mutex::new(receiver),
                last_entry: atomic::AtomicU64::new(last_entry),
                file_size: atomic::AtomicU64::new(file_size),
                err_handler: std::sync::Mutex::new(err_handler),
            }),
            sender: sender,
        }
    }

    pub fn clone_inner(&self) -> Arc<WalInner> {
        self.inner.clone()
    }

    pub fn write(&self, item: Entry) -> Result<()> {
        // Append data to the stream
        self.sender.send(item).context("wal sender error")?;
        Ok(())
    }

    pub fn start(&self) -> () {
        // Start the WAL with the given sender
        let _ = thread::Builder::new()
            .name("wals write thread".into())
            .spawn({
                let _self = self.inner.clone();
                move || {
                    _self.run().unwrap_or_else(|e| {
                        log::error!("WAL thread encountered an error: {:?}", e);
                        // Call the error handler if set
                        _self.err_handler.lock().unwrap()(e);
                    })
                }
            });
    }

    pub fn set_err_handler(
        &self,
        err_handler: Box<dyn Fn(Error) + Send + Sync>,
    ) -> Result<(), Error> {
        // Set the error handler
        *self.err_handler.lock().unwrap() = err_handler;
        Ok(())
    }
}

impl Drop for Wal {
    fn drop(&mut self) {
        // Close the WAL file
        log::info!("Dropping WAL, closing sender channel");
    }
}
