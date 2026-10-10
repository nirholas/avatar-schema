import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { validate, assertValid, schema, SCHEMA_VERSION, SCHEMA_ID } from '../src/index.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const example = JSON.parse(
	readFileSync(resolve(__dirname, '../examples/basic.json'), 'utf8'),
);

test('schema exports are stable', () => {
	assert.equal(SCHEMA_VERSION, 1);
	assert.equal(SCHEMA_ID, 'https://three.ws/schema/avatar.v1.json');
	assert.equal(schema.$id, SCHEMA_ID);
});

test('valid example passes', () => {
	const result = validate(example);
	assert.equal(result.valid, true);
});

test('assertValid does not throw for valid example', () => {
	assert.doesNotThrow(() => assertValid(example));
});

test('missing required field fails', () => {
	const { mesh, ...broken } = example;
	const result = validate(broken);
	assert.equal(result.valid, false);
	assert.ok(result.errors.some((e) => e.message?.includes("'mesh'")));
});

test('wrong schemaVersion fails', () => {
	const broken = { ...example, schemaVersion: 2 };
	const result = validate(broken);
	assert.equal(result.valid, false);
});

test('non-hex sha256 fails', () => {
	const broken = { ...example, mesh: { ...example.mesh, sha256: 'NOT-HEX' } };
	const result = validate(broken);
	assert.equal(result.valid, false);
	assert.ok(result.errors.some((e) => e.instancePath.includes('sha256')));
});

test('invalid CAIP-2 chain fails', () => {
	const broken = { ...example, owner: { chain: 'NOT VALID', address: '0xabc' } };
	const result = validate(broken);
	assert.equal(result.valid, false);
});

test('ENS-style id accepted', () => {
	const result = validate({ ...example, id: 'alice.eth' });
	assert.equal(result.valid, true);
});

test('three.ws name id accepted', () => {
	const result = validate({ ...example, id: 'agent-007.ws' });
	assert.equal(result.valid, true);
});

test('CAIP-10 id accepted', () => {
	const result = validate({
		...example,
		id: 'eip155:1:0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
	});
	assert.equal(result.valid, true);
});

test('additional properties rejected', () => {
	const broken = { ...example, somethingUnknown: 'nope' };
	const result = validate(broken);
	assert.equal(result.valid, false);
});

test('assertValid throws with summary for invalid input', () => {
	assert.throws(
		() => assertValid({ schemaVersion: 1 }),
		(err) => err instanceof Error && err.message.startsWith('Invalid avatar manifest:'),
	);
});
