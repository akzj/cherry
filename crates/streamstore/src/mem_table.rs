use crate::{entry::Entry, table::StreamTable};
use anyhow::Result;
use std::{
    collections::HashMap,
    io,
    sync::{atomic::AtomicU64, Arc, Mutex, Weak},
};

pub type MemTableArc = Arc<MemTable>;
pub type MemTableWeak = Weak<MemTable>;
pub(crate) type GetStreamOffset = Box<dyn Fn(u64) -> Result<u64, anyhow::Error> + Send + Sync>;
pub struct MemTable {
    stream_tables: Mutex<HashMap<u64, StreamTable>>,
    first_entry: AtomicU64,
    last_entry: AtomicU64,
    size: AtomicU64,
    get_stream_offset: Mutex<GetStreamOffset>,
}

impl MemTable {
    pub fn new(get_stream_offset: GetStreamOffset) -> Self {
        MemTable {
            stream_tables: Mutex::new(HashMap::new()),
            first_entry: AtomicU64::new(0),
            last_entry: AtomicU64::new(0),
            size: AtomicU64::new(0),
            get_stream_offset: Mutex::new(get_stream_offset),
        }
    }

    pub fn get_first_entry(&self) -> u64 {
        self.first_entry.load(std::sync::atomic::Ordering::SeqCst)
    }

    pub fn get_last_entry(&self) -> u64 {
        self.last_entry.load(std::sync::atomic::Ordering::SeqCst)
    }

    pub fn get_size(&self) -> u64 {
        self.size.load(std::sync::atomic::Ordering::SeqCst)
    }

    pub fn get_stream_ids(&self) -> Vec<u64> {
        let guard = self.stream_tables.lock().unwrap();
        guard.keys().cloned().collect()
    }

    pub fn get_stream_tables(&self) -> std::sync::MutexGuard<HashMap<u64, StreamTable>> {
        self.stream_tables.lock().unwrap()
    }

    pub fn get_stream_range(&self, stream_id: u64) -> Option<(u64, u64)> {
        let guard = self.stream_tables.lock().unwrap();
        if let Some(stream_table) = guard.get(&stream_id) {
            return stream_table.get_stream_range();
        }
        None
    }

    pub fn read_stream(&self, stream_id: u64, offset: u64, buf: &mut [u8]) -> io::Result<usize> {
        let guard = self.stream_tables.lock().unwrap();
        if let Some(stream_table) = guard.get(&stream_id) {
            return stream_table.read_stream(offset, buf);
        }
        Err(io::Error::new(
            io::ErrorKind::NotFound,
            format!("Stream ID {} not found", stream_id),
        ))
    }

    // return the stream offset
    pub fn append(&self, entry: &Entry) -> Result<u64> {
        assert!(entry.stream_id != 0, "Stream ID cannot be zero");
        assert!(entry.data.len() > 0, "Entry data cannot be empty");
        assert!(entry.id > 0, "Entry ID must be greater than zero");
        assert!(
            entry.id > self.last_entry.load(std::sync::atomic::Ordering::SeqCst),
            "Entry ID must be greater than the last entry ID"
        );

        let data_len = entry.data.len() as u64;

        let mut guard = self.stream_tables.lock().unwrap();

        let res = match guard.get_mut(&entry.stream_id) {
            Some(stream_table) => stream_table,
            None => {
                let offset = match self.get_stream_offset.lock().unwrap()(entry.stream_id) {
                    Ok(offset) => offset,
                    Err(e) => return Err(e),
                };
                guard.insert(entry.stream_id, StreamTable::new(entry.stream_id, offset));
                guard.get_mut(&entry.stream_id).unwrap()
            }
        };

        // Append the data to the stream table
        let offset = res.append(&entry.data)?;

        // Update the stream table
        self.size
            .fetch_add(data_len, std::sync::atomic::Ordering::SeqCst);

        self.last_entry
            .store(entry.id, std::sync::atomic::Ordering::SeqCst);

        if self.first_entry.load(std::sync::atomic::Ordering::SeqCst) == 0 {
            self.first_entry
                .store(entry.id, std::sync::atomic::Ordering::SeqCst);
        }
        Ok(offset)
    }
}

