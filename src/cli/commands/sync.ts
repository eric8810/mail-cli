import chalk from 'chalk';
import ora from 'ora';

import config from '../../config';
import IMAPSync from '../../imap/sync';
import accountManager from '../../sync/account-manager';
import SyncDaemon from '../../sync/daemon';
import SyncScheduler from '../../sync/scheduler';
import logger from '../../utils/logger';
import { formatSyncResults } from '../utils/formatter';

/**
 * Sync command - Synchronize emails from IMAP server
 */
async function syncCommand(action, options = {}) {
  // Handle daemon subcommands
  if (action === 'daemon') {
    return handleDaemonCommand(options);
  }

  // Handle auto sync mode
  if (options.auto) {
    return handleAutoSync(options);
  }

  // Handle regular sync
  return handleRegularSync(action, options);
}

/**
 * Handle regular sync operation
 */
async function handleRegularSync(action, options) {
  const spinner = ora('Initializing sync...').start();

  try {
    // Load configuration
    const cfg = config.load();
    if (!cfg.imap.host || !cfg.imap.user || !cfg.imap.password) {
      spinner.fail('Configuration incomplete. Please run: mail-cli config');
      process.exit(1);
    }

    // Determine folders to sync
    let folders = cfg.sync.folders || ['INBOX'];

    // Support --folders option for multiple folders
    if (options.folders) {
      folders = options.folders.split(',').map((f) => f.trim());
    } else if (options.folder) {
      folders = [options.folder];
    }

    // Filter by account if specified
    const account = options.account || null;

    spinner.text = `Syncing folders: ${folders.join(', ')}`;

    // Create sync manager and sync
    const imapConfig = account ? getAccountConfig(cfg, account) : cfg.imap;
    const syncManager = new IMAPSync(imapConfig);

    // Apply date filter if specified
    if (options.since) {
      // TODO: Implement date filtering in IMAPSync
      spinner.info(
        `Date filtering (--since) will be implemented in future version`
      );
    }

    const results = await syncManager.syncFolders(folders);

    spinner.succeed('Sync completed');
    console.log();
    console.log(formatSyncResults(results));

    // Display sync statistics
    displaySyncStats(results);
  } catch (error) {
    spinner.fail('Sync failed');
    console.error(chalk.red('Error:'), error.message);
    logger.error('Sync command failed', { error: error.message });
    process.exit(1);
  }
}

/**
 * Handle auto sync mode
 */
async function handleAutoSync(options) {
  console.log(chalk.blue('Starting automatic sync mode...'));

  try {
    const cfg = config.load();

    // Determine sync interval
    const interval = options.interval
      ? parseInt(options.interval) * 60000 // Convert minutes to milliseconds
      : cfg.sync.syncInterval || 300000;

    // Determine folders
    const folders = options.folders
      ? options.folders.split(',').map((f) => f.trim())
      : cfg.sync.folders || ['INBOX'];

    const account = options.account || null;

    // Create and start scheduler
    const scheduler = new SyncScheduler({
      config: cfg,
      interval,
      folders,
      account,
    });

    // Setup event handlers
    scheduler.on('started', (info) => {
      console.log(chalk.green('✓ Auto sync started'));
      console.log(chalk.gray(`  Interval: ${info.interval / 1000}s`));
      console.log(chalk.gray(`  Folders: ${info.folders.join(', ')}`));
      console.log();
      console.log(chalk.yellow('Press Ctrl+C to stop'));
    });

    scheduler.on('sync-start', (info) => {
      console.log(
        chalk.blue(`[${new Date().toLocaleTimeString()}] Syncing...`)
      );
    });

    scheduler.on('sync-complete', (result) => {
      console.log(
        chalk.green(`[${new Date().toLocaleTimeString()}] ✓ Sync completed`)
      );
      console.log(chalk.gray(`  New emails: ${result.totalNew}`));
      console.log(chalk.gray(`  Duration: ${result.duration}ms`));
      if (result.spamDetected > 0) {
        console.log(chalk.yellow(`  Spam detected: ${result.spamDetected}`));
      }
      console.log();
    });

    scheduler.on('sync-error', (error) => {
      console.error(
        chalk.red(
          `[${new Date().toLocaleTimeString()}] ✗ Sync failed: ${error.error}`
        )
      );
      console.log();
    });

    // Handle graceful shutdown
    process.on('SIGINT', () => {
      console.log();
      console.log(chalk.yellow('Stopping auto sync...'));
      scheduler.stop();

      const stats = scheduler.getStatus().stats;
      console.log();
      console.log(chalk.blue('Auto Sync Statistics:'));
      console.log(chalk.gray(`  Total syncs: ${stats.totalSyncs}`));
      console.log(chalk.gray(`  Successful: ${stats.successfulSyncs}`));
      console.log(chalk.gray(`  Failed: ${stats.failedSyncs}`));
      console.log(chalk.gray(`  Total new emails: ${stats.totalNewEmails}`));

      process.exit(0);
    });

    await scheduler.start();
  } catch (error) {
    console.error(chalk.red('Error:'), error.message);
    logger.error('Auto sync failed', { error: error.message });
    process.exit(1);
  }
}

/**
 * Handle daemon subcommands
 */
