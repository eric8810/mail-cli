# AI Agent Guide for Open Mail CLI

## Project Overview

Open Mail CLI is a command-line email client with IMAP/SMTP support built with Node.js 18+. It provides offline-first email management with SQLite storage, supporting features like email threading, contact management, signatures, spam detection, filters, templates, notifications, import/export, and multi-account support. The project uses modular architecture with clear separation of concerns across CLI, storage, IMAP/SMTP clients, and utility modules.

**Key Stats**: 100+ files, 32,000+ lines of code, 16 CLI commands, 11 modules

## Technology Stack

- **Runtime**: Node.js >= 18.0.0
- **Package Manager**: pnpm (pnpm@10.15.1+)
- **Database**: SQLite3 via better-sqlite3 (synchronous API, WAL mode, foreign keys enabled)
- **Email Protocols**: IMAP (node-imap v0.9.6+), SMTP (nodemailer v6.9.7+)
- **CLI Framework**: Commander.js v11.1.0+, Inquirer.js v8.2.6+
- **Email Parsing**: mailparser v3.6.5+
- **UI/UX**: Chalk v4.1.2+, Ora v5.4.1+, CLI-Table3 v0.6.3+
- **Other**: dotenv v16.3.1+, node-notifier v10.0.1+

## Build and Test Commands

```bash
# Install dependencies
pnpm install

# Run the application
pnpm start
# or
node src/index.js

# Run tests (currently no test files exist)
pnpm test
pnpm test:watch
pnpm test:coverage

# Lint code
pnpm lint
pnpm lint:fix

# Link globally for development
pnpm link
```

**Note**: The project has test scripts configured but no actual test files were found in `tests/` directory. Tests should be created using Jest.

## Project Structure

