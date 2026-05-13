import type { Metadata } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { Toaster } from 'react-hot-toast';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Providers from '@/components/Providers';
import '../globals.css';

const inter = Inter({ subsets: ['latin', 'cyrillic'], variable: '--font-inter' });
const playfair = Playfair_Display({ subsets: ['latin', 'cyrillic'], variable: '--font-playfair', display: 'swap' });

const locales = ['hy', 'en', 'ru', 'fr', 'de', 'it', 'es', 'zh', 'hi', 'ar'];

export const metadata: Metadata = {
  title: 'Kamancha Restaurant — Yerevan',
  description: 'Authentic Armenian cuisine in the heart of Yerevan. TripAdvisor #3. Live music every evening. Tumanyan 23.',
  keywords: 'Armenian restaurant, Yerevan, Kamancha, Armenian food, live music',
};

export default async function LocaleLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  if (!locales.includes(locale)) notFound();
  const messages = await getMessages();
  const isRtl = locale === 'ar';

  return (
    <html lang={locale} dir={isRtl ? 'rtl' : 'ltr'} className={`${inter.variable} ${playfair.variable}`}>
      <body>
        <NextIntlClientProvider messages={messages}>
          <Providers>
            <Navbar locale={locale} />
            <main className="min-h-screen">{children}</main>
            <Footer />
            <Toaster position="top-center" toastOptions={{ duration: 4000 }} />
          </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
