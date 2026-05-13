import { getRequestConfig } from 'next-intl/server';
import { notFound } from 'next/navigation';

const locales = ['hy', 'en', 'ru', 'fr', 'de', 'it', 'es', 'zh', 'hi', 'ar'];

export default getRequestConfig(async ({ locale }) => {
  if (!locales.includes(locale as string)) notFound();
  return {
    messages: (await import(`./i18n/locales/${locale}.json`)).default,
  };
});
