#!/bin/bash

# ============================================
# Baliku Driver - Complete Startup Script
# Starts Backend + Frontend together
# For macOS and Linux
# ============================================

echo ""
echo "================================================"
echo " Baliku Driver - Complete Application Startup"
echo "================================================"
echo ""
echo "This script will:"
echo "  1. Start Backend API Server (Port 4000)"
echo "  2. Start Driver/Guide Frontend PWA (Port 3001)"
echo "  3. Start Admin Frontend PWA (Port 3002)"
echo "  4. Open browser automatically"
echo ""
echo "================================================"
echo ""

# Get the script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check if Node.js is installed
if ! command_exists node; then
    echo -e "${RED}ERROR: Node.js is not installed${NC}"
    echo "Please install Node.js from https://nodejs.org/"
    exit 1
fi

# Check if npm is installed
if ! command_exists npm; then
    echo -e "${RED}ERROR: npm is not installed${NC}"
    echo "Please install npm (comes with Node.js)"
    exit 1
fi

echo "[1/7] Installing Backend dependencies..."
cd "$PROJECT_DIR/apps/baliku-driver-server" || exit 1
npm install
if [ $? -ne 0 ]; then
    echo ""
    echo -e "${RED}ERROR: Failed to install backend dependencies${NC}"
    exit 1
fi

echo ""
echo "[2/6] Installing Frontend dependencies..."
cd "$PROJECT_DIR/apps/baliku-driver-client" || exit 1
npm install
if [ $? -ne 0 ]; then
    echo ""
    echo -e "${RED}ERROR: Failed to install frontend dependencies${NC}"
    exit 1
fi

echo ""
echo "[3/6] Starting Backend API Server..."
cd "$PROJECT_DIR/apps/baliku-driver-server" || exit 1

# Create a function to run backend in new terminal (macOS)
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS - use osascript to open new Terminal window
    osascript -e "tell application \"Terminal\" to do script \"cd '$PROJECT_DIR/apps/baliku-driver-server' && echo 'Baliku Backend API Server' && echo 'Running on http://localhost:4000' && echo '' && npm run dev\""
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    # Linux - use gnome-terminal, xterm, or other
    if command_exists gnome-terminal; then
        gnome-terminal -- bash -c "cd '$PROJECT_DIR/apps/baliku-driver-server' && echo 'Baliku Backend API Server' && echo 'Running on http://localhost:4000' && echo '' && npm run dev; exec bash"
    elif command_exists xterm; then
        xterm -e "cd '$PROJECT_DIR/apps/baliku-driver-server' && echo 'Baliku Backend API Server' && echo 'Running on http://localhost:4000' && echo '' && npm run dev; exec bash" &
    else
        # Fallback: run in background
        cd "$PROJECT_DIR/apps/baliku-driver-server"
        npm run dev > /tmp/baliku-backend.log 2>&1 &
        BACKEND_PID=$!
        echo "Backend started in background (PID: $BACKEND_PID)"
        echo "Logs: /tmp/baliku-backend.log"
    fi
else
    # Fallback: run in background
    cd "$PROJECT_DIR/apps/baliku-driver-server"
    npm run dev > /tmp/baliku-backend.log 2>&1 &
    BACKEND_PID=$!
    echo "Backend started in background (PID: $BACKEND_PID)"
    echo "Logs: /tmp/baliku-backend.log"
fi

# Wait for backend to start
echo "[5/7] Waiting for backend to initialize (5 seconds)..."
sleep 5

echo ""
echo "[6/7] Starting Driver/Guide Frontend PWA Server..."
cd "$PROJECT_DIR/apps/baliku-driver-client" || exit 1

# Create a function to run frontend in new terminal (macOS)
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS - use osascript to open new Terminal window
    osascript -e "tell application \"Terminal\" to do script \"cd '$PROJECT_DIR/apps/baliku-driver-client' && echo 'Baliku Driver/Guide PWA' && echo 'Running on http://localhost:3001' && echo '' && npm start\""
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    # Linux - use gnome-terminal, xterm, or other
    if command_exists gnome-terminal; then
        gnome-terminal -- bash -c "cd '$PROJECT_DIR/apps/baliku-driver-client' && echo 'Baliku Driver/Guide PWA' && echo 'Running on http://localhost:3001' && echo '' && npm start; exec bash"
    elif command_exists xterm; then
        xterm -e "cd '$PROJECT_DIR/apps/baliku-driver-client' && echo 'Baliku Driver/Guide PWA' && echo 'Running on http://localhost:3001' && echo '' && npm start; exec bash" &
    else
        # Fallback: run in background
        cd "$PROJECT_DIR/apps/baliku-driver-client"
        npm start > /tmp/baliku-frontend.log 2>&1 &
        FRONTEND_PID=$!
        echo "Frontend started in background (PID: $FRONTEND_PID)"
        echo "Logs: /tmp/baliku-frontend.log"
    fi
