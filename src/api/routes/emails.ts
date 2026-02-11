import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import * as emailController from '../controllers/email';
import { SendEmailSchema } from '../schemas/email';

const app = new Hono();

app.get('/', emailController.list);
app.get('/:id', emailController.get);
app.post('/', zValidator('json', SendEmailSchema), emailController.send);
app.post('/:id/mark-read', emailController.markRead);
app.post('/:id/star', emailController.star);

export default app;
