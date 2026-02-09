# Sync Enhancement Features

This document describes the enhanced synchronization features for the mail client.

## Features

### 1. Automatic Sync (Scheduler)

The sync scheduler enables automatic periodic synchronization of emails.

**Usage:**
```bash
# Start auto sync with default interval (5 minutes)
mail-cli sync --auto

# Start auto sync with custom interval (in minutes)
mail-cli sync --auto --interval 10

# Auto sync specific folders
mail-cli sync --auto --folders "INBOX,Sent,Drafts"

# Auto sync specific account
mail-cli sync --auto --account user@example.com
```

**Features:**
- Configurable sync interval (minimum 1 minute)
- Real-time sync progress display
- Automatic error recovery
- Sync statistics tracking
- Graceful shutdown with Ctrl+C

### 2. Background Daemon

Run email synchronization as a background daemon process.

**Usage:**
```bash
# Start daemon with default settings
mail-cli sync daemon start

# Start daemon with custom interval
mail-cli sync daemon start --interval 15

# Start daemon for specific folders
mail-cli sync daemon start --folders "INBOX,Important"

# Check daemon status
mail-cli sync daemon status

# View daemon logs (last 50 lines)
mail-cli sync daemon logs

# View more log lines
mail-cli sync daemon logs --lines=100

# Stop daemon
mail-cli sync daemon stop
```

**Features:**
- Runs in background (detached process)
- Automatic restart on errors
- Log file management
- PID file tracking
- Graceful shutdown

### 3. Selective Sync

Sync only specific folders, accounts, or date ranges.

**Usage:**
```bash
# Sync specific folder
mail-cli sync --folder INBOX

# Sync multiple folders
mail-cli sync --folders "INBOX,Sent,Drafts"

# Sync emails since specific date
mail-cli sync --since 2024-01-01

# Sync specific account
mail-cli sync --account user@example.com

# Combine options
mail-cli sync --folders "INBOX,Sent" --since 2024-01-01 --account user@example.com
```

### 4. Sync Statistics

View detailed synchronization statistics and progress.

**Statistics Include:**
- Total syncs performed
- Successful/failed sync count
- Total new emails synced
- Total errors encountered
- Spam detected count
- Per-folder sync results
- Sync duration

### 5. Configuration

Configure sync behavior in `config.json`:

```json
{
  "sync": {
    "autoSync": false,
    "syncInterval": 300000,
    "folders": ["INBOX"],
    "enableDaemon": false,
    "selectiveSyncEnabled": false,
    "syncSince": null,
    "concurrentFolders": 3,
    "retryOnError": true,
    "maxRetries": 3,
    "retryDelay": 5000
  }
}
```

**Configuration Options:**
- `autoSync`: Enable automatic sync on startup
- `syncInterval`: Sync interval in milliseconds (default: 300000 = 5 minutes)
- `folders`: Default folders to sync
- `enableDaemon`: Start daemon on application startup
- `selectiveSyncEnabled`: Enable selective sync features
- `syncSince`: Default date for selective sync
- `concurrentFolders`: Number of folders to sync concurrently
- `retryOnError`: Retry failed syncs
- `maxRetries`: Maximum retry attempts
- `retryDelay`: Delay between retries in milliseconds

## Architecture

### Components

1. **SyncScheduler** (`src/sync/scheduler.js`)
   - Manages periodic sync operations
   - Event-driven architecture
   - Statistics tracking
   - Configurable intervals

2. **SyncDaemon** (`src/sync/daemon.js`)
   - Background process management
   - PID file handling
   - Log file management
   - Process lifecycle control

3. **DaemonWorker** (`src/sync/daemon-worker.js`)
   - Background worker process
   - Signal handling (SIGTERM, SIGINT)
   - Error recovery
   - Logging

### Events

The SyncScheduler emits the following events:

- `started`: Scheduler started
- `stopped`: Scheduler stopped
- `sync-start`: Sync operation started
- `sync-complete`: Sync operation completed successfully
- `sync-error`: Sync operation failed

### File Locations

- PID file: `{dataDir}/sync-daemon.pid`
- Log file: `{dataDir}/sync-daemon.log`
- Config file: `{dataDir}/config.json`

## Examples

### Example 1: Quick Sync
```bash
# Sync INBOX immediately
mail-cli sync
```

### Example 2: Auto Sync with Custom Settings
```bash
# Auto sync every 10 minutes
mail-cli sync --auto --interval 10 --folders "INBOX,Sent"
```

### Example 3: Background Daemon
```bash
# Start daemon
mail-cli sync daemon start --interval 15

# Check status
mail-cli sync daemon status

# View logs
mail-cli sync daemon logs

# Stop daemon
mail-cli sync daemon stop
```

### Example 4: Selective Sync
```bash
# Sync only recent emails
mail-cli sync --since 2024-01-01 --folders "INBOX,Important"
```

## Troubleshooting

### Daemon won't start
- Check if daemon is already running: `mail-cli sync daemon status`
- Check log file for errors: `mail-cli sync daemon logs`
- Ensure data directory is writable

### Sync fails repeatedly
- Check IMAP credentials in config
- Verify network connectivity
- Check log files for specific errors
- Increase retry delay in config

### High memory usage
- Reduce number of concurrent folders
- Sync fewer folders
- Increase sync interval

## Future Enhancements

- Multi-account support (depends on task #7)
- Date-based filtering (--since implementation)
- Bandwidth throttling
- Sync conflict resolution
- Incremental sync optimization
- Push notification support (IMAP IDLE)
