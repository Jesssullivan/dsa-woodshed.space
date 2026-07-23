import { describe, expect, it } from 'vitest';
import { splitPrintableMarkdown } from './printables';

describe('splitPrintableMarkdown', () => {
	it('replaces only the download-only booklet section', () => {
		const raw = `# Printables

Intro.

## Full booklet

[Download](assets/booklet.pdf)

Booklet copy.

## Reference sheets

| Sheet |
|---|

## Build locally

\`just packet\`
`;

		const parts = splitPrintableMarkdown(raw);
		expect(parts.beforeReader).toContain('# Printables');
		expect(parts.beforeReader).toContain('Intro.');
		expect(parts.beforeReader).not.toContain('Full booklet');
		expect(parts.afterReader).toMatch(/^## Reference sheets/);
		expect(parts.afterReader).toContain('## Build locally');
		expect(`${parts.beforeReader}${parts.afterReader}`).not.toContain('assets/booklet.pdf');
	});

	it('fails closed when source headings drift', () => {
		expect(() => splitPrintableMarkdown('# Printables\n\n## Downloads\n')).toThrow(
			'expected "## Full booklet" before "## Reference sheets"',
		);
	});
});
