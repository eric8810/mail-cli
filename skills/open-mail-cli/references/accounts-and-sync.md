# Account Management & Sync

## Account Management

**Purpose**: Configure and manage multiple email accounts (Gmail, Outlook, QQ Mail, etc.).

**When to use**: When setting up the tool for the first time, adding a new mailbox, switching between accounts, or diagnosing connection issues.

**Best practices**:
- Always use `--test` when adding an account to verify IMAP/SMTP connectivity immediately.
- Set a default account so commands without `--account` use the right mailbox.
- Disable unused accounts instead of deleting them to preserve historical data.

```bash
mail-cli account add --email user@gmail.com --name "Work Gmail" \
  --imap-host imap.gmail.com --imap-port 993 \
  --smtp-host smtp.gmail.com --smtp-port 465 \
  --username user@gmail.com --password "app-password" --test

mail-cli account list
mail-cli account show --id 1
mail-cli account default --id 1    # Set as default
mail-cli account test --id 1       # Test connection
mail-cli account enable --id 2
mail-cli account disable --id 2
mail-cli account edit --id 1 --name "Personal Gmail"
mail-cli account delete --id 1 --yes
```

## Sync & Background Daemon

**Purpose**: Fetch emails from the remote IMAP server to local storage, with optional continuous background sync.

**When to use**:
- Run `sync` before any read/list/search operation if the user expects fresh data.
- Use daemon mode when the user needs real-time email monitoring or continuous inbox awareness.

**Best practices**:
- For first-time sync on a large mailbox, use `--since` to limit the date range and avoid long waits.
- Use `--folders` to sync only relevant folders instead of everything.
- Start the daemon for long-running sessions; stop it when done to free resources.
- Check daemon status before starting a new one to avoid duplicates.

```bash
mail-cli sync                              # Sync default inbox
mail-cli sync --folder Sent                # Sync specific folder
mail-cli sync --folders "INBOX,Sent,Drafts" # Sync multiple folders
mail-cli sync --since 2024-06-01           # Limit sync range
mail-cli sync --account 2                  # Sync specific account
mail-cli sync --auto --interval 5          # Auto sync every 5 minutes

# Daemon mode for continuous background sync
mail-cli sync daemon start
mail-cli sync daemon status
mail-cli sync daemon logs --lines=100
mail-cli sync daemon stop
```

## Common Email Provider Settings

| Provider | IMAP Host | IMAP Port | SMTP Host | SMTP Port |
|----------|-----------|-----------|-----------|-----------|
| Gmail | imap.gmail.com | 993 | smtp.gmail.com | 465 |
| Outlook | outlook.office365.com | 993 | smtp.office365.com | 587 |
| QQ Mail | imap.qq.com | 993 | smtp.qq.com | 465 |
| Yahoo | imap.mail.yahoo.com | 993 | smtp.mail.yahoo.com | 465 |
| 163 Mail | imap.163.com | 993 | smtp.163.com | 465 |

> **Note**: For Gmail, use an [App Password](https://myaccount.google.com/apppasswords) instead of your regular password. For QQ Mail, use an authorization code from QQ Mail settings.

## Troubleshooting

- **Connection refused**: Verify IMAP/SMTP host and port. Ensure your firewall allows outbound connections on ports 993/465.
- **Authentication failed**: Check username/password. For Gmail, use App Passwords. For QQ Mail, use authorization codes.
- **Sync timeout**: Try `mail-cli sync --since <recent-date>` to limit the sync range.
- **Database locked**: Ensure no other mail-cli process is running. Check `mail-cli sync daemon status`.
- **No emails shown**: Run `mail-cli sync` first to fetch emails from the server to local storage.
