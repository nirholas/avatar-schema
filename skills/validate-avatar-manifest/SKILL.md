---
name: validate-avatar-manifest
description: Validate or write a three.ws on-chain avatar manifest (avatar.v1 JSON Schema) with @three-ws/avatar-schema. Use when a manifest fails validation, or when authoring one by hand or in code.
---

# Validate an avatar manifest

`@three-ws/avatar-schema` (Node 18+) bundles `avatar.v1.json` and an Ajv 2020 validator with `ajv-formats`.

Install: `npm install @three-ws/avatar-schema`

## API

- `validate(manifest)` returns `{ valid: true }` or `{ valid: false, errors }` (Ajv `ErrorObject[]`, each with `instancePath` and `message`). Does not throw.
- `assertValid(manifest)` throws an `Error` with a joined message on the first invalid manifest.
- `schema` is the parsed schema object. `SCHEMA_VERSION` is `1`. `SCHEMA_ID` is `https://three.ws/schema/avatar.v1.json`.
- Subpaths `@three-ws/avatar-schema/schema` and `/schema/v1` expose the raw JSON file, for any other validator (`with { type: 'json' }` import attribute, or `require`).

## Fields

Required: `schemaVersion` (always `1`), `id` (CAIP-10 account id or an ENS-style `*.eth`, `*.ws`, `*.sol` name), `name`, `mesh` (`{uri, sha256, format, kBytes?}` with format `glb`, `gltf` or `vrm`), `skeleton` (`avaturn`, `mixamo`, `rpm`, `vrm-humanoid`, `custom`), `owner` (`{chain, address}`, chain is a CAIP-2 id), `createdAt` (ISO 8601 UTC).

Optional: `animations` (`{uri, sha256}`), `accessories` (array of `{slot, uri, sha256}`, slots `head`, `eyes`, `ears`, `neck`, `torso`, `back`, `hands`, `waist`, `feet`), `traits` (flat string, number or boolean values), `creator` (`{chain, address}`), `signature` (`{algorithm, value, signer}`, algorithm `eip-712`, `ed25519` or `secp256k1`).

Every binary asset is a URI plus SHA-256 so clients can verify the bytes.

## Worked example

```js
import { readFile } from 'node:fs/promises';
import { validate } from '@three-ws/avatar-schema';

const manifest = JSON.parse(await readFile('./manifest.json', 'utf8'));
const result = validate(manifest);
if (!result.valid) for (const e of result.errors) console.error(e.instancePath, e.message);
```

To fix a failing manifest: read each error's `instancePath`, correct that field against the table above, and revalidate until `valid` is true. `examples/basic.json` in the repo is a fully populated reference. To generate a manifest from a mesh file, use the `three-ws-avatar init` CLI from `@three-ws/avatar-cli`.