```
open-mail-cli/
├── src/
│   ├── index.js                 # Main entry point (#!/usr/bin/env node)
│   ├── cli/
│   │   ├── index.js            # CLI application setup with Commander.js
│   │   ├── commands/           # 16+ command implementations
│   │   │   ├── account.js      # Multi-account management
│   │   │   ├── config.js       # Configuration management
│   │   │   ├── contact.js      # Contact management
│   │   │   ├── delete.js       # Email deletion
│   │   │   ├── draft.js        # Draft management
│   │   │   ├── filter.js       # Email filter rules
│   │   │   ├── filter-quick.js # Quick filters
│   │   │   ├── folder.js       # Folder management
│   │   │   ├── forward.js      # Email forwarding
│   │   │   ├── import-export.js # EML/MBOX import/export
│   │   │   ├── list.js         # List emails
│   │   │   ├── mark.js         # Star/flag emails
│   │   │   ├── notify.js       # Notifications
│   │   │   ├── read.js         # Read email details
│   │   │   ├── reply.js        # Reply to emails
│   │   │   ├── search.js       # Search emails
│   │   │   ├── send.js         # Send emails
│   │   │   ├── signature.js    # Email signatures
│   │   │   ├── spam.js         # Spam detection
│   │   │   ├── sync.js         # IMAP sync (with daemon support)
│   │   │   ├── tag.js          # Tag management
│   │   │   ├── template.js     # Email templates
│   │   │   ├── thread.js       # Thread management
│   │   │   └── trash.js        # Trash management
│   │   └── utils/
│   │       └── formatter.js    # Output formatting utilities
│   ├── config/
│   │   ├── index.js            # ConfigManager singleton (load/save/validate)
│   │   ├── schema.js           # Configuration validation schema
│   │   └── defaults.js         # Default configuration values
│   ├── storage/
│   │   ├── database.js         # DatabaseManager singleton (SQLite)
│   │   ├── models/             # Data model classes
│   │   │   ├── account.js      # Account model
│   │   │   ├── attachment.js   # Attachment model
│   │   │   ├── contact.js      # Contact model
│   │   │   ├── contact_group.js # Contact group model
│   │   │   ├── email.js        # Email model
│   │   │   ├── filter.js       # Filter model
│   │   │   ├── folder.js       # Folder model
│   │   │   ├── saved-search.js # Saved search model
│   │   │   ├── signature.js    # Signature model
│   │   │   ├── spam.js         # Spam model
│   │   │   ├── tag.js          # Tag model
│   │   │   ├── template.js     # Template model
│   │   │   └── thread.js       # Thread model
│   │   └── migrations/
│   │       ├── 001_initial.js  # Initial schema (emails, attachments, folders)
│   │       ├── 002_p0_features.js # Reply/Forward, Drafts, Delete/Trash, Spam, Signatures
│   │       ├── 003_p1_features.js # Tags, Filters, Contacts, Multi-account, Threading
│   │       └── 004_p2_features.js # Templates, Notifications, Import/Export
│   ├── imap/
│   │   ├── client.js           # IMAPClient class (connection, folders, fetch)
│   │   └── sync.js             # Sync logic
│   ├── smtp/
│   │   ├── client.js           # SMTPClient class (connection, send)
│   │   └── composer.js         # Email composition
│   ├── accounts/
│   │   └── manager.js          # Account management
│   ├── contacts/
│   │   └── manager.js          # Contact management
│   ├── filters/
│   │   ├── engine.js           # FilterEngine (apply filters to emails)
│   │   ├── executor.js         # Execute filter actions
│   │   └── matcher.js          # Match emails against filter conditions
│   ├── spam/
│   │   ├── detector.js         # Spam detection logic
│   │   ├── filter.js           # Spam filtering
│   │   └── rules.js            # Spam rule management
│   ├── templates/
│   │   └── manager.js          # Template management
│   ├── threads/
│   │   ├── analyzer.js         # ThreadAnalyzer (analyze email relationships)
│   │   ├── builder.js          # ThreadBuilder (build thread trees)
│   │   └── index.js            # Thread module exports
│   ├── signatures/
│   │   └── manager.js          # Signature management
│   ├── notifications/
│   │   └── manager.js          # Notification management
│   ├── import-export/
│   │   ├── eml.js              # EML format handler
│   │   ├── mbox.js             # MBOX format handler
│   │   └── manager.js          # Import/export manager
│   ├── sync/
│   │   ├── index.js            # Sync module exports
│   │   ├── daemon.js           # Sync daemon
│   │   ├── daemon-worker.js    # Daemon worker
│   │   ├── scheduler.js        # Sync scheduler
│   │   └── account-manager.js  # Account sync management
│   └── utils/
│       ├── logger.js           # Logger singleton (ERROR, WARN, INFO, DEBUG)
│       ├── errors.js           # Custom error classes
│       ├── helpers.js          # Helper functions (encrypt/decrypt, paths)
│       └── email-parser.js     # Email parsing utilities
├── docs/                       # Documentation (mostly in Chinese)
├── data/                       # Runtime data directory (created automatically)
│   ├── config.json            # User configuration (passwords encrypted)
│   ├── mail.db                # SQLite database
│   └── logs/
│       └── open-mail-client.log    # Application logs
└── package.json               # Project configuration
```

## Code Style Guidelines

### General Style
- **Indentation**: 2 spaces (not tabs)
- **Variable declarations**: Prefer `const` over `let`. Never use `var`
- **String concatenation**: Use template literals (backticks) instead of `+`
- **Asynchronous code**: Use async/await instead of callbacks
- **Semicolons**: Use semicolons at end of statements
- **Quotes**: Use single quotes for strings, double quotes in JSON

### Naming Conventions
- **Files**: kebab-case (e.g., `email-parser.js`, `filter-quick.js`)
- **Classes**: PascalCase (e.g., `IMAPClient`, `ConfigManager`, `FilterEngine`)
- **Variables/Functions**: camelCase (e.g., `fetchEmails`, `markAsRead`, `emailData`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `MAX_ATTACHMENT_SIZE`, `DEFAULT_PORT`)
- **Private methods**: Prefix with underscore (e.g., `_ensureDataDir()`, `_matchFilter()`)
- **Singletons**: Export singleton instances (e.g., `module.exports = new ConfigManager()`)

### Documentation
- **JSDoc comments**: Required for all functions and classes
- **Format**: Block comments with description, parameters, and return values
```javascript
/**
 * Fetch emails from folder (headers only for sync)
 */
async fetchEmails(criteria = ['ALL'], options = {}) {
  // implementation
}
```

