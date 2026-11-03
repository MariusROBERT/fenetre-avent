import { auth } from '#lib/server/auth.js';

/** @param {Request} request */
const handle = (request) => {
	if (request.method === 'POST' && new URL(request.url).pathname.endsWith('/sign-up/email')) {
		return Response.json({ message: 'Registration is disabled.' }, { status: 403 });
	}
	return auth.handler(request);
};

export const GET = ({ request }) => handle(request);
export const POST = ({ request }) => handle(request);
