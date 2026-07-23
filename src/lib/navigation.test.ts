import { describe, expect, it } from 'vitest';
import { PRIMARY_NAV_LINKS, PROJECT_ROUTE, SOURCE_OF_TRUTH_ROUTE, primaryNavState } from './navigation';

function link(label: string) {
	const found = PRIMARY_NAV_LINKS.find((entry) => entry.label === label);
	if (!found) throw new Error(`missing primary navigation link: ${label}`);
	return found;
}

describe('primary navigation', () => {
	it('keeps the four informational links beside the separate Start action', () => {
		expect(PRIMARY_NAV_LINKS.map((entry) => entry.label)).toEqual(['Practice', 'Library', 'Method', 'Project']);
		expect(link('Project').href).toBe(PROJECT_ROUTE);
	});

	it('marks Project without also marking Method', () => {
		expect(primaryNavState(PROJECT_ROUTE, link('Project'))).toBe('page');
		expect(primaryNavState(PROJECT_ROUTE, link('Method'))).toBeUndefined();
	});

	it('keeps other guide pages under Method', () => {
		expect(primaryNavState('/guide/getting-started', link('Method'))).toBe('page');
		expect(primaryNavState('/guide/local-practice', link('Method'))).toBe('location');
		expect(primaryNavState('/reference/common-patterns', link('Library'))).toBe('location');
	});

	it('excludes the source-of-truth contract page from Method, and it is not the Project route', () => {
		expect(SOURCE_OF_TRUTH_ROUTE).not.toBe(PROJECT_ROUTE);
		expect(primaryNavState(SOURCE_OF_TRUTH_ROUTE, link('Method'))).toBeUndefined();
		expect(primaryNavState(SOURCE_OF_TRUTH_ROUTE, link('Project'))).toBeUndefined();
	});
});
