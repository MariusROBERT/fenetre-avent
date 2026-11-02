import { generateIcalendar } from '#lib/server/ical.js';
import { getAllConfirmedRegistrations } from '#lib/server/registrations/queries.js';

export function GET({ url }) {
	return new Response(generateIcalendar(getAllConfirmedRegistrations(), url.origin), {
		headers: {
			'content-type': 'text/calendar; charset=utf-8',
			'content-disposition': 'inline; filename="fenetres-avent.ics"'
		}
	});
}
