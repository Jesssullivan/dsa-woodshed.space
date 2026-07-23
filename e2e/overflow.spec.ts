import { expect, test } from '@playwright/test';

// Static scaffold regression guard: no document-level horizontal overflow at
// canonical breakpoints, and every same-page hash link on the home route
// resolves to an actual element.

const breakpoints = [
	{ label: 'mobile-min', width: 320, height: 1200 },
	{ label: 'mobile-small', width: 390, height: 1200 },
	{ label: 'mobile-large', width: 430, height: 1200 },
	{ label: 'tablet', width: 768, height: 1200 },
	{ label: 'desktop', width: 1440, height: 1200 },
];

// Content routes gained the IA nav shell (persistent sidebar at `lg`, a
// per-page TOC rail at `xl`). Check them at the same breakpoints so a future
// layout change here gets the same overflow guard the home page has.
const routes = [
	'/',
	'/library',
	'/challenges',
	'/practice',
	'/printables',
	'/reference',
	'/reference/algorithm-templates',
	'/guide/interview-practice-evidence',
	// pymdownx-heavy raw-lane pages: stacked content tabs, admonitions, and
	// indented tables are the widest constructs the renderer emits.
	'/guide/getting-started',
	'/guide/learning-paths',
	'/guide/source-of-truth',
	'/guide/when-to-use-what',
];

for (const bp of breakpoints) {
	for (const route of routes) {
		test(`${route} has no document overflow at ${bp.label} (${bp.width}px)`, async ({ page }) => {
			await page.setViewportSize({ width: bp.width, height: bp.height });
			await page.goto(route);
			await page.waitForLoadState('networkidle');
			const { scrollWidth, innerWidth } = await page.evaluate(() => ({
				scrollWidth: document.documentElement.scrollWidth,
				innerWidth: window.innerWidth,
			}));
			// Tolerate up to 1px subpixel rounding; anything beyond means real overflow.
			expect(scrollWidth, `${route} ${bp.label} document overflow`).toBeLessThanOrEqual(innerWidth + 1);
		});
	}
}

test('home-route same-page hash links all resolve to an element', async ({ page }) => {
	await page.goto('/');
	await page.waitForLoadState('networkidle');
	const broken = await page.evaluate(() => {
		const hashes = Array.from(document.querySelectorAll<HTMLAnchorElement>('a[href]'))
			.map((a) => a.getAttribute('href') ?? '')
			.filter((h) => h.startsWith('/#') || h.startsWith('#'))
			.map((h) => (h.startsWith('/#') ? h.slice(1) : h));
		const unique = Array.from(new Set(hashes));
		return unique.filter((h) => h.length > 1 && !document.querySelector(h));
	});
	expect(broken, 'home-route hash targets without matching element').toEqual([]);
});

test('minimum-width navigation control remains visible', async ({ page }) => {
	await page.setViewportSize({ width: 320, height: 1200 });
	await page.goto('/');
	await expect(page.getByRole('button', { name: 'Open navigation' })).toBeInViewport();
});

test('Project is current without also marking Method', async ({ page }) => {
	await page.setViewportSize({ width: 1440, height: 1200 });
	await page.goto('/guide/source-of-truth');
	const navigation = page.getByRole('navigation', { name: 'Section navigation' });
	await expect(navigation.getByRole('link', { name: 'Project' })).toHaveAttribute('aria-current', 'page');
	await expect(navigation.getByRole('link', { name: 'Method' })).not.toHaveAttribute('aria-current');
	await expect(page.getByRole('complementary', { name: 'Site sections' })).toHaveCount(0);
	await expect(page.getByRole('navigation', { name: 'Breadcrumb' })).toContainText('Project');
	await expect(page.getByRole('navigation', { name: 'Breadcrumb' })).not.toContainText('Guide');
	await expect(page.getByRole('navigation', { name: 'Section pages' })).toHaveCount(0);
});

test('home defaults to ordinary comments and keeps Printables easy to reach', async ({ page }) => {
	await page.goto('/');
	const defaultComments = page.getByRole('region', { name: 'Start with ordinary comments' });
	await expect(defaultComments).toBeVisible();
	await expect(defaultComments).toContainText(/There are no\s+required prefixes or labels/);
	await expect(defaultComments).toContainText('/reacto');
	await expect(defaultComments).toContainText('optional labels');
	await expect(
		page.getByRole('navigation', { name: 'Library shortcuts' }).getByRole('link', { name: 'Printables' }),
	).toBeVisible();
});

test('practice-table code tokens wrap within their cells at minimum width', async ({ page }) => {
	await page.setViewportSize({ width: 320, height: 1200 });
	await page.goto('/challenges');
	const clipped = await page.locator('table code').evaluateAll((tokens) =>
		tokens
			.filter((token) => {
				const cell = token.closest('td');
				if (!cell) return false;
				const cellRect = cell.getBoundingClientRect();
				return Array.from(token.getClientRects()).some(
					(rect) => rect.left < cellRect.left - 1 || rect.right > cellRect.right + 1,
				);
			})
			.map((token) => token.textContent),
	);
	expect(clipped).toEqual([]);
});

test('reading-path utility links retain 44px targets', async ({ page }) => {
	await page.setViewportSize({ width: 390, height: 1200 });
	await page.goto('/guide/source-of-truth');
	const undersized = await page
		.locator('nav[aria-label="Breadcrumb"] a, [data-pagefind-ignore] a[title], footer a')
		.evaluateAll((links) =>
			links
				.filter((link) => {
					const rect = link.getBoundingClientRect();
					return rect.width > 0 && rect.height < 44;
				})
				.map((link) => ({ text: link.textContent?.trim(), height: link.getBoundingClientRect().height })),
		);
	expect(undersized).toEqual([]);
});
