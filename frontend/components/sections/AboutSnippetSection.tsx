'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useTranslations, useLocale } from 'next-intl';

export default function AboutSnippetSection() {
  const t = useTranslations('home.about');
  const common = useTranslations('common');
  const locale = useLocale();

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <h2 className="section-title">{t('title')}</h2>
            <p className="section-subtitle">{t('subtitle')}</p>
            <p className="text-text-main/80 leading-relaxed mb-6">{t('text')}</p>
            <div className="flex flex-wrap gap-3">
              <Link href={`/${locale}/about`} className="btn-primary">
                {common('learnMore')}
              </Link>
              <Link href={`/${locale}/booking`} className="btn-outline">
                {common('bookTable')}
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="relative"
          >
            <div className="bg-bg rounded-2xl p-8 border-l-4 border-accent">
              <div className="text-8xl mb-4">🎻</div>
              <blockquote className="text-primary font-medium text-lg italic leading-relaxed">
                &ldquo;Every dish we serve carries the soul of our ancestors and the warmth of Armenian hospitality.&rdquo;
              </blockquote>
              <p className="mt-4 text-accent font-semibold">— Areg Manukyan, Founder</p>
            </div>
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-accent/10 rounded-full" />
            <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-secondary/10 rounded-full" />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
