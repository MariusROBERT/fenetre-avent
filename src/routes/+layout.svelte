<script>
	import './layout.css';
	import 'maplibre-gl/dist/maplibre-gl.css';
	import favicon from '../../icon.png';
	import { siteConfig } from '#lib/config/site.js';

	/** @type {{children: import('svelte').Snippet}} */
	let { children } = $props();
</script>

<svelte:head>
	<title>{siteConfig.name}</title>
	<link rel="icon" href={favicon} type="image/png" />
</svelte:head>

{@render children()}
