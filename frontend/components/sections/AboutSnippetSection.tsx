'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useTranslations, useLocale } from 'next-intl';

export default function AboutSnippetSection() {
  const t = useTranslations('home.about');
  const common = useTranslations('common');
  const locale = useLocale();

  const stats = [
    { value: '#3',   label: 'TripAdvisor Yerevan'  },
    { value: '75K',  label: 'Instagram Followers'  },
    { value: '2019', label: 'Founded'              },
    { value: '120+', label: 'Seats'                },
  ];

  return (
    <section className="py-20 bg-primary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <h2 className="font-display text-3xl md:text-4xl font-bold text-accent mb-5">
              {t('title')}
            </h2>
            <p className="text-text-muted-green text-base leading-relaxed mb-6" style={{ color: '#C8D8C0' }}>
              {t('text')}
            </p>
            <blockquote
              className="pl-5 my-7 italic"
              style={{
                borderLeft: '3px solid #D4A843',
                color: '#E8D8B0',
                fontFamily: 'var(--font-playfair), Georgia, serif',
              }}
            >
              &ldquo;Every dish we serve carries the soul of our ancestors and the warmth of Armenian hospitality.&rdquo;
              <footer className="mt-3 text-accent text-sm font-semibold not-italic" style={{ fontFamily: 'var(--font-inter), system-ui' }}>
                — Areg Manukyan, Founder
              </footer>
            </blockquote>
            <div className="flex flex-wrap gap-3 mt-7">
              <Link href={`/${locale}/about`} className="btn-gold">
                {common('learnMore')}
              </Link>
              <Link href={`/${locale}/booking`} className="btn-outline-gold">
                {common('bookTable')}
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="grid grid-cols-2 gap-4"
          >
            {stats.map((stat, i) => (
              <div
                key={i}
                className="bg-primary-deeper rounded-lg p-7 text-center border border-green-border"
              >
                <div className="font-display font-bold text-accent text-3xl mb-2">
                  {stat.value}
                </div>
                <div
                  className="text-text-muted-green-2 uppercase"
                  style={{ fontSize: '11px', letterSpacing: '1.5px' }}
                >
                  {stat.label}
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
