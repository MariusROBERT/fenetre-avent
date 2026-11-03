import { ADMIN_EMAIL, ADMIN_PASSWORD, BETTER_AUTH_SECRET } from '$app/env/private';
import { auth } from '#lib/server/auth.js';

/** @param {Request} request */
const handle = (request) => {
	if (request.method === 'POST' && new URL(request.url).pathname.endsWith('/sign-up/email')) {
		return Response.json({ message: 'Registration is disabled.' }, { status: 403 });
	}
	if (!ADMIN_EMAIL || !ADMIN_PASSWORD || !BETTER_AUTH_SECRET || BETTER_AUTH_SECRET.length < 32) {
		return Response.json({ message: 'Authentication is not configured.' }, { status: 503 });
	}
	return auth.handler(request);
};

export const GET = ({ request }) => handle(request);
export const POST = ({ request }) => handle(request);
