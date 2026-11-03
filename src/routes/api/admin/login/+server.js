import { json } from '@sveltejs/kit';
import {
	ADMIN_EMAIL,
	ADMIN_PASSWORD,
	ADMIN_USERNAME,
	BETTER_AUTH_SECRET,
	ORIGIN
} from '$app/env/private';
import { auth } from '#lib/server/auth.js';

export async function POST({ request }) {
	if (
		!ADMIN_EMAIL ||
		!ADMIN_USERNAME ||
		!ADMIN_PASSWORD ||
		!BETTER_AUTH_SECRET ||
		BETTER_AUTH_SECRET.length < 32
	) {
		return json({ message: 'Authentication is not configured.' }, { status: 503 });
	}
	if (request.headers.get('origin') !== ORIGIN)
		return json({ message: 'Forbidden' }, { status: 403 });

	let body;
	try {
		body = await request.json();
	} catch {
		return json({ message: 'Invalid request' }, { status: 400 });
	}
	if (typeof body.login !== 'string' || typeof body.password !== 'string') {
		return json({ message: 'Invalid credentials' }, { status: 401 });
	}
	if (body.login.trim().toLowerCase() !== ADMIN_USERNAME.toLowerCase()) {
		return json({ message: 'Invalid credentials' }, { status: 401 });
	}

	const response = await auth.api.signInEmail({
		body: { email: ADMIN_EMAIL, password: body.password },
		asResponse: true
	});
	if (!response.ok) return json({ message: 'Invalid credentials' }, { status: 401 });
	return response;
}
