import { Hono } from 'hono';
import emailRoutes from './emails';
import accountRoutes from './accounts';
import syncRoutes from './sync';

const app = new Hono();

app.route('/emails', emailRoutes);
app.route('/accounts', accountRoutes);
app.route('/sync', syncRoutes);

export default app;
