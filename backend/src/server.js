import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config } from './config.js';
import { pool } from './db.js';
import { migrate } from './migrate.js';
import { authRouter, requireAuth } from './auth.js';
import { entitiesRouter } from './entities.js';
import { functionsRouter } from './functions.js';
import { usersRouter } from './users.js';
import { errorHandler } from './http.js';

const app = express();
app.disable('x-powered-by');
app.use(helmet());
app.use(cors({ origin: config.corsOrigin }));
app.use(express.json({ limit: '1mb' }));

app.get('/api/health', async (_req, res) => {
  await pool.query('SELECT 1');
  res.json({ status: 'ok' });
});

app.use('/api/auth', authRouter);
app.use('/api/entities', requireAuth, entitiesRouter);
app.use('/api/functions', requireAuth, functionsRouter);
app.use('/api/users', requireAuth, usersRouter);

app.use('/api', (_req, res) => res.status(404).json({ message: 'Route introuvable.' }));
app.use(errorHandler);

await migrate();
const server = app.listen(config.port, () => console.log(`[api] Wetrack API sur le port ${config.port}`));

const shutdown = () => server.close(() => pool.end().then(() => process.exit(0)));
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
