import Ajv from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));

export const schema = JSON.parse(
	readFileSync(resolve(__dirname, '../schema/avatar.v1.json'), 'utf8'),
);

const ajv = new Ajv({ allErrors: true, strict: true });
addFormats(ajv);
const compiled = ajv.compile(schema);

/**
 * Validate an avatar manifest against avatar.v1.json.
 *
 * @param {unknown} manifest - parsed JSON object to check.
 * @returns {{ valid: true } | { valid: false, errors: import('ajv').ErrorObject[] }}
 */
export function validate(manifest) {
	const ok = compiled(manifest);
	if (ok) return { valid: true };
	return { valid: false, errors: compiled.errors ?? [] };
}

/**
 * Throw on invalid manifest. Useful in pipelines that want to fail fast.
 *
 * @param {unknown} manifest
 * @returns {void}
 */
export function assertValid(manifest) {
	const result = validate(manifest);
	if (result.valid) return;
	const summary = result.errors
		.map((e) => `${e.instancePath || '/'} ${e.message}`)
		.join('; ');
	throw new Error(`Invalid avatar manifest: ${summary}`);
}

export const SCHEMA_VERSION = 1;
export const SCHEMA_ID = 'https://three.ws/schema/avatar.v1.json';
