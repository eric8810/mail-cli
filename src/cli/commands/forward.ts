import chalk from 'chalk';
import inquirer from 'inquirer';
import ora from 'ora';

import config from '../../config';
import SMTPClient from '../../smtp/client';
import EmailComposer from '../../smtp/composer';
import attachmentModel from '../../storage/models/attachment';
import emailModel from '../../storage/models/email';
import logger from '../../utils/logger';

/**
 * Forward command - Forward an email
 */
async function forwardCommand(emailId, options) {
  try {
    // Load configuration
    const cfg = config.load();
    if (!cfg.smtp.host || !cfg.smtp.user || !cfg.smtp.password) {
      console.error(
        chalk.red('SMTP configuration incomplete. Please run: mail-cli config')
      );
      process.exit(1);
    }

    // Get original email
    const originalEmail = emailModel.findById(emailId);
    if (!originalEmail) {
      console.error(chalk.red(`Email with ID ${emailId} not found`));
      process.exit(1);
    }

    // Display original email info
    console.log(chalk.bold.cyan('Forwarding:'));
    console.log(chalk.gray(`From: ${originalEmail.from}`));
    console.log(chalk.gray(`Subject: ${originalEmail.subject}`));
    console.log(chalk.gray(`Date: ${originalEmail.date}`));
    console.log();

    // Get recipient(s)
    let recipients;
    if (options.to) {
      recipients = options.to.split(',').map((e) => e.trim());
    } else {
      const answers = await inquirer.prompt([
        {
          type: 'input',
          name: 'to',
          message: 'Forward to (comma-separated):',
          validate: (input) => (input.trim() ? true : 'Recipient is required'),
        },
      ]);
      recipients = answers.to.split(',').map((e) => e.trim());
    }

    // Create composer
    const composer = new EmailComposer();
    composer.setTo(recipients);

    // Set subject with "Fwd:" prefix
    let subject = originalEmail.subject;
    if (!subject.toLowerCase().startsWith('fwd:')) {
      subject = `Fwd: ${subject}`;
    }
    composer.setSubject(subject);

    // Get forward message (optional)
    let forwardMessage = '';
    if (options.body) {
      forwardMessage = options.body;
    } else {
      const answers = await inquirer.prompt([
        {
          type: 'input',
          name: 'message',
          message: 'Forward message (optional):',
        },
      ]);
      forwardMessage = answers.message;
    }

    // Build forwarded email body
    const forwardHeader =
      `---------- Forwarded message ---------\n` +
      `From: ${originalEmail.from}\n` +
      `Date: ${originalEmail.date}\n` +
      `Subject: ${originalEmail.subject}\n` +
      `To: ${originalEmail.to}\n`;

    let fullBody = '';
    if (forwardMessage) {
      fullBody = forwardMessage + '\n\n';
    }
    fullBody += forwardHeader + '\n' + originalEmail.bodyText;

    composer.setBody(fullBody);

    // Handle attachments
    if (originalEmail.hasAttachments && !options.noAttachments) {
      try {
        const attachments = attachmentModel.findByEmailId(emailId);
        if (attachments && attachments.length > 0) {
          console.log(
            chalk.gray(`Including ${attachments.length} attachment(s)`)
          );
          for (const attachment of attachments) {
            if (attachment.filePath) {
              composer.addAttachment(attachment.filePath, attachment.filename);
            }
          }
        }
      } catch (error) {
        console.warn(
          chalk.yellow(`Warning: Could not attach files: ${error.message}`)
        );
      }
    }

    // Confirm before sending
    if (!options.to) {
      const { confirm } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'confirm',
          message: 'Send this forwarded email?',
          default: true,
        },
      ]);

      if (!confirm) {
        console.log(chalk.yellow('Forward cancelled.'));
        process.exit(0);
      }
    }

    // Send email
    const spinner = ora('Forwarding email...').start();

    const smtpClient = new SMTPClient(cfg.smtp);
    const emailData = composer.compose();
    const result = await smtpClient.sendEmail(emailData);

    spinner.succeed('Email forwarded successfully!');
    console.log(chalk.gray(`Message ID: ${result.messageId}`));

    smtpClient.disconnect();
  } catch (error) {
    console.error(chalk.red('Error:'), error.message);
    logger.error('Forward command failed', { error: error.message });
    process.exit(1);
  }
}

module.exports = forwardCommand;
