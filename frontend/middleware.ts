import createMiddleware from 'next-intl/middleware';

export default createMiddleware({
  locales: ['hy', 'en', 'ru', 'fr', 'de', 'it', 'es', 'zh', 'hi', 'ar'],
  defaultLocale: 'hy',
  localePrefix: 'always',
});

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};
