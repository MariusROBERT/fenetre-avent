import { siteConfig } from '#lib/config/site.js';
import { auth, initializeAdmin } from '#lib/server/auth.js';
import { getAdminRegistrations } from '#lib/server/registrations/queries.js';
import { isEligibleAdventDate } from '#lib/server/registrations/date-rules.js';

export async function load(event) {
	await initializeAdmin();
	const session = await auth.api.getSession({ headers: event.request.headers });
	if (!session) return { authenticated: false, year: siteConfig.adventYear };
	return {
		authenticated: true,
		year: siteConfig.adventYear,
		registrations: getAdminRegistrations(siteConfig.adventYear),
		availableDates: Array.from(
			{ length: 24 },
			(_, index) => `${siteConfig.adventYear}-12-${String(index + 1).padStart(2, '0')}`
		).filter((date) => isEligibleAdventDate(date, siteConfig.adventYear))
	};
}
