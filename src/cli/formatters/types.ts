export type OutputFormat = 'markdown' | 'json' | 'ids-only';

export interface FormatOptions {
  format?: OutputFormat;
  idsOnly?: boolean;
  fields?: string; // Field selection string (e.g., "id,from,subject" or "*,^body")
  [key: string]: unknown;
}

export interface FormatMeta {
  total?: number;
  unread?: number;
  folder?: string;
  limit?: number;
  offset?: number;
  page?: number;
  totalPages?: number;
  showing?: string;
  [key: string]: unknown;
}

export interface Formatter<T = Record<string, unknown>, M = FormatMeta> {
  formatList(data: T[], meta: M, options: FormatOptions): string;
  formatDetail(data: T, options: FormatOptions): string;
}