/// Asserts that the type `T` is `Send` and `Sync`.
/// This is useful for ensuring that types used in concurrent contexts are safe to share across threads.
#[allow(unused)]
fn assert_send_sync<T: Send + Sync>() {}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::entry::Entry;

    #[test]
    fn test_stream_data() {
        assert_send_sync::<MemTable>();
    }

    #[test]
    fn test_mem_table_new() {
        let get_stream_offset = Box::new(|_stream_id| Ok(0));
        let mem_table = MemTable::new(get_stream_offset);
        
        assert_eq!(mem_table.get_first_entry(), 0);
        assert_eq!(mem_table.get_last_entry(), 0);
        assert_eq!(mem_table.get_size(), 0);
        assert!(mem_table.get_stream_ids().is_empty());
    }

    #[test]
    fn test_mem_table_append_single_entry() {
        let get_stream_offset = Box::new(|_stream_id| Ok(0));
        let mem_table = MemTable::new(get_stream_offset);
        
        let entry = Entry {
            version: 1,
            id: 1,
            stream_id: 100,
            data: b"test data".to_vec(),
            callback: None,
        };

        let offset = mem_table.append(&entry).unwrap();
        assert_eq!(offset, 9); // Length of "test data"
        
        assert_eq!(mem_table.get_first_entry(), 1);
        assert_eq!(mem_table.get_last_entry(), 1);
        assert_eq!(mem_table.get_size(), 9);
        assert_eq!(mem_table.get_stream_ids(), vec![100]);
    }

    #[test]
    fn test_mem_table_append_multiple_entries() {
        let get_stream_offset = Box::new(|_stream_id| Ok(0));
        let mem_table = MemTable::new(get_stream_offset);
        
        let entries = vec![
            Entry {
                version: 1,
                id: 1,
                stream_id: 100,
                data: b"first".to_vec(),
                callback: None,
            },
            Entry {
                version: 1,
                id: 2,
                stream_id: 100,
                data: b"second".to_vec(),
                callback: None,
            },
            Entry {
                version: 1,
                id: 3,
                stream_id: 200,
                data: b"third".to_vec(),
                callback: None,
            },
        ];

        // For stream 100: first entry at offset 0, gets offset 5
        let offset1 = mem_table.append(&entries[0]).unwrap();
        assert_eq!(offset1, 5); // 0 + 5
        
        // For stream 100: second entry continues from offset 5, gets offset 11
        let offset2 = mem_table.append(&entries[1]).unwrap();
        assert_eq!(offset2, 11); // 5 + 6
        
        // For stream 200: first entry at offset 0, gets offset 5
        let offset3 = mem_table.append(&entries[2]).unwrap();
        assert_eq!(offset3, 5); // 0 + 5 (new stream starts at 0)
        
        assert_eq!(mem_table.get_first_entry(), 1);
        assert_eq!(mem_table.get_last_entry(), 3);
        assert_eq!(mem_table.get_size(), 16); // 5 + 6 + 5
        
        let mut stream_ids = mem_table.get_stream_ids();
        stream_ids.sort();
        assert_eq!(stream_ids, vec![100, 200]);
    }

    #[test]
    fn test_mem_table_get_stream_range() {
        let get_stream_offset = Box::new(|_stream_id| Ok(0));
        let mem_table = MemTable::new(get_stream_offset);
        
        // Test with non-existent stream
        assert_eq!(mem_table.get_stream_range(999), None);
        
        let entry = Entry {
            version: 1,
            id: 1,
            stream_id: 100,
            data: b"test data".to_vec(),
            callback: None,
        };

        mem_table.append(&entry).unwrap();
        
        let range = mem_table.get_stream_range(100);
        assert_eq!(range, Some((0, 9)));
    }

    #[test]
    fn test_mem_table_read_stream() {
        let get_stream_offset = Box::new(|_stream_id| Ok(0));
        let mem_table = MemTable::new(get_stream_offset);
        
        let entry = Entry {
            version: 1,
            id: 1,
            stream_id: 100,
            data: b"hello world".to_vec(),
            callback: None,
        };

        mem_table.append(&entry).unwrap();
        
        // Test reading the entire data
        let mut buf = vec![0u8; 11];
        let bytes_read = mem_table.read_stream(100, 0, &mut buf).unwrap();
        assert_eq!(bytes_read, 11);
        assert_eq!(&buf, b"hello world");
        
        // Test reading partial data
        let mut buf = vec![0u8; 5];
        let bytes_read = mem_table.read_stream(100, 0, &mut buf).unwrap();
        assert_eq!(bytes_read, 5);
        assert_eq!(&buf, b"hello");
        
        // Test reading from offset
        let mut buf = vec![0u8; 5];
        let bytes_read = mem_table.read_stream(100, 6, &mut buf).unwrap();
        assert_eq!(bytes_read, 5);
        assert_eq!(&buf, b"world");
        
        // Test reading non-existent stream
        let mut buf = vec![0u8; 5];
        let result = mem_table.read_stream(999, 0, &mut buf);
        assert!(result.is_err());
        assert_eq!(result.unwrap_err().kind(), std::io::ErrorKind::NotFound);
    }

    #[test]
    fn test_mem_table_with_custom_stream_offset() {
        let get_stream_offset = Box::new(|stream_id| {
            match stream_id {
                100 => Ok(1000),
                200 => Ok(2000),
                _ => Ok(0),
            }
        });
        let mem_table = MemTable::new(get_stream_offset);
        
        let entry1 = Entry {
            version: 1,
            id: 1,
            stream_id: 100,
            data: b"data1".to_vec(),
            callback: None,
        };
        
        let entry2 = Entry {
            version: 1,
            id: 2,
            stream_id: 200,
            data: b"data2".to_vec(),
            callback: None,
        };

        let offset1 = mem_table.append(&entry1).unwrap();
        let offset2 = mem_table.append(&entry2).unwrap();
        
        assert_eq!(offset1, 1005); // 1000 + 5
        assert_eq!(offset2, 2005); // 2000 + 5
        
        assert_eq!(mem_table.get_stream_range(100), Some((1000, 1005)));
        assert_eq!(mem_table.get_stream_range(200), Some((2000, 2005)));
    }

    #[test]
    #[should_panic(expected = "Stream ID cannot be zero")]
    fn test_mem_table_append_zero_stream_id() {
        let get_stream_offset = Box::new(|_stream_id| Ok(0));
        let mem_table = MemTable::new(get_stream_offset);
        
        let entry = Entry {
            version: 1,
            id: 1,
            stream_id: 0, // Invalid stream ID
            data: b"test".to_vec(),
            callback: None,
        };

        mem_table.append(&entry).unwrap();
    }

    #[test]
    #[should_panic(expected = "Entry data cannot be empty")]
    fn test_mem_table_append_empty_data() {
        let get_stream_offset = Box::new(|_stream_id| Ok(0));
        let mem_table = MemTable::new(get_stream_offset);
        
        let entry = Entry {
            version: 1,
            id: 1,
            stream_id: 100,
            data: Vec::new(), // Empty data
            callback: None,
        };

        mem_table.append(&entry).unwrap();
    }

    #[test]
    #[should_panic(expected = "Entry ID must be greater than zero")]
    fn test_mem_table_append_zero_entry_id() {
        let get_stream_offset = Box::new(|_stream_id| Ok(0));
        let mem_table = MemTable::new(get_stream_offset);
        
        let entry = Entry {
            version: 1,
            id: 0, // Invalid entry ID
            stream_id: 100,
            data: b"test".to_vec(),
            callback: None,
        };

        mem_table.append(&entry).unwrap();
    }

    #[test]
    #[should_panic(expected = "Entry ID must be greater than the last entry ID")]
    fn test_mem_table_append_non_increasing_entry_id() {
        let get_stream_offset = Box::new(|_stream_id| Ok(0));
        let mem_table = MemTable::new(get_stream_offset);
        
        let entry1 = Entry {
            version: 1,
            id: 2,
            stream_id: 100,
            data: b"first".to_vec(),
            callback: None,
        };
        
        let entry2 = Entry {
            version: 1,
            id: 1, // Lower than previous entry ID
            stream_id: 100,
            data: b"second".to_vec(),
            callback: None,
        };

        mem_table.append(&entry1).unwrap();
        mem_table.append(&entry2).unwrap(); // Should panic
    }

    #[test]
    fn test_mem_table_get_stream_offset_error() {
        let get_stream_offset = Box::new(|stream_id| {
            if stream_id == 999 {
                Err(anyhow::anyhow!("Stream offset error"))
            } else {
                Ok(0)
            }
        });
        let mem_table = MemTable::new(get_stream_offset);
        
        let entry = Entry {
            version: 1,
            id: 1,
            stream_id: 999,
            data: b"test".to_vec(),
            callback: None,
        };

        let result = mem_table.append(&entry);
        assert!(result.is_err());
        assert!(result.unwrap_err().to_string().contains("Stream offset error"));
    }

    #[test]
    fn test_mem_table_concurrent_access() {
        use std::sync::{Arc, atomic::{AtomicU64, Ordering}};
        use std::thread;
        
        let get_stream_offset = Box::new(|_stream_id| Ok(0));
        let mem_table = Arc::new(MemTable::new(get_stream_offset));
        let entry_id_counter = Arc::new(AtomicU64::new(0));
        
        let mut handles = vec![];
        
        // Spawn multiple threads to append entries
        for i in 1..=10 {
            let mem_table_clone = Arc::clone(&mem_table);
            let counter_clone = Arc::clone(&entry_id_counter);
            let handle = thread::spawn(move || {
                let entry_id = counter_clone.fetch_add(1, Ordering::SeqCst) + 1;
                let entry = Entry {
                    version: 1,
                    id: entry_id,
                    stream_id: 100 + (i % 3), // Use different streams to reduce contention
                    data: format!("data{}", i).into_bytes(),
                    callback: None,
                };
                mem_table_clone.append(&entry)
            });
            handles.push(handle);
        }
        
        // Wait for all threads to complete
        let mut results = vec![];
        for handle in handles {
            results.push(handle.join().unwrap());
        }
        
        // Check that all operations succeeded with proper ID ordering
        let successful_count = results.iter().filter(|r| r.is_ok()).count();
        assert_eq!(successful_count, 10);
        
        // Verify final state
        assert_eq!(mem_table.get_last_entry(), 10);
        assert_eq!(mem_table.get_first_entry(), 1);
    }
}
