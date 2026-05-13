'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useTranslations, useLocale } from 'next-intl';
import { getMusicCountdown } from '@/lib/utils';
import { Music } from 'lucide-react';

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
    <section className="py-20 bg-bg-dark">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <div className="inline-flex items-center space-x-2 bg-accent/10 border border-accent/30 rounded-full px-4 py-2 mb-6">
            <Music size={16} className="text-accent" />
            <span className="text-accent text-sm font-semibold uppercase tracking-wide">Live Music</span>
          </div>

          <h2 className="font-display text-3xl md:text-4xl font-bold text-primary mb-3">{t('title')}</h2>
          <p className="text-text-secondary text-lg mb-10">{t('subtitle')}</p>

          <div className="bg-primary rounded-2xl p-10 inline-block min-w-[320px]">
            {countdown.isLive ? (
              <div>
                <p className="text-accent font-bold text-3xl animate-pulse mb-2">{t('liveNow')}</p>
                <p className="text-white/60 text-sm">Music is playing now — come join us!</p>
              </div>
            ) : (
              <div>
                <p className="text-white/50 text-xs uppercase tracking-widest mb-5">{t('countdown')}</p>
                <div className="flex items-center justify-center space-x-6 text-white">
                  {[
                    { val: countdown.hours,   label: t('hours')   },
                    { val: countdown.minutes, label: t('minutes') },
                    { val: countdown.seconds, label: t('seconds') },
                  ].map(({ val, label }, idx) => (
                    <div key={idx} className="text-center">
                      <div className="text-5xl font-bold tabular-nums font-display">{String(val).padStart(2, '0')}</div>
                      <div className="text-xs text-white/40 uppercase tracking-wide mt-1">{label}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="mt-10">
            <Link
              href={`/${locale}/events`}
              className="inline-flex items-center px-6 py-3 rounded-lg bg-primary text-white font-semibold hover:bg-primary-light transition-colors"
            >
              View Events Schedule
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
