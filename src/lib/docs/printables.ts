const FULL_BOOKLET_HEADING = /^## Full booklet\s*$/m;
const REFERENCE_SHEETS_HEADING = /^## Reference sheets\s*$/m;

export interface PrintableMarkdownParts {
	beforeReader: string;
	afterReader: string;
}

/**
 * Replace the packet's download-only "Full booklet" section with the
 * route-native reader while keeping the source-authored introduction,
 * reference-sheet table, and local-build instructions in their original order.
 */
export function splitPrintableMarkdown(raw: string): PrintableMarkdownParts {
	const fullBooklet = FULL_BOOKLET_HEADING.exec(raw);
	const referenceSheets = REFERENCE_SHEETS_HEADING.exec(raw);
	if (!fullBooklet || !referenceSheets || referenceSheets.index <= fullBooklet.index) {
		throw new Error(
			'printables: expected "## Full booklet" before "## Reference sheets"; update the route split with the packet source',
		);
	}

	return {
		beforeReader: raw.slice(0, fullBooklet.index).trimEnd() + '\n',
		afterReader: raw.slice(referenceSheets.index).trimStart(),
	};
}
