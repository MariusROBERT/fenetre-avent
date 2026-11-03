import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { error, json } from '@sveltejs/kit';
import { ORIGIN } from '$app/env/private';
import { db } from '#lib/server/db/index.js';
import { registration } from '#lib/server/db/schema.js';
import { requireAdmin } from '#lib/server/admin.js';

const entrySchema = z
	.object({
		date: z.string().regex(/^\d{4}-12-(0[1-9]|1\d|2[0-4])$/),
		name: z.string().trim().min(2).max(100),
		email: z.union([z.literal(''), z.email()]),
		phone: z.string().trim().max(30),
		description: z.string().trim().min(5).max(1000),
		address: z.string().trim().min(1).max(500),
		latitude: z.number().finite().min(-90).max(90),
		longitude: z.number().finite().min(-180).max(180),
		status: z.enum(['pending', 'confirmed', 'cancelled'])
	})
	.refine((entry) => entry.email.length > 0 || entry.phone.length > 0, {
		message: 'At least one contact method is required'
	});

/** @param {import('@sveltejs/kit').RequestEvent} event */
async function authorize(event) {
	await requireAdmin(event);
	if (event.request.headers.get('origin') !== ORIGIN) error(403, 'Forbidden');
}

export async function PUT(event) {
	await authorize(event);
	const { id, ...input } = await event.request.json();
	if (typeof id !== 'string') error(400, 'Invalid entry');
	const parsed = entrySchema.safeParse(input);
	if (!parsed.success) error(400, 'Invalid entry');
	try {
		const result = db
			.update(registration)
			.set({ ...parsed.data, updatedAt: new Date().toISOString() })
			.where(eq(registration.id, id))
			.run();
		if (!result.changes) error(404, 'Entry not found');
	} catch (cause) {
		if (
			cause &&
			typeof cause === 'object' &&
			'code' in cause &&
			cause.code === 'SQLITE_CONSTRAINT_UNIQUE'
		)
			error(409, 'Date already reserved');
		throw cause;
	}
	return json({ success: true });
}

export async function DELETE(event) {
	await authorize(event);
	const { id } = await event.request.json();
	if (typeof id !== 'string') error(400, 'Invalid entry');
	const result = db.delete(registration).where(eq(registration.id, id)).run();
	if (!result.changes) error(404, 'Entry not found');
	return json({ success: true });
}
