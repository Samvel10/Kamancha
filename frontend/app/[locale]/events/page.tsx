'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useTranslations, useLocale } from 'next-intl';
import { getEvents } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import { Calendar, Clock, Music } from 'lucide-react';

interface Event {
  _id: string;
  title: Record<string, string> | string;
  description: Record<string, string> | string;
  date: string;
  time: string;
  type: 'music' | 'special' | 'holiday' | 'other';
}

const TYPE_COLORS: Record<string, string> = {
  music: 'bg-accent/10 text-accent',
  special: 'bg-secondary/10 text-secondary',
  holiday: 'bg-primary/10 text-primary',
  other: 'bg-gray-100 text-gray-600',
};

export default function EventsPage() {
  const t = useTranslations('events');
  const locale = useLocale();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getEvents(locale).then((data) => setEvents(data.data || [])).catch(() => {}).finally(() => setLoading(false));
  }, [locale]);

  const getTitle = (e: Event) => typeof e.title === 'object' ? (e.title[locale] || e.title.en || '') : e.title;
  const getDesc = (e: Event) => typeof e.description === 'object' ? (e.description[locale] || e.description.en || '') : e.description;

  return (
    <div className="pt-16 min-h-screen bg-bg">
      <div className="bg-primary py-16 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-bg mb-3">{t('title')}</h1>
        <p className="text-accent text-lg">{t('subtitle')}</p>
      </div>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-2xl font-bold text-primary mb-8">{t('upcoming')}</h2>
        {loading ? (
          <div className="space-y-4">
            {[1,2,3].map(i => <div key={i} className="card p-6 animate-pulse"><div className="h-5 bg-bg-dark rounded w-1/2 mb-3"/><div className="h-3 bg-bg-dark rounded w-full"/></div>)}
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-20 text-text-main/50"><Music size={48} className="mx-auto mb-4 opacity-30"/><p>{t('noEvents')}</p></div>
        ) : (
          <div className="space-y-6">
            {events.map((event, i) => (
              <motion.div key={event._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="bg-white rounded-2xl shadow-md p-6 hover:shadow-lg transition-shadow">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`text-xs font-semibold px-3 py-1 rounded-full ${TYPE_COLORS[event.type] || TYPE_COLORS.other}`}>
                        {t(`types.${event.type}`)}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-primary mb-2">{getTitle(event)}</h3>
                    <p className="text-text-main/70 text-sm leading-relaxed">{getDesc(event)}</p>
                    <div className="flex items-center gap-4 mt-3 text-sm text-text-main/60">
                      <span className="flex items-center gap-1"><Calendar size={14}/>{formatDate(event.date, locale)}</span>
                      <span className="flex items-center gap-1"><Clock size={14}/>{event.time}</span>
                    </div>
                  </div>
                  <Link href={`/${locale}/booking`} className="btn-accent text-sm whitespace-nowrap shrink-0">{t('bookForEvent')}</Link>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
