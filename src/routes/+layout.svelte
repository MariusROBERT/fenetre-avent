<script>
	import './layout.css';
	import 'maplibre-gl/dist/maplibre-gl.css';
	import favicon from '#lib/assets/favicon.svg';
	import { siteConfig } from '#lib/config/site.js';

	/** @type {{children: import('svelte').Snippet}} */
	let { children } = $props();
</script>

<svelte:head>
	<title>{siteConfig.name}</title>
	<link rel="icon" href={favicon} />
</svelte:head>

{@render children()}
