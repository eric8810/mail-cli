#!/usr/bin/env node

import chalk from 'chalk';
import { Command } from 'commander';

import packageJson from '../../package.json' assert { type: 'json' };

// Import commands
import accountCommand from './commands/account';
import configCommand from './commands/config';
import contactCommand from './commands/contact';
import { deleteCommand } from './commands/delete';
import draftCommand from './commands/draft';
import folderCommand from './commands/folder';
import forwardCommand from './commands/forward';
import { exportCommand, importCommand } from './commands/import-export';
import listCommand from './commands/list';
import {
  starCommand,
  unstarCommand,
  flagCommand,
  unflagCommand,
} from './commands/mark';
import notifyCommand from './commands/notify';
import readCommand from './commands/read';
import replyCommand from './commands/reply';
import searchCommand from './commands/search';
import sendCommand from './commands/send';
import serveCommand from './commands/serve';
import signatureCommand from './commands/signature';
import spamCommand from './commands/spam';
import syncCommand from './commands/sync';
import tagCommand from './commands/tag';
import templateCommand from './commands/template';
import {
  listThreads,
  showThread,
  deleteThread,
  moveThread,
} from './commands/thread';
import { trashCommand } from './commands/trash';

const VALID_FORMATS = ['markdown', 'json', 'ids-only'];

function validateFormat(value: string): string {
  if (!VALID_FORMATS.includes(value)) {
    throw new Error(
      `Invalid format '${value}'. Valid formats: ${VALID_FORMATS.join(', ')}`
    );
  }
  return value;
}

/**
 * CLI Application
 */
