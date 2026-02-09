# Email Organization: Tags, Folders, Stars & Trash

## Tags & Labels

**Purpose**: Categorize and organize emails with custom tags for quick retrieval.

**When to use**: When the user wants to classify emails by project, priority, topic, or any custom category.

**Best practices**:
- Create tags with meaningful colors to enable visual distinction.
- Use `tag filter` to quickly retrieve all emails under a category.
- Prefer tags over folders for cross-cutting categories (an email can have multiple tags but lives in one folder).

```bash
mail-cli tag create "urgent" --color "#FF0000" --description "Needs immediate attention"
mail-cli tag create "project-x" --color "#0066FF" --description "Project X related"
mail-cli tag list
mail-cli tag add <email-id> "urgent"
mail-cli tag remove <email-id> "urgent"
mail-cli tag filter "project-x" --limit 50
mail-cli tag delete "old-tag" --yes
```

## Star & Flag (Priority Marking)

**Purpose**: Quickly mark emails as starred (follow-up) or flagged (important).

**When to use**: When the user wants to highlight specific emails for later attention without creating a full tag system.

**Best practices**:
- Use `star` for "need to follow up" and `flag` for "important" — they serve different purposes.
- Combine with `list --starred` or `list --flagged` to review marked emails.

```bash
mail-cli star <email-id>       # Mark for follow-up
mail-cli unstar <email-id>
mail-cli flag <email-id>       # Mark as important
mail-cli unflag <email-id>

# Review marked emails
mail-cli list --starred
mail-cli list --flagged
```

## Folder Management

**Purpose**: Organize the mailbox structure with custom folders and subfolders.

**When to use**: When the user needs to create organizational structure, check folder statistics, or reorganize the mailbox.

**Best practices**:
- Use folders for mutually exclusive categories (an email belongs to one folder).
- Use `folder stats` to understand mailbox distribution before reorganizing.
- Favorite frequently accessed folders for quick reference.

```bash
mail-cli folder list
mail-cli folder create --name "Projects" --parent "INBOX"
mail-cli folder rename --name "Projects" --new-name "Active Projects"
mail-cli folder stats --name "INBOX"
mail-cli folder favorite --name "INBOX"
mail-cli folder delete --name "old-folder" --yes
```

## Trash & Deletion

**Purpose**: Safely delete emails with recovery options, or permanently remove them.

**When to use**: When the user wants to clean up the mailbox, recover accidentally deleted emails, or permanently purge old messages.

**Best practices**:
- Default `delete` moves to trash (recoverable). Use `--permanent` only when the user explicitly wants irreversible deletion.
- Always use `--yes` flag in automated workflows to skip confirmation prompts.
- Use `trash restore` to recover accidentally deleted emails before emptying trash.

```bash
mail-cli delete <email-id>                    # Move to trash (recoverable)
mail-cli delete <email-id> --permanent --yes  # Permanent deletion

mail-cli trash list --limit 50
mail-cli trash restore <email-id>
mail-cli trash empty --yes                    # Permanently purge all trash
```
