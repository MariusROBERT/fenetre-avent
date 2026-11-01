import { and, eq, gte, lte, ne } from 'drizzle-orm';
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
