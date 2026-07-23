import { describe, expect, it } from 'vitest';
import { extractDescription, extractTitle, stripFrontmatter } from './sync-content.mjs';

describe('packet frontmatter metadata', () => {
	it('extracts quoted source-authored titles and descriptions', () => {
		const source = `---
title: "Getting Started"
description: 'Start in the editor, then reason, implement, and test.'
---

# Ignored heading
`;

		expect(extractTitle(source, 'fallback')).toBe('Getting Started');
		expect(extractDescription(source, 'docs/guide/getting-started.md')).toBe(
			'Start in the editor, then reason, implement, and test.',
		);
	});

	it('folds a concise YAML block into one plain-text summary', () => {
		const source = `---
title: Practice Drills
description: >-
  Choose a real problem, write reasoning comments,
  then prove the implementation with focused tests.
---
`;

		expect(extractDescription(source)).toBe(
			'Choose a real problem, write reasoning comments, then prove the implementation with focused tests.',
		);
	});

	it('leaves older frontmatter without a description on the compatibility path', () => {
		const source = `---
title: Legacy Page
---

# Legacy Page
`;

		expect(extractDescription(source)).toBeUndefined();
		expect(stripFrontmatter(source).body).toContain('# Legacy Page');
	});

	it('rejects summaries that are too long or contain markdown-only notation', () => {
		const tooLong = `---
description: ${'x'.repeat(181)}
---
`;
		const markdown = `---
description: Run \`just practice-next\` after saving.
---
`;

		expect(() => extractDescription(tooLong, 'docs/too-long.md')).toThrow('at or below 180');
		expect(() => extractDescription(markdown, 'docs/markdown.md')).toThrow('markdown backtick');
	});
});
