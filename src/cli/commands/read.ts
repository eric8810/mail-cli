import chalk from 'chalk';
import ora from 'ora';

import config from '../../config';
import IMAPClient from '../../imap/client';
import attachmentModel from '../../storage/models/attachment';
import emailModel from '../../storage/models/email';
import logger from '../../utils/logger';
import { formatEmailDetails } from '../utils/formatter';

/**
 * Read command - Read email details
 */
async function readCommand(emailId, options) {
  try {
    if (!emailId) {
      console.error(chalk.red('Error: Email ID is required'));
      console.log('Usage: mail-cli read <id>');
      process.exit(1);
    }

    const email = emailModel.findById(emailId);

    if (!email) {
      console.error(chalk.red(`Email with ID ${emailId} not found`));
      process.exit(1);
    }

    // Check if body needs to be fetched from server
    if (!email.bodyText && !email.bodyHtml) {
      const spinner = ora('Fetching email body from server...').start();

      try {
        // Load IMAP config
        const cfg = config.load();
        if (!cfg.imap.host || !cfg.imap.user || !cfg.imap.password) {
          spinner.warn(
            'IMAP configuration incomplete. Showing email without body.'
          );
        } else {
          // Connect to IMAP and fetch body
          const imapClient = new IMAPClient(cfg.imap);
          await imapClient.connect();
          await imapClient.openFolder(email.folder, true);

          const bodyData = await imapClient.fetchEmailBody(email.uid);

          // Update email in database with body
          emailModel.updateBody(emailId, {
            bodyText: bodyData.bodyText,
            bodyHtml: bodyData.bodyHtml,
          });

          // Update local email object
          email.bodyText = bodyData.bodyText;
          email.bodyHtml = bodyData.bodyHtml;

          imapClient.disconnect();
          spinner.succeed('Email body fetched from server');
        }
      } catch (error) {
        spinner.fail('Failed to fetch email body from server');
        logger.error('Failed to fetch email body', {
          emailId,
          error: error.message,
        });
        console.log(chalk.yellow('Showing email without body content'));
      }
    }

    // Get attachments
    const attachments = email.hasAttachments
      ? attachmentModel.findByEmailId(emailId)
      : [];

    // Display email
    console.log();
    console.log(formatEmailDetails(email, attachments));
    console.log();

    // Mark as read if not already
    if (!email.isRead) {
      emailModel.markAsRead(emailId);
      console.log(chalk.gray('(Marked as read)'));
    }
  } catch (error) {
    console.error(chalk.red('Error:'), error.message);
    logger.error('Read command failed', { emailId, error: error.message });
    process.exit(1);
  }
}

module.exports = readCommand;
