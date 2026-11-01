import assert from 'node:assert/strict';
import test from 'node:test';
import { getParisDate, isEligibleAdventDate } from '../src/lib/server/registrations/date-rules.js';

test('Paris date reflects the Europe/Paris calendar day', () => {
	assert.equal(getParisDate(new Date('2026-12-12T22:59:59.000Z')), '2026-12-12');
	assert.equal(getParisDate(new Date('2026-12-12T23:00:00.000Z')), '2026-12-13');
});

test('Advent date eligibility includes the selected Paris day', () => {
	const beforeParisMidnight = new Date('2026-12-12T22:59:59.000Z');
	assert.equal(isEligibleAdventDate('2026-12-12', 2026, beforeParisMidnight), true);
	assert.equal(isEligibleAdventDate('2026-12-11', 2026, beforeParisMidnight), false);
	assert.equal(isEligibleAdventDate('2026-12-13', 2026, beforeParisMidnight), true);
	assert.equal(isEligibleAdventDate('2026-12-12', 2026, new Date('2026-12-12T23:00:00Z')), false);
});

test('Advent eligibility rejects invalid dates and dates outside the active edition', () => {
	const now = new Date('2026-11-01T12:00:00Z');
	for (const date of [
		'2026-11-30',
		'2026-12-00',
		'2026-12-25',
		'2026-02-30',
		'2025-12-01',
		'bad'
	]) {
		assert.equal(isEligibleAdventDate(date, 2026, now), false, date);
	}
});
