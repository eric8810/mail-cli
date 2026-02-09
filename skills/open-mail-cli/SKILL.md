---
name: open-mail-cli
description: >
  Gives the agent the ability to send, receive, search, and manage emails directly from the terminal.
  Use this skill when the agent needs to handle email tasks: sending messages, reading inbox,
  replying, forwarding, managing contacts, organizing with tags/folders/filters, scheduling
  background sync, or automating email workflows. Supports IMAP/SMTP with Gmail, Outlook, QQ Mail,
  and other standard providers. Activates on keywords: send email, check inbox, reply, forward,
  email automation, contacts, email template, notifications.
---

# Open Mail CLI - Agent Email Toolkit

This skill equips the agent with a full-featured email client accessible via the `mail-cli` command. The agent can send, receive, search, organize, and automate emails entirely from the terminal through IMAP/SMTP protocols, with offline-first local storage.

## Installation

```bash
npm install -g open-mail-cli
# Requirements: Node.js >= 18.0.0
```

## Getting Started

### 1. Configure an Email Account

```bash
# Interactive wizard (recommended)
mail-cli config

# Or manual setup
mail-cli account add --email user@gmail.com --name "My Gmail" \
  --imap-host imap.gmail.com --imap-port 993 \
  --smtp-host smtp.gmail.com --smtp-port 465 \
  --username user@gmail.com --password "app-password" --test
```

### 2. Sync, Read, and Send

```bash
mail-cli sync                # Fetch emails from server
mail-cli list --unread       # Browse unread emails
mail-cli read <email-id>     # Read a specific email
mail-cli send --to user@example.com --subject "Hello" --body "Content"
```

## Capabilities Overview

Choose the reference that matches the task at hand. Each reference includes purpose, scenarios, best practices, and full command syntax.

### Sending & Composing
> Reference: [references/sending-and-replying.md](references/sending-and-replying.md)

Send emails, reply to conversations, forward messages, and manage drafts. Use this when the user needs to compose or respond to emails.

### Reading & Searching
> Reference: [references/reading-and-searching.md](references/reading-and-searching.md)

List, filter, read, and search emails. View conversations as threads. Use this when the user wants to check inbox, find specific emails, or follow a conversation.

### Organization
> Reference: [references/organization.md](references/organization.md)

Organize emails with tags, folders, stars, flags, and trash management. Use this when the user wants to categorize, prioritize, or clean up their mailbox.

### Accounts & Sync
> Reference: [references/accounts-and-sync.md](references/accounts-and-sync.md)

Manage multiple email accounts, configure IMAP/SMTP, run background sync daemon. Includes provider settings table (Gmail, Outlook, QQ Mail, etc.) and troubleshooting. Use this for setup, connectivity issues, or multi-account workflows.

### Automation
> Reference: [references/automation.md](references/automation.md)

Email templates with variables, signatures, desktop notifications, spam filtering, contact management, and import/export. Use this when the user wants to automate repetitive email tasks or manage contacts and spam.

## Key Principles

- **Sync before read**: Local storage is offline-first. Always `mail-cli sync` before listing or searching if fresh data is expected.
- **Confirm before send**: Always verify recipient, subject, and content with the user before executing `send`, `reply`, or `forward`.
- **Non-destructive by default**: `delete` moves to trash. Only use `--permanent` when the user explicitly requests irreversible deletion.
- **Use `--yes` for automation**: Skip interactive confirmation prompts in automated workflows.
- **Templates over repetition**: If the user sends similar emails more than twice, create a template.
- **Tags for cross-cutting, folders for exclusive**: An email can have multiple tags but belongs to one folder.
