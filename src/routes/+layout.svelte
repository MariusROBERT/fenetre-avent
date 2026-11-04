<script>
	import './layout.css';
	import 'maplibre-gl/dist/maplibre-gl.css';
	import { siteConfig } from '#lib/config/site.js';

	/** @type {{children: import('svelte').Snippet}} */
	let { children } = $props();
</script>

<svelte:head>
	<title>{siteConfig.name}</title>
	<meta name="robots" content="noindex, nofollow, noarchive" />
	<link rel="icon" href="/favicon.png" type="image/png" />
</svelte:head>

{@render children()}
