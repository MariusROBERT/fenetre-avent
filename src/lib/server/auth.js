import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { eq } from 'drizzle-orm';
import {
	ADMIN_EMAIL,
	ADMIN_PASSWORD,
	ADMIN_USERNAME,
	BETTER_AUTH_SECRET,
	ORIGIN
} from '$app/env/private';
import { db } from '#lib/server/db/index.js';
import { user } from '#lib/server/db/schema.js';

const adminEmail = ADMIN_EMAIL ?? '';
const adminPassword = ADMIN_PASSWORD ?? '';
const adminUsername = ADMIN_USERNAME ?? '';
const authSecret = BETTER_AUTH_SECRET || 'build-only-secret-configure-BETTER_AUTH_SECRET';

export const auth = betterAuth({
	appName: 'Fenêtres de l’Avent',
	baseURL: ORIGIN,
	secret: authSecret,
	database: drizzleAdapter(db, { provider: 'sqlite' }),
	emailAndPassword: { enabled: true },
	trustedOrigins: [ORIGIN],
	advanced: { useSecureCookies: ORIGIN.startsWith('https://') }
});

export function assertAuthConfigured() {
	if (
		!adminEmail ||
		!adminUsername ||
		!adminPassword ||
		authSecret.length < 32 ||
		!BETTER_AUTH_SECRET
	) {
		throw new Error(
			'Configure ADMIN_EMAIL, ADMIN_USERNAME, ADMIN_PASSWORD and a BETTER_AUTH_SECRET of at least 32 characters'
		);
	}
}

/** Create the configured account once. Public registration is disabled above. */
export async function initializeAdmin() {
	assertAuthConfigured();
	if (db.select().from(user).where(eq(user.email, adminEmail)).get()) return;
	try {
		await auth.api.signUpEmail({
			body: { name: 'Admin', email: adminEmail, password: adminPassword }
		});
	} catch (cause) {
		if (!db.select().from(user).where(eq(user.email, adminEmail)).get()) throw cause;
	}
}
