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
    getMenu(locale, undefined).then((data) => {
      setItems((data.data || []).filter((i: MenuItem) => i.is_popular).slice(0, 6));
    }).catch(() => {}).finally(() => setLoading(false));
  }, [locale]);

  const placeholders: MenuItem[] = [
    { id: '1', name: 'Khorovats', description: 'Traditional Armenian BBQ', price: 6800, category: 'grill', is_popular: true },
    { id: '2', name: 'Dolma', description: 'Stuffed grape leaves', price: 4200, category: 'appetizers', is_popular: true },
    { id: '3', name: 'Spas', description: 'Armenian yogurt soup', price: 2500, category: 'soups', is_popular: true },
  ];

  const displayItems = items.length > 0 ? items : (!loading ? placeholders : []);

  return (
    <section className="py-20 bg-bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="section-title">{t('title')}</h2>
          <p className="section-subtitle">{t('subtitle')}</p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1,2,3].map(i => (
              <div key={i} className="card animate-pulse">
                <div className="h-48 bg-bg-dark" />
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-bg-dark rounded w-3/4" />
                  <div className="h-3 bg-bg-dark rounded w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayItems.map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="card hover:shadow-xl transition-shadow group"
              >
                <div className="relative h-48 bg-bg-dark overflow-hidden">
                  {item.image_url ? (
                    <img src={item.image_url} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-6xl">🍽️</div>
                  )}
                  <div className="absolute top-2 right-2 bg-accent text-white text-xs px-2 py-1 rounded-full flex items-center space-x-1">
                    <Star size={10} fill="white" />
                    <span>{common('all').toLowerCase() === 'all' ? 'Popular' : common('all')}</span>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-primary text-lg mb-1">{item.name}</h3>
                  <p className="text-text-main/70 text-sm mb-3 line-clamp-2">{item.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-accent font-bold">{formatPrice(item.price)}</span>
                    <Link href={`/${locale}/menu`} className="text-primary text-sm font-medium hover:text-accent transition-colors">
                      {common('viewMenu')} →
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        <div className="text-center mt-10">
          <Link href={`/${locale}/menu`} className="btn-primary px-8 py-3">
            {common('viewMenu')}
          </Link>
        </div>
      </div>
    </section>
  );
}
