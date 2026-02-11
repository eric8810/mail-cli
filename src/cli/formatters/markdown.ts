import { formatDate, truncate } from '../../utils/helpers';
import type { Formatter, FormatMeta, FormatOptions } from './types';
import type { EmailData } from './email-data';
import {
  parseFieldSelection,
  selectFields,
  getDefaultFieldSelection,
  type FieldSelection,
} from '../utils/field-selection';

export class MarkdownFormatter implements Formatter<EmailData> {
  formatList(
    data: EmailData[],
    meta: FormatMeta,
    options: FormatOptions
  ): string {
    if (!data || data.length === 0) {
      return 'No results found.';
    }

    // Parse field selection
    const selection = options.fields
      ? parseFieldSelection(options.fields)
      : getDefaultFieldSelection('list');

    // Apply field selection to data
    const filteredData = data.map((item) => selectFields(item, selection));

    const lines: string[] = [];

    const showing = meta.showing ? `Showing ${meta.showing}` : '';
    const unreadTotal = `${meta.unread ?? 0} unread, ${meta.total ?? data.length} total`;
    const title = meta.folder || 'Results';
    const header = showing
      ? `${title} (${unreadTotal}) - ${showing}`
      : `${title} (${unreadTotal})`;

    lines.push(`## ${header}`);
    lines.push('');

    // Build table header based on selected fields
    const tableHeaders = this.buildTableHeaders(selection, filteredData[0]);
    lines.push(tableHeaders.header);
    lines.push(tableHeaders.separator);

    // Build table rows
    for (let i = 0; i < filteredData.length; i++) {
      const item = filteredData[i];
      const originalItem = data[i];
      const row = this.buildTableRow(selection, item, originalItem);
      lines.push(row);
    }

    if (meta.totalPages) {
      lines.push('');
      lines.push(
        `Page ${meta.page || 1} of ${meta.totalPages} (${meta.total} total emails)`
      );
    }

    return lines.join('\n');
  }

  formatDetail(data: EmailData, options: FormatOptions): string {
    // Parse field selection
    const selection = options.fields
      ? parseFieldSelection(options.fields)
      : getDefaultFieldSelection('detail');

    // Apply field selection
    const filtered = selectFields(data, selection);

    const lines: string[] = [];

    lines.push('## Email Details');
    lines.push('');

    // Display fields dynamically based on selection
    const fieldOrder = [
      'id',
      'from',
      'to',
      'cc',
      'bcc',
      'subject',
      'date',
      'isRead',
      'isStarred',
      'isFlagged',
      'attachments',
      'bodyText',
      'bodyHtml',
    ];

    for (const field of fieldOrder) {
      if (!(field in filtered)) continue;

      const value = filtered[field];
      if (value === undefined || value === null) continue;

      switch (field) {
        case 'id':
          lines.push(`- **ID:** ${value}`);
          break;
        case 'from':
          lines.push(`- **From:** ${this.escapeMarkdown(String(value))}`);
          break;
        case 'to':
          lines.push(`- **To:** ${this.escapeMarkdown(String(value))}`);
          break;
        case 'cc':
          lines.push(`- **CC:** ${this.escapeMarkdown(String(value))}`);
          break;
        case 'bcc':
          lines.push(`- **BCC:** ${this.escapeMarkdown(String(value))}`);
          break;
        case 'subject':
          lines.push(`- **Subject:** ${this.escapeMarkdown(String(value))}`);
          break;
        case 'date':
          lines.push(
            `- **Date:** ${this.formatDateISO(value as string | Date)}`
          );
          break;
        case 'isRead':
          lines.push(`- **Status:** ${value ? 'Read' : 'Unread'}`);
          break;
        case 'isStarred':
          if (value) lines.push(`- **Starred:** Yes`);
          break;
        case 'isFlagged':
          if (value) lines.push(`- **Flagged (Important):** Yes`);
          break;
        case 'attachments':
          if (Array.isArray(value) && value.length > 0) {
            lines.push(`- **Attachments:** ${value.length}`);
            for (const att of value) {
              lines.push(
                `  - ${att.filename} (${this.formatFileSize(att.size)})`
              );
            }
          }
          break;
      }
    }

    // Display body if present
    if ('bodyText' in filtered || 'bodyHtml' in filtered) {
      lines.push('');
      lines.push('### Body');
      lines.push('');

      const body =
        (filtered.bodyText as string) || (filtered.bodyHtml as string) || '';
      lines.push(body || '(No content)');
    }

    return lines.join('\n');
  }

