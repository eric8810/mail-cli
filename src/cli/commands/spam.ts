import spamFilter from '../../spam/filter';
import emailModel from '../../storage/models/email';
import spamModel from '../../storage/models/spam';
import logger from '../../utils/logger';
import { formatTable } from '../utils/formatter';

/**
 * Spam management commands
 */

/**
 * Mark email as spam
 */
async function markAsSpam(emailId) {
  try {
    const email = await emailModel.findById(emailId);
    if (!email) {
      console.error(`Error: Email with ID ${emailId} not found`);
      return;
    }

    await emailModel.markAsSpam(emailId);
    console.log(`Email #${emailId} marked as spam`);

    // Learn from user feedback
    await spamFilter.learnFromFeedback(emailId, true);
    console.log('Spam filter updated based on your feedback');
  } catch (error) {
    console.error('Failed to mark email as spam:', error.message);
    logger.error('Mark as spam failed', { emailId, error: error.message });
  }
}

/**
 * Unmark email as spam
 */
async function unmarkAsSpam(emailId) {
  try {
    const email = await emailModel.findById(emailId);
    if (!email) {
      console.error(`Error: Email with ID ${emailId} not found`);
      return;
    }

    await emailModel.unmarkAsSpam(emailId);
    console.log(`Email #${emailId} unmarked as spam`);

    // Learn from user feedback
    await spamFilter.learnFromFeedback(emailId, false);
    console.log('Spam filter updated based on your feedback');
  } catch (error) {
    console.error('Failed to unmark email as spam:', error.message);
    logger.error('Unmark as spam failed', { emailId, error: error.message });
  }
}

/**
 * List spam emails
 */
async function listSpam(options = {}) {
  try {
    const { limit = 20, offset = 0 } = options;
    const spamEmails = await emailModel.findSpam({ limit, offset });
    const totalCount = await emailModel.countSpam();

    if (spamEmails.length === 0) {
      console.log('No spam emails found');
      return;
    }

    console.log(`\nSpam Emails (${spamEmails.length} of ${totalCount}):\n`);

    const tableData = spamEmails.map((email) => ({
      ID: email.id,
      From: email.from.substring(0, 30),
      Subject: email.subject.substring(0, 40),
      Date: new Date(email.date).toLocaleDateString(),
    }));

    console.log(formatTable(tableData));
  } catch (error) {
    console.error('Failed to list spam emails:', error.message);
    logger.error('List spam failed', { error: error.message });
  }
}

/**
 * Add email to blacklist
 */
async function addToBlacklist(emailAddress, reason) {
  try {
    await spamModel.addToBlacklist(emailAddress, reason);
    console.log(`Added ${emailAddress} to blacklist`);

    if (reason) {
      console.log(`Reason: ${reason}`);
    }
  } catch (error) {
    console.error('Failed to add to blacklist:', error.message);
    logger.error('Add to blacklist failed', {
      emailAddress,
      error: error.message,
    });
  }
}

/**
 * Remove email from blacklist
 */
async function removeFromBlacklist(emailAddress) {
  try {
    const removed = await spamModel.removeFromBlacklist(emailAddress);

    if (removed) {
      console.log(`Removed ${emailAddress} from blacklist`);
    } else {
      console.log(`${emailAddress} was not in blacklist`);
    }
  } catch (error) {
    console.error('Failed to remove from blacklist:', error.message);
    logger.error('Remove from blacklist failed', {
      emailAddress,
      error: error.message,
    });
  }
}

/**
 * List blacklist
 */
async function listBlacklist() {
  try {
    const blacklist = await spamModel.getBlacklist();

    if (blacklist.length === 0) {
      console.log('Blacklist is empty');
      return;
    }

    console.log(`\nBlacklist (${blacklist.length} entries):\n`);

    const tableData = blacklist.map((entry) => ({
      ID: entry.id,
      Email: entry.email_address,
      Domain: entry.domain || 'N/A',
      Reason: (entry.reason || 'N/A').substring(0, 30),
      Added: new Date(entry.created_at).toLocaleDateString(),
    }));

    console.log(formatTable(tableData));
  } catch (error) {
    console.error('Failed to list blacklist:', error.message);
    logger.error('List blacklist failed', { error: error.message });
  }
}

/**
 * Add email to whitelist
 */
async function addToWhitelist(emailAddress) {
  try {
    await spamModel.addToWhitelist(emailAddress);
    console.log(`Added ${emailAddress} to whitelist`);
  } catch (error) {
    console.error('Failed to add to whitelist:', error.message);
    logger.error('Add to whitelist failed', {
      emailAddress,
      error: error.message,
    });
  }
}

/**
 * Remove email from whitelist
 */
async function removeFromWhitelist(emailAddress) {
  try {
    const removed = await spamModel.removeFromWhitelist(emailAddress);

    if (removed) {
      console.log(`Removed ${emailAddress} from whitelist`);
    } else {
      console.log(`${emailAddress} was not in whitelist`);
    }
  } catch (error) {
    console.error('Failed to remove from whitelist:', error.message);
    logger.error('Remove from whitelist failed', {
      emailAddress,
      error: error.message,
    });
  }
}

/**
 * List whitelist
 */
