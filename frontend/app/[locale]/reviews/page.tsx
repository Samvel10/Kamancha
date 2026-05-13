'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTranslations, useLocale } from 'next-intl';
import { MessageSquare, Star } from 'lucide-react';
import { getReviews } from '@/lib/api';
import { formatDate, getStars, cn } from '@/lib/utils';

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

  return (
    <div className="pt-16 min-h-screen bg-bg">
      <div className="bg-primary py-16 text-center">
        <h1 className="font-display text-4xl md:text-5xl font-bold mb-3" style={{ color: '#F5ECD7' }}>
          {t('title')}
        </h1>
        <hr className="section-divider" />
        <p className="text-text-muted-green text-base mb-6">{t('subtitle')}</p>
        <div className="mt-4">
          <div className="font-display text-5xl font-bold text-accent">{avgRating}</div>
          <div className="text-accent text-2xl mt-1 tracking-widest">★★★★★</div>
          <p className="text-text-muted-green-2 text-sm mt-2 uppercase tracking-wider">{t('tripAdvisorRank')}</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-wrap gap-2 mb-10 justify-center">
          {SOURCES.map((s) => (
            <button
              key={s}
              onClick={() => setActiveSource(s)}
              className={cn(
                'px-5 py-2 rounded-full text-sm font-medium transition-colors border',
                activeSource === s
                  ? 'bg-primary text-accent border-primary'
                  : 'bg-transparent text-primary border-primary hover:bg-primary hover:text-accent'
              )}
            >
              {t(`sources.${s}`)}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-lg border border-border p-6 animate-pulse">
                <div className="h-4 bg-bg-dark rounded w-1/3 mb-3" />
                <div className="h-3 bg-bg-dark rounded w-full mb-2" />
                <div className="h-3 bg-bg-dark rounded w-2/3" />
              </div>
            ))}
          </div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-20 text-text-secondary">
            <MessageSquare size={48} className="mx-auto mb-4 text-accent/40" />
            <p>{t('noReviews')}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map((review, i) => (
              <motion.div
                key={review._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className="bg-white rounded-lg border border-border p-6"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-display font-bold text-primary">{review.author}</p>
                    <div className="text-accent text-sm flex items-center gap-0.5 mt-0.5">
                      <Star size={14} fill="currentColor" />
                      <span className="ml-1">{getStars(review.rating)}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-text-secondary bg-bg-dark px-2 py-1 rounded uppercase tracking-wider">
                      {review.source}
                    </span>
                    <p className="text-xs text-text-faint mt-1">{formatDate(review.date, locale)}</p>
                  </div>
                </div>
                <p className="text-text-secondary leading-relaxed">{review.text}</p>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
