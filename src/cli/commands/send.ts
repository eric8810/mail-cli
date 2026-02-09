import chalk from 'chalk';
import inquirer from 'inquirer';
import ora from 'ora';

import config from '../../config';
import contactManager from '../../contacts/manager';
import signatureManager from '../../signatures/manager';
import SMTPClient from '../../smtp/client';
import EmailComposer from '../../smtp/composer';
import logger from '../../utils/logger';

/**
 * Send command - Send email via SMTP
 */
async function sendCommand(options) {
  try {
    // Load configuration
    const cfg = config.load();
    if (!cfg.smtp.host || !cfg.smtp.user || !cfg.smtp.password) {
      console.error(
        chalk.red('SMTP configuration incomplete. Please run: mail-cli config')
      );
      process.exit(1);
    }

    let emailData;

    if (options.to && options.subject && options.body) {
      // Non-interactive mode
      const composer = new EmailComposer();
      composer
        .setTo(options.to.split(',').map((e) => e.trim()))
        .setSubject(options.subject)
        .setBody(options.body);

      if (options.cc) {
        composer.setCc(options.cc.split(',').map((e) => e.trim()));
      }

      // Add signature if available
      try {
        const signature = await signatureManager.getForEmail(cfg.smtp.user, {
          name: cfg.smtp.user.split('@')[0],
          email: cfg.smtp.user,
        });
        if (signature) {
          composer.addSignature(signature);
        }
      } catch (error) {
        logger.debug('Could not add signature', { error: error.message });
      }

      emailData = composer.compose();
    } else {
      // Interactive mode
      emailData = await interactiveSend();
    }

    // Send email
    const spinner = ora('Sending email...').start();

    const smtpClient = new SMTPClient(cfg.smtp);
    const result = await smtpClient.sendEmail(emailData);

    spinner.succeed('Email sent successfully!');
    console.log(chalk.gray(`Message ID: ${result.messageId}`));

    // Auto-collect contacts from recipients
    try {
      const recipients = [
        ...(emailData.to || []),
        ...(emailData.cc || []),
        ...(emailData.bcc || []),
      ];

      for (const recipient of recipients) {
        await contactManager.autoCollectContact(recipient);
      }
    } catch (error) {
      logger.debug('Failed to auto-collect contacts', { error: error.message });
    }

    smtpClient.disconnect();
  } catch (error) {
    console.error(chalk.red('Error:'), error.message);
    logger.error('Send command failed', { error: error.message });
    process.exit(1);
  }
}

/**
 * Interactive email sending
 */
async function interactiveSend() {
  console.log(chalk.bold.cyan('Compose Email'));
  console.log();

  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'to',
      message: 'To (comma-separated):',
      validate: (input) => (input.trim() ? true : 'Recipient is required'),
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
      validate: (input) => (input.trim() ? true : 'Subject is required'),
    },
    {
      type: 'editor',
      name: 'body',
      message: 'Body (opens editor):',
      validate: (input) => (input.trim() ? true : 'Body is required'),
    },
    {
      type: 'input',
      name: 'attachments',
      message: 'Attachments (comma-separated file paths, optional):',
    },
    {
      type: 'confirm',
      name: 'confirm',
      message: 'Send this email?',
      default: true,
    },
  ]);

  if (!answers.confirm) {
    console.log(chalk.yellow('Email cancelled.'));
    process.exit(0);
  }

  const composer = new EmailComposer();
  composer
    .setTo(answers.to.split(',').map((e) => e.trim()))
    .setSubject(answers.subject)
    .setBody(answers.body);

  if (answers.cc) {
    composer.setCc(answers.cc.split(',').map((e) => e.trim()));
  }

  if (answers.attachments) {
    const files = answers.attachments.split(',').map((f) => f.trim());
    for (const file of files) {
      try {
        composer.addAttachment(file);
      } catch (error) {
        console.error(
          chalk.yellow(
            `Warning: Could not add attachment ${file}: ${error.message}`
          )
        );
      }
    }
  }

  // Add signature if available
  try {
    const cfg = config.load();
    const signature = await signatureManager.getForEmail(cfg.smtp.user, {
      name: cfg.smtp.user.split('@')[0],
      email: cfg.smtp.user,
    });
    if (signature) {
      composer.addSignature(signature);
    }
  } catch (error) {
    // Signature is optional, just log the error
    logger.debug('Could not add signature', { error: error.message });
  }

  return composer.compose();
}

module.exports = sendCommand;
