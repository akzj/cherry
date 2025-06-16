# Build stage
FROM rust:1.75-slim as builder

# Install dependencies for building
RUN apt-get update && apt-get install -y \
    pkg-config \
    libssl-dev \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy the workspace files first
COPY Cargo.toml Cargo.lock ./
COPY crates/ ./crates/

# Build the application
RUN cargo build --release -p cherryserver

# Runtime stage
FROM debian:bookworm-slim

# Install runtime dependencies
RUN apt-get update && apt-get install -y \
    libpq5 \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Create app user
RUN useradd -r -s /bin/false cherryserver

# Set working directory
WORKDIR /app

# Copy the binary from builder stage
COPY --from=builder /app/target/release/cherryserver /app/cherryserver

# Copy configuration files
COPY config.yaml /app/config.yaml

# Change ownership
RUN chown -R cherryserver:cherryserver /app

# Switch to app user
USER cherryserver

# Expose port
EXPOSE 3000

# Health check will be added after implementing /health endpoint

# Run the application
CMD ["./cherryserver"] 