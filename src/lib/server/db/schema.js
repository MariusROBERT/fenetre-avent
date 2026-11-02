import { check, real, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

export const registration = sqliteTable(
	'registrations',
	{
		id: text('id')
			.primaryKey()
			.$defaultFn(() => crypto.randomUUID()),
		date: text('date').notNull(),
		name: text('name').notNull(),
		email: text('email'),
		phone: text('phone'),
		description: text('description').notNull(),
		address: text('address').notNull(),
		latitude: real('latitude').notNull(),
		longitude: real('longitude').notNull(),
		status: text('status').notNull().default('confirmed'),
		rulesAcceptedAt: text('rules_accepted_at').notNull(),
		rulesVersion: text('rules_version').notNull(),
		createdAt: text('created_at')
			.notNull()
			.default(sql`CURRENT_TIMESTAMP`),
		updatedAt: text('updated_at')
			.notNull()
			.default(sql`CURRENT_TIMESTAMP`)
	},
	(table) => [
		check(
			'registrations_contact_required',
			sql`${table.email} IS NOT NULL OR ${table.phone} IS NOT NULL`
		),
		check(
			'registrations_status_valid',
			sql`${table.status} IN ('pending', 'confirmed', 'cancelled')`
		),
		uniqueIndex('registrations_active_date_unique')
			.on(table.date)
			.where(sql`${table.status} <> 'cancelled'`)
	]
);
