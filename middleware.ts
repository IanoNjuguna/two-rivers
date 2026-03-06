import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

export default createMiddleware(routing);

export const config = {
	// Match only internationalized pathnames
	matcher: ['/', '/(en|sw|fr|es|pt|zh|ja|ko|th|vi|ru|he|ar|uk)/:path*', '/((?!api|_next|_vercel|.*\\..*).*)']
};
