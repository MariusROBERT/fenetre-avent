export const siteConfig = {
	name: 'Fenêtres de l’Avent',
	publicUrl: 'http://localhost:5173',
	adventYear: 2026,
	municipality: {
		name: 'Grenoble',
		inseeCode: '38185',
		postalCode: '38000',
		// Coordinates use [longitude, latitude], matching GeoJSON and MapLibre.
		mapCenter: [5.9874, 45.2571],
		mapBounds: [
			[5.678003, 45.154148],
			[5.753078, 45.214319]
		]
	},
	mapTileUrl: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png'
};
