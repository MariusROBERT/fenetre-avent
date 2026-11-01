import assert from 'node:assert/strict';
import test from 'node:test';
import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { eq } from 'drizzle-orm';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import * as schema from '../src/lib/server/db/schema.js';

test('SQLite requires contact information and prevents active duplicate dates', () => {
	const client = new Database(':memory:');

	try {
		const db = drizzle(client, { schema });
		migrate(db, { migrationsFolder: 'drizzle' });

		const registration = {
			date: '2026-12-01',
			name: 'Test participant',
			description: 'A decorated Advent window',
			address: '1 place de la Mairie, Grenoble',
			latitude: 45.2571,
			longitude: 5.9874,
			rulesAcceptedAt: '2026-11-01T12:00:00.000Z',
			rulesVersion: '1',
			phone: '0600000000'
		};

		assert.throws(
			() =>
				db
					.insert(schema.registration)
					.values({ ...registration, phone: null })
					.run(),
			/registrations_contact_required/
		);

		const first = db.insert(schema.registration).values(registration).returning().get();
		assert.throws(
			() => db.insert(schema.registration).values(registration).run(),
			/UNIQUE constraint failed/
		);

		db.update(schema.registration)
			.set({ status: 'cancelled' })
			.where(eq(schema.registration.id, first.id))
			.run();
		db.insert(schema.registration).values(registration).run();
	} finally {
		client.close();
	}
});
