# StreamStore-rs

StreamStore-rs is a Rust library for building stream-sourced applications using the StreamStore protocol. It provides a simple and efficient way to manage streams, making it easier to build scalable and maintainable systems.

## Features

- **Stream Management**: Efficiently manage streams with support for seek, read, and append operations.
- **High Performance**: Built with performance in mind, leveraging Rust's capabilities for low-level memory management.
- **Concurrency**: Designed to handle concurrent operations safely and efficiently.

## Usage

To use StreamStore in your project, add it to your `Cargo.toml` dependencies:

```toml
[dependencies]
streamstore = { path = "../streamstore" }
```

## Related Components

- [StreamServer](/workspace/cherry/crates/streamserver): Server implementation for StreamStore
- [CherryCore](/workspace/cherry/crates/cherrycore): Core functionality for the Cherry application