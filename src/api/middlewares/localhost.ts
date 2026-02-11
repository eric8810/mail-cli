import type { MiddlewareHandler } from 'hono';
import logger from '../../utils/logger';

export const localhostOnly: MiddlewareHandler = async (c, next) => {
  const clientIP =
    c.req.header('x-forwarded-for') || c.req.header('x-real-ip') || '127.0.0.1';

  if (
    clientIP !== '127.0.0.1' &&
    clientIP !== '::1' &&
    clientIP !== 'localhost'
  ) {
    logger.warn('Access denied from non-localhost IP', { ip: clientIP });
    return c.json(
      {
        error: {
          code: 'ACCESS_DENIED',
          message: 'Access is only allowed from localhost',
        },
      },
      403
    );
  }

  await next();
  return;
};
