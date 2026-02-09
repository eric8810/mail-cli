# Automation: Templates, Signatures, Notifications, Spam & Import/Export

## Email Templates

**Purpose**: Create reusable email templates with `{{variable}}` placeholders for dynamic content generation.

**When to use**: When the user sends similar emails repeatedly (meeting invites, status updates, outreach, notifications) and wants to standardize the format while customizing details.

**Best practices**:
- Design templates with clear variable names that describe the expected content.
- Use templates for any email sent more than twice with the same structure.
- Test templates with `template show` before using them in production.

```bash
# Create a reusable template
mail-cli template create --name "Meeting Invite" \
  --subject "Meeting: {{topic}} on {{date}}" \
  --text "Hi {{name}}, let's meet at {{time}} in {{location}}. Agenda: {{agenda}}"

# Preview and use
mail-cli template list
mail-cli template show --id 1
mail-cli template use --id 1 \
  --vars "name=John,topic=Q1 Review,date=Monday,time=2pm,location=Room A,agenda=Budget review"

# Maintain templates
mail-cli template edit --id 1 --subject "Updated: {{topic}} on {{date}}"
mail-cli template delete --id 1
```

## Email Signatures

**Purpose**: Manage reusable signature blocks that are automatically appended to outgoing emails.

**When to use**: When the user has different identities or roles requiring different sign-offs (e.g., work vs. personal).

**Best practices**:
- Create separate signatures for different contexts (work, personal, formal).
- Set the most frequently used signature as default.
- Use HTML signatures for rich formatting when recipients use modern email clients.

```bash
mail-cli signature create --name "Work" \
  --text "Best regards, John Doe | ACME Corp" \
  --html "<p>Best regards,<br><b>John Doe</b> | ACME Corp</p>" --default
mail-cli signature list
mail-cli signature set-default --id 2
mail-cli signature edit --id 1 --text "Updated signature"
mail-cli signature delete --id 1
```

## Notifications

**Purpose**: Configure desktop alerts for incoming emails with intelligent filtering.

**When to use**: When the user wants real-time awareness of important incoming emails without constantly checking the inbox.

**Best practices**:
- Combine with daemon mode (`sync daemon start`) for real-time notification delivery.
- Use sender and tag filters to avoid notification fatigue — only alert on what matters.
- Use `--important` to limit notifications to flagged/important emails only.
- Test notifications after configuration to verify they work correctly.

```bash
mail-cli notify enable
mail-cli notify config --sender boss@company.com --important
mail-cli notify config --tag urgent
mail-cli notify test       # Verify notification delivery
mail-cli notify status     # Check current configuration
mail-cli notify disable
```

## Spam Management

**Purpose**: Detect, filter, and manage unwanted emails using Bayesian filtering and custom rules.

**When to use**: When the user is receiving unwanted emails and wants to train the spam filter, manage blacklists/whitelists, or clean up the inbox.

**Best practices**:
- Mark spam consistently to train the Bayesian filter for better accuracy over time.
- Use blacklist for known spam senders; whitelist for trusted senders that get false-positived.
- Run `spam filter` periodically to apply rules to new emails in the inbox.
- Check `spam stats` to monitor filter effectiveness.

```bash
mail-cli spam mark <email-id>       # Train filter: this is spam
mail-cli spam unmark <email-id>     # Train filter: this is not spam
mail-cli spam list                  # View detected spam

mail-cli spam blacklist add spammer@evil.com
mail-cli spam blacklist remove spammer@evil.com
mail-cli spam whitelist add trusted@partner.com

mail-cli spam filter                # Apply spam rules to inbox
mail-cli spam stats                 # View filter accuracy and statistics
```

## Contacts

**Purpose**: Maintain an address book with contact details, groups, and import/export capabilities.

**When to use**: When the user needs to look up email addresses, organize recipients into groups, or manage a contact list.

**Best practices**:
- Use contact groups to manage mailing lists (e.g., "Team", "Clients").
- Use `contact search` to quickly find addresses instead of browsing the full list.
- Import/export contacts via CSV for bulk operations or backup.

```bash
mail-cli contact add --email john@company.com --name "John Doe" --company "ACME"
mail-cli contact list --favorites --limit 20
mail-cli contact search "John"
mail-cli contact show <contact-id>
mail-cli contact edit <contact-id> --phone "+1234567890"
mail-cli contact delete <contact-id> --yes

# Groups for organizing recipients
mail-cli contact group create "Engineering" --description "Engineering team"
mail-cli contact group add <contact-id> "Engineering"
mail-cli contact group list
mail-cli contact group remove <contact-id> "Engineering"

# Bulk operations
mail-cli contact import contacts.csv
mail-cli contact export contacts.csv
```

## Import / Export

**Purpose**: Move emails in and out of the system using standard EML and MBOX formats.

**When to use**: When migrating from another email client, creating backups, archiving old emails, or sharing specific emails as files.

**Best practices**:
- Use MBOX format for bulk operations (entire folders); EML for individual emails.
- Export important folders regularly as backup.
- When importing, specify the target `--folder` to keep the mailbox organized.

```bash
# Export individual email or entire folder
mail-cli export eml <email-id> output.eml
mail-cli export folder INBOX backup.mbox

# Import from files
mail-cli import eml message.eml --folder INBOX
mail-cli import mbox backup.mbox --folder Archive
```
