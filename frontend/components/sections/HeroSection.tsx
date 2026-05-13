'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useTranslations, useLocale } from 'next-intl';
import { getMusicCountdown } from '@/lib/utils';
import { Music } from 'lucide-react';

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
      <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-primary-light opacity-95" />

      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <p className="text-accent text-sm font-semibold uppercase tracking-widest mb-4">
            TripAdvisor Yerevan #3
          </p>
          <h1 className="font-display text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
            {t('title')}
          </h1>
          <p className="text-xl md:text-2xl text-accent font-light mb-3">
            {t('subtitle')}
          </p>
          <p className="text-white/60 mb-10 text-base">{t('description')}</p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-14">
            <Link
              href={`/${locale}/booking`}
              className="inline-flex items-center justify-center px-8 py-4 rounded-xl bg-accent text-white text-lg font-semibold hover:bg-accent-dark transition-colors"
            >
              {t('cta')}
            </Link>
            <Link
              href={`/${locale}/menu`}
              className="inline-flex items-center justify-center px-8 py-4 rounded-xl border border-white/40 text-white text-lg font-semibold hover:bg-white/10 transition-colors"
            >
              {t('ctaMenu')}
            </Link>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 inline-block min-w-[260px]"
          >
            <div className="flex items-center justify-center space-x-2 mb-3">
              <Music size={16} className="text-accent" />
              <p className="text-accent font-semibold text-sm uppercase tracking-wide">{music('title')}</p>
            </div>
            {countdown.isLive ? (
              <p className="text-white text-2xl font-bold animate-pulse">{music('liveNow')}</p>
            ) : (
              <div className="flex items-center justify-center space-x-4 text-white">
                {[
                  { val: countdown.hours,   label: music('hours')   },
                  { val: countdown.minutes, label: music('minutes') },
                  { val: countdown.seconds, label: music('seconds') },
                ].map(({ val, label }, idx) => (
                  <div key={idx} className="text-center">
                    <div className="text-3xl font-bold tabular-nums">{String(val).padStart(2, '0')}</div>
                    <div className="text-xs text-white/50 uppercase mt-0.5">{label}</div>
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