async function handleDaemonCommand(options) {
  const daemon = new SyncDaemon();
  const subcommand = options.subcommand || 'status';

  try {
    switch (subcommand) {
      case 'start':
        await handleDaemonStart(daemon, options);
        break;

      case 'stop':
        await handleDaemonStop(daemon);
        break;

      case 'status':
        handleDaemonStatus(daemon);
        break;

      case 'logs':
        handleDaemonLogs(daemon, options);
        break;

      default:
        console.error(chalk.red(`Unknown daemon command: ${subcommand}`));
        console.log('Available commands: start, stop, status, logs');
        process.exit(1);
    }
  } catch (error) {
    console.error(chalk.red('Error:'), error.message);
    logger.error('Daemon command failed', { subcommand, error: error.message });
    process.exit(1);
  }
}

/**
 * Start daemon
 */
async function handleDaemonStart(daemon, options) {
  const spinner = ora('Starting sync daemon...').start();

  try {
    const cfg = config.load();

    const daemonOptions = {
      interval: options.interval
        ? parseInt(options.interval) * 60000
        : cfg.sync.syncInterval || 300000,
      folders: options.folders
        ? options.folders.split(',').map((f) => f.trim())
        : cfg.sync.folders || ['INBOX'],
      account: options.account || null,
    };

    const result = await daemon.start(daemonOptions);

    spinner.succeed('Sync daemon started');
    console.log();
    console.log(chalk.blue('Daemon Information:'));
    console.log(chalk.gray(`  PID: ${result.pid}`));
    console.log(chalk.gray(`  Log file: ${result.logFile}`));
    console.log(chalk.gray(`  Interval: ${result.options.interval / 1000}s`));
    console.log(chalk.gray(`  Folders: ${result.options.folders.join(', ')}`));
    console.log();
    console.log(chalk.yellow('Use "sync daemon logs" to view logs'));
    console.log(chalk.yellow('Use "sync daemon stop" to stop the daemon'));
  } catch (error) {
    spinner.fail('Failed to start daemon');
    throw error;
  }
}

/**
 * Stop daemon
 */
async function handleDaemonStop(daemon) {
  const spinner = ora('Stopping sync daemon...').start();

  try {
    const result = await daemon.stop();

    spinner.succeed('Sync daemon stopped');
    console.log();
    console.log(chalk.gray(`  PID: ${result.pid}`));
    if (result.forcedKill) {
      console.log(chalk.yellow('  (Force killed)'));
    }
  } catch (error) {
    spinner.fail('Failed to stop daemon');
    throw error;
  }
}

/**
 * Show daemon status
 */
function handleDaemonStatus(daemon) {
  const status = daemon.getStatus();

  console.log(chalk.blue('Sync Daemon Status:'));
  console.log();

  if (status.isRunning) {
    console.log(chalk.green('✓ Running'));
    console.log(chalk.gray(`  PID: ${status.pid}`));
    console.log(chalk.gray(`  Log file: ${status.logFile}`));
    if (status.logSize !== undefined) {
      console.log(chalk.gray(`  Log size: ${formatBytes(status.logSize)}`));
      console.log(
        chalk.gray(`  Last activity: ${status.lastModified.toLocaleString()}`)
      );
    }
  } else {
    console.log(chalk.yellow('✗ Not running'));
  }

  console.log();
  console.log(chalk.gray(`PID file: ${status.pidFile}`));
}

/**
 * Show daemon logs
 */
function handleDaemonLogs(daemon, options) {
  const lines = options.lines ? parseInt(options.lines) : 50;
  const logs = daemon.getLogs(lines);

  if (!logs) {
    console.log(chalk.yellow('No logs available'));
    return;
  }

  console.log(chalk.blue(`Last ${lines} log entries:`));
  console.log();
  console.log(logs);
}

/**
 * Display sync statistics
 */
function displaySyncStats(results) {
  console.log(chalk.blue('Sync Statistics:'));
  console.log(chalk.gray(`  Total new emails: ${results.totalNew}`));
  console.log(chalk.gray(`  Total errors: ${results.totalErrors}`));
  if (results.spamDetected > 0) {
    console.log(chalk.yellow(`  Spam detected: ${results.spamDetected}`));
  }
  if (results.filtersApplied > 0) {
    console.log(chalk.green(`  Filters applied: ${results.filtersApplied}`));
  }

  console.log();
  console.log(chalk.blue('Folders:'));
  for (const [folder, result] of Object.entries(results.folders)) {
    if (result.error) {
      console.log(chalk.red(`  ✗ ${folder}: ${result.error}`));
    } else {
      console.log(chalk.green(`  ✓ ${folder}: ${result.newEmails} new emails`));
    }
  }
}

/**
 * Get account-specific config
 */
function getAccountConfig(cfg, accountId) {
  // Try to get account from database if accounts table exists
  if (accountManager.accountsTableExists()) {
    const imapConfig = accountManager.getImapConfig(accountId);
    if (imapConfig) {
      logger.info('Using account-specific IMAP config', { accountId });
      return imapConfig;
    }
  }

  // Fallback to default config
  logger.warn(
    'Account not found or accounts table not available, using default config',
    { accountId }
  );
  return cfg.imap;
}

/**
 * Format bytes to human readable
 */
function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

module.exports = syncCommand;
