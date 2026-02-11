import type { Formatter, FormatMeta, FormatOptions } from './types';
import type { EmailData } from './email-data';
import {
  parseFieldSelection,
  selectFields,
  getDefaultFieldSelection,
} from '../utils/field-selection';

interface JSONResult {
  data: EmailData | EmailData[];
  meta?: FormatMeta;
}

export class JSONFormatter implements Formatter<EmailData> {
  formatList(
    data: EmailData[],
    meta: FormatMeta,
    options: FormatOptions
  ): string {
    // Apply field selection
    const selection = options.fields
      ? parseFieldSelection(options.fields)
      : getDefaultFieldSelection('list');

    const filteredData = data.map((item) => {
      const sanitized = this.sanitizeItem(item);
      return selectFields(sanitized, selection);
    });

    const result: JSONResult = {
      data: filteredData,
      meta: this.sanitizeMeta(meta),
    };
    return JSON.stringify(result, null, 2);
  }

  formatDetail(data: EmailData, options: FormatOptions): string {
    // Apply field selection
    const selection = options.fields
      ? parseFieldSelection(options.fields)
      : getDefaultFieldSelection('detail');

    const sanitized = this.sanitizeItem(data);
    const filtered = selectFields(sanitized, selection);

    const result: JSONResult = {
      data: filtered,
    };
    return JSON.stringify(result, null, 2);
  }

  private sanitizeData(data: EmailData | EmailData[]): EmailData | EmailData[] {
    if (Array.isArray(data)) {
      return data.map((item) => this.sanitizeItem(item));
    }
    return this.sanitizeItem(data);
  }

  private sanitizeItem(item: EmailData): EmailData {
    if (!item) return item;

    const result: EmailData = {} as EmailData;

    for (const key of Object.keys(item) as Array<keyof EmailData>) {
      if (typeof key === 'string' && key.startsWith('_')) continue;

      const keyString = key as string;

      if (
        keyString.includes('password') ||
        keyString.includes('token') ||
        keyString.includes('secret')
      ) {
        (result as Record<string, unknown>)[keyString] = '***REDACTED***';
      } else if (keyString === 'bodyHtml') {
        (result as Record<string, unknown>)[keyString] = (
          item as Record<string, unknown>
        )[keyString]
          ? '<HTML content>'
          : null;
      } else {
        (result as Record<string, unknown>)[keyString] = (
          item as Record<string, unknown>
        )[keyString];
      }
    }

    return result;
  }

  private sanitizeMeta(meta: FormatMeta): Record<string, unknown> {
    const result: Record<string, unknown> = {};

    for (const key of Object.keys(meta)) {
      result[key] = meta[key];
    }

    return result;
  }
}
