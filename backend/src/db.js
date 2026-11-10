import pg from 'pg';
import { config } from './config.js';

// Les colonnes numériques agrégées (SUM, COUNT) reviennent en nombres JS.
pg.types.setTypeParser(pg.types.builtins.INT8, (v) => Number(v));
pg.types.setTypeParser(pg.types.builtins.NUMERIC, (v) => Number(v));

export const pool = new pg.Pool({ connectionString: config.databaseUrl, max: 10 });

export const query = (text, params) => pool.query(text, params);
