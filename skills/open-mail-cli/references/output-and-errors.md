# Output Format Control & Error Handling

## Output Formats

**Purpose**: Control how command output is structured for different consumers (LLMs, scripts, humans).

**When to use**: When the agent needs to parse output programmatically, reduce token usage, or present data in a specific format.

**Best practices**:
- Use `--format json` when the agent needs to parse output (e.g. extract email IDs, iterate over results).
- Use `--format markdown` (default) when output is consumed by an LLM — tables are optimized for context windows.
- Use `--format html` for email body rendering with rich formatting.
- Use `--ids-only` when only email IDs are needed (minimal output, useful for piping).

```bash
# Format options
mail-cli list --format markdown      # Default: Markdown table
mail-cli list --format json          # JSON array for programmatic parsing
mail-cli list --format html          # HTML output
mail-cli list --ids-only             # Only email IDs, one per line

# Works with list, read, search, and thread commands
mail-cli read <email-id> --format json
mail-cli search "invoice" --format json
```

## Field Selection

**Purpose**: Request only specific fields in command output, reducing noise and token consumption.

**When to use**: When the agent only needs certain data points (e.g. just IDs and subjects, not full bodies).

**Syntax**:
- Comma-separated field names: `--fields id,subject,from`
- All fields: `--fields "*"`
- Exclude fields: `--fields "*,^body"` (all fields except body)

```bash
# Select specific fields
mail-cli list --fields id,subject,from,date
mail-cli list --format json --fields id,subject    # Combine with format

# Exclude heavy fields
mail-cli list --fields "*,^body"                   # Everything except body

# Works with read, list, search, thread
mail-cli read <email-id> --fields subject,from,body
mail-cli search "report" --fields id,subject,date
mail-cli thread list --fields id,subject,messageCount
```

## Pagination

**Purpose**: Navigate large result sets without overwhelming output or context windows.

**When to use**: When listing or searching emails in large mailboxes.

**Best practices**:
- Output includes range annotations (e.g. "Showing 1-20 of 150") so the agent knows its position.
- Use `--limit` + `--page` for page-based navigation, or `--limit` + `--offset` for precise control.

```bash
mail-cli list --limit 20                    # First 20 results
mail-cli list --limit 20 --page 2           # Results 21-40
mail-cli list --limit 20 --offset 40        # Results 41-60
mail-cli search "meeting" --limit 10        # Limit search results
```

## Exit Codes

**Purpose**: Standardized exit codes allow the agent to determine failure type without parsing error text.

| Exit Code | Meaning | Example |
|-----------|---------|---------|
| 0 | Success | Command completed normally |
| 1 | General error | Unexpected failure |
| 2 | Validation / parameter error | Missing required argument, invalid config |
| 3 | Network / connection error | IMAP server unreachable |
| 4 | Authentication error | Wrong password, expired token |
| 5 | Permission error | Insufficient access rights |

**Agent usage**: Check `$?` after command execution to branch error handling logic.

```bash
mail-cli sync
# $? = 0 → success
# $? = 3 → network issue, retry later
# $? = 4 → auth failed, re-authenticate
```

## JSON Error Output

**Purpose**: When `--format json` is used, errors are returned as structured JSON instead of plain text.

**Format**:
```json
{
  "error": {
    "code": "AUTHENTICATION_ERROR",
    "message": "Invalid credentials for account 1"
  }
}
```

This allows agents to parse error details programmatically and take appropriate action based on the error code.
