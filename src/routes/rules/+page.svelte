<script>
	import { resolve } from '$app/paths';
	import { SvelteMarkdownEditor } from '@michaelcuneo/markdown-editor';
	import '@michaelcuneo/markdown-editor/styles.css';
	/** @type {{data: import('./$types').PageData}} */
	let { data } = $props();
</script>

<main class="mx-auto max-w-3xl px-4 py-10 sm:px-6">
	<a class="text-sm underline underline-offset-4" href={resolve('/')}>Retour au calendrier</a>
	<article class="rules mt-8">
		<SvelteMarkdownEditor markdown={data.rulesMarkdown} editable={false} bare />
	</article>
	<p class="mt-8 text-sm text-slate-500">Version du règlement : {data.rulesVersion}</p>
</main>

<style>
	.rules {
		--md-fg: #0f172a;
		--md-h1: #0f172a;
		--md-h2: #0f172a;
		--md-h3: #0f172a;
		--md-strong: #0f172a;
		--md-em: #166534;
		--md-muted: #475569;
	}

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
