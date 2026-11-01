import { json } from '@sveltejs/kit';
import { siteConfig } from '#lib/config/site.js';

export async function GET({ url, fetch }) {
	const query = url.searchParams.get('q')?.trim() ?? '';
	if (query.length < 3) return json({ suggestions: [] });
	if (query.length > 100) {
		return json({ error: 'La recherche est trop longue.', suggestions: [] }, { status: 400 });
	}

	const endpoint = new URL('https://data.geopf.fr/geocodage/search');
	endpoint.searchParams.set('q', query);
	endpoint.searchParams.set('index', 'address');
	endpoint.searchParams.set('limit', '5');
	endpoint.searchParams.set('autocomplete', '1');
	endpoint.searchParams.set('citycode', siteConfig.municipality.inseeCode);

	try {
		const response = await fetch(endpoint, { signal: AbortSignal.timeout(5000) });
		if (!response.ok) throw new Error('Address service unavailable');

		/** @type {{features?: {properties: {citycode?: string, label?: string}, geometry: {coordinates: [number, number]}}[]}} */
		const results = await response.json();
		const suggestions = (results.features ?? [])
			.filter((feature) => feature.properties.citycode === siteConfig.municipality.inseeCode)
			.map((feature) => ({
				label: feature.properties.label,
				longitude: feature.geometry.coordinates[0],
				latitude: feature.geometry.coordinates[1]
			}))
			.filter(
				(suggestion) =>
					typeof suggestion.label === 'string' &&
					Number.isFinite(suggestion.longitude) &&
					Number.isFinite(suggestion.latitude)
			);

		return json({ suggestions });
	} catch {
		return json(
			{
				error: 'Le service de recherche d’adresses est momentanément indisponible.',
				suggestions: []
			},
			{ status: 502 }
		);
	}
}
