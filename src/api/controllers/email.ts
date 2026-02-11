import type { Context } from 'hono';
import emailModel from '../../storage/models/email';
import SMTPClient from '../../smtp/client';
import EmailComposer from '../../smtp/composer';
import config from '../../config';
import logger from '../../utils/logger';

export async function list(c: Context) {
  try {
    const folder = c.req.query('folder') || 'INBOX';
    const limit = parseInt(c.req.query('limit') || '20', 10);
    const offset = parseInt(c.req.query('offset') || '0', 10);

    const emails = emailModel.findByFolder(folder, { limit, offset });
    const total = emailModel.countByFolder(folder);

    return c.json({
      data: emails,
      meta: { total, limit, offset },
    });
  } catch (error) {
    logger.error('Failed to list emails', { error: (error as Error).message });
    throw new Error('Failed to list emails');
  }
}

export async function get(c: Context) {
  try {
    const id = parseInt(c.req.param('id'), 10);

    if (isNaN(id)) {
      return c.json(
        { error: { code: 'INVALID_ID', message: 'Invalid email ID' } },
        400
      );
    }

    const email = emailModel.findById(id);

    if (!email) {
      const error = new Error('Email not found');
      error.name = 'NotFoundError';
      throw error;
    }

    return c.json({ data: email });
  } catch (error) {
    logger.error('Failed to get email', { error: (error as Error).message });
    throw error;
  }
}

export async function send(c: Context) {
  try {
    const data = c.req.valid('json');

    const cfg = config.load();
    if (!cfg.smtp.host || !cfg.smtp.user || !cfg.smtp.password) {
      return c.json(
        {
          error: {
            code: 'SMTP_NOT_CONFIGURED',
            message: 'SMTP configuration incomplete',
          },
        },
        400
      );
    }

    const composer = new EmailComposer();
    composer.setTo([data.to]).setSubject(data.subject).setBody(data.body);

    if (data.cc) {
      composer.setCc(data.cc);
    }
    if (data.bcc) {
      composer.setBcc(data.bcc);
    }
    if (data.reply_to) {
      composer.setReplyTo(data.reply_to);
    }

    const emailData = composer.compose();

    const smtpClient = new SMTPClient(cfg.smtp);
    const result = await smtpClient.sendEmail(emailData);

    smtpClient.disconnect();

    return c.json(
      {
        data: {
          id: result.messageId,
          status: 'sent',
          message_id: result.messageId,
          response: result.response,
        },
      },
      201
    );
  } catch (error) {
    logger.error('Failed to send email', { error: (error as Error).message });
    throw new Error('Failed to send email');
  }
}

export async function markRead(c: Context) {
  try {
    const id = parseInt(c.req.param('id'), 10);

    if (isNaN(id)) {
      return c.json(
        { error: { code: 'INVALID_ID', message: 'Invalid email ID' } },
        400
      );
    }

    const isRead = c.req.query('read') === 'true';

    emailModel.markAsRead(id);

    return c.json({
      data: {
        id,
        is_read: isRead,
      },
    });
  } catch (error) {
    logger.error('Failed to mark email as read', {
      error: (error as Error).message,
    });
    throw new Error('Failed to mark email as read');
  }
}

export async function star(c: Context) {
  try {
    const id = parseInt(c.req.param('id'), 10);

    if (isNaN(id)) {
      return c.json(
        { error: { code: 'INVALID_ID', message: 'Invalid email ID' } },
        400
      );
    }

    const isStarred = c.req.query('starred') === 'true';

    emailModel.markAsStarred(id);

    return c.json({
      data: {
        id,
        is_starred: isStarred,
      },
    });
  } catch (error) {
    logger.error('Failed to star email', { error: (error as Error).message });
    throw new Error('Failed to star email');
  }
}
