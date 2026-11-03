import { redirect } from '@sveltejs/kit';
import { auth, initializeAdmin } from '#lib/server/auth.js';

/** @param {import('@sveltejs/kit').RequestEvent} event */
export async function requireAdmin(event) {
	await initializeAdmin();
	const session = await auth.api.getSession({ headers: event.request.headers });
	if (!session) throw redirect(303, '/admin');
	return session;
}
