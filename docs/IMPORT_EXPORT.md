# Email Import/Export Feature

This document describes the email import/export functionality implemented in the mail client.

## Features

### Export Formats
- **EML**: Export individual emails in EML format (RFC 822)
- **MBOX**: Export multiple emails in MBOX format (Unix mailbox)

### Import Formats
- **EML**: Import individual EML files
- **MBOX**: Import MBOX files with multiple emails

### Key Capabilities
- Preserve email metadata (date, sender, recipients, subject)
- Support for attachments (export and import)
- Duplicate detection based on Message-ID (incremental import)
- Batch operations with progress tracking
- Error handling and logging

## CLI Commands

### Export Commands

#### Export Single Email to EML
```bash
mail-cli export email <id> <file>
```
Example:
```bash
mail-cli export email 123 ~/backup/email-123.eml
```

#### Export Folder to MBOX
```bash
mail-cli export folder <folder> <file>
```
Example:
```bash
mail-cli export folder INBOX ~/backup/inbox.mbox
```

#### Export All Emails to MBOX
```bash
mail-cli export all <file>
```
Example:
```bash
mail-cli export all ~/backup/all-emails.mbox
```

### Import Commands

#### Import EML File
```bash
mail-cli import eml <file> [options]
```
Options:
- `-f, --folder <folder>`: Target folder (default: INBOX)
- `-a, --account <id>`: Account ID

Example:
```bash
mail-cli import eml ~/backup/email.eml --folder INBOX
mail-cli import eml ~/backup/email.eml --folder Archive --account 1
```

#### Import MBOX File
```bash
mail-cli import mbox <file> [options]
```
Options:
- `-f, --folder <folder>`: Target folder (default: INBOX)
- `-a, --account <id>`: Account ID

Example:
```bash
mail-cli import mbox ~/backup/inbox.mbox --folder INBOX
mail-cli import mbox ~/backup/archive.mbox --folder Archive --account 1
```

## Implementation Details

### File Structure
```
src/import-export/
├── eml.js          # EML format handler
├── mbox.js         # MBOX format handler
└── manager.js      # Import/Export manager
```

### EML Handler (`eml.js`)
- **parse(filePath)**: Parse EML file and extract email data
- **generate(emailData, filePath)**: Generate EML file from email data
- Supports multipart/alternative (text + HTML)
- Handles email headers and MIME encoding

### MBOX Handler (`mbox.js`)
- **parse(filePath, onEmail)**: Parse MBOX file with callback for each email
- **generate(emails, filePath)**: Generate MBOX file from email array
- **append(emailData, filePath)**: Append email to existing MBOX file
- Follows MBOX format specification (From_ line separator)

### Import/Export Manager (`manager.js`)
- **exportEmailToEml(emailId, filePath)**: Export single email
- **exportFolderToMbox(folderName, filePath, onProgress)**: Export folder
- **exportAllToMbox(filePath, onProgress)**: Export all emails
- **importEml(filePath, folder, accountId)**: Import EML file
- **importMbox(filePath, folder, accountId, onProgress)**: Import MBOX file
- **batchExportToMbox(emailIds, filePath, onProgress)**: Batch export

### Duplicate Detection
- Uses Message-ID header to detect duplicates
- Skips emails that already exist in the database
- Reports skipped emails in import results

### Attachment Handling
- Exports: Reads attachment files from storage and includes in export
- Imports: Saves attachment content to files in attachments directory
- Preserves filename, content type, and size metadata

### Progress Tracking
- Export operations report progress (current/total)
- Import operations report imported/skipped/errors counts
- CLI displays progress with ora spinner

## Usage Examples

### Backup Workflow
```bash
# Export all emails to backup
mail-cli export all ~/backup/all-emails-$(date +%Y%m%d).mbox

# Export specific folder
mail-cli export folder "Important" ~/backup/important.mbox
```

### Migration Workflow
```bash
# Import emails from another client
mail-cli import mbox ~/old-client/inbox.mbox --folder INBOX
mail-cli import mbox ~/old-client/sent.mbox --folder Sent
```

### Single Email Operations
```bash
# Export important email
mail-cli export email 456 ~/documents/contract-email.eml

# Import email from file
mail-cli import eml ~/downloads/invoice.eml --folder Receipts
```

## Error Handling

### Export Errors
- Email not found: Returns error message
- Attachment read failure: Logs warning, continues without attachment
- File write failure: Returns error with details

### Import Errors
- Invalid file format: Returns parse error
- Duplicate email: Skips and reports as duplicate
- Attachment save failure: Logs error, continues with email import
- Database errors: Returns error and stops import

## Testing

Run the test suite:
```bash
node test-import-export.js
```

Tests cover:
- EML generation and parsing
- MBOX generation and parsing
- Round-trip conversion (generate → parse → verify)

## Dependencies

- **mailparser**: Email parsing library (already in package.json)
- **fs/promises**: File system operations
- **ora**: Progress spinner for CLI
- **commander**: CLI framework

## Future Enhancements

Potential improvements:
- Support for additional formats (PST, MSG)
- Compression support (gzip MBOX files)
- Selective export (date range, filters)
- Import from remote URLs
- Export to cloud storage
- Attachment extraction tool
