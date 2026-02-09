import chalk from 'chalk';
import inquirer from 'inquirer';
import ora from 'ora';

import config from '../../config';
import SMTPClient from '../../smtp/client';
import EmailComposer from '../../smtp/composer';
import emailModel from '../../storage/models/email';
import logger from '../../utils/logger';

/**
 * Reply command - Reply to an email
 */
async function replyCommand(emailId, options) {
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
    console.log(chalk.bold.cyan('Replying to:'));
    console.log(chalk.gray(`From: ${originalEmail.from}`));
    console.log(chalk.gray(`Subject: ${originalEmail.subject}`));
    console.log(chalk.gray(`Date: ${originalEmail.date}`));
    console.log();

    // Create composer
    const composer = new EmailComposer();

    // Set recipients
    if (options.all) {
      // Reply to all
      const allRecipients = composer.getAllRecipients(
        originalEmail,
        cfg.smtp.user
      );
      if (allRecipients.length === 0) {
        console.error(chalk.red('No recipients found for reply-all'));
        process.exit(1);
      }
      composer.setTo(allRecipients);
      console.log(chalk.gray(`Reply to all: ${allRecipients.join(', ')}`));
    } else {
      // Reply to sender only
      composer.setTo([originalEmail.from]);
      console.log(chalk.gray(`Reply to: ${originalEmail.from}`));
    }

    // Set subject with "Re:" prefix
    let subject = originalEmail.subject;
    if (!subject.toLowerCase().startsWith('re:')) {
      subject = `Re: ${subject}`;
    }
    composer.setSubject(subject);

    // Set reply headers
    if (originalEmail.messageId) {
      composer.setInReplyTo(originalEmail.messageId);
    }
    composer.setReferences(composer.buildReferences(originalEmail));

    // Get reply body
    let replyBody;
    if (options.body) {
      // Non-interactive mode
      replyBody = options.body;
    } else if (options.editor) {
      // Interactive mode with editor
      const answers = await inquirer.prompt([
        {
          type: 'editor',
          name: 'body',
          message: 'Reply body (opens editor):',
          validate: (input) => (input.trim() ? true : 'Reply body is required'),
        },
      ]);
      replyBody = answers.body;
    } else {
      // Interactive mode with input
      const answers = await inquirer.prompt([
        {
          type: 'input',
          name: 'body',
          message: 'Reply body:',
          validate: (input) => (input.trim() ? true : 'Reply body is required'),
        },
      ]);
      replyBody = answers.body;
    }

    // Quote original email
    const quotedBody = composer.quoteOriginalEmail(originalEmail);

    // Combine reply and quoted text
    const fullBody = replyBody + '\n\n' + quotedBody;
    composer.setBody(fullBody);

    // Confirm before sending
    if (!options.body) {
      const { confirm } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'confirm',
          message: 'Send this reply?',
          default: true,
        },
      ]);

      if (!confirm) {
        console.log(chalk.yellow('Reply cancelled.'));
        process.exit(0);
      }
    }

    // Send email
    const spinner = ora('Sending reply...').start();

    const smtpClient = new SMTPClient(cfg.smtp);
    const emailData = composer.compose();
    const result = await smtpClient.sendEmail(emailData);

    spinner.succeed('Reply sent successfully!');
    console.log(chalk.gray(`Message ID: ${result.messageId}`));

    smtpClient.disconnect();
  } catch (error) {
    console.error(chalk.red('Error:'), error.message);
    logger.error('Reply command failed', { error: error.message });
    process.exit(1);
  }
}

module.exports = replyCommand;
