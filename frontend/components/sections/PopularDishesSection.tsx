'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useTranslations, useLocale } from 'next-intl';
import { getMenu } from '@/lib/api';
import { formatPrice } from '@/lib/utils';
import { Star } from 'lucide-react';

interface MenuItem {
  id: string;
  name: string;
  name_hy: string;
  description: string;
  price: number;
  category: string;
  image_url?: string;
  is_popular: boolean;
}

export default function PopularDishesSection() {
  const t = useTranslations('home.popular');
  const common = useTranslations('common');
  const locale = useLocale();
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMenu(locale, undefined)
      .then((data) => {
        setItems((data.data || []).filter((i: MenuItem) => i.is_popular).slice(0, 6));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [locale]);

  return (
    <section className="py-20 bg-bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-primary mb-3">{t('title')}</h2>
          <p className="text-text-secondary text-lg">{t('subtitle')}</p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-xl border border-border animate-pulse overflow-hidden">
                <div className="h-48 bg-bg-dark" />
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-bg-dark rounded w-3/4" />
                  <div className="h-3 bg-bg-dark rounded w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : items.length === 0 ? null : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="bg-white rounded-xl border border-border overflow-hidden shadow-sm hover:shadow-lg transition-shadow group"
              >
                <div className="relative h-48 bg-bg-dark overflow-hidden">
                  {item.image_url ? (
                    <img
                      src={item.image_url}
                      alt={item.name_hy || item.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-bg-dark">
                      <span className="text-text-secondary/30 text-sm uppercase tracking-widest">Photo</span>
                    </div>
                  )}
                  <div className="absolute top-2 right-2 bg-accent text-white text-xs px-2 py-1 rounded-full flex items-center space-x-1">
                    <Star size={10} fill="white" />
                    <span>Popular</span>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-display font-bold text-primary text-lg leading-tight">
                    {item.name_hy && item.name_hy !== item.name ? item.name_hy : item.name}
                  </h3>
                  {item.name_hy && item.name_hy !== item.name && locale !== 'hy' && (
                    <p className="text-text-secondary text-sm">{item.name}</p>
                  )}
                  <p className="text-text-secondary text-sm mt-1 mb-3 line-clamp-2">{item.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-accent font-bold text-lg">{formatPrice(item.price)}</span>
                    <Link
                      href={`/${locale}/menu`}
                      className="text-primary text-sm font-medium hover:text-accent transition-colors"
                    >
                      {common('viewMenu')} →
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        <div className="text-center mt-10">
          <Link
            href={`/${locale}/menu`}
            className="inline-flex items-center px-8 py-3 rounded-lg bg-primary text-white font-semibold hover:bg-primary-light transition-colors"
          >
            {common('viewMenu')}
          </Link>
        </div>
      </div>
    </section>
  );
}
