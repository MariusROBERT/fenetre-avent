import { resolve } from 'node:path';
import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import * as schema from '../src/lib/server/db/schema.js';

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error('DATABASE_URL is not set');

const client = new Database(databaseUrl);
try {
	migrate(drizzle(client, { schema }), { migrationsFolder: resolve('drizzle') });
} finally {
	client.close();
}
