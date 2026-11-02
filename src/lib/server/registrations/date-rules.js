const parisDateFormatter = new Intl.DateTimeFormat('en-CA', {
	timeZone: 'Europe/Paris',
	year: 'numeric',
	month: '2-digit',
	day: '2-digit'
});

/** @param {Date} [now] @returns {string} */
export function getParisDate(now = new Date()) {
	const parts = Object.fromEntries(
		parisDateFormatter.formatToParts(now).map(({ type, value }) => [type, value])
	);
	return `${parts.year}-${parts.month}-${parts.day}`;
}

/** @param {string} date @param {number} year @returns {boolean} */
export function isAdventDate(date, year) {
	if (typeof date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return false;
	const parsedDate = new Date(`${date}T00:00:00Z`);
	if (Number.isNaN(parsedDate.getTime()) || parsedDate.toISOString().slice(0, 10) !== date)
		return false;
	if (!date.startsWith(`${year}-12-`)) return false;

	const day = Number(date.slice(-2));
	return day >= 1 && day <= 24;
}

/** @param {string} date
 * @param {number} year
 * @param {Date} [now]
 * @returns {boolean}
 */
export function isEligibleAdventDate(date, year, now = new Date()) {
	return isAdventDate(date, year) && date >= getParisDate(now);
}
