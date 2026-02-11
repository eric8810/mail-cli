import { z } from 'zod';

export const SendEmailSchema = z.object({
  to: z.string().email('Invalid email address'),
  subject: z.string().min(1, 'Subject is required'),
  body: z.string().min(1, 'Body is required'),
  cc: z.array(z.string().email()).optional(),
  bcc: z.array(z.string().email()).optional(),
  reply_to: z.string().optional(),
});

export type SendEmailInput = z.infer<typeof SendEmailSchema>;
