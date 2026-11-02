export const siteConfig = {
	name: 'Fenêtres de l’Avent',
	publicUrl: 'http://localhost:3024',
	adventYear: 2026,
	rulesVersion: '2026-01',
	municipality: {
		name: 'Grenoble',
		inseeCode: '38185',
		postalCode: '38000',
		boundaryGeoJson: 'config/commune.geojson',
		// Coordinates use [longitude, latitude], matching GeoJSON and MapLibre.
		mapCenter: /** @type {[number, number]} */ ([5.71554, 45.18423]),
		mapBounds: /** @type {[[number, number], [number, number]]} */ ([
			[5.678003, 45.154148],
			[5.753078, 45.214319]
		])
	},
	mapTileUrl: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
	mapTileAttribution:
		'© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
};
