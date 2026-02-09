import chalk from 'chalk';
import Table from 'cli-table3';
import inquirer from 'inquirer';
import ora from 'ora';

import config from '../../config';
import IMAPSync from '../../imap/sync';
import SMTPClient from '../../smtp/client';
import EmailComposer from '../../smtp/composer';
import emailModel from '../../storage/models/email';
import logger from '../../utils/logger';

/**
 * Draft command - Manage email drafts
 */
async function draftCommand(action, options) {
  try {
    switch (action) {
      case 'save':
        await saveDraft(options);
        break;
      case 'list':
        await listDrafts(options);
        break;
      case 'edit':
        await editDraft(options);
        break;
      case 'delete':
        await deleteDraft(options);
        break;
      case 'send':
        await sendDraft(options);
        break;
      case 'sync':
        await syncDrafts(options);
        break;
      default:
        console.error(chalk.red(`Unknown action: ${action}`));
        console.log(
          chalk.gray('Available actions: save, list, edit, delete, send, sync')
        );
        process.exit(1);
    }
  } catch (error) {
    console.error(chalk.red('Error:'), error.message);
    logger.error('Draft command failed', { action, error: error.message });
    process.exit(1);
  }
}

/**
 * Save a new draft
 */
async function saveDraft(options) {
  let draftData;

  if (options.to && options.subject && options.body) {
    // Non-interactive mode
    draftData = {
      to: options.to,
      cc: options.cc || '',
      subject: options.subject,
      bodyText: options.body,
    };
  } else {
    // Interactive mode
    draftData = await interactiveDraftCompose();
  }

  const spinner = ora('Saving draft...').start();

  try {
    const draftId = emailModel.saveDraft(draftData);
    spinner.succeed('Draft saved successfully!');
    console.log(chalk.gray(`Draft ID: ${draftId}`));

    // Optionally sync to server
    if (options.sync) {
      await syncDraftToServer(draftId);
    }
  } catch (error) {
    spinner.fail('Failed to save draft');
    throw error;
  }
}

/**
 * List all drafts
 */
async function listDrafts(options) {
  const spinner = ora('Loading drafts...').start();

  try {
    const drafts = emailModel.findDrafts({ limit: options.limit || 50 });
    spinner.stop();

    if (drafts.length === 0) {
      console.log(chalk.yellow('No drafts found.'));
      return;
    }

    console.log(chalk.bold.cyan(`\nDrafts (${drafts.length}):\n`));

    const table = new Table({
      head: ['ID', 'To', 'Subject', 'Updated'],
      colWidths: [8, 30, 40, 20],
    });

    drafts.forEach((draft) => {
      table.push([
        draft.id,
        truncate(draft.to || '(no recipient)', 28),
        truncate(draft.subject || '(no subject)', 38),
        formatDate(draft.updatedAt),
      ]);
    });

    console.log(table.toString());
    console.log(chalk.gray(`\nTotal: ${drafts.length} drafts`));
  } catch (error) {
    spinner.fail('Failed to load drafts');
    throw error;
  }
}

/**
 * Edit an existing draft
 */
async function editDraft(options) {
  const draftId = options.id || options._[1];

  if (!draftId) {
    console.error(chalk.red('Draft ID is required'));
    console.log(chalk.gray('Usage: mail-cli draft edit <draft-id>'));
    process.exit(1);
  }

  const spinner = ora('Loading draft...').start();

  try {
    const draft = emailModel.findById(draftId);

    if (!draft || !draft.isDraft) {
      spinner.fail('Draft not found');
      process.exit(1);
    }

    spinner.stop();

    console.log(chalk.bold.cyan('Edit Draft'));
    console.log();

    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'to',
        message: 'To:',
        default: draft.to,
      },
      {
        type: 'input',
        name: 'cc',
        message: 'CC:',
        default: draft.cc,
      },
      {
        type: 'input',
        name: 'subject',
        message: 'Subject:',
        default: draft.subject,
      },
      {
        type: 'editor',
        name: 'body',
        message: 'Body:',
        default: draft.bodyText,
      },
      {
        type: 'confirm',
        name: 'confirm',
        message: 'Save changes?',
        default: true,
      },
    ]);

    if (!answers.confirm) {
      console.log(chalk.yellow('Changes cancelled.'));
      return;
    }

    const updateSpinner = ora('Updating draft...').start();

    emailModel.saveDraft({
      id: draftId,
      to: answers.to,
      cc: answers.cc,
      subject: answers.subject,
      bodyText: answers.body,
    });

    updateSpinner.succeed('Draft updated successfully!');
  } catch (error) {
    spinner.fail('Failed to edit draft');
    throw error;
  }
}

/**
 * Delete a draft
 */
async function deleteDraft(options) {
  const draftId = options.id || options._[1];

  if (!draftId) {
    console.error(chalk.red('Draft ID is required'));
    console.log(chalk.gray('Usage: mail-cli draft delete <draft-id>'));
    process.exit(1);
  }

  const draft = emailModel.findById(draftId);

  if (!draft || !draft.isDraft) {
    console.error(chalk.red('Draft not found'));
    process.exit(1);
  }

  console.log(chalk.bold.yellow('Delete Draft'));
  console.log(chalk.gray(`To: ${draft.to}`));
  console.log(chalk.gray(`Subject: ${draft.subject}`));
  console.log();

  const { confirm } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'confirm',
      message: 'Are you sure you want to delete this draft?',
      default: false,
    },
  ]);

  if (!confirm) {
    console.log(chalk.yellow('Deletion cancelled.'));
    return;
  }

  const spinner = ora('Deleting draft...').start();

  try {
    emailModel.deleteDraft(draftId);
    spinner.succeed('Draft deleted successfully!');
  } catch (error) {
    spinner.fail('Failed to delete draft');
    throw error;
  }
}

