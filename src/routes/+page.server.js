import { siteConfig } from '#lib/config/site.js';
import { isEligibleAdventDate } from '#lib/server/registrations/date-rules.js';
import { getCalendarRegistrations } from '#lib/server/registrations/queries.js';

export function load() {
	const year = siteConfig.adventYear;
	const registrations = new Map(getCalendarRegistrations(year).map((entry) => [entry.date, entry]));
	const now = new Date();

	return {
		year,
		days: Array.from({ length: 24 }, (_, index) => {
			const date = `${year}-12-${String(index + 1).padStart(2, '0')}`;
			const registration = registrations.get(date) ?? null;
			const state = registration
				? 'reserved'
				: isEligibleAdventDate(date, year, now)
					? 'available'
					: 'past';

			return {
				date,
				state,
				registration
			};
		})
	};
}
