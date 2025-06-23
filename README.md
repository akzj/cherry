# Cherry

Cherry is a modern instant messaging application built with Tauri, React, and Rust. It provides a fast, secure, and feature-rich messaging experience.

## Project Structure

This repository is organized as a Rust workspace with multiple crates:

- [Cherry](/workspace/cherry/crates/cherry): The main application using Tauri, React, and TypeScript
- [CherryCore](/workspace/cherry/crates/cherrycore): Core functionality for the Cherry application
- [CherryServer](/workspace/cherry/crates/cherryserver): Server-side implementation for Cherry
- [StreamStore](/workspace/cherry/crates/streamstore): A Rust library for building stream-sourced applications
- [StreamServer](/workspace/cherry/crates/streamserver): Server implementation for StreamStore

## Getting Started

### Prerequisites

- Rust (latest stable version)
- Node.js (v14 or later)
- npm or yarn

### Development Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/akzj/cherry.git
   cd cherry
   ```

2. Install dependencies:
   ```bash
   # Install Rust dependencies
   cargo build
   
   # Install frontend dependencies
   cd crates/cherry
   npm install
   ```

3. Run the development server:
   ```bash
   # In the crates/cherry directory
   npm run tauri dev
   ```

## Docker Development Environment

A Docker development environment is available for easier setup:

```bash
docker-compose -f docker-compose.dev.yml up
```

## License

This project is licensed under the MIT License - see the LICENSE file for details.