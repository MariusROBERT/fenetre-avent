import rulesMarkdown from '#lib/content/rules.md?raw';
import { siteConfig } from '#lib/config/site.js';

export async function load() {
	return {
		rulesMarkdown,
		rulesVersion: siteConfig.rulesVersion
	};
}
