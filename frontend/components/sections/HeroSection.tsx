'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useTranslations, useLocale } from 'next-intl';
import { getMusicCountdown } from '@/lib/utils';

export default function HeroSection() {
  const t = useTranslations('home.hero');
  const music = useTranslations('home.music');
  const locale = useLocale();
  const [countdown, setCountdown] = useState({ hours: 0, minutes: 0, seconds: 0, isLive: false });

  useEffect(() => {
    const update = () => setCountdown(getMusicCountdown());
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-primary">
      <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/95 to-primary-light" />
      <div
        className="absolute inset-0 opacity-10"
        style={{ backgroundImage: 'url(/images/pattern-armenian.svg)', backgroundSize: '200px' }}
      />

      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <p className="text-accent text-sm font-semibold uppercase tracking-widest mb-4">
            ★ TripAdvisor Yerevan #3 ★
          </p>
          <h1 className="text-5xl md:text-7xl font-bold text-bg mb-6 leading-tight">
            {t('title')}
          </h1>
          <p className="text-xl md:text-2xl text-accent font-light mb-3">
            {t('subtitle')}
          </p>
          <p className="text-bg/70 mb-10">{t('description')}</p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link href={`/${locale}/booking`} className="btn-accent text-lg px-8 py-4 rounded-xl">
              {t('cta')}
            </Link>
            <Link href={`/${locale}/menu`} className="btn-outline text-lg px-8 py-4 rounded-xl border-bg text-bg hover:bg-bg hover:text-primary">
              {t('ctaMenu')}
            </Link>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 inline-block"
          >
            <p className="text-accent font-semibold mb-3">🎵 {music('title')}</p>
            {countdown.isLive ? (
              <p className="text-bg text-2xl font-bold animate-pulse">{music('liveNow')}</p>
            ) : (
              <div className="flex items-center space-x-4 text-bg">
                {[
                  { val: countdown.hours, label: music('hours') },
                  { val: countdown.minutes, label: music('minutes') },
                  { val: countdown.seconds, label: music('seconds') },
                ].map(({ val, label }) => (
                  <div key={label} className="text-center">
                    <div className="text-3xl font-bold tabular-nums">{String(val).padStart(2, '0')}</div>
                    <div className="text-xs text-bg/60 uppercase">{label}</div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
