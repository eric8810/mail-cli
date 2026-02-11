export interface EmailData {
  id: number;
  from?: string;
  to?: string;
  cc?: string;
  bcc?: string;
  subject?: string;
  date: string | Date;
  isRead?: boolean;
  isStarred?: boolean;
  isFlagged?: boolean;
  hasAttachments?: boolean;
  attachments?: Array<{ filename: string; size: number }>;
  bodyText?: string;
  bodyHtml?: string;
  folder?: string;
  flags?: string[];
  inReplyTo?: string;
  references?: string;
  threadId?: number;
  accountId?: number | null;
  [key: string]: unknown;
}
