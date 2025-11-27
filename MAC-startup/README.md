# Mac/Linux Startup Scripts

This directory contains startup scripts for macOS and Linux systems.

## Files

- **`start-all.sh`** - Starts both Backend and Frontend servers together
- **`start-server.sh`** - Starts only the Backend API server
- **`start-client.sh`** - Starts only the Frontend PWA server

## Prerequisites

1. **Node.js** (v14 or higher) - [Download](https://nodejs.org/)
2. **npm** (comes with Node.js)
3. **Terminal** (built-in on macOS/Linux)

## Usage

### Option 1: Start Everything at Once (Recommended)

```bash
./mac-startup/start-all.sh
```

This will:
1. Install dependencies (if needed)
2. Start Backend API on `http://localhost:4000`
3. Start Frontend PWA on `http://localhost:3001`
4. Open browser automatically

### Option 2: Start Individually

**Backend only:**
```bash
./mac-startup/start-server.sh
```

**Frontend only:**
```bash
./mac-startup/start-client.sh
```

## First Time Setup

1. **Make scripts executable** (if not already):
   ```bash
   chmod +x mac-startup/*.sh
   ```

2. **Run the startup script:**
   ```bash
   ./mac-startup/start-all.sh
   ```

## How It Works

### macOS
- Opens new Terminal windows for Backend and Frontend
- Uses `osascript` to open Terminal windows
- Automatically opens browser with `open` command

### Linux
- Opens new terminal windows (gnome-terminal or xterm)
- Falls back to background process if no terminal available
- Automatically opens browser with `xdg-open` command

## Stopping the Servers

### If using Terminal windows:
- Press `Ctrl+C` in each Terminal window
- Or close the Terminal windows

### If running in background:
- Find process IDs: `ps aux | grep node`
- Kill processes: `kill <PID>`

## Troubleshooting

### "Permission denied" error
```bash
chmod +x mac-startup/*.sh
```

### "Node.js is not installed" error
Install Node.js from: https://nodejs.org/

### "npm is not installed" error
npm comes with Node.js. Reinstall Node.js if needed.

### Port already in use
- Backend (4000): `lsof -ti:4000 | xargs kill -9`
- Frontend (3001): `lsof -ti:3001 | xargs kill -9`

### Scripts don't open new Terminal windows
- macOS: Make sure Terminal app has necessary permissions
- Linux: Install `gnome-terminal` or `xterm`

## Notes

- Scripts automatically detect macOS vs Linux
- Dependencies are installed automatically if missing
- Browser opens automatically after servers start
- Scripts use relative paths, so they work from any location

---

**Last Updated**: Created for macOS/Linux compatibility

