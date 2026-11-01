import assert from 'node:assert/strict';
import test from 'node:test';
import { escapeIcalText, foldIcalLine, generateIcalendar } from '../src/lib/server/ical.js';

test('iCalendar text escapes delimiters and line breaks', () => {
	assert.equal(escapeIcalText('A;B, C\\D\r\nE'), 'A\\;B\\, C\\\\D\\nE');
});

test('iCalendar lines fold at UTF-8 byte boundaries', () => {
	const line = `SUMMARY:${'fenêtre '.repeat(30)}`;
	const folded = foldIcalLine(line).split('\r\n');
	assert(folded.every((part) => Buffer.byteLength(part, 'utf8') <= 75));
	assert(folded.slice(1).every((part) => part.startsWith(' ')));
	assert.equal(folded.map((part, index) => (index ? part.slice(1) : part)).join(''), line);
});

test('feed includes all years, stable IDs, all-day boundaries, and no contacts', () => {
	const feed = generateIcalendar([
		{
			id: 'event-one',
			date: '2024-12-24',
			name: 'Famille Martin',
			description: 'Une fenêtre, décorée',
			address: '1 rue du Village',
			updatedAt: '2024-12-20 10:30:00',
			email: 'private@example.com',
			phone: '0600000000'
		},
		{
			id: 'event-two',
			date: '2026-12-01',
			name: 'Association',
			description: 'Décorations',
			address: '2 place de la Mairie',
			updatedAt: '2026-11-20T10:30:00.000Z'
		}
	]);

	assert.match(feed, /UID:event-one@fenetre-avent/);
	assert.match(feed, /DTSTART;VALUE=DATE:20241224/);
	assert.match(feed, /DTEND;VALUE=DATE:20241225/);
	assert.match(feed, /DTSTART;VALUE=DATE:20261201/);
	assert.match(feed, /SUMMARY:Fenêtre de l’Avent — Famille Martin/);
	assert.match(feed, /DTSTAMP:20241220T103000Z/);
	assert.match(feed, /LAST-MODIFIED:20261120T103000Z/);
	assert.doesNotMatch(feed, /private@example.com|0600000000/);
	assert(feed.endsWith('\r\n'));
});
