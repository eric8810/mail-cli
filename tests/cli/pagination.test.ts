import { describe, expect, it } from 'vitest';
import {
  parsePagination,
  calculateRange,
} from '../../src/cli/utils/pagination';

describe('parsePagination', () => {
  it('should use default values when no options provided', () => {
    const result = parsePagination({});
    expect(result).toEqual({ limit: 20, offset: 0, page: 1 });
  });

  it('should use custom limit', () => {
    const result = parsePagination({ limit: 50 });
    expect(result).toEqual({ limit: 50, offset: 0, page: 1 });
  });

  it('should calculate offset from page', () => {
    const result = parsePagination({ page: 3 });
    expect(result).toEqual({ limit: 20, offset: 40, page: 3 });
  });

  it('should calculate offset from page with custom limit', () => {
    const result = parsePagination({ page: 2, limit: 50 });
    expect(result).toEqual({ limit: 50, offset: 50, page: 2 });
  });

  it('should prioritize offset over page when both are provided', () => {
    const result = parsePagination({ offset: 100, page: 3 });
    expect(result).toEqual({ limit: 20, offset: 100, page: 6 });
  });

  it('should handle offset directly', () => {
    const result = parsePagination({ offset: 40 });
    expect(result).toEqual({ limit: 20, offset: 40, page: 3 });
  });

  it('should handle negative limit by using default', () => {
    const result = parsePagination({ limit: -10 });
    expect(result.limit).toBe(1);
  });

  it('should handle zero limit by using minimum', () => {
    const result = parsePagination({ limit: 0 });
    expect(result.limit).toBe(1);
  });

  it('should handle negative offset by using 0', () => {
    const result = parsePagination({ offset: -5 });
    expect(result.offset).toBe(0);
    expect(result.page).toBe(1);
  });

  it('should handle negative page by using 1', () => {
    const result = parsePagination({ page: -1 });
    expect(result.page).toBe(1);
    expect(result.offset).toBe(0);
  });

  it('should handle all negative values', () => {
    const result = parsePagination({ limit: -10, offset: -5, page: -1 });
    expect(result.limit).toBeGreaterThan(0);
    expect(result.offset).toBeGreaterThanOrEqual(0);
    expect(result.page).toBeGreaterThan(0);
  });
});

describe('calculateRange', () => {
  it('should calculate range correctly for first page', () => {
    const range = calculateRange(0, 20, 150);
    expect(range).toEqual({ start: 1, end: 20, total: 150, showing: '1-20' });
  });

  it('should calculate range correctly for middle page', () => {
    const range = calculateRange(40, 20, 150);
    expect(range).toEqual({ start: 41, end: 60, total: 150, showing: '41-60' });
  });

  it('should calculate range correctly for last page', () => {
    const range = calculateRange(140, 20, 150);
    expect(range).toEqual({
      start: 141,
      end: 150,
      total: 150,
      showing: '141-150',
    });
  });

  it('should handle partial last page', () => {
    const range = calculateRange(140, 20, 145);
    expect(range).toEqual({
      start: 141,
      end: 145,
      total: 145,
      showing: '141-145',
    });
  });

  it('should handle empty list', () => {
    const range = calculateRange(0, 20, 0);
    expect(range).toEqual({ start: 0, end: 0, total: 0, showing: '0' });
  });

  it('should handle offset beyond total', () => {
    const range = calculateRange(200, 20, 150);
    expect(range).toEqual({ start: 0, end: 0, total: 150, showing: '0' });
  });

  it('should handle offset at the end', () => {
    const range = calculateRange(150, 20, 150);
    expect(range).toEqual({ start: 0, end: 0, total: 150, showing: '0' });
  });

  it('should handle single item', () => {
    const range = calculateRange(0, 20, 1);
    expect(range).toEqual({ start: 1, end: 1, total: 1, showing: '1-1' });
  });

  it('should handle exact multiple', () => {
    const range = calculateRange(0, 20, 100);
    expect(range).toEqual({ start: 1, end: 20, total: 100, showing: '1-20' });
  });

  it('should handle large limit', () => {
    const range = calculateRange(0, 200, 50);
    expect(range).toEqual({ start: 1, end: 50, total: 50, showing: '1-50' });
  });
});

describe('pagination integration', () => {
  it('should work together for typical pagination scenario', () => {
    const options = { page: 2, limit: 25 };
    const { limit, offset, page } = parsePagination(options);
    const range = calculateRange(offset, limit, 100);

    expect(limit).toBe(25);
    expect(offset).toBe(25);
    expect(page).toBe(2);
    expect(range).toEqual({ start: 26, end: 50, total: 100, showing: '26-50' });
  });

  it('should work together when using offset directly', () => {
    const options = { offset: 30, limit: 10 };
    const { limit, offset, page } = parsePagination(options);
    const range = calculateRange(offset, limit, 100);

    expect(limit).toBe(10);
    expect(offset).toBe(30);
    expect(page).toBe(4);
    expect(range).toEqual({ start: 31, end: 40, total: 100, showing: '31-40' });
  });

  it('should handle empty results properly', () => {
    const options = { page: 1, limit: 20 };
    const { limit, offset, page } = parsePagination(options);
    const range = calculateRange(offset, limit, 0);

    expect(range).toEqual({ start: 0, end: 0, total: 0, showing: '0' });
  });
});
