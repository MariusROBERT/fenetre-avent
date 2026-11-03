<script>
	import { resolve } from '$app/paths';
	import { SvelteMarkdownEditor } from '@michaelcuneo/markdown-editor';
	import '@michaelcuneo/markdown-editor/styles.css';
	/** @type {{data: import('./$types').PageData}} */
	let { data } = $props();
</script>

<svelte:head><title>Confidentialité et mentions légales — Fenêtres de l'Avent</title></svelte:head>

<main class="mx-auto max-w-3xl px-4 py-10 sm:px-6">
	<a
		class="text-sm text-[#D6B56E] underline underline-offset-4 hover:text-[#FFF4DB]"
		href={resolve('/')}>Retour au calendrier</a
	>
	<article class="privacy mt-8">
		<SvelteMarkdownEditor markdown={data.privacyMarkdown} editable={false} bare />
	</article>
	<p class="mt-8 text-sm text-[#DAE8D8]">Version de la politique : {data.privacyVersion}</p>
</main>

<style>
	.privacy {
		--md-bg: transparent;
		--md-fg: #fff4db;
		--md-h1: #fff4db;
		--md-h2: #fff4db;
		--md-h3: #fff4db;
		--md-strong: #fff4db;
		--md-em: #d6b56e;
		--md-muted: #dae8d8;
		--md-code-bg: #102e27;
		--md-code-fg: #f2dfae;
		--md-blockquote-bg: #21483d;
		--md-blockquote-fg: #dae8d8;
		--md-blockquote-border: #d6b56e;
	}

	.privacy :global(h1) {
		font-size: 1.875rem;
		font-weight: 700;
		line-height: 1.2;
	}
	.privacy :global(h2) {
		margin-top: 1.75rem;
		font-size: 1.25rem;
		font-weight: 600;
	}
	.privacy :global(p) {
		margin-top: 0.75rem;
		line-height: 1.6;
	}
</style>
