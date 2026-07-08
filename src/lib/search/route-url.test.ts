import { describe, expect, it } from 'vitest';
import { routeUrl } from './route-url.js';

// One implementation serves both SearchDialog navigation and the postbuild
// verify-search-index gate; these cases pin the contract they share.
describe('routeUrl', () => {
	it('strips the pagefind .html suffix to the clean prerendered route', () => {
		expect(routeUrl('/algorithms/arrays/two_sum.html')).toBe('/algorithms/arrays/two_sum');
	});
	it('preserves hash and query tails', () => {
		expect(routeUrl('/reference/big-o-complexity.html#tables')).toBe('/reference/big-o-complexity#tables');
		expect(routeUrl('/guide/getting-started.html?q=x')).toBe('/guide/getting-started?q=x');
	});
	it('passes the suffix-less home URL through untouched', () => {
		expect(routeUrl('/')).toBe('/');
	});
	it('does not touch .html mid-path', () => {
		expect(routeUrl('/a.html.bak')).toBe('/a.html.bak');
	});
});
