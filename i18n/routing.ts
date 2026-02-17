import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
	locales: ['en', 'sw', 'fr', 'es', 'pt', 'zh', 'ja', 'ko', 'th', 'vi', 'ru', 'he', 'ar', 'uk'],
	defaultLocale: 'en',
});

export type Locale = (typeof routing.locales)[number];
