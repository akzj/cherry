use std::{io, slice::Iter};

use anyhow::Result;

use crate::StreamId;

const STREAM_DATA_BUFFER_CAP: u64 = 128 << 10; // 128KB

pub struct StreamData {
    stream_id: StreamId,
    offset: u64,
    data: Vec<u8>,
}

impl StreamData {
    pub fn new(stream_id: StreamId, offset: u64, buffer_cap: u64) -> Self {
        StreamData {
            stream_id,
            offset,
            data: Vec::with_capacity(buffer_cap as usize),
        }
    }

    // Fill the buffer with data
    // If the buffer is full, return the remaining data
    // If the buffer is not full, return None
    pub fn fill<'a>(&mut self, data: &'a [u8]) -> Result<(usize, Option<&'a [u8]>)> {
        let available = self.cap_remaining().min(data.len());
        self.data.extend_from_slice(&data[..available as usize]);

        let remaining_data = if available < data.len() {
            Some(&data[available as usize..])
        } else {
            None
        };

        Ok((available, remaining_data))
    }

    pub fn get_stream_range(&self) -> Option<(u64, u64)> {
        if self.data.is_empty() {
            return None;
        }
        let start = self.offset;
        let end = self.offset + self.data.len() as u64;
        Some((start, end))
    }

    pub fn size(&self) -> u64 {
        self.data.len() as u64
    }

    pub fn data(&self) -> &[u8] {
        &self.data
    }

    pub fn cap_remaining(&self) -> usize {
        self.data.capacity() - self.data.len()
    }
}

pub struct StreamTable {
    stream_id: StreamId,
    offset: u64,
    size: u64,
    stream_datas: Vec<StreamData>,
}

impl StreamTable {
    pub fn new(stream_id: StreamId, offset: u64) -> Self {
        StreamTable {
            stream_id,
            offset: offset,
            size: 0,
            stream_datas: Vec::new(),
        }
    }

    pub fn stream_id(&self) -> StreamId {
        self.stream_id
    }
    pub fn offset(&self) -> u64 {
        self.offset
    }
    pub fn size(&self) -> u64 {
        self.size
    }
    pub fn stream_datas(&self) -> Iter<StreamData> {
        self.stream_datas.iter()
    }

    pub fn append(&mut self, data: &[u8]) -> Result<u64> {
        if self.stream_datas.is_empty() || self.stream_datas.last().unwrap().cap_remaining() == 0 {
            if !self.stream_datas.is_empty() {
                assert_eq!(
                    self.stream_datas.last().unwrap().size(),
                    STREAM_DATA_BUFFER_CAP
                );
            }

            self.stream_datas.push(StreamData::new(
                self.stream_id,
                self.offset + self.size,
                STREAM_DATA_BUFFER_CAP,
            ));
        }

        let stream_data = self.stream_datas.last_mut().unwrap();
        let (size, remain_buffer) = stream_data.fill(data)?;
        self.size += size as u64;

        // If the buffer is full, we need to create a new buffer
        if let Some(buffer) = remain_buffer {
            return self.append(buffer);
        }

        Ok(self.offset + self.size)
    }

    pub fn get_stream_range(&self) -> Option<(u64, u64)> {
        if self.stream_datas.is_empty() {
            return None;
        }
        return Some((self.offset, self.offset + self.size));
    }

    pub fn print_stream_meta(&self) {
        for (i, stream_data) in self.stream_datas.iter().enumerate() {
            assert!(stream_data.stream_id == self.stream_id);
            if i != self.stream_datas.len() - 1 {
                assert_eq!(stream_data.size(), STREAM_DATA_BUFFER_CAP);
            }
        }
    }

    pub fn crc64(&self) -> u64 {
        let crc64 = crc::Crc::<u64>::new(&crc::CRC_64_REDIS);
        let mut digest = crc64.digest();
        for stream_data in &self.stream_datas {
            digest.update(&stream_data.data);
        }
        digest.finalize()
    }

