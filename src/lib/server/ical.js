import { siteConfig } from '#lib/config/site.js';

/** @param {string} value */
export function escapeIcalText(value) {
	return value
		.replace(/\\/g, '\\\\')
		.replace(/\r\n?|\n/g, '\\n')
		.replace(/([,;])/g, '\\$1');
}

/** @param {string} line */
export function foldIcalLine(line) {
	let folded = '';
	let current = '';
	let byteLength = 0;

	for (const character of line) {
		const characterLength = Buffer.byteLength(character, 'utf8');
		if (byteLength + characterLength > 75) {
			folded += `${current}\r\n `;
			current = character;
			byteLength = characterLength + 1;
		} else {
			current += character;
			byteLength += characterLength;
		}
	}

	return folded + current;
}

/** @param {string} value */
function toIcalTimestamp(value) {
	const iso = value.includes('T') ? value : `${value.replace(' ', 'T')}Z`;
	const date = new Date(iso);
	if (Number.isNaN(date.getTime())) throw new Error('Invalid registration update timestamp.');
	return date
		.toISOString()
		.replace(/[-:]/g, '')
		.replace(/\.\d{3}/, '');
}

/** @param {string} date */
function nextDay(date) {
	const parsedDate = new Date(`${date}T00:00:00Z`);
	if (Number.isNaN(parsedDate.getTime()) || parsedDate.toISOString().slice(0, 10) !== date) {
		throw new Error('Invalid registration date.');
	}
	parsedDate.setUTCDate(parsedDate.getUTCDate() + 1);
	return parsedDate.toISOString().slice(0, 10).replaceAll('-', '');
}

/** @param {Array<{id: string, date: string, name: string, description: string, address: string, updatedAt: string}>} registrations
 * @param {string} [publicUrl]
 */
export function generateIcalendar(registrations, publicUrl = siteConfig.publicUrl) {
	const events = registrations.flatMap((registration) => {
		const date = new Date(`${registration.date}T00:00:00Z`);
		if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== registration.date) {
			throw new Error('Invalid registration date.');
		}

		const dateValue = registration.date.replaceAll('-', '');
		const updatedAt = toIcalTimestamp(registration.updatedAt);
		const eventUrl = new URL(
			`/?date=${encodeURIComponent(registration.date)}`,
			publicUrl
		).toString();

		return [
			'BEGIN:VEVENT',
			`UID:${registration.id}@fenetre-avent`,
			`DTSTAMP:${updatedAt}`,
			`LAST-MODIFIED:${updatedAt}`,
			`DTSTART;VALUE=DATE:${dateValue}`,
			`DTEND;VALUE=DATE:${nextDay(registration.date)}`,
			`SUMMARY:${escapeIcalText(`Fenêtre de l’Avent — ${registration.name}`)}`,
			`DESCRIPTION:${escapeIcalText(`${registration.description}\nAdresse : ${registration.address}`)}`,
			`LOCATION:${escapeIcalText(registration.address)}`,
			`URL:${eventUrl}`,
			'STATUS:CONFIRMED',
			'END:VEVENT'
		];
	});

	const lines = [
		'BEGIN:VCALENDAR',
		'VERSION:2.0',
		'PRODID:-//Fenetre de l Avent//Fenetre Avent//FR',
		'CALSCALE:GREGORIAN',
		'METHOD:PUBLISH',
		`X-WR-CALNAME:${escapeIcalText(siteConfig.name)}`,
		...events,
		'END:VCALENDAR'
	];

	return `${lines.map(foldIcalLine).join('\r\n')}\r\n`;
}
