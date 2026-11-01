import assert from 'node:assert/strict';
import test from 'node:test';
import { isInsideMunicipality } from '../src/lib/server/registrations/geography.js';

test('municipality validation accepts its center and boundary, and rejects outside points', () => {
	assert.equal(isInsideMunicipality(5.9874, 45.2571), true);
	assert.equal(isInsideMunicipality(5.950871, 45.269471), true);
	assert.equal(isInsideMunicipality(0, 0), false);
	assert.equal(isInsideMunicipality(Number.NaN, 45), false);
});
