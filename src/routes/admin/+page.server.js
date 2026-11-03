import { siteConfig } from '#lib/config/site.js';
import { auth, initializeAdmin } from '#lib/server/auth.js';
import { getAdminRegistrations } from '#lib/server/registrations/queries.js';

export async function load(event) {
	await initializeAdmin();
	const session = await auth.api.getSession({ headers: event.request.headers });
	if (!session) return { authenticated: false, year: siteConfig.adventYear };
	return {
		authenticated: true,
		year: siteConfig.adventYear,
		registrations: getAdminRegistrations(siteConfig.adventYear)
	};
}
