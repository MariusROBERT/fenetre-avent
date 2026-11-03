import { z } from 'zod';

const optionalEmail = z.union([
	z.literal(''),
	z.email('Saisissez une adresse e-mail valide.').trim()
]);
const optionalPhone = z.union([
	z.literal(''),
	z
		.string()
		.trim()
		.regex(/^\+?[0-9\s().-]{6,20}$/, 'Saisissez un numéro de téléphone valide.')
]);
/** @param {number} min
 * @param {number} max
 */
const coordinate = (min, max) =>
	z
		.string()
		.trim()
		.min(1, 'Cette coordonnée est obligatoire.')
		.transform(Number)
		.pipe(
			z
				.number()
				.finite('Saisissez une coordonnée valide.')
				.min(min, 'La coordonnée est hors limites.')
				.max(max, 'La coordonnée est hors limites.')
		);

export const registrationSchema = z
	.object({
		name: z
			.string()
			.trim()
			.min(2, 'Le nom doit comporter au moins 2 caractères.')
			.max(100, 'Le nom ne peut pas dépasser 100 caractères.'),
		email: optionalEmail,
		phone: optionalPhone,
		description: z
			.string()
			.trim()
			.min(5, 'La description doit comporter au moins 5 caractères.')
			.max(1000, 'La description ne peut pas dépasser 1 000 caractères.'),
		address: z.string().trim().min(1, 'L\'adresse est obligatoire.'),
		latitude: coordinate(-90, 90),
		longitude: coordinate(-180, 180),
		rulesAccepted: z.boolean().refine(Boolean, 'Vous devez accepter le règlement.'),
		privacyAccepted: z
			.boolean()
			.refine(Boolean, 'Vous devez accepter la politique de confidentialité.')
	})
	.refine((data) => data.email.length > 0 || data.phone.length > 0, {
		path: ['email'],
		message: 'Indiquez au moins un moyen de contact.'
	});

/** @param {FormData} formData */
export function registrationInputFromFormData(formData) {
	return {
		name: formData.get('name'),
		email: formData.get('email') ?? '',
		phone: formData.get('phone') ?? '',
		description: formData.get('description'),
		address: formData.get('address'),
		latitude: formData.get('latitude'),
		longitude: formData.get('longitude'),
		rulesAccepted: formData.get('rulesAccepted') === 'on',
		privacyAccepted: formData.get('privacyAccepted') === 'on'
	};
}
