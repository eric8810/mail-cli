import { Hono } from 'hono';
import * as syncController from '../controllers/sync';

const app = new Hono();

app.post('/', syncController.trigger);
app.get('/status', syncController.getStatus);

export default app;