else
    # Fallback: run in background
    cd "$PROJECT_DIR/apps/baliku-driver-client"
    npm start > /tmp/baliku-frontend.log 2>&1 &
    FRONTEND_PID=$!
    echo "Frontend started in background (PID: $FRONTEND_PID)"
    echo "Logs: /tmp/baliku-frontend.log"
fi

# Wait a moment
sleep 2

echo ""
echo "[7/7] Starting Admin Frontend PWA Server..."
cd "$PROJECT_DIR/apps/baliku-admin-client" || exit 1

# Create a function to run admin frontend in new terminal (macOS)
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS - use osascript to open new Terminal window
    osascript -e "tell application \"Terminal\" to do script \"cd '$PROJECT_DIR/apps/baliku-admin-client' && echo 'Baliku Admin PWA' && echo 'Running on http://localhost:3002' && echo '' && npm start\""
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    # Linux - use gnome-terminal, xterm, or other
    if command_exists gnome-terminal; then
        gnome-terminal -- bash -c "cd '$PROJECT_DIR/apps/baliku-admin-client' && echo 'Baliku Admin PWA' && echo 'Running on http://localhost:3002' && echo '' && npm start; exec bash"
    elif command_exists xterm; then
        xterm -e "cd '$PROJECT_DIR/apps/baliku-admin-client' && echo 'Baliku Admin PWA' && echo 'Running on http://localhost:3002' && echo '' && npm start; exec bash" &
    else
        # Fallback: run in background
        cd "$PROJECT_DIR/apps/baliku-admin-client"
        npm start > /tmp/baliku-admin.log 2>&1 &
        ADMIN_PID=$!
        echo "Admin started in background (PID: $ADMIN_PID)"
        echo "Logs: /tmp/baliku-admin.log"
    fi
else
    # Fallback: run in background
    cd "$PROJECT_DIR/apps/baliku-admin-client"
    npm start > /tmp/baliku-admin.log 2>&1 &
    ADMIN_PID=$!
    echo "Admin started in background (PID: $ADMIN_PID)"
    echo "Logs: /tmp/baliku-admin.log"
fi

# Wait for frontends to start
echo "Waiting for frontends to initialize (5 seconds)..."
sleep 5

echo ""
echo "================================================"
echo -e " ${GREEN}SUCCESS! Application is starting...${NC}"
echo "================================================"
echo ""
echo "  Backend API:        http://localhost:4000"
echo "  Driver/Guide PWA:   http://localhost:3001"
echo "  Admin PWA:          http://localhost:3002"
echo ""
echo "  Opening browser in 3 seconds..."
echo "================================================"
echo ""

# Wait a moment then open browser
sleep 3

# Open browser (macOS)
if [[ "$OSTYPE" == "darwin"* ]]; then
    open http://localhost:3001
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    if command_exists xdg-open; then
        xdg-open http://localhost:3001
    elif command_exists firefox; then
        firefox http://localhost:3001 &
    elif command_exists google-chrome; then
        google-chrome http://localhost:3001 &
    else
        echo "Please open http://localhost:3001 in your browser"
    fi
else
    echo "Please open http://localhost:3001 in your browser"
fi

echo ""
echo "Browser opened! The application should load now."
echo ""
echo "To STOP the servers:"
if [[ "$OSTYPE" == "darwin"* ]]; then
    echo "  - Close the Terminal windows for Backend and Frontend"
    echo "  - Or press Ctrl+C in each Terminal window"
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    echo "  - Close the terminal windows for Backend and Frontend"
    echo "  - Or press Ctrl+C in each terminal window"
    if [ ! -z "$BACKEND_PID" ] || [ ! -z "$FRONTEND_PID" ]; then
        echo "  - Or kill processes: kill $BACKEND_PID $FRONTEND_PID"
    fi
fi
echo ""
echo "This window will close in 10 seconds..."
sleep 10

