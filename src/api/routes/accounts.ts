import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import * as accountController from '../controllers/account';
import { AddAccountSchema } from '../schemas/account';

const app = new Hono();

app.get('/', accountController.list);
app.get('/:id', accountController.get);
app.post('/', zValidator('json', AddAccountSchema), accountController.add);

export default app;
