/** @param {{event: import('@sveltejs/kit').RequestEvent, resolve: (event: import('@sveltejs/kit').RequestEvent) => Promise<Response>}} args */
export async function handle({ event, resolve }) {
	const response = await resolve(event);
	response.headers.set('X-Robots-Tag', 'noindex, nofollow, noarchive');
	return response;
}