/**
 * Send a draft
 */
async function sendDraft(options) {
  const draftId = options.id || options._[1];

  if (!draftId) {
    console.error(chalk.red('Draft ID is required'));
    console.log(chalk.gray('Usage: mail-cli draft send <draft-id>'));
    process.exit(1);
  }

  const draft = emailModel.findById(draftId);

  if (!draft || !draft.isDraft) {
    console.error(chalk.red('Draft not found'));
    process.exit(1);
  }

  // Validate draft has required fields
  if (!draft.to || !draft.subject) {
    console.error(chalk.red('Draft is incomplete. Please edit it first.'));
    console.log(
      chalk.gray('Missing: ') +
        (!draft.to ? 'recipient ' : '') +
        (!draft.subject ? 'subject' : '')
    );
    process.exit(1);
  }

  console.log(chalk.bold.cyan('Send Draft'));
  console.log(chalk.gray(`To: ${draft.to}`));
  console.log(chalk.gray(`Subject: ${draft.subject}`));
  console.log();

  const { confirm } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'confirm',
      message: 'Send this draft?',
      default: true,
    },
  ]);

  if (!confirm) {
    console.log(chalk.yellow('Sending cancelled.'));
    return;
  }

  const spinner = ora('Sending email...').start();

  try {
    // Load SMTP configuration
    const cfg = config.load();
    if (!cfg.smtp.host || !cfg.smtp.user || !cfg.smtp.password) {
      spinner.fail('SMTP configuration incomplete');
      console.error(chalk.red('Please run: mail-cli config'));
      process.exit(1);
    }

    // Compose email
    const composer = new EmailComposer();
    composer
      .setTo(draft.to.split(',').map((e) => e.trim()))
      .setSubject(draft.subject)
      .setBody(draft.bodyText || '', draft.bodyHtml || '');

    if (draft.cc) {
      composer.setCc(draft.cc.split(',').map((e) => e.trim()));
    }

    // Send email
    const smtpClient = new SMTPClient(cfg.smtp);
    const result = await smtpClient.sendEmail(composer.compose());

    // Convert draft to sent email
    emailModel.convertDraftToSent(draftId, result.messageId);

    spinner.succeed('Email sent successfully!');
    console.log(chalk.gray(`Message ID: ${result.messageId}`));

    smtpClient.disconnect();
  } catch (error) {
    spinner.fail('Failed to send email');
    throw error;
  }
}

/**
 * Sync drafts with IMAP server
 */
async function syncDrafts(options) {
  const spinner = ora('Syncing drafts with server...').start();

  try {
    const cfg = config.load();
    if (!cfg.imap.host || !cfg.imap.user || !cfg.imap.password) {
      spinner.fail('IMAP configuration incomplete');
      console.error(chalk.red('Please run: mail-cli config'));
      process.exit(1);
    }

    const sync = new IMAPSync(cfg.imap);
    const result = await sync.syncDrafts();

    spinner.succeed('Drafts synced successfully!');
    console.log(chalk.gray(`Synced: ${result.synced} drafts`));
    console.log(chalk.gray(`Total on server: ${result.total} drafts`));
  } catch (error) {
    spinner.fail('Failed to sync drafts');
    throw error;
  }
}

/**
 * Interactive draft composition
 */
async function interactiveDraftCompose() {
  console.log(chalk.bold.cyan('Compose Draft'));
  console.log();

  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'to',
      message: 'To (comma-separated):',
    },
    {
      type: 'input',
      name: 'cc',
      message: 'CC (comma-separated, optional):',
    },
    {
      type: 'input',
      name: 'subject',
      message: 'Subject:',
    },
    {
      type: 'editor',
      name: 'body',
      message: 'Body (opens editor):',
    },
  ]);

  return {
    to: answers.to,
    cc: answers.cc,
    subject: answers.subject,
    bodyText: answers.body,
  };
}

/**
 * Sync draft to IMAP server
 */
async function syncDraftToServer(draftId) {
  const spinner = ora('Syncing draft to server...').start();

  try {
    const cfg = config.load();
    const draft = emailModel.findById(draftId);

    const sync = new IMAPSync(cfg.imap);
    await sync.uploadDraft(draft);

    spinner.succeed('Draft synced to server');
  } catch (error) {
    spinner.warn('Failed to sync draft to server (saved locally)');
    logger.error('Failed to sync draft to server', {
      draftId,
      error: error.message,
    });
  }
}

/**
 * Truncate string to specified length
 */
function truncate(str, maxLength) {
  if (!str) return '';
  if (str.length <= maxLength) return str;
  return str.substring(0, maxLength - 3) + '...';
}

/**
 * Format date for display
 */
function formatDate(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  const diff = now - date;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days === 0) {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  } else if (days === 1) {
    return 'Yesterday';
  } else if (days < 7) {
    return `${days} days ago`;
  } else {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }
}

module.exports = draftCommand;
