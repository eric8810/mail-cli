export interface PaginationOptions {
  limit?: number;
  offset?: number;
  page?: number;
}

export interface PaginationResult {
  limit: number;
  offset: number;
  page: number;
}

export interface RangeInfo {
  start: number;
  end: number;
  total: number;
  showing: string;
}

export function parsePagination(
  options: PaginationOptions = {}
): PaginationResult {
  const limit = Math.max(options.limit ?? 20, 1);

  let offset = 0;
  let page = 1;

  if (options.offset !== undefined) {
    offset = Math.max(options.offset, 0);
    page = Math.floor(offset / limit) + 1;
  } else if (options.page !== undefined) {
    page = Math.max(options.page, 1);
    offset = (page - 1) * limit;
  }

  return { limit, offset, page };
}

export function calculateRange(
  offset: number,
  limit: number,
  total: number
): RangeInfo {
  if (total === 0 || offset >= total) {
    return { start: 0, end: 0, total, showing: '0' };
  }

  const start = offset + 1;
  const end = Math.min(offset + limit, total);
  const showing = `${start}-${end}`;

  return { start, end, total, showing };
}
