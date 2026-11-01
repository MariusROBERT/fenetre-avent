<script>
	/** @type {{content: string}} */
	let { content } = $props();
	// content is generated from the checked-in rules Markdown, never participant input.
</script>

<!-- eslint-disable-next-line svelte/no-at-html-tags -->
{@html content}
