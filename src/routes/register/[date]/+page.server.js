import { error, fail } from '@sveltejs/kit';
import { siteConfig } from '#lib/config/site.js';
import { registrationInputFromFormData, registrationSchema } from '#lib/schemas/registration.js';
import { db } from '#lib/server/db/index.js';
import { registration } from '#lib/server/db/schema.js';
import { isAdventDate, isEligibleAdventDate } from '#lib/server/registrations/date-rules.js';
import { isInsideMunicipality } from '#lib/server/registrations/geography.js';
import { isDateReserved } from '#lib/server/registrations/queries.js';
import rulesMarkdown from '#lib/content/rules.md?raw';
import { marked } from 'marked';

export async function load({ params }) {
	if (!isAdventDate(params.date, siteConfig.adventYear)) {
		throw error(404, 'Cette date ne fait pas partie du calendrier.');
	}

	const reserved = isDateReserved(params.date);
	const eligible = isEligibleAdventDate(params.date, siteConfig.adventYear);

	return {
		date: params.date,
		available: !reserved && eligible,
		unavailableMessage: reserved
			? 'Cette date est déjà réservée.'
			: !eligible
				? 'La date est passée, les inscriptions sont closes.'
				: null,
		rulesHtml: await marked.parse(rulesMarkdown),
		rulesVersion: siteConfig.rulesVersion
	};
}

export const actions = {
	default: async ({ params, request }) => {
		const { date } = params;
		if (!isAdventDate(date, siteConfig.adventYear)) {
			return fail(400, {
				success: false,
				message: 'Cette date ne fait pas partie du calendrier.',
				errors: []
			});
		}
		if (!isEligibleAdventDate(date, siteConfig.adventYear)) {
			return fail(400, {
				success: false,
				message: 'Les inscriptions pour cette date sont closes.',
				errors: []
			});
		}
		if (isDateReserved(date)) {
			return fail(409, {
				success: false,
				message: 'Cette date vient d’être réservée. Choisissez une autre date.',
				errors: []
			});
		}

		const formData = await request.formData();
		const parsed = registrationSchema.safeParse(registrationInputFromFormData(formData));
		if (!parsed.success) {
			return fail(400, {
				success: false,
				message: 'Vérifiez les champs du formulaire.',
				errors: parsed.error.issues.map((issue) => issue.message)
			});
		}

		const values = parsed.data;
		if (!isInsideMunicipality(values.longitude, values.latitude)) {
			return fail(400, {
				success: false,
				message: 'Le point GPS doit se trouver dans la commune de Grenoble.',
				errors: []
			});
		}

		try {
			db.insert(registration)
				.values({
					date,
					name: values.name,
					email: values.email || null,
					phone: values.phone || null,
					description: values.description,
					address: values.address,
					latitude: values.latitude,
					longitude: values.longitude,
					status: 'confirmed',
					rulesAcceptedAt: new Date().toISOString(),
					rulesVersion: siteConfig.rulesVersion
				})
				.run();
		} catch (cause) {
			if (
				cause &&
				typeof cause === 'object' &&
				'code' in cause &&
				cause.code === 'SQLITE_CONSTRAINT_UNIQUE'
			) {
				return fail(409, {
					success: false,
					message: 'Cette date vient d’être réservée. Choisissez une autre date.',
					errors: []
				});
			}
			throw cause;
		}

		return {
			success: true,
			message: null,
			errors: [],
			confirmation: {
				date,
				name: values.name,
				description: values.description,
				address: values.address
			}
		};
	}
};
