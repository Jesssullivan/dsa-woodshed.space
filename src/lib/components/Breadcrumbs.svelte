<script lang="ts">
	// House breadcrumb trail: every item but the last is a link; the last is the
	// current page (`aria-current="page"`, not a link).
	interface Crumb {
		label: string;
		href?: string;
	}
	interface Props {
		items: Crumb[];
	}
	let { items }: Props = $props();
</script>

<nav aria-label="Breadcrumb" class="text-surface-500 mb-6 text-sm">
	<ol class="flex flex-wrap items-center gap-1.5">
		{#each items as item, i (item.label)}
			<li class="flex items-center gap-1.5">
				{#if i > 0}<span aria-hidden="true" class="text-surface-400">/</span>{/if}
				{#if item.href}
					<a href={item.href} class="hover:text-primary-500 underline-offset-2 hover:underline">{item.label}</a>
				{:else}
					<span aria-current="page" class="text-surface-700-300 font-medium">{item.label}</span>
				{/if}
			</li>
		{/each}
	</ol>
</nav>