### Error Handling
- **Custom error classes**: Extend `MailClientError` (defined in `src/utils/errors.js`)
  - `ConfigError` - Configuration-related errors
  - `ConnectionError` - Network/connection failures
  - `AuthenticationError` - Authentication failures
  - `SyncError` - Synchronization errors
  - `StorageError` - Database/storage errors
- **Try-catch**: Wrap all async operations in try-catch blocks
- **Error logging**: Use `logger.error()` with context object
- **User-facing errors**: Display friendly messages, log technical details
- **Global error handlers**: Implemented in `src/index.js` (lines 26-36)

### Database Operations
- **Use prepared statements**: Always use parameterized queries to prevent SQL injection
- **Transactions**: Use for multi-step operations
- **Error handling**: Wrap in try-catch, throw `StorageError`
- **Singleton pattern**: Access database via `database.getDb()`

### CLI Command Pattern
Commands in `src/cli/commands/` follow this pattern:
```javascript
function commandName(options) {
  try {
    // Command logic
  } catch (error) {
    console.error(chalk.red('Error:'), error.message);
    logger.error('Command failed', { error: error.message });
    process.exit(1);
  }
}
module.exports = commandName;
```

## Architecture Patterns

### Singleton Pattern
Used for managers to ensure single instance:
- `ConfigManager` (src/config/index.js)
- `DatabaseManager` (src/storage/database.js)
- `Logger` (src/utils/logger.js)
- `FilterEngine` (src/filters/engine.js)
- `ThreadAnalyzer` (src/threads/analyzer.js)

### Model Pattern
Data models in `src/storage/models/` follow this structure:
- Constructor with database reference
- Private `_getDb()` method to get database instance
- CRUD methods: `create()`, `findById()`, `update()`, `delete()`
- Query methods: `findByFolder()`, `search()`, etc.
- Private `_formatEmail()` helper for formatting database records

### CLI Structure
- Main entry: `src/index.js` initializes database and runs CLI
- CLI setup: `src/cli/index.js` defines all commands using Commander.js
- Commands: Individual files in `src/cli/commands/` handle specific operations

### Database Schema
- **Migration system**: Versioned migrations in `src/storage/migrations/`
- **WAL mode**: Enabled for better concurrency
- **Foreign keys**: Enabled with `ON DELETE CASCADE`
- **Indexes**: Created on frequently queried columns
- **Timestamps**: `created_at` and `updated_at` on most tables

## Configuration

### Config File Location
- **Linux/macOS**: `~/.config/open-mail-client/config.json`
- **Windows**: `%APPDATA%\open-mail-client\config.json`

### Config Structure
```javascript
{
  imap: {
    host: 'imap.example.com',
    port: 993,
    secure: true,
    user: 'user@example.com',
    password: 'encrypted_password'
  },
  smtp: {
    host: 'smtp.example.com',
    port: 465,
    secure: true,
    user: 'user@example.com',
    password: 'encrypted_password'
  }
}
```

### Security
- Passwords are encrypted using Node.js crypto module (see `src/utils/helpers.js`)
- TLS/SSL enforced for IMAP/SMTP connections
- Database file with restricted permissions
- Sensitive information never logged

## Testing

### Current State
- Test scripts configured in `package.json` but no test files exist
- Should use Jest for testing (configured as dev dependency)
- Test files should be placed in `tests/` directory with `.test.js` or `.spec.js` extension

### Running Tests
```bash
# Run all tests
pnpm test

# Run specific test file
pnpm test -- path/to/test/file.test.js

# Watch mode
pnpm test:watch

# Coverage report
pnpm test:coverage
```

### Test Organization
- Unit tests for individual modules
- Integration tests for database operations
- End-to-end tests for CLI commands
- Mock IMAP/SMTP connections for testing

## Important Implementation Details

### Email Synchronization
- **Incremental sync**: Uses IMAP UID to track new emails
- **Batch processing**: Fetches emails in batches (default 100) to avoid timeouts
- **Lazy loading**: Email body fetched on demand (headers only during sync)
- **Performance logging**: Extensive `[PERF]` logging in sync operations

### Thread Analysis
- **Subject normalization**: Removes Re:, Fwd:, etc. prefixes
- **Relationship detection**: Uses In-Reply-To, References headers, and subject similarity
- **Levenshtein distance**: For calculating subject similarity
- **Confidence scoring**: Different methods have different confidence levels

