<script lang="ts">
	// Vendored, first-party ambient background. Adapted from the operator's
	// own animated-blob background package: a handful of organically
	// wobbling blob shapes, colored from the active theme and drifting
	// gently with scroll. Reimplemented from scratch here — no worker, no
	// device-motion / pointer physics, no external runtime dependency — so
	// the effect stays a quiet, load-bearing texture behind the reading
	// surface rather than a focal element.
	//
	// Palette is read at runtime from the theme's own CSS custom properties
	// (getComputedStyle), so a theme or color-mode switch cascades into the
	// blob colors without this component knowing anything about theme names.
	// A MutationObserver watches the attributes the theme store flips
	// (data-mode / data-theme on <html>) and re-reads the palette when they
	// change. Fully client-only: everything here is skipped during SSR, and
	// prefers-reduced-motion disables the effect entirely (no static frame
	// either — nothing is rendered).
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';

	const BLOB_COUNT = 5;
	const PALETTE_VARS = [
		'--color-primary-500',
		'--color-secondary-500',
		'--color-tertiary-500',
		'--color-surface-400',
		'--color-surface-600',
	] as const;
	// Muted neutrals; only used if the theme vars above aren't resolvable yet
	// (e.g. a render before the stylesheet has applied).
	const FALLBACK_PALETTE = ['#a8785a', '#6b8a94', '#8a6b94', '#8a8378', '#5a544a'];

	interface BlobShape {
		/** Position in a 0-100 viewBox, allowed to run slightly off-canvas. */
		x: number;
		y: number;
		vx: number;
		vy: number;
		/** Base radius, same 0-100 units as position. */
		size: number;
		/** Wobble phase for the organic outline. */
		phase: number;
		phaseSpeed: number;
		color: string;
	}

	function readPalette(): string[] {
		if (!browser) return FALLBACK_PALETTE;
		const styles = getComputedStyle(document.documentElement);
		const values = PALETTE_VARS.map((name) => styles.getPropertyValue(name).trim());
		return values.every((value) => value.length > 0) ? values : FALLBACK_PALETTE;
	}

	function seedBlobs(palette: string[]): BlobShape[] {
		const seeded: BlobShape[] = [];
		for (let i = 0; i < BLOB_COUNT; i++) {
			seeded.push({
				x: 10 + Math.random() * 80,
				y: 10 + Math.random() * 80,
				vx: (Math.random() - 0.5) * 1.4,
				vy: (Math.random() - 0.5) * 1.4,
				size: 16 + Math.random() * 12,
				phase: Math.random() * Math.PI * 2,
				phaseSpeed: 0.12 + Math.random() * 0.14,
				color: palette[i % palette.length] ?? FALLBACK_PALETTE[i % FALLBACK_PALETTE.length],
			});
		}
		return seeded;
	}

	// Organic blob outline: an 8-point radial polygon with a sinusoidal
	// radius wobble, closed into a smooth path with cubic-bezier control
	// points between each vertex.
	function blobPath(blob: BlobShape): string {
		const sides = 8;
		const points: { x: number; y: number }[] = [];
		for (let i = 0; i < sides; i++) {
			const angle = (i / sides) * Math.PI * 2;
			const wobble = 1 + 0.12 * Math.sin(angle * 2 + blob.phase);
			points.push({
				x: blob.x + Math.cos(angle) * blob.size * wobble,
				y: blob.y + Math.sin(angle) * blob.size * wobble,
			});
		}

		const smoothing = 0.15;
		let d = `M ${points[0].x.toFixed(2)},${points[0].y.toFixed(2)}`;
		for (let i = 0; i < sides; i++) {
			const curr = points[i];
			const next = points[(i + 1) % sides];
			const after = points[(i + 2) % sides];
			const cp1x = curr.x + (next.x - curr.x) * smoothing;
			const cp1y = curr.y + (next.y - curr.y) * smoothing;
			const cp2x = next.x - (after.x - curr.x) * (smoothing * 0.3);
			const cp2y = next.y - (after.y - curr.y) * (smoothing * 0.3);
			d += ` C ${cp1x.toFixed(2)},${cp1y.toFixed(2)} ${cp2x.toFixed(2)},${cp2y.toFixed(2)} ${next.x.toFixed(2)},${next.y.toFixed(2)}`;
		}
		return `${d} Z`;
	}

	let blobs = $state<BlobShape[]>([]);
	let reduceMotion = $state(true);
	let ready = $state(false);
	const paths = $derived.by(() => blobs.map((blob) => blobPath(blob)));

	let frame: number | undefined;
	let lastTime = 0;
	let lastScrollY = 0;
	let scrollNudge = 0;

	function tick(time: number) {
		const dt = Math.min((time - lastTime) / 1000, 0.05);
		lastTime = time;

		// Scroll-coupled drift: a nudge picked up in handleScroll decays back
		// to zero each frame, so the field eases along with reading motion
		// instead of snapping to it.
		scrollNudge *= 0.94;

		blobs = blobs.map((blob) => {
			let x = blob.x + blob.vx * dt * 6;
			let y = blob.y + (blob.vy + scrollNudge) * dt * 6;
			// Wrap around a slightly oversized field so a blob re-enters from
			// the opposite edge instead of popping back into view.
			if (x < -20) x = 120;
			if (x > 120) x = -20;
			if (y < -20) y = 120;
			if (y > 120) y = -20;
			return { ...blob, x, y, phase: blob.phase + blob.phaseSpeed * dt };
		});

		frame = requestAnimationFrame(tick);
	}

	function handleScroll() {
		const currentY = window.scrollY;
		const delta = currentY - lastScrollY;
		lastScrollY = currentY;
		scrollNudge = Math.max(-4, Math.min(4, scrollNudge + delta * 0.02));
	}

	function startAnimation() {
		if (frame !== undefined) return;
		lastTime = performance.now();
		frame = requestAnimationFrame(tick);
	}

	function stopAnimation() {
		if (frame !== undefined) cancelAnimationFrame(frame);
		frame = undefined;
	}

	onMount(() => {
		if (!browser) return;

		const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
		reduceMotion = motionQuery.matches;
		lastScrollY = window.scrollY;
		blobs = seedBlobs(readPalette());
		ready = true;

		const onMotionPreferenceChange = (event: MediaQueryListEvent) => {
			reduceMotion = event.matches;
			if (reduceMotion) stopAnimation();
			else startAnimation();
		};
		motionQuery.addEventListener('change', onMotionPreferenceChange);

		// Re-read the palette whenever the theme store flips data-mode or
		// data-theme on <html>, so a light/dark or theme switch cascades into
		// the blob colors without a reload.
		const paletteObserver = new MutationObserver(() => {
			const palette = readPalette();
			blobs = blobs.map((blob, i) => ({ ...blob, color: palette[i % palette.length] ?? blob.color }));
		});
		paletteObserver.observe(document.documentElement, {
			attributes: true,
			attributeFilter: ['data-mode', 'data-theme'],
		});

		window.addEventListener('scroll', handleScroll, { passive: true });
		if (!reduceMotion) startAnimation();

		return () => {
			motionQuery.removeEventListener('change', onMotionPreferenceChange);
			paletteObserver.disconnect();
			window.removeEventListener('scroll', handleScroll);
			stopAnimation();
		};
	});
</script>

{#if browser && ready && !reduceMotion}
	<div
		class="pointer-events-none fixed inset-0 -z-10 opacity-10"
		aria-hidden="true"
		role="presentation"
		data-testid="vector-blobs-bg"
	>
		<svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice" class="h-full w-full">
			{#each blobs as blob, i (i)}
				<path d={paths[i]} fill={blob.color} />
			{/each}
		</svg>
	</div>
{/if}
