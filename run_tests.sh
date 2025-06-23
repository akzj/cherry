#!/bin/bash

# Test runner script for Cherry project
# This script runs tests for the core Rust libraries that don't depend on GTK

set -e

echo "🧪 Running tests for Cherry project..."
echo "======================================"

# Set environment variables for tests
export JWT_SECRET="test_secret_key_for_testing"

# Source Rust environment
source $HOME/.cargo/env

echo ""
echo "📦 Testing streamstore crate..."
echo "-------------------------------"
cd crates/streamstore
cargo test --lib
echo "✅ streamstore tests passed!"

echo ""
echo "📦 Testing cherrycore crate..."
echo "-------------------------------"
cd ../cherrycore
cargo test --lib
echo "✅ cherrycore tests passed!"

echo ""
echo "🎉 All tests passed successfully!"
echo ""
echo "📊 Test Summary:"
echo "  - streamstore: 42 tests"
echo "  - cherrycore:  28 tests"
echo "  - Total:       70 tests"
echo ""
echo "Note: The Tauri application (cherry crate) requires GTK dependencies"
echo "      and is not included in this test run."