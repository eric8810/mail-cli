# Reading, Browsing & Searching Emails

## Reading & Browsing

**Purpose**: Fetch, list, and read emails from the local mailbox.

**When to use**: When the user wants to check inbox, find specific emails, or review email content.

**Best practices**:
- Always run `mail-cli sync` before listing if the user expects recent emails. Local storage may be stale.
- Use filters (`--unread`, `--starred`, `--tag`, `--folder`) to narrow results instead of listing everything.
- Use `--thread` view when the user is interested in a conversation rather than individual messages.
- Use pagination (`--limit`, `--offset`, `--page`) for large mailboxes to avoid overwhelming output.
- Use `--format json` when the agent needs to parse output programmatically; use `--format markdown` (default) when output is consumed by an LLM.
- Use `--fields` to request only the data needed, reducing token usage and keeping responses focused.

```bash
# Sync first, then list
mail-cli sync
mail-cli list --unread --limit 20

# Output format control
mail-cli list --format json                          # JSON for programmatic parsing
mail-cli list --format markdown                      # Markdown table (default, LLM-friendly)
mail-cli list --format html                          # HTML output

# Field selection — only return what you need
mail-cli list --fields id,from,subject,date          # Specific fields
mail-cli list --fields "*,^body"                     # All fields except body
mail-cli list --format json --fields id,subject      # Combine with format

# Read a specific email
mail-cli read <email-id>
mail-cli read <email-id> --format json --fields subject,from,body
mail-cli read <email-id> --raw    # Raw content for debugging

# Filter by multiple criteria
mail-cli list --folder INBOX --starred --account 2
mail-cli list --tag "urgent" --limit 10
mail-cli list --all-accounts      # Unified inbox across all accounts
mail-cli list --thread            # Conversation view

# Pagination
mail-cli list --limit 20 --page 2           # Page-based
mail-cli list --limit 20 --offset 40        # Offset-based
mail-cli list --ids-only                    # Only email IDs (minimal output)
```

## Searching

**Purpose**: Find emails matching specific criteria across the local mailbox.

**When to use**: When the user needs to locate emails by keyword, sender, subject, date, or folder.

**Best practices**:
- Combine keyword with `--from`, `--subject`, `--folder`, `--date` for precise results.
- Search operates on local storage — ensure a recent sync for up-to-date results.
- For broad searches, start with a keyword then narrow with additional flags.
- Use `--format json --fields` for agent-friendly output that's easy to parse.

```bash
mail-cli search "meeting" --from boss@company.com
mail-cli search "invoice" --folder INBOX --date 2024-01-01
mail-cli search --subject "quarterly report"
mail-cli search "budget" --format json --fields id,subject,from,date
mail-cli search "report" --ids-only    # Just IDs for piping to other commands
```

## Email Threading

**Purpose**: View and manage emails as grouped conversations instead of individual messages.

**When to use**: When the user wants to follow a conversation thread, understand the full context of an email exchange, or manage entire conversations at once.

**Best practices**:
- Use `thread show --expanded` to see all messages in a conversation.
- Use `thread move` to archive or reorganize entire conversations at once.
- Prefer thread view over individual email view when dealing with back-and-forth discussions.

```bash
mail-cli thread list --folder INBOX --limit 20
mail-cli thread list --fields id,subject,messageCount   # Select thread fields
mail-cli thread show <thread-id> --expanded
mail-cli thread move <thread-id> "Archive"
mail-cli thread delete <thread-id> --permanent
```
