import { serve } from '@hono/node-server';
import { OpenAPIHono } from '@hono/zod-openapi';
import { logger as honoLogger } from 'hono/logger';
import { prettyJSON } from 'hono/pretty-json';
import { swaggerUI } from '@hono/swagger-ui';
import routes from './routes';
import { errorHandler } from './middlewares/error';
import { localhostOnly } from './middlewares/localhost';
import logger from '../utils/logger';

const app = new OpenAPIHono();

app.use('*', honoLogger());
app.use('*', prettyJSON());
app.use('*', localhostOnly());

app.route('/api', routes);

app.onError(errorHandler);

app.doc('/api/openapi.json', {
  openapi: '3.0.0',
  info: {
    title: 'Open Mail CLI API',
    version: '1.0.0',
    description:
      'HTTP API for Open Mail CLI - Local email management via RESTful interface',
  },
});

app.get('/api/docs', swaggerUI({ url: '/api/openapi.json' }));

app.get('/health', (c) =>
  c.json({ status: 'ok', timestamp: new Date().toISOString() })
);

export function startServer(
  port: number = 3000,
  hostname: string = '127.0.0.1'
) {
  try {
    const server = serve({
      fetch: app.fetch,
      port,
      hostname,
    });

    logger.info(`API Server running at http://${hostname}:${port}`);
    logger.info(
      `API Documentation available at http://${hostname}:${port}/api/docs`
    );

    return server;
  } catch (error) {
    logger.error('Failed to start API server', {
      error: (error as Error).message,
    });
    throw error;
  }
}

export default app;
