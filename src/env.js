import { defineEnvVars } from '@sveltejs/kit/env';

export const variables = defineEnvVars({
	DATABASE_URL: {
		description: 'Path to the SQLite database file.',
		schema: (value) => value ?? 'local.db'
	},
	ORIGIN: {
		description: 'Public origin used by the Node adapter behind a reverse proxy.',
		schema: (value) => value ?? 'http://localhost:3024'
	}
});