async function listWhitelist() {
  try {
    const whitelist = await spamModel.getWhitelist();

    if (whitelist.length === 0) {
      console.log('Whitelist is empty');
      return;
    }

    console.log(`\nWhitelist (${whitelist.length} entries):\n`);

    const tableData = whitelist.map((entry) => ({
      ID: entry.id,
      Email: entry.email_address,
      Domain: entry.domain || 'N/A',
      Added: new Date(entry.created_at).toLocaleDateString(),
    }));

    console.log(formatTable(tableData));
  } catch (error) {
    console.error('Failed to list whitelist:', error.message);
    logger.error('List whitelist failed', { error: error.message });
  }
}

/**
 * Run spam filter on inbox
 */
async function runFilter(options = {}) {
  try {
    console.log('Initializing spam filter...');
    await spamFilter.initialize();

    console.log('Scanning inbox for spam...');

    // Get all non-spam, non-deleted emails
    const emails = await emailModel.findByFolder('INBOX', { limit: 100 });
    const unscannedEmails = emails.filter((e) => !e.isSpam && !e.isDeleted);

    if (unscannedEmails.length === 0) {
      console.log('No emails to scan');
      return;
    }

    console.log(`Scanning ${unscannedEmails.length} emails...`);

    let spamCount = 0;
    for (const email of unscannedEmails) {
      const result = await spamFilter.filterEmail(email.id);
      if (result.isSpam) {
        spamCount++;
        console.log(
          `  [SPAM] Email #${email.id}: ${email.subject.substring(0, 50)}`
        );
        console.log(
          `         Score: ${result.score}, Reasons: ${result.reasons.join(', ')}`
        );
      }
    }

    console.log(`\nScan complete: ${spamCount} spam emails detected`);
  } catch (error) {
    console.error('Failed to run spam filter:', error.message);
    logger.error('Run filter failed', { error: error.message });
  }
}

/**
 * Show spam statistics
 */
async function showStatistics() {
  try {
    await spamFilter.initialize();
    const stats = await spamFilter.getStatistics();

    console.log('\nSpam Filter Statistics:\n');
    console.log(`  Spam emails: ${stats.spamCount}`);
    console.log(`  Blacklist entries: ${stats.blacklistCount}`);
    console.log(`  Whitelist entries: ${stats.whitelistCount}`);
    console.log(`  Active rules: ${stats.rulesCount}`);
    console.log(`  Detection threshold: ${stats.threshold}`);
  } catch (error) {
    console.error('Failed to get statistics:', error.message);
    logger.error('Get statistics failed', { error: error.message });
  }
}

/**
 * Main spam command handler
 */
async function spamCommand(action, ...args) {
  try {
    switch (action) {
      case 'mark':
        if (!args[0]) {
          console.error('Usage: mail-cli spam mark <email-id>');
          return;
        }
        await markAsSpam(parseInt(args[0]));
        break;

      case 'unmark':
        if (!args[0]) {
          console.error('Usage: mail-cli spam unmark <email-id>');
          return;
        }
        await unmarkAsSpam(parseInt(args[0]));
        break;

      case 'list':
        await listSpam();
        break;

      case 'blacklist':
        const blacklistAction = args[0];
        if (blacklistAction === 'add') {
          if (!args[1]) {
            console.error(
              'Usage: mail-cli spam blacklist add <email> [reason]'
            );
            return;
          }
          await addToBlacklist(args[1], args.slice(2).join(' '));
        } else if (blacklistAction === 'remove') {
          if (!args[1]) {
            console.error('Usage: mail-cli spam blacklist remove <email>');
            return;
          }
          await removeFromBlacklist(args[1]);
        } else if (blacklistAction === 'list') {
          await listBlacklist();
        } else {
          console.error(
            'Usage: mail-cli spam blacklist <add|remove|list> [email]'
          );
        }
        break;

      case 'whitelist':
        const whitelistAction = args[0];
        if (whitelistAction === 'add') {
          if (!args[1]) {
            console.error('Usage: mail-cli spam whitelist add <email>');
            return;
          }
          await addToWhitelist(args[1]);
        } else if (whitelistAction === 'remove') {
          if (!args[1]) {
            console.error('Usage: mail-cli spam whitelist remove <email>');
            return;
          }
          await removeFromWhitelist(args[1]);
        } else if (whitelistAction === 'list') {
          await listWhitelist();
        } else {
          console.error(
            'Usage: mail-cli spam whitelist <add|remove|list> [email]'
          );
        }
        break;

      case 'filter':
        await runFilter();
        break;

      case 'stats':
        await showStatistics();
        break;

      default:
        console.log('Spam Management Commands:');
        console.log(
          '  mail-cli spam mark <email-id>           - Mark email as spam'
        );
        console.log(
          '  mail-cli spam unmark <email-id>         - Unmark email as spam'
        );
        console.log(
          '  mail-cli spam list                      - List spam emails'
        );
        console.log(
          '  mail-cli spam blacklist add <email>     - Add to blacklist'
        );
        console.log(
          '  mail-cli spam blacklist remove <email>  - Remove from blacklist'
        );
        console.log(
          '  mail-cli spam blacklist list            - List blacklist'
        );
        console.log(
          '  mail-cli spam whitelist add <email>     - Add to whitelist'
        );
        console.log(
          '  mail-cli spam whitelist remove <email>  - Remove from whitelist'
        );
        console.log(
          '  mail-cli spam whitelist list            - List whitelist'
        );
        console.log(
          '  mail-cli spam filter                    - Run spam filter on inbox'
        );
        console.log(
          '  mail-cli spam stats                     - Show spam statistics'
        );
    }
  } catch (error) {
    console.error('Spam command failed:', error.message);
    logger.error('Spam command failed', { action, error: error.message });
  }
}

module.exports = spamCommand;