### Filter Engine
- **Condition matching**: Supports AND (matchAll) and OR (matchAny) logic
- **Action execution**: Can move, tag, mark read/starred, delete, forward emails
- **Priority system**: Filters execute in priority order
- **Enabled/disabled**: Filters can be toggled without deletion

### Spam Detection
- **Bayesian filtering**: Statistical approach to spam detection
- **Blacklist/whitelist**: Domain and email address lists
- **Rule-based**: Configurable spam rules with priority
- **Keywords**: Pattern matching for common spam terms

## Common Tasks

### Adding a New CLI Command
1. Create command file in `src/cli/commands/`
2. Export a function that accepts `options` parameter
3. Register command in `src/cli/index.js` using `program.command()`
4. Follow error handling pattern with try-catch
5. Use `chalk` for colored output, `logger` for debugging

### Adding a New Database Table
1. Create migration file in `src/storage/migrations/`
2. Implement `up(db)` and `down(db)` functions
3. Register migration in `src/storage/database.js` `runMigrations()`
4. Create model file in `src/storage/models/`
5. Add indexes for frequently queried columns

### Adding a New Feature Module
1. Create directory under appropriate category (e.g., `src/feature/`)
2. Implement manager class with singleton pattern
3. Add model in `src/storage/models/` if needed
4. Create migration if database changes required
5. Add CLI command in `src/cli/commands/`
6. Update documentation

## Security Considerations

- **Never log passwords or sensitive data**
- **Always use parameterized queries** to prevent SQL injection
- **Encrypt passwords in config file** using provided encryption functions
- **Validate all user input** before processing
- **Use TLS/SSL** for all IMAP/SMTP connections
- **Sanitize email content** before display to prevent XSS (when rendering HTML)
- **Restrict file permissions** on config and database files

## Performance Optimization

- **Database indexes**: Created on uid, folder, date, from_address, subject
- **WAL mode**: Enabled for better write performance
- **Batch operations**: Fetch/process emails in batches
- **Lazy loading**: Email bodies fetched on demand
- **Connection pooling**: IMAP connections reused when possible
- **Query optimization**: Use LIMIT/OFFSET for pagination

## Troubleshooting

### Common Issues
1. **Database locked**: Ensure only one instance running, check WAL file
2. **IMAP connection failed**: Check credentials, host, port, TLS settings
3. **Migration errors**: Database schema may be out of sync, check migrations
4. **Config not loading**: Check file path and permissions
5. **Permission denied**: Check data directory permissions

### Debugging
- Set log level to DEBUG: `logger.setLevel('DEBUG')`
- Check log file: `data/logs/open-mail-client.log`
- Use `--help` flag for command options
- Enable verbose logging for sync operations

## Language and Documentation

- **Primary documentation language**: Chinese (docs/ directory)
- **Code comments**: English
- **User-facing messages**: English in CLI, Chinese in docs
- **Error messages**: English
- **JSDoc comments**: English

## Dependencies

Key dependencies and their purposes:
- `better-sqlite3`: Synchronous SQLite database driver
- `chalk`: Terminal string styling
- `cli-table3`: Formatted table output
- `commander`: CLI framework for command parsing
- `inquirer`: Interactive command-line prompts
- `mailparser`: Email parsing (MIME, HTML, attachments)
- `node-imap`: IMAP client implementation
- `node-notifier`: Desktop notifications
- `nodemailer`: SMTP client for sending emails
- `ora`: Elegant terminal spinners

## Notes for AI Agents

1. **Always check existing patterns** before adding new code
2. **Use established singleton managers** instead of creating new instances
3. **Follow the error handling pattern** with custom error classes
4. **Log all operations** with appropriate levels (ERROR, WARN, INFO, DEBUG)
5. **Validate configuration** before use
6. **Use prepared statements** for all database operations
7. **Encrypt sensitive data** before storing
8. **Add JSDoc comments** to all functions and classes
9. **Test CLI commands** manually before submitting
10. **Run lint command** (`pnpm lint`) before committing changes

## Development Workflow

1. Make code changes
2. Run `pnpm lint` and fix any issues
3. Test CLI commands manually
4. Check logs for errors or warnings
5. Update documentation if needed
6. Add tests if adding new functionality
7. Run `pnpm test` if tests exist
