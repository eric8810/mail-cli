import { z } from 'zod';

export const AddAccountSchema = z.object({
  email: z.string().email('Invalid email address'),
  name: z.string().min(1, 'Name is required'),
  imap_host: z.string().min(1, 'IMAP host is required'),
  imap_port: z.number().int().min(1).max(65535),
  imap_secure: z.boolean().default(true),
  smtp_host: z.string().min(1, 'SMTP host is required'),
  smtp_port: z.number().int().min(1).max(65535),
  smtp_secure: z.boolean().default(true),
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
});

export type AddAccountInput = z.infer<typeof AddAccountSchema>;
