import type { Context } from 'hono';
import accountSyncManager from '../../sync/account-manager';
import logger from '../../utils/logger';

const syncJobs = new Map<
  string,
  { status: string; progress?: number; error?: string }
>();

export async function trigger(c: Context) {
  try {
    const accountIdStr = c.req.query('account_id');
    const folder = c.req.query('folder');

    const jobId = `sync-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    syncJobs.set(jobId, { status: 'started' });

    const accountId = accountIdStr ? parseInt(accountIdStr, 10) : undefined;

    accountSyncManager
      .syncAccount(accountId, folder)
      .then(() => {
        syncJobs.set(jobId, { status: 'completed' });
      })
      .catch((error: Error) => {
        syncJobs.set(jobId, { status: 'failed', error: error.message });
      });

    return c.json({
      data: {
        job_id: jobId,
        status: 'started',
      },
    });
  } catch (error) {
    logger.error('Failed to trigger sync', { error: (error as Error).message });
    throw new Error('Failed to trigger sync');
  }
}

export async function getStatus(c: Context) {
  try {
    const jobId = c.req.query('job_id');

    if (!jobId) {
      return c.json(
        { error: { code: 'MISSING_JOB_ID', message: 'Job ID is required' } },
        400
      );
    }

    const job = syncJobs.get(jobId);

    if (!job) {
      return c.json(
        { error: { code: 'JOB_NOT_FOUND', message: 'Sync job not found' } },
        404
      );
    }

    return c.json({
      data: {
        job_id: jobId,
        ...job,
      },
    });
  } catch (error) {
    logger.error('Failed to get sync status', {
      error: (error as Error).message,
    });
    throw new Error('Failed to get sync status');
  }
}
