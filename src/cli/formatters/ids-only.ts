import type { Formatter, FormatMeta, FormatOptions } from './types';
import type { EmailData } from './email-data';

export class IDsOnlyFormatter implements Formatter<EmailData> {
  formatList(
    data: EmailData[],
    meta: FormatMeta,
    options: FormatOptions
  ): string {
    if (!data || data.length === 0) {
      return '';
    }

    return data.map((item) => item.id).join(' ');
  }

  formatDetail(data: EmailData, options: FormatOptions): string {
    return String(data?.id || '');
  }
}
