import privacyMarkdown from '#lib/content/privacy.md?raw';
import { siteConfig } from '#lib/config/site.js';

export function load() {
	return { privacyMarkdown, privacyVersion: siteConfig.privacyVersion };
}
