# Sending, Replying & Forwarding Emails

## Sending Emails

**Purpose**: Compose and deliver emails to one or more recipients.

**When to use**: When the user asks to send a message, notify someone, or deliver information via email.

**Best practices**:
- Always confirm recipient address and subject with the user before sending.
- Use `--cc` for secondary recipients who need visibility but no action required.
- For repetitive emails, prefer creating a template first (see Templates), then use `template use` to send.

```bash
mail-cli send --to recipient@example.com --subject "Subject" --body "Content"
mail-cli send --to a@b.com,b@c.com --cc manager@b.com --subject "Report" --body "Attached"
```

## Replying

**Purpose**: Respond to an existing email, preserving the conversation context.

**When to use**: When the user wants to reply to a specific email in their inbox.

**Best practices**:
- Use `reply --all` only when all original recipients need to see the response.
- Default `reply` sends only to the original sender — this is usually the safer choice.

```bash
mail-cli reply <email-id> --body "Thanks, confirmed."
mail-cli reply <email-id> --all --body "Noted, will follow up."
```

## Forwarding

**Purpose**: Redistribute an existing email to new recipients.

**When to use**: When the user wants to share an email with someone who wasn't on the original thread.

**Best practices**:
- Add context in `--body` to explain why the email is being shared.
- Use `--no-attachments` if attachments are large or irrelevant to the new recipient.

```bash
mail-cli forward <email-id> --to colleague@company.com --body "FYI - see below"
mail-cli forward <email-id> --to a@b.com --no-attachments
```

## Drafts

**Purpose**: Save work-in-progress emails for later editing and sending.

**When to use**: When composing a complex email that needs review, or when the user wants to prepare emails in advance.

**Best practices**:
- Save drafts early for long emails to avoid losing content.
- Use `draft sync` to push drafts to the IMAP server so they appear on other devices.
- Always review a draft with `draft list` before sending.

```bash
mail-cli draft save --to user@b.com --subject "Proposal" --body "Draft content..."
mail-cli draft list
mail-cli draft edit --id 1 --body "Updated content"
mail-cli draft send --id 1
mail-cli draft delete --id 1
mail-cli draft sync    # Sync drafts to IMAP server for cross-device access
```
