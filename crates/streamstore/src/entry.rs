use std::{
    fs::File,
    io::Read,
};

use anyhow::{Error, anyhow};

use crate::errors;
use anyhow::{Context, Result};

pub type AppendEntryResultFn = Box<dyn Fn(Result<u64>) -> () + Send + Sync>;
pub type DataType = Vec<u8>;

pub struct Entry {
    // auto increment id
    pub version: u8,
    pub id: u64,
    pub stream_id: u64,
    pub data: DataType,
    pub callback: Option<AppendEntryResultFn>,
}

pub trait Encoder {
    fn encode(&self) -> Vec<u8>;
}

impl Encoder for Entry {
    fn encode(&self) -> Vec<u8> {
        // Encode the item into bytes
        let mut data = Vec::new();
        data.extend_from_slice(&self.version.to_le_bytes());

        if self.version == 1 {
            data.extend_from_slice(&self.id.to_le_bytes());
            data.extend_from_slice(&self.stream_id.to_le_bytes());
            data.extend_from_slice(&(self.data.len() as u32).to_le_bytes());
            data.extend_from_slice(&self.data);
        } else {
            panic!("Unsupported version");
        }
        data
    }
}

pub trait Decoder<'a> {
    fn decode(&mut self, closure: Box<dyn FnMut(Entry) -> Result<bool, Error> + 'a>) -> Result<()>;
}

impl<'a> Decoder<'a> for File {
    fn decode(
        &mut self,
        mut closure: Box<dyn FnMut(Entry) -> Result<bool, Error> + 'a>,
    ) -> Result<()> {
        // Decode the item from bytes
        loop {
            let mut entry = Entry::default();

            let mut version = [0u8; 1];
            match self.read_exact(&mut version) {
                Ok(()) => {
                    entry.version = u8::from_le_bytes(version);
                }
                Err(ref e) if e.kind() == std::io::ErrorKind::UnexpectedEof => break, // End of file
                Err(e) => return Err(anyhow!(e)),
            }
            if entry.version == 1 {
                let mut id_buf = [0u8; 8];
                self.read_exact(&mut id_buf).context("")?;
                entry.id = u64::from_le_bytes(id_buf);

                let mut stream_id_buf = [0u8; 8];
                self.read_exact(&mut stream_id_buf)
                    .context("Failed to read stream_id")?;
                entry.stream_id = u64::from_le_bytes(stream_id_buf);

                let mut data_size_buf = [0u8; 4];
                self.read_exact(&mut data_size_buf)
                    .context("Failed to read data size")?;

                let data_size = u32::from_le_bytes(data_size_buf);

                entry.data.resize(data_size as usize, 0);
                self.read_exact(&mut entry.data)
                    .map_err(errors::new_io_error)?;
            } else {
                log::error!("Unsupported version: {}", entry.version);
                return Err(anyhow!(errors::new_invalid_data()));
            }
            // Call the closure with the decoded entry
            if !closure(entry)? {
                break;
            }
        }
        Ok(())
    }
}

impl Entry {
    pub fn default() -> Self {
        Entry {
            version: 0,
            id: 0,
            stream_id: 0,
            data: Vec::new(),
            callback: None,
        }
    }
}

impl std::fmt::Debug for Entry {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        f.debug_struct("Entry")
            .field("version", &self.version)
            .field("id", &self.id)
            .field("stream_id", &self.stream_id)
            .field("data", &self.data)
            .finish()
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::io::Write;
    use std::fs;

    #[test]
    fn test_entry_encode() {
        let entry = Entry {
            version: 1,
            id: 1,
            stream_id: 1,
            data: "hello world".as_bytes().to_vec(),
            callback: None,
        };

        let encoded = entry.encode();

        // write the encoded data to a file
        let mut file = File::create("test_entry.bin").expect("Failed to create file");
        file.write_all(&encoded).expect("Failed to write to file");

        file.sync_all().expect("Failed to flush file");
        drop(file);

        // Read the file back and decode
        let mut file = File::open("test_entry.bin").expect("Failed to open file");

        let meta = file.metadata().expect("Failed to read metadata");
        assert!(meta.len() > 0, "File should not be empty");

        file.decode(Box::new(|decoded_entry| {
            assert_eq!(decoded_entry.version, 1);
            assert_eq!(decoded_entry.id, 1);
            assert_eq!(decoded_entry.stream_id, 1);
            assert_eq!(decoded_entry.data, b"hello world");
            Ok(true)
        }))
        .expect("Failed to decode entry");

        // Clean up
        let _ = fs::remove_file("test_entry.bin");
    }

    #[test]
    fn test_entry_default() {
        let entry = Entry::default();
        assert_eq!(entry.version, 0);
        assert_eq!(entry.id, 0);
        assert_eq!(entry.stream_id, 0);
        assert!(entry.data.is_empty());
        assert!(entry.callback.is_none());
    }

    #[test]
    fn test_entry_debug() {
        let entry = Entry {
            version: 1,
            id: 42,
            stream_id: 123,
            data: vec![1, 2, 3],
            callback: None,
        };
        let debug_str = format!("{:?}", entry);
        assert!(debug_str.contains("version: 1"));
        assert!(debug_str.contains("id: 42"));
        assert!(debug_str.contains("stream_id: 123"));
        assert!(debug_str.contains("data: [1, 2, 3]"));
    }

