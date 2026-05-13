'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useTranslations, useLocale } from 'next-intl';

export default function AboutSnippetSection() {
  const t = useTranslations('home.about');
  const common = useTranslations('common');
  const locale = useLocale();

  return (
    <section className="py-20 bg-primary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-4">{t('title')}</h2>
            <p className="text-accent text-lg mb-5">{t('subtitle')}</p>
            <p className="text-white/70 leading-relaxed mb-8">{t('text')}</p>
            <div className="flex flex-wrap gap-3">
              <Link
                href={`/${locale}/about`}
                className="inline-flex items-center px-6 py-3 rounded-lg bg-accent text-white font-semibold hover:bg-accent-dark transition-colors"
              >
                {common('learnMore')}
              </Link>
              <Link
                href={`/${locale}/booking`}
                className="inline-flex items-center px-6 py-3 rounded-lg border border-white/30 text-white font-semibold hover:bg-white/10 transition-colors"
              >
                {common('bookTable')}
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <div className="bg-white/5 rounded-2xl p-8 border-l-4 border-accent">
              <blockquote className="text-white font-display font-medium text-xl italic leading-relaxed">
                &ldquo;Every dish we serve carries the soul of our ancestors and the warmth of Armenian hospitality.&rdquo;
              </blockquote>
              <p className="mt-5 text-accent font-semibold">— Areg Manukyan, Founder</p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
