import { and, asc, eq, gte, lte, ne } from 'drizzle-orm';
import { db } from '#lib/server/db/index.js';
import { registration } from '#lib/server/db/schema.js';

/** @param {number} year */
export function getCalendarRegistrations(year) {
	return db
		.select({
			date: registration.date,
			name: registration.name,
			description: registration.description,
			address: registration.address,
			latitude: registration.latitude,
			longitude: registration.longitude
		})
		.from(registration)
		.where(
			and(
				eq(registration.status, 'confirmed'),
				gte(registration.date, `${year}-12-01`),
				lte(registration.date, `${year}-12-24`)
			)
		)
		.all();
}

/** @param {string} date */
export function isDateReserved(date) {
	return Boolean(
		db
			.select({ id: registration.id })
			.from(registration)
			.where(and(eq(registration.date, date), ne(registration.status, 'cancelled')))
			.limit(1)
			.get()
	);
}

export function getAllConfirmedRegistrations() {
	return db
		.select({
			id: registration.id,
			date: registration.date,
			name: registration.name,
			description: registration.description,
			address: registration.address,
			latitude: registration.latitude,
			longitude: registration.longitude,
			updatedAt: registration.updatedAt
		})
		.from(registration)
		.where(eq(registration.status, 'confirmed'))
		.orderBy(asc(registration.date))
		.all();
}

/** @param {number} year */
export function getAdminRegistrations(year) {
	return db
		.select()
		.from(registration)
		.where(and(gte(registration.date, `${year}-12-01`), lte(registration.date, `${year}-12-24`)))
		.orderBy(asc(registration.date))
		.all();
}