    pub fn read_stream(&self, offset: u64, buf: &mut [u8]) -> io::Result<usize> {
        self.print_stream_meta();

        let mut offset = offset;
        let mut size = buf.len() as u64;
        let mut copied_size = 0;

        // find the first stream data that offset <= offset by quick search
        let res = self.stream_datas.binary_search_by(|stream_data| {
            let (_begin, end) = stream_data.get_stream_range().unwrap();
            end.cmp(&offset)
        });
        let mut index = match res {
            Ok(index) => index + 1, // we want the first stream data that starts after the offset
            Err(index) => index,
        };

        if index >= self.stream_datas.len() {
            log::debug!(
                "Offset {} find index {} is beyond the last stream data [{},{}), returning 0 bytes read",
                offset,
                index,
                self.stream_datas.last().unwrap().offset,
                self.stream_datas.last().unwrap().offset + self.stream_datas.last().unwrap().size()
            );
            return Ok(0);
        }
        // read the data from the stream data
        while index < self.stream_datas.len() && size > 0 {
            let stream_data = &self.stream_datas[index];
            let stream_data_offset = stream_data.offset;
            let stream_data_size = stream_data.size();

            assert!(
                stream_data_offset <= offset && offset <= stream_data_offset + stream_data_size
            );
            // we can read the data from this stream data

            let start = (offset - stream_data_offset) as usize;
            let end = (start + size as usize).min(stream_data_size as usize);

            // copy the data to the buffer
            let data_to_copy = &stream_data.data[start..end];
            let bytes_to_copy = data_to_copy.len();
            buf[copied_size as usize..(copied_size as u64 + bytes_to_copy as u64) as usize]
                .copy_from_slice(data_to_copy);

            copied_size += bytes_to_copy;
            size -= (bytes_to_copy) as u64;
            offset += bytes_to_copy as u64;
            index += 1;
        }

        Ok(copied_size)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_stream_data_new() {
        let buffer_cap = 1024u64;
        let stream_data = StreamData::new(123, 1000, buffer_cap);
        assert_eq!(stream_data.stream_id, 123);
        assert_eq!(stream_data.offset, 1000);
        assert_eq!(stream_data.data.capacity(), buffer_cap as usize);
        assert_eq!(stream_data.size(), 0);
        assert_eq!(stream_data.cap_remaining(), buffer_cap as usize);
        assert_eq!(stream_data.get_stream_range(), None);
    }

    #[test]
    fn test_stream_data_fill() {
        let buffer_cap = 100u64;
        let mut stream_data = StreamData::new(1, 0, buffer_cap);

        // Fill with data that fits
        let data1 = b"hello world";
        let (filled, remaining) = stream_data.fill(data1).unwrap();
        assert_eq!(filled, 11);
        assert!(remaining.is_none());
        assert_eq!(stream_data.size(), 11);
        assert_eq!(stream_data.cap_remaining(), (buffer_cap as usize) - 11);
        assert_eq!(stream_data.get_stream_range(), Some((0, 11)));

        // Fill with more data
        let data2 = b" how are you?";
        let (filled, remaining) = stream_data.fill(data2).unwrap();
        assert_eq!(filled, 13);
        assert!(remaining.is_none());
        assert_eq!(stream_data.size(), 24);
        assert_eq!(stream_data.cap_remaining(), (buffer_cap as usize) - 24);
        assert_eq!(stream_data.get_stream_range(), Some((0, 24)));
    }

    #[test]
    fn test_stream_data_fill_overflow() {
        let buffer_cap = 10u64;
        let mut stream_data = StreamData::new(1, 0, buffer_cap);

        // Fill with data that exceeds capacity
        let data = b"this is a very long string that exceeds capacity";
        let (filled, remaining) = stream_data.fill(data).unwrap();
        assert_eq!(filled, buffer_cap as usize);
        assert!(remaining.is_some());
        assert_eq!(remaining.unwrap(), &data[buffer_cap as usize..]);
        assert_eq!(stream_data.size(), buffer_cap);
        assert_eq!(stream_data.cap_remaining(), 0);
        assert_eq!(stream_data.get_stream_range(), Some((0, buffer_cap)));
    }

    #[test]
    fn test_stream_data_data() {
        let mut stream_data = StreamData::new(1, 0, 100);
        let data = b"test data";
        stream_data.fill(data).unwrap();
        assert_eq!(stream_data.data(), data);
    }

    #[test]
    fn test_stream_table_new() {
        let table = StreamTable::new(123, 1000);
        assert_eq!(table.stream_id(), 123);
        assert_eq!(table.offset(), 1000);
        assert_eq!(table.size(), 0);
        assert_eq!(table.stream_datas().count(), 0);
        assert_eq!(table.get_stream_range(), None);
    }

    #[test]
    fn test_stream_table_append_single() {
        let mut table = StreamTable::new(1, 0);
        let data = b"hello world";
        let offset = table.append(data).unwrap();
        assert_eq!(offset, 11);
        assert_eq!(table.size(), 11);
        assert_eq!(table.stream_datas().count(), 1);
        assert_eq!(table.get_stream_range(), Some((0, 11)));
    }

    #[test]
    fn test_stream_table_append_multiple() {
        let mut table = StreamTable::new(1, 100);

        let data1 = b"first";
        let offset1 = table.append(data1).unwrap();
        assert_eq!(offset1, 105); // 100 + 5

        let data2 = b"second";
        let offset2 = table.append(data2).unwrap();
        assert_eq!(offset2, 111); // 100 + 5 + 6

        assert_eq!(table.size(), 11);
        assert_eq!(table.stream_datas().count(), 1);
        assert_eq!(table.get_stream_range(), Some((100, 111)));
    }

    #[test]
    fn test_stream_table_append_large_data() {
        let mut table = StreamTable::new(1, 0);

        // Create data larger than STREAM_DATA_BUFFER_CAP
        let large_data = vec![0x42; (STREAM_DATA_BUFFER_CAP + 1000) as usize];
        let offset = table.append(&large_data).unwrap();
        assert_eq!(offset, large_data.len() as u64);
        assert_eq!(table.size(), large_data.len() as u64);
        assert!(table.stream_datas().count() > 1); // Should create multiple buffers
        assert_eq!(table.get_stream_range(), Some((0, large_data.len() as u64)));
    }

    #[test]
    fn test_stream_table_crc64() {
        let mut table = StreamTable::new(1, 0);
        let data = b"test data for crc";
        table.append(data).unwrap();

        let crc = table.crc64();

        // Verify CRC is calculated correctly
        let crc64 = crc::Crc::<u64>::new(&crc::CRC_64_REDIS);
        let expected_crc = crc64.checksum(data);
        assert_eq!(crc, expected_crc);
    }

    #[test]
    fn test_stream_table_read_stream() {
        let mut table = StreamTable::new(1, 0);
        let data = b"hello world test data";
        table.append(data).unwrap();

        // Read entire data
        let mut buf = vec![0u8; data.len()];
        let bytes_read = table.read_stream(0, &mut buf).unwrap();
        assert_eq!(bytes_read, data.len());
        assert_eq!(&buf, data);

        // Read partial data from start
        let mut buf = vec![0u8; 5];
        let bytes_read = table.read_stream(0, &mut buf).unwrap();
        assert_eq!(bytes_read, 5);
        assert_eq!(&buf, b"hello");

        // Read partial data from middle
        let mut buf = vec![0u8; 5];
        let bytes_read = table.read_stream(6, &mut buf).unwrap();
        assert_eq!(bytes_read, 5);
        assert_eq!(&buf, b"world");

        // Read from end
        let mut buf = vec![0u8; 4];
        let bytes_read = table.read_stream(17, &mut buf).unwrap();
        assert_eq!(bytes_read, 4);
        assert_eq!(&buf, b"data");

        // Read beyond end
        let mut buf = vec![0u8; 10];
        let bytes_read = table.read_stream(100, &mut buf).unwrap();
        assert_eq!(bytes_read, 0);
    }

    #[test]
    fn test_stream_table_read_stream_multiple_buffers() {
        let mut table = StreamTable::new(1, 0);

        // Add data that will span multiple buffers
        let data_size = (STREAM_DATA_BUFFER_CAP + 1000) as usize;
        let large_data = (0..data_size).map(|i| (i % 256) as u8).collect::<Vec<u8>>();
        table.append(&large_data).unwrap();

        // Read entire data
        let mut buf = vec![0u8; data_size];
        let bytes_read = table.read_stream(0, &mut buf).unwrap();
        assert_eq!(bytes_read, data_size);
        assert_eq!(buf, large_data);

        // Read across buffer boundaries
        let start_offset = STREAM_DATA_BUFFER_CAP - 100;
        let read_size = 200;
        let mut buf = vec![0u8; read_size as usize];
        let bytes_read = table.read_stream(start_offset, &mut buf).unwrap();
        assert_eq!(bytes_read, read_size as usize);
        assert_eq!(
            buf,
            large_data[start_offset as usize..(start_offset + read_size) as usize]
        );
    }

    #[test]
    fn test_stream_data_fill_original() {
        // Original test from the codebase
        let mut table = StreamTable::new(1, 0);
        let count = 1000;
        let mut next_offset = 0;
        let crc64 = crc::Crc::<u64>::new(&crc::CRC_64_ECMA_182);
        let mut digest = crc64.digest();
        for i in 0..count {
            let data = format!("hello world {}\n", i);
            digest.update(data.as_bytes());
            next_offset += data.len() as u64;
            let offset = table.append(data.as_bytes()).unwrap();
            assert_eq!(offset, next_offset);
        }

        let checksum = digest.finalize();

        let mut buf = vec![0u8; next_offset as usize];
        let read_size = table.read_stream(0, &mut buf).unwrap();
        assert_eq!(read_size, next_offset as usize);
        let read_checksum = crc64.checksum(&buf);
        assert_eq!(read_checksum, checksum);

        let mut read_bytes = Vec::new();
        loop {
            let mut buf = vec![0u8; (rand::random::<u64>() % 64 + 1) as usize];
            let read_size = table
                .read_stream(read_bytes.len() as u64, &mut buf)
                .unwrap();
            if read_size == 0 {
                break;
            }
            buf.truncate(read_size);
            read_bytes.extend_from_slice(buf.as_slice());
            if read_bytes.len() as u64 >= next_offset {
                break;
            }

            assert_eq!(read_size, buf.len() as usize);
        }

        let read_checksum = crc64.checksum(&read_bytes);
        assert_eq!(read_bytes.len() as u64, next_offset);
        assert_eq!(read_checksum, checksum);
    }

    #[test]
    fn test_stream_table_print_stream_meta() {
        let mut table = StreamTable::new(1, 0);

        // Add enough data to create multiple buffers
        let data_size = (STREAM_DATA_BUFFER_CAP * 2 + 100) as usize;
        let large_data = vec![0x42; data_size];
        table.append(&large_data).unwrap();

        // This should not panic
        table.print_stream_meta();
    }

    #[test]
    fn test_stream_data_empty_range() {
        let stream_data = StreamData::new(1, 100, 1024);
        assert_eq!(stream_data.get_stream_range(), None);
    }

    #[test]
    fn test_stream_data_with_offset() {
        let mut stream_data = StreamData::new(1, 500, 1024);
        let data = b"test data";
        stream_data.fill(data).unwrap();
        assert_eq!(stream_data.get_stream_range(), Some((500, 509)));
    }

    #[test]
    fn test_stream_table_empty_read() {
        let table = StreamTable::new(1, 0);
        let mut buf = vec![0u8; 10];
        let bytes_read = table.read_stream(0, &mut buf).unwrap();
        assert_eq!(bytes_read, 0);
    }
}
