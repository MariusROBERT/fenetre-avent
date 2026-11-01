import assert from 'node:assert/strict';
import test from 'node:test';
import { registrationSchema } from '../src/lib/schemas/registration.js';

const validRegistration = {
	name: 'Famille Martin',
	email: '',
	phone: '06 00 00 00 00',
	description: 'Une fenêtre décorée pour Noël.',
	address: '1 place de la Mairie',
	latitude: '45.2571',
	longitude: '5.9874',
	rulesAccepted: true
};

test('registration accepts either contact method and parses coordinates', () => {
	const result = registrationSchema.safeParse(validRegistration);
	assert.equal(result.success, true);
	if (result.success) {
		assert.equal(result.data.latitude, 45.2571);
		assert.equal(result.data.longitude, 5.9874);
	}

	assert.equal(
		registrationSchema.safeParse({ ...validRegistration, phone: '', email: 'a@example.fr' })
			.success,
		true
	);
});

test('registration requires a valid contact, accepted rules, and in-range coordinates', () => {
	assert.equal(registrationSchema.safeParse({ ...validRegistration, phone: '' }).success, false);
	assert.equal(
		registrationSchema.safeParse({ ...validRegistration, rulesAccepted: false }).success,
		false
	);
	assert.equal(
		registrationSchema.safeParse({ ...validRegistration, email: 'invalid' }).success,
		false
	);
	assert.equal(registrationSchema.safeParse({ ...validRegistration, latitude: '' }).success, false);
	assert.equal(
		registrationSchema.safeParse({ ...validRegistration, longitude: '181' }).success,
		false
	);
});
