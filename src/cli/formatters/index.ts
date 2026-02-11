import { MarkdownFormatter } from './markdown';
import { JSONFormatter } from './json';
import { IDsOnlyFormatter } from './ids-only';
import type {
  Formatter,
  FormatOptions,
  OutputFormat,
  FormatMeta,
} from './types';
import type { EmailData } from './email-data';

export { MarkdownFormatter, JSONFormatter, IDsOnlyFormatter };
export type { Formatter, FormatOptions, OutputFormat, FormatMeta, EmailData };

export function getFormatter(format: OutputFormat = 'markdown'): Formatter {
  switch (format) {
    case 'json':
      return new JSONFormatter();
    case 'ids-only':
      return new IDsOnlyFormatter();
    case 'markdown':
    default:
      return new MarkdownFormatter();
  }
}

export function formatData<T, M = FormatMeta>(
  data: T[],
  meta: M,
  options: FormatOptions = {}
): string {
  const format = options.idsOnly ? 'ids-only' : options.format || 'markdown';
  const formatter = getFormatter(format);
  return formatter.formatList(data, meta, options);
}

export function formatDetail<T>(data: T, options: FormatOptions = {}): string {
  const format = options.idsOnly ? 'ids-only' : options.format || 'markdown';
  const formatter = getFormatter(format);
  return formatter.formatDetail(data, options);
}
