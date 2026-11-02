import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { siteConfig } from '#lib/config/site.js';

/** @type {{geometry: {type: 'Polygon' | 'MultiPolygon', coordinates: number[][][][] | number[][][]}}} */
const boundary = JSON.parse(
	readFileSync(resolve(process.cwd(), siteConfig.municipality.boundaryGeoJson), 'utf8')
);
/** @type {number[][][][]} */
const polygons =
	boundary.geometry.type === 'Polygon'
		? [/** @type {number[][][]} */ (boundary.geometry.coordinates)]
		: boundary.geometry.type === 'MultiPolygon'
			? /** @type {number[][][][]} */ (boundary.geometry.coordinates)
			: [];

if (polygons.length === 0)
	throw new Error('Municipal GeoJSON must contain a Polygon or MultiPolygon.');

/** @param {number[][]} ring
 * @param {number} longitude
 * @param {number} latitude
 */
function ringContainsPoint(ring, longitude, latitude) {
	let inside = false;

	for (let index = 0, previous = ring.length - 1; index < ring.length; previous = index++) {
		const [x1, y1] = ring[previous];
		const [x2, y2] = ring[index];
		const cross = (longitude - x1) * (y2 - y1) - (latitude - y1) * (x2 - x1);
		if (
			Math.abs(cross) < 1e-10 &&
			longitude >= Math.min(x1, x2) &&
			longitude <= Math.max(x1, x2) &&
			latitude >= Math.min(y1, y2) &&
			latitude <= Math.max(y1, y2)
		)
			return true;

		if (
			y1 > latitude !== y2 > latitude &&
			longitude < ((x2 - x1) * (latitude - y1)) / (y2 - y1) + x1
		)
			inside = !inside;
	}

	return inside;
}

/** @param {number} longitude
 * @param {number} latitude
 */
export function isInsideMunicipality(longitude, latitude) {
	if (
		!Number.isFinite(longitude) ||
		!Number.isFinite(latitude) ||
		longitude < -180 ||
		longitude > 180 ||
		latitude < -90 ||
		latitude > 90
	)
		return false;

	return polygons.some(
		(polygon) =>
			ringContainsPoint(polygon[0], longitude, latitude) &&
			!polygon.slice(1).some((hole) => ringContainsPoint(hole, longitude, latitude))
	);
}