    #[test]
    fn test_entry_encode_different_versions() {
        let entry = Entry {
            version: 1,
            id: 100,
            stream_id: 200,
            data: vec![0x41, 0x42, 0x43], // "ABC"
            callback: None,
        };

        let encoded = entry.encode();
        
        // Check the encoded format
        assert_eq!(encoded[0], 1); // version
        assert_eq!(u64::from_le_bytes([encoded[1], encoded[2], encoded[3], encoded[4], encoded[5], encoded[6], encoded[7], encoded[8]]), 100); // id
        assert_eq!(u64::from_le_bytes([encoded[9], encoded[10], encoded[11], encoded[12], encoded[13], encoded[14], encoded[15], encoded[16]]), 200); // stream_id
        assert_eq!(u32::from_le_bytes([encoded[17], encoded[18], encoded[19], encoded[20]]), 3); // data length
        assert_eq!(&encoded[21..24], &[0x41, 0x42, 0x43]); // data
    }

    #[test]
    #[should_panic(expected = "Unsupported version")]
    fn test_entry_encode_unsupported_version() {
        let entry = Entry {
            version: 2, // Unsupported version
            id: 1,
            stream_id: 1,
            data: vec![1, 2, 3],
            callback: None,
        };
        entry.encode();
    }

    #[test]
    fn test_entry_decode_multiple_entries() {
        let entries = vec![
            Entry {
                version: 1,
                id: 1,
                stream_id: 10,
                data: "first".as_bytes().to_vec(),
                callback: None,
            },
            Entry {
                version: 1,
                id: 2,
                stream_id: 20,
                data: "second".as_bytes().to_vec(),
                callback: None,
            },
            Entry {
                version: 1,
                id: 3,
                stream_id: 30,
                data: "third".as_bytes().to_vec(),
                callback: None,
            },
        ];

        // Encode all entries to a file
        let mut file = File::create("test_multiple_entries.bin").expect("Failed to create file");
        for entry in &entries {
            file.write_all(&entry.encode()).expect("Failed to write entry");
        }
        file.sync_all().expect("Failed to flush file");
        drop(file);

        // Decode all entries
        let mut file = File::open("test_multiple_entries.bin").expect("Failed to open file");
        let mut decoded_entries = Vec::new();
        
        file.decode(Box::new(|entry| {
            decoded_entries.push(entry);
            Ok(true)
        })).expect("Failed to decode entries");

        assert_eq!(decoded_entries.len(), 3);
        
        for (i, decoded) in decoded_entries.iter().enumerate() {
            assert_eq!(decoded.version, entries[i].version);
            assert_eq!(decoded.id, entries[i].id);
            assert_eq!(decoded.stream_id, entries[i].stream_id);
            assert_eq!(decoded.data, entries[i].data);
        }

        // Clean up
        let _ = fs::remove_file("test_multiple_entries.bin");
    }

    #[test]
    fn test_entry_decode_empty_file() {
        // Create an empty file
        let file = File::create("test_empty.bin").expect("Failed to create file");
        drop(file);

        let mut file = File::open("test_empty.bin").expect("Failed to open file");
        let mut count = 0;
        
        file.decode(Box::new(|_entry| {
            count += 1;
            Ok(true)
        })).expect("Failed to decode empty file");

        assert_eq!(count, 0);

        // Clean up
        let _ = fs::remove_file("test_empty.bin");
    }

    #[test]
    fn test_entry_decode_early_termination() {
        let entries = vec![
            Entry {
                version: 1,
                id: 1,
                stream_id: 10,
                data: "first".as_bytes().to_vec(),
                callback: None,
            },
            Entry {
                version: 1,
                id: 2,
                stream_id: 20,
                data: "second".as_bytes().to_vec(),
                callback: None,
            },
        ];

        // Encode entries to a file
        let mut file = File::create("test_early_term.bin").expect("Failed to create file");
        for entry in &entries {
            file.write_all(&entry.encode()).expect("Failed to write entry");
        }
        file.sync_all().expect("Failed to flush file");
        drop(file);

        // Decode with early termination
        let mut file = File::open("test_early_term.bin").expect("Failed to open file");
        let mut count = 0;
        
        file.decode(Box::new(|_entry| {
            count += 1;
            if count == 1 {
                Ok(false) // Stop after first entry
            } else {
                Ok(true)
            }
        })).expect("Failed to decode with early termination");

        assert_eq!(count, 1);

        // Clean up
        let _ = fs::remove_file("test_early_term.bin");
    }

    #[test]
    fn test_entry_encode_large_data() {
        let large_data = vec![0x42; 1024 * 1024]; // 1MB of data
        let entry = Entry {
            version: 1,
            id: 999,
            stream_id: 888,
            data: large_data.clone(),
            callback: None,
        };

        let encoded = entry.encode();
        
        // Write and read back
        let mut file = File::create("test_large_entry.bin").expect("Failed to create file");
        file.write_all(&encoded).expect("Failed to write to file");
        file.sync_all().expect("Failed to flush file");
        drop(file);

        let mut file = File::open("test_large_entry.bin").expect("Failed to open file");
        file.decode(Box::new(|decoded_entry| {
            assert_eq!(decoded_entry.version, 1);
            assert_eq!(decoded_entry.id, 999);
            assert_eq!(decoded_entry.stream_id, 888);
            assert_eq!(decoded_entry.data.len(), 1024 * 1024);
            assert_eq!(decoded_entry.data, large_data);
            Ok(true)
        })).expect("Failed to decode large entry");

        // Clean up
        let _ = fs::remove_file("test_large_entry.bin");
    }
}