function createCLI(): Command {
  const program = new Command();

  program
    .name('mail-cli')
    .description('A command-line email client with IMAP/SMTP support')
    .version(packageJson.version);

  // Config command
  program
    .command('config')
    .description('Configure IMAP and SMTP settings')
    .option('--show', 'Show current configuration')
    .option('--set <key=value>', 'Set a configuration value')
    .action(configCommand);

  // Sync command
  program
    .command('sync [action]')
    .description('Synchronize emails from IMAP server')
    .option('--folder <name>', 'Sync specific folder (default: INBOX)')
    .option('--folders <names>', 'Sync multiple folders (comma-separated)')
    .option('--since <date>', 'Sync emails since date (YYYY-MM-DD)')
    .option('--account <id>', 'Sync specific account')
    .option('--auto', 'Start automatic sync mode')
    .option(
      '--interval <minutes>',
      'Sync interval in minutes (default: 5)',
      parseInt
    )
    .action((action, options) => {
      if (action === 'daemon') {
        const subcommand = process.argv[4];
        options.subcommand = subcommand;
        options.lines = parseInt(
          process.argv
            .find((arg) => arg.startsWith('--lines='))
            ?.split('=')[1] || '50',
          10
        );
      }
      syncCommand(action, options);
    });

  // List command
  program
    .command('list')
    .description('List emails from local storage')
    .option(
      '--folder <name>',
      'List emails from specific folder (default: INBOX)'
    )
    .option('--unread', 'Show only unread emails')
    .option('--starred', 'Show only starred emails')
    .option('--flagged', 'Show only flagged (important) emails')
    .option('--tag <name>', 'Filter by tag name')
    .option('--account <id>', 'Filter by account ID', parseInt)
    .option('--all-accounts', 'Show emails from all accounts (unified inbox)')
    .option(
      '--limit <number>',
      'Number of emails to show (default: 50)',
      parseInt
    )
    .option('--page <number>', 'Page number (default: 1)', parseInt)
    .option('--thread', 'Display emails in thread view')
    .option(
      '--format <format>',
      'Output format (markdown, json, ids-only)',
      validateFormat,
      'markdown'
    )
    .option('--ids-only', 'Output only email IDs (same as --format ids-only)')
    .option(
      '--fields <fields>',
      'Select fields to display (comma-separated, e.g., "id,from,subject" or "*,^body")'
    )
    .action(listCommand);

  // Read command
  program
    .command('read <id>')
    .description('Read email details')
    .option('--raw', 'Show raw email content')
    .option(
      '--format <format>',
      'Output format (markdown, json, ids-only)',
      validateFormat,
      'markdown'
    )
    .option(
      '--fields <fields>',
      'Select fields to display (comma-separated, e.g., "id,from,subject" or "*,^body")'
    )
    .action(readCommand);

  // Send command
  program
    .command('send')
    .description('Send an email')
    .option('--to <addresses>', 'Recipient email addresses (comma-separated)')
    .option('--cc <addresses>', 'CC email addresses (comma-separated)')
    .option('--subject <text>', 'Email subject')
    .option('--body <text>', 'Email body')
    .action(sendCommand);

  // Search command
  program
    .command('search [keyword]')
    .description('Search emails')
    .option('--from <address>', 'Search by sender')
    .option('--subject <text>', 'Search by subject')
    .option('--folder <name>', 'Search in specific folder')
    .option('--date <date>', 'Search from date (YYYY-MM-DD)')
    .option(
      '--format <format>',
      'Output format (markdown, json, ids-only)',
      validateFormat,
      'markdown'
    )
    .option('--ids-only', 'Output only email IDs (same as --format ids-only)')
    .option(
      '--fields <fields>',
      'Select fields to display (comma-separated, e.g., "id,from,subject" or "*,^body")'
    )
    .action(searchCommand);

  // Draft command
  program
    .command('draft <action>')
    .description('Manage drafts (save|list|edit|delete|send|sync)')
    .option('--id <id>', 'Draft ID', parseInt)
    .option('--to <addresses>', 'Recipient email addresses (comma-separated)')
    .option('--cc <addresses>', 'CC email addresses (comma-separated)')
    .option('--subject <text>', 'Email subject')
    .option('--body <text>', 'Email body')
    .option('--sync', 'Sync draft to IMAP server')
    .option(
      '--limit <number>',
      'Number of drafts to show (default: 50)',
      parseInt
    )
    .action(draftCommand);

  // Spam command
  program
    .command('spam <action> [args...]')
    .description(
      'Manage spam (mark|unmark|list|blacklist|whitelist|filter|stats)'
    )
    .action(spamCommand);

  // Signature command
  program
    .command('signature <action>')
    .description('Manage signatures (create|list|edit|delete|set-default)')
    .option('--id <id>', 'Signature ID', parseInt)
    .option('--name <name>', 'Signature name')
    .option('--text <text>', 'Signature text content')
    .option('--html <html>', 'Signature HTML content')
    .option('--default', 'Set as default signature')
    .option('--account <email>', 'Account email address')
    .action(signatureCommand);

  // Template command
  program
    .command('template <action>')
    .description('Manage email templates (create|list|show|edit|delete|use)')
    .option('--id <id>', 'Template ID', parseInt)
    .option('--name <name>', 'Template name')
    .option('--subject <subject>', 'Template subject')
    .option('--text <text>', 'Template text content')
    .option('--html <html>', 'Template HTML content')
    .option('--account <id>', 'Account ID', parseInt)
    .option(
      '--enabled <boolean>',
      'Enable/disable template',
      (val) => val === 'true'
    )
    .option(
      '--vars <vars>',
      'Variables for template rendering (key=value,key2=value2)'
    )
    .action(templateCommand);

  // Notify command
  program
    .command('notify <action>')
    .description(
      'Manage email notifications (enable|disable|config|test|status)'
    )
    .option(
      '--sender <email>',
      'Filter by sender email or domain (comma-separated)'
    )
    .option('--tag <name>', 'Filter by tag name (comma-separated)')
    .option('--important', 'Only notify for important emails')
    .action(notifyCommand);

  // Delete command
  program
    .command('delete <email-id>')
    .description('Delete email (move to trash or permanently delete)')
    .option('--permanent', 'Permanently delete email')
    .option('--yes', 'Skip confirmation prompt')
    .action(deleteCommand);

  // Trash command
  program
    .command('trash <action> [args]')
    .description('Manage trash (list|empty|restore)')
    .option(
      '--limit <number>',
      'Number of emails to show (default: 50)',
      parseInt
    )
    .option('--offset <number>', 'Offset for pagination (default: 0)', parseInt)
    .option('--yes', 'Skip confirmation prompt')
    .action(trashCommand);

  // Reply command
  program
    .command('reply <email-id>')
    .description('Reply to an email')
    .option('--all', 'Reply to all recipients')
    .option('--body <text>', 'Reply body (non-interactive mode)')
    .option('--editor', 'Use editor for reply body')
    .action(replyCommand);

  // Forward command
  program
    .command('forward <email-id>')
    .description('Forward an email')
    .option('--to <addresses>', 'Forward to (comma-separated)')
    .option('--body <text>', 'Forward message')
    .option('--no-attachments', 'Do not include attachments')
    .action(forwardCommand);

  // Tag command
  program
    .command('tag <action> [args...]')
    .description('Manage tags (create|list|delete|add|remove|filter)')
    .option('--color <color>', 'Tag color in hex format (e.g., #FF0000)')
    .option('--description <text>', 'Tag description')
    .option(
      '--limit <number>',
      'Number of emails to show (default: 50)',
      parseInt
    )
    .option('--page <number>', 'Page number (default: 1)', parseInt)
    .option('--yes', 'Skip confirmation prompt')
    .action(tagCommand);

  // Star command
  program
    .command('star <email-id>')
    .description('Mark email as starred')
    .action(starCommand);

  // Unstar command
  program
    .command('unstar <email-id>')
    .description('Remove starred mark from email')
    .action(unstarCommand);

  // Flag command
  program
    .command('flag <email-id>')
    .description('Mark email as important (flagged)')
    .action(flagCommand);

  // Unflag command
  program
    .command('unflag <email-id>')
    .description('Remove important mark from email')
    .action(unflagCommand);

  // Account command
  program
    .command('account <action>')
    .description(
      'Manage email accounts (add|list|show|edit|delete|default|enable|disable|test|migrate)'
    )
    .option('--id <id>', 'Account ID', parseInt)
    .option('--email <email>', 'Email address')
    .option('--name <name>', 'Display name')
    .option('--imap-host <host>', 'IMAP server host')
    .option('--imap-port <port>', 'IMAP server port', parseInt)
    .option('--smtp-host <host>', 'SMTP server host')
    .option('--smtp-port <port>', 'SMTP server port', parseInt)
    .option('--username <username>', 'Account username')
    .option('--password <password>', 'Account password')
    .option('--test', 'Test connection after adding account')
    .option('--enabled-only', 'Show only enabled accounts')
    .option('--yes', 'Skip confirmation prompts')
    .action(accountCommand);

  // Contact command
  program
    .command('contact <action> [args...]')
    .description(
      'Manage contacts (add|list|show|edit|delete|search|group|import|export)'
    )
    .option('--email <email>', 'Contact email address')
    .option('--name <name>', 'Contact display name')
    .option('--phone <phone>', 'Contact phone number')
    .option('--company <company>', 'Contact company')
    .option('--title <title>', 'Contact job title')
    .option('--notes <notes>', 'Contact notes')
    .option('--favorite <boolean>', 'Mark as favorite (true/false)')
    .option('--group <name>', 'Filter by group name')
    .option('--favorites', 'Show only favorite contacts')
    .option('--limit <number>', 'Number of results to show', parseInt)
    .option('--description <text>', 'Group description')
    .option('--yes', 'Skip confirmation prompts')
    .action(contactCommand);

  // Folder command
  program
    .command('folder <action> [args...]')
    .description('Manage folders (list|create|delete|rename|favorite|stats)')
    .option('--name <name>', 'Folder name')
    .option('--new-name <name>', 'New folder name (for rename)')
    .option('--parent <name>', 'Parent folder name')
    .option('--account <id>', 'Account ID', parseInt)
    .option('--yes', 'Skip confirmation prompts')
    .action(folderCommand);

  interface ThreadOptions {
    folder?: string;
    limit?: number;
    account?: number;
    expanded?: boolean;
    permanent?: boolean;
    fields?: string;
  }

  // Thread command
  program
    .command('thread <action> [args...]')
    .description('Manage email threads (list|show|delete|move)')
    .option('--folder <name>', 'Folder to list threads from (default: INBOX)')
    .option(
      '--limit <number>',
      'Number of threads to show (default: 20)',
      parseInt
    )
    .option('--account <id>', 'Filter by account ID', parseInt)
    .option('--expanded', 'Show expanded thread view')
    .option('--permanent', 'Permanently delete thread')
    .option(
      '--fields <fields>',
      'Select fields to display (comma-separated, e.g., "id,subject,messageCount")'
    )
    .action((action: string, args: string[], options: ThreadOptions) => {
      if (action === 'list') {
        listThreads(options);
      } else if (action === 'show' && args.length > 0) {
        showThread(parseInt(args[0], 10), options);
      } else if (action === 'delete' && args.length > 0) {
        deleteThread(parseInt(args[0], 10), options);
      } else if (action === 'move' && args.length > 1) {
        moveThread(parseInt(args[0], 10), args[1], options);
      } else {
        console.error(
          chalk.red('Invalid thread command. Use: list|show|delete|move')
        );
        process.exit(1);
      }
    });

  // Export command
  program.addCommand(exportCommand);

  // Import command
  program.addCommand(importCommand);

  // Serve command
  program
    .command('serve')
    .description('Start HTTP API server for email management')
    .option('-p, --port <number>', 'Port number (default: 3000)', parseInt)
    .option('-h, --host <host>', 'Host address (default: 127.0.0.1)')
    .option('--allow-remote', 'Allow remote connections (bind to 0.0.0.0)')
    .action(serveCommand);

  return program;
}

export default createCLI;
