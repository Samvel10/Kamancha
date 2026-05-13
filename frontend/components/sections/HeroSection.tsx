'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useTranslations, useLocale } from 'next-intl';

export default function HeroSection() {
  const t = useTranslations('home.hero');
  const locale = useLocale();

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-primary">
      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <p
            className="text-accent text-xs font-semibold uppercase mb-6"
            style={{ letterSpacing: '3px' }}
          >
            TripAdvisor Yerevan #3
          </p>
          <h1
            className="font-display font-bold leading-tight mb-6 text-[1.75rem] sm:text-[2rem] md:text-[2.625rem]"
            style={{ color: '#F5ECD7' }}
          >
            {t('title')}
          </h1>
          <p className="text-text-muted-green text-base sm:text-lg md:text-xl font-light mb-4 max-w-2xl mx-auto">
            {t('subtitle')}
          </p>
          <p className="text-text-muted-green-2 text-sm mb-10 max-w-xl mx-auto">{t('description')}</p>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center">
            <Link href={`/${locale}/booking`} className="btn-gold">
              {t('cta')}
            </Link>
            <Link href={`/${locale}/menu`} className="btn-outline-gold">
              {t('ctaMenu')}
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
