import bookletJson from '$content/.booklet.json';

export interface BookletAsset {
	name: string;
	size: number;
	digest: `sha256:${string}`;
	downloadUrl: string;
	localUrl: string;
}

export interface BookletMetadata {
	sourceRepo: string;
	tagName: string;
	publishedAt: string;
	releaseUrl: string;
	asset: BookletAsset;
}

/**
 * Build-generated metadata for the exact booklet copied into `static/`.
 * `just sync-content` writes and verifies both files before SvelteKit runs.
 */
export const bookletMetadata = bookletJson as BookletMetadata;
