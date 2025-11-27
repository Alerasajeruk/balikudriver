#!/bin/bash

# ============================================
# Baliku Driver - Backend Server Startup
# For macOS and Linux
# ============================================

echo ""
echo "================================================"
echo " Baliku Driver - Backend API Server"
echo "================================================"
echo ""
echo "Starting Backend API Server on Port 4000..."
echo ""

# Get the script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}ERROR: Node.js is not installed${NC}"
    echo "Please install Node.js from https://nodejs.org/"
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo -e "${RED}ERROR: npm is not installed${NC}"
    echo "Please install npm (comes with Node.js)"
    exit 1
fi

# Navigate to backend directory
cd "$PROJECT_DIR/apps/baliku-driver-server" || exit 1

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
    if [ $? -ne 0 ]; then
        echo -e "${RED}ERROR: Failed to install dependencies${NC}"
        exit 1
    fi
fi

echo ""
echo -e "${GREEN}Starting Backend API Server...${NC}"
echo "Backend API will be available at: http://localhost:4000"
echo ""
echo "Press Ctrl+C to stop the server"
echo "================================================"
echo ""

# Start the server
npm run dev

