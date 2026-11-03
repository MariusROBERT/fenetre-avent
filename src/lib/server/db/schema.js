import { check, integer, real, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core';
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

export const user = sqliteTable('user', {
	id: text('id').primaryKey(),
	name: text('name').notNull(),
	email: text('email').notNull().unique(),
	emailVerified: integer('email_verified', { mode: 'boolean' }).notNull().default(false),
	image: text('image'),
	createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
	updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull()
});

export const session = sqliteTable('session', {
	id: text('id').primaryKey(),
	expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull(),
	token: text('token').notNull().unique(),
	createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
	updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
	ipAddress: text('ip_address'),
	userAgent: text('user_agent'),
	userId: text('user_id')
		.notNull()
		.references(() => user.id, { onDelete: 'cascade' })
});

export const account = sqliteTable('account', {
	id: text('id').primaryKey(),
	accountId: text('account_id').notNull(),
	providerId: text('provider_id').notNull(),
	userId: text('user_id')
		.notNull()
		.references(() => user.id, { onDelete: 'cascade' }),
	accessToken: text('access_token'),
	refreshToken: text('refresh_token'),
	idToken: text('id_token'),
	accessTokenExpiresAt: integer('access_token_expires_at', { mode: 'timestamp' }),
	refreshTokenExpiresAt: integer('refresh_token_expires_at', { mode: 'timestamp' }),
	scope: text('scope'),
	password: text('password'),
	createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
	updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull()
});

export const verification = sqliteTable('verification', {
	id: text('id').primaryKey(),
	identifier: text('identifier').notNull(),
	value: text('value').notNull(),
	expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull(),
	createdAt: integer('created_at', { mode: 'timestamp' }),
	updatedAt: integer('updated_at', { mode: 'timestamp' })
});
