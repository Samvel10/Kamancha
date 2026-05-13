'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTranslations, useLocale } from 'next-intl';
import { getReviews } from '@/lib/api';
import { formatDate, getStars } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface Review {
  _id: string; author: string; rating: number; text: string;
  lang: string; source: string; date: string;
}

const SOURCES = ['all', 'tripadvisor', 'google', 'internal'] as const;

export default function ReviewsPage() {
  const t = useTranslations('reviews');
  const locale = useLocale();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [activeSource, setActiveSource] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getReviews(activeSource).then((data) => setReviews(data.data || [])).catch(() => {}).finally(() => setLoading(false));
  }, [activeSource]);

  const avgRating = reviews.length > 0 ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : '5.0';

  const SOURCE_ICONS: Record<string, string> = { tripadvisor: '🌍', google: '🔍', internal: '🏠' };

  return (
    <div className="pt-16 min-h-screen bg-bg">
      <div className="bg-primary py-16 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-bg mb-3">{t('title')}</h1>
        <p className="text-accent text-lg">{t('subtitle')}</p>
        <div className="mt-6">
          <div className="text-5xl font-bold text-accent">{avgRating}</div>
          <div className="text-yellow-400 text-2xl mt-1">★★★★★</div>
          <p className="text-bg/60 text-sm mt-1">{t('tripAdvisorRank')}</p>
        </div>
      </div>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-wrap gap-2 mb-8 justify-center">
          {SOURCES.map((s) => (
            <button key={s} onClick={() => setActiveSource(s)} className={cn('px-4 py-2 rounded-full text-sm font-medium transition-colors', activeSource === s ? 'bg-primary text-bg' : 'bg-white text-text-main hover:bg-bg-dark border border-bg-dark')}>
              {SOURCE_ICONS[s] || '⭐'} {t(`sources.${s}`)}
            </button>
          ))}
        </div>
        {loading ? (
          <div className="space-y-4">{[1,2,3].map(i => <div key={i} className="card p-6 animate-pulse"><div className="h-4 bg-bg-dark rounded w-1/3 mb-3"/><div className="h-3 bg-bg-dark rounded w-full mb-2"/><div className="h-3 bg-bg-dark rounded w-2/3"/></div>)}</div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-20 text-text-main/50"><div className="text-5xl mb-4">💬</div><p>{t('noReviews')}</p></div>
        ) : (
          <div className="space-y-4">
            {reviews.map((review, i) => (
              <motion.div key={review._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }} className="bg-white rounded-2xl shadow-md p-6">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-bold text-primary">{review.author}</p>
                    <div className="text-yellow-400 text-sm">{getStars(review.rating)}</div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-text-main/50 bg-bg px-2 py-1 rounded-full">
                      {SOURCE_ICONS[review.source] || '⭐'} {review.source}
                    </span>
                    <p className="text-xs text-text-main/40 mt-1">{formatDate(review.date, locale)}</p>
                  </div>
                </div>
                <p className="text-text-main/70 leading-relaxed">{review.text}</p>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
