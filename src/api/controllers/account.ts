import type { Context } from 'hono';
import accountManager from '../../accounts/manager';
import logger from '../../utils/logger';

export async function list(c: Context) {
  try {
    const accounts = accountManager.getAllAccounts();

    return c.json({
      data: (accounts || []).map(
        (acc: {
          id: number;
          email: string;
          name: string;
          enabled: boolean;
        }) => ({
          id: acc.id,
          email: acc.email,
          name: acc.name,
          enabled: acc.enabled,
        })
      ),
    });
  } catch (error) {
    logger.error('Failed to list accounts', {
      error: (error as Error).message,
    });
    throw new Error('Failed to list accounts');
  }
}

export async function get(c: Context) {
  try {
    const id = parseInt(c.req.param('id'), 10);

    if (isNaN(id)) {
      return c.json(
        { error: { code: 'INVALID_ID', message: 'Invalid account ID' } },
        400
      );
    }

    const account = accountManager.getAccount(id);

    if (!account) {
      const error = new Error('Account not found');
      error.name = 'NotFoundError';
      throw error;
    }

    return c.json({
      data: {
        id: account.id,
        email: account.email,
        name: account.name,
        enabled: account.enabled,
      },
    });
  } catch (error) {
    logger.error('Failed to get account', { error: (error as Error).message });
    throw error;
  }
}

export async function add(c: Context) {
  try {
    const data = await c.req.json();

    const accountId = await accountManager.addAccount(data);

    const account = accountManager.getAccount(accountId);

    if (!account) {
      return c.json(
        {
          error: {
            code: 'ACCOUNT_NOT_CREATED',
            message: 'Failed to create account',
          },
        },
        500
      );
    }

    return c.json(
      {
        data: {
          id: account.id,
          email: data.email,
        },
      },
      201
    );
  } catch (error) {
    logger.error('Failed to add account', { error: (error as Error).message });
    throw new Error('Failed to add account');
  }
}
