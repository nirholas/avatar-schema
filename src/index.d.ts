import type { ErrorObject } from 'ajv';

export type MeshFormat = 'glb' | 'gltf' | 'vrm';
export type SkeletonKind = 'avaturn' | 'mixamo' | 'rpm' | 'vrm-humanoid' | 'custom';
export type AccessorySlot =
	| 'head'
	| 'eyes'
	| 'ears'
	| 'neck'
	| 'torso'
	| 'back'
	| 'hands'
	| 'waist'
	| 'feet';
export type SignatureAlgorithm = 'eip-712' | 'ed25519' | 'secp256k1';

export interface MeshRef {
	uri: string;
	sha256: string;
	format: MeshFormat;
	kBytes?: number;
}

export interface AnimationsRef {
	uri: string;
	sha256: string;
}

export interface AccessoryRef {
	slot: AccessorySlot;
	uri: string;
	sha256: string;
}

export interface ChainAccount {
	/** CAIP-2 chain id, e.g. "eip155:1" or "solana:mainnet-beta". */
	chain: string;
	address: string;
}

export interface Signature {
	algorithm: SignatureAlgorithm;
	/** Hex-encoded with leading 0x. */
	value: string;
	signer: string;
}

export interface AvatarManifestV1 {
	schemaVersion: 1;
	/** CAIP-10 account id or a *.eth / *.ws / *.sol name. */
	id: string;
	name: string;
	mesh: MeshRef;
	skeleton: SkeletonKind;
	animations?: AnimationsRef;
	accessories?: AccessoryRef[];
	traits?: Record<string, string | number | boolean>;
	owner: ChainAccount;
	creator?: ChainAccount;
	/** ISO 8601 UTC timestamp. */
	createdAt: string;
	signature?: Signature;
}

export type ValidationResult =
	| { valid: true }
	| { valid: false; errors: ErrorObject[] };

export declare const schema: object;
export declare const SCHEMA_VERSION: 1;
export declare const SCHEMA_ID: 'https://three.ws/schema/avatar.v1.json';

export declare function validate(manifest: unknown): ValidationResult;
export declare function assertValid(manifest: unknown): asserts manifest is AvatarManifestV1;
