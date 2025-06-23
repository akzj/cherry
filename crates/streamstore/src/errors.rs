use thiserror::Error;

#[derive(Debug, Error)]
pub enum Error {
    #[error("Stream already exists")]
    AlreadyExists,

    #[error("path {path} is invalid")]
    InValidPath { path: std::path::PathBuf },

    #[error("invalid data")]
    InvalidData,

    #[error("internal error")]
    InternalError,

    #[error("is closed")]
    CloseError,

    #[error("store is read-only")]
    StoreIsReadOnly,

    #[error("channel is closed")]
    WalChannelSendError,

    #[error("IO error")]
    IoError(std::io::Error),

    #[error("Stream {stream_id} offset {offset} is invalid")]
    StreamOffsetInvalid { stream_id: u64, offset: u64 },

    #[error("Stream {stream_id} Not Found")]
    StreamNotFound { stream_id: u64 },
}

pub fn new_stream_offset_invalid(stream_id: u64, offset: u64) -> anyhow::Error {
    anyhow::anyhow!(Error::StreamOffsetInvalid { stream_id, offset })
}

pub fn new_stream_not_found(stream_id: u64) -> anyhow::Error {
    anyhow::anyhow!(Error::StreamNotFound { stream_id })
}

pub fn new_io_error(e: std::io::Error) -> anyhow::Error {
    anyhow::anyhow!(Error::IoError(e))
}

pub fn new_invalid_path(path: std::path::PathBuf) -> anyhow::Error {
    anyhow::anyhow!(Error::InValidPath { path })
}

pub fn new_invalid_data() -> anyhow::Error {
    anyhow::anyhow!(Error::InvalidData)
}

pub fn new_store_is_read_only() -> anyhow::Error {
    anyhow::anyhow!(Error::StoreIsReadOnly)
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::path::PathBuf;

    #[test]
    fn test_error_display() {
        let error = Error::AlreadyExists;
        assert_eq!(error.to_string(), "Stream already exists");

        let path = PathBuf::from("/invalid/path");
        let error = Error::InValidPath { path: path.clone() };
        assert_eq!(error.to_string(), format!("path {} is invalid", path.display()));

        let error = Error::InvalidData;
        assert_eq!(error.to_string(), "invalid data");

        let error = Error::InternalError;
        assert_eq!(error.to_string(), "internal error");

        let error = Error::CloseError;
        assert_eq!(error.to_string(), "is closed");

        let error = Error::StoreIsReadOnly;
        assert_eq!(error.to_string(), "store is read-only");

        let error = Error::WalChannelSendError;
        assert_eq!(error.to_string(), "channel is closed");

        let io_error = std::io::Error::new(std::io::ErrorKind::NotFound, "file not found");
        let error = Error::IoError(io_error);
        assert_eq!(error.to_string(), "IO error");

        let error = Error::StreamOffsetInvalid { stream_id: 123, offset: 456 };
        assert_eq!(error.to_string(), "Stream 123 offset 456 is invalid");

        let error = Error::StreamNotFound { stream_id: 789 };
        assert_eq!(error.to_string(), "Stream 789 Not Found");
    }

    #[test]
    fn test_error_constructors() {
        let err = new_stream_offset_invalid(123, 456);
        assert!(err.to_string().contains("Stream 123 offset 456 is invalid"));

        let err = new_stream_not_found(789);
        assert!(err.to_string().contains("Stream 789 Not Found"));

        let io_error = std::io::Error::new(std::io::ErrorKind::NotFound, "test error");
        let err = new_io_error(io_error);
        assert!(err.to_string().contains("IO error"));

        let path = PathBuf::from("/test/path");
        let err = new_invalid_path(path.clone());
        assert!(err.to_string().contains(&format!("path {} is invalid", path.display())));

        let err = new_invalid_data();
        assert!(err.to_string().contains("invalid data"));

        let err = new_store_is_read_only();
        assert!(err.to_string().contains("store is read-only"));
    }

    #[test]
    fn test_error_debug() {
        let error = Error::AlreadyExists;
        let debug_str = format!("{:?}", error);
        assert!(debug_str.contains("AlreadyExists"));
    }
}