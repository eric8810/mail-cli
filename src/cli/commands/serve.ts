import chalk from 'chalk';
import { Ora } from 'ora';
import ora from 'ora';
import database from '../../storage/database';
import { startServer } from '../../api/server';
import logger from '../../utils/logger';

const DEFAULT_PORT = 3000;
const DEFAULT_HOSTNAME = '127.0.0.1';

export async function serveCommand(options: {
  port?: number;
  host?: string;
  'allow-remote'?: boolean;
}): Promise<void> {
  const spinner = ora();
  const port = options.port || DEFAULT_PORT;
  const hostname = options['allow-remote']
    ? '0.0.0.0'
    : options.host || DEFAULT_HOSTNAME;

  try {
    spinner.start('Initializing database...');
    database.getDb();
    spinner.succeed('Database initialized');

    spinner.start(`Starting API server at http://${hostname}:${port}...`);

    startServer(port, hostname);

    spinner.succeed(
      chalk.green(
        `API server is running at ${chalk.cyan(`http://${hostname}:${port}`)}`
      )
    );
    console.log('');
    console.log(chalk.bold('Available endpoints:'));
    console.log(
      chalk.cyan(`  • Health check:     http://${hostname}:${port}/health`)
    );
    console.log(
      chalk.cyan(`  • API docs:         http://${hostname}:${port}/api/docs`)
    );
    console.log(
      chalk.cyan(
        `  • OpenAPI spec:     http://${hostname}:${port}/api/openapi.json`
      )
    );
    console.log('');
    console.log(chalk.bold('API endpoints:'));
    console.log(chalk.cyan(`  • GET  /api/emails           List emails`));
    console.log(chalk.cyan(`  • GET  /api/emails/:id       Get email details`));
    console.log(chalk.cyan(`  • POST /api/emails           Send email`));
    console.log(
      chalk.cyan(`  • POST /api/emails/:id/mark-read   Mark as read`)
    );
    console.log(chalk.cyan(`  • POST /api/emails/:id/star         Star email`));
    console.log(chalk.cyan(`  • GET  /api/accounts         List accounts`));
    console.log(chalk.cyan(`  • POST /api/accounts         Add account`));
    console.log(chalk.cyan(`  • POST /api/sync             Trigger sync`));
    console.log(chalk.cyan(`  • GET  /api/sync/status      Get sync status`));
    console.log('');

    logger.info('API Server started', { port, hostname });
  } catch (error) {
    spinner.fail(chalk.red('Failed to start API server'));
    logger.error('Serve command failed', { error: (error as Error).message });
    console.error(chalk.red('Error:'), (error as Error).message);
    process.exit(1);
  }
}

export default serveCommand;
