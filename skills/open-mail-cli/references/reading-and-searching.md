# Reading, Browsing & Searching Emails

## Reading & Browsing

**Purpose**: Fetch, list, and read emails from the local mailbox.

**When to use**: When the user wants to check inbox, find specific emails, or review email content.

**Best practices**:
- Always run `mail-cli sync` before listing if the user expects recent emails. Local storage may be stale.
- Use filters (`--unread`, `--starred`, `--tag`, `--folder`) to narrow results instead of listing everything.
- Use `--thread` view when the user is interested in a conversation rather than individual messages.
- Use pagination (`--limit`, `--page`) for large mailboxes to avoid overwhelming output.

```bash
# Sync first, then list
mail-cli sync
mail-cli list --unread --limit 20

# Read a specific email
mail-cli read <email-id>
mail-cli read <email-id> --raw    # Raw content for debugging

# Filter by multiple criteria
mail-cli list --folder INBOX --starred --account 2
mail-cli list --tag "urgent" --limit 10
mail-cli list --all-accounts      # Unified inbox across all accounts
mail-cli list --thread            # Conversation view
mail-cli list --limit 100 --page 2  # Pagination
```

## Searching

**Purpose**: Find emails matching specific criteria across the local mailbox.

**When to use**: When the user needs to locate emails by keyword, sender, subject, date, or folder.

**Best practices**:
- Combine keyword with `--from`, `--subject`, `--folder`, `--date` for precise results.
- Search operates on local storage — ensure a recent sync for up-to-date results.
- For broad searches, start with a keyword then narrow with additional flags.

```bash
mail-cli search "meeting" --from boss@company.com
mail-cli search "invoice" --folder INBOX --date 2024-01-01
mail-cli search --subject "quarterly report"
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
mail-cli thread show <thread-id> --expanded
mail-cli thread move <thread-id> "Archive"
mail-cli thread delete <thread-id> --permanent
```
