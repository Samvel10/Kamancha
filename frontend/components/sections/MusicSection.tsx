'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useTranslations, useLocale } from 'next-intl';
import { getMusicCountdown } from '@/lib/utils';

export default function MusicSection() {
  const t = useTranslations('home.music');
  const locale = useLocale();
  const [countdown, setCountdown] = useState({ hours: 0, minutes: 0, seconds: 0, isLive: false });

  useEffect(() => {
    const update = () => setCountdown(getMusicCountdown());
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="bg-bg-music py-20 relative" style={{ borderTop: '3px solid #D4A843' }}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <h2 className="section-title">{t('title')}</h2>
          <hr className="section-divider" />
          <p className="text-text-secondary text-base mb-10">{t('subtitle')}</p>

          <div className="inline-flex items-center bg-primary rounded-md px-6 sm:px-8 py-4 sm:py-5 mb-8">
            <span
              className="text-accent font-display font-bold text-2xl sm:text-[32px]"
              style={{ letterSpacing: '2px' }}
            >
              19:30
            </span>
            <span
              className="text-text-muted-green-2 ml-3 sm:ml-4 uppercase text-[10px] sm:text-[11px]"
              style={{ letterSpacing: '1.5px' }}
            >
              Daily
            </span>
          </div>

          {!countdown.isLive ? (
            <div className="text-text-secondary text-sm mb-8">
              <span className="uppercase tracking-widest text-xs">{t('countdown')}</span>
              <div className="flex items-center justify-center space-x-4 sm:space-x-6 mt-4 text-primary">
                {[
                  { val: countdown.hours,   label: t('hours')   },
                  { val: countdown.minutes, label: t('minutes') },
                  { val: countdown.seconds, label: t('seconds') },
                ].map(({ val, label }, idx) => (
                  <div key={idx} className="text-center">
                    <div className="text-3xl font-bold tabular-nums font-display">{String(val).padStart(2, '0')}</div>
                    <div className="text-xs text-text-faint uppercase tracking-wide mt-0.5">{label}</div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-accent font-bold text-2xl animate-pulse mb-8">{t('liveNow')}</p>
          )}

          <div>
            <Link href={`/${locale}/events`} className="btn-primary">
              View Events Schedule
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
