import { defineEnvVars } from '@sveltejs/kit/env';

export const variables = defineEnvVars({
	DATABASE_URL: {
		description: 'Path to the SQLite database file.',
		schema: (value) => value ?? 'local.db'
	},
	ORIGIN: {
		description: 'Public origin used by the Node adapter behind a reverse proxy.',
		schema: (value) => value ?? 'http://localhost:3024'
	},
	BETTER_AUTH_SECRET: {
		description: 'Secret used to sign Better Auth sessions (at least 32 characters).',
		schema: (value) => value
	},
	ADMIN_EMAIL: {
		description: 'Email address of the single administrator.',
		schema: (value) => value
	},
	ADMIN_USERNAME: {
		description: 'Login name of the single administrator.',
		schema: (value) => value
	},
	ADMIN_PASSWORD: {
		description: 'Password for the administrator account.',
		schema: (value) => value
	}
});