  private buildTableHeaders(
    selection: FieldSelection,
    sampleData: Partial<EmailData>
  ): { header: string; separator: string } {
    const fields =
      selection.include === '*'
        ? Object.keys(sampleData).filter((f) => !selection.exclude.includes(f))
        : selection.include;

    const headers: string[] = [];
    const separators: string[] = [];

    for (const field of fields) {
      const headerName = this.getFieldDisplayName(field);
      headers.push(` ${headerName} `);
      separators.push(''.padStart(headerName.length + 2, '-'));
    }

    return {
      header: `|${headers.join('|')}|`,
      separator: `|${separators.join('|')}|`,
    };
  }

  private buildTableRow(
    selection: FieldSelection,
    item: Partial<EmailData>,
    originalItem: EmailData
  ): string {
    const fields =
      selection.include === '*'
        ? Object.keys(item).filter((f) => !selection.exclude.includes(f))
        : selection.include;

    const values: string[] = [];

    for (const field of fields) {
      const value = this.formatFieldValue(field, item[field], originalItem);
      values.push(` ${value} `);
    }

    return `|${values.join('|')}|`;
  }

  private getFieldDisplayName(field: string): string {
    const displayNames: Record<string, string> = {
      id: 'ID',
      from: 'From',
      to: 'To',
      cc: 'CC',
      bcc: 'BCC',
      subject: 'Subject',
      date: 'Date',
      isRead: 'Status',
      isStarred: 'Starred',
      isFlagged: 'Flagged',
      hasAttachments: 'Attachments',
      folder: 'Folder',
      bodyText: 'Body',
      bodyHtml: 'HTML',
      threadId: 'Thread',
      accountId: 'Account',
    };

    return (
      displayNames[field] || field.charAt(0).toUpperCase() + field.slice(1)
    );
  }

  private formatFieldValue(
    field: string,
    value: unknown,
    originalItem: EmailData
  ): string {
    if (value === undefined || value === null) {
      return '';
    }

    switch (field) {
      case 'id':
      case 'threadId':
      case 'accountId':
        return String(value);

      case 'from':
      case 'to':
      case 'cc':
      case 'bcc':
        return this.escapeMarkdownForTable(truncate(String(value), 20));

      case 'subject':
        return this.escapeMarkdownForTable(truncate(String(value), 30));

      case 'date':
        return formatDate(value as string | Date);

      case 'isRead':
        return value ? 'Read' : 'Unread';

      case 'isStarred':
      case 'isFlagged':
      case 'hasAttachments':
        return value ? 'Yes' : 'No';

      case 'bodyText':
      case 'bodyHtml':
        return this.escapeMarkdownForTable(truncate(String(value), 50));

      case 'folder':
        return this.escapeMarkdownForTable(String(value));

      default:
        if (typeof value === 'object') {
          return this.escapeMarkdownForTable(JSON.stringify(value));
        }
        return this.escapeMarkdownForTable(truncate(String(value), 30));
    }
  }

  private escapeMarkdown(text: string): string {
    if (!text) return '';
    return text.replace(/\|/g, '\\|');
  }

  private escapeMarkdownForTable(text: string): string {
    if (!text) return '';
    return text.replace(/\|/g, '\\|').replace(/\n/g, ' ');
  }

  private formatDateISO(
    date: string | number | Date | null | undefined
  ): string {
    if (!date) return '';
    if (typeof date === 'string' && date.includes('T')) {
      return date;
    }
    return new Date(date).toISOString();
  }

  private formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }
}
