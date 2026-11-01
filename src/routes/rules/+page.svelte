<script>
	import { resolve } from '$app/paths';
	import RulesContent from '#lib/components/RulesContent.svelte';
	/** @type {{data: import('./$types').PageData}} */
	let { data } = $props();
</script>

<main class="mx-auto max-w-3xl px-4 py-10 sm:px-6">
	<a class="text-sm underline underline-offset-4" href={resolve('/')}>Retour au calendrier</a>
	<article class="rules mt-8">
		<RulesContent content={data.rulesHtml} />
	</article>
	<p class="mt-8 text-sm text-slate-500">Version du règlement : {data.rulesVersion}</p>
</main>

<style>
	.rules :global(h1) {
		font-size: 1.875rem;
		font-weight: 700;
		line-height: 1.2;
	}

	.rules :global(h2) {
		margin-top: 1.75rem;
		font-size: 1.25rem;
		font-weight: 600;
	}

	.rules :global(p) {
		margin-top: 0.75rem;
		line-height: 1.6;
	}
</style>
