import type { ErrorHandler } from 'hono';

export const errorHandler: ErrorHandler = (err, c) => {
  console.error('API Error:', err);

  if (err.name === 'NotFoundError') {
    return c.json(
      {
        error: {
          code: 'NOT_FOUND',
          message: err.message,
        },
      },
      404
    );
  }

  if (err.name === 'ValidationError') {
    return c.json(
      {
        error: {
          code: 'VALIDATION_ERROR',
          message: err.message,
        },
      },
      400
    );
  }

  return c.json(
    {
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An unexpected error occurred',
      },
    },
    500
  );
};
