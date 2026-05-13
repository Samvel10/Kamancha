'use client';
import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations, useLocale } from 'next-intl';
import { getGallery } from '@/lib/api';
import { cn } from '@/lib/utils';

interface GalleryItem { _id: string; url: string; category: string; title?: string; }

const FILTERS = ['all', 'food', 'interior', 'events', 'team'] as const;
type Filter = typeof FILTERS[number];

const DEMO_ITEMS: GalleryItem[] = [
  { _id: '1', url: '', category: 'food', title: 'Khorovats' },
  { _id: '2', url: '', category: 'interior', title: 'Main Hall' },
  { _id: '3', url: '', category: 'food', title: 'Dolma' },
  { _id: '4', url: '', category: 'events', title: 'Jazz Evening' },
  { _id: '5', url: '', category: 'interior', title: 'Garden Terrace' },
  { _id: '6', url: '', category: 'food', title: 'Dessert' },
];

const EMOJIS: Record<string, string> = { food: '🍽️', interior: '🏛️', events: '🎵', team: '👥' };

export default function GalleryPage() {
  const t = useTranslations('gallery');
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [activeFilter, setActiveFilter] = useState<Filter>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getGallery().then((data) => setItems(data.data || [])).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const displayItems = items.length > 0 ? items : DEMO_ITEMS;
  const filtered = activeFilter === 'all' ? displayItems : displayItems.filter((i) => i.category === activeFilter);

  return (
    <div className="pt-16 min-h-screen bg-bg">
      <div className="bg-primary py-16 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-bg mb-3">{t('title')}</h1>
        <p className="text-accent text-lg">{t('subtitle')}</p>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-wrap gap-2 mb-8 justify-center">
          {FILTERS.map((f) => (
            <button key={f} onClick={() => setActiveFilter(f)} className={cn('px-5 py-2 rounded-full text-sm font-medium transition-colors', activeFilter === f ? 'bg-primary text-bg' : 'bg-white text-text-main hover:bg-bg-dark border border-bg-dark')}>
              {t(`filter.${f}`)}
            </button>
          ))}
        </div>
        {loading ? (
          <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className={`animate-pulse bg-bg-dark rounded-xl ${i % 3 === 0 ? 'h-64' : 'h-48'} break-inside-avoid mb-4`}/>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-text-main/50"><div className="text-5xl mb-4">🖼️</div><p>{t('noImages')}</p></div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div key={activeFilter} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="columns-2 md:columns-3 lg:columns-4 gap-4">
              {filtered.map((item, i) => (
                <motion.div key={item._id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }} className="break-inside-avoid mb-4">
                  <div className={`bg-bg-dark rounded-xl overflow-hidden group cursor-pointer hover:shadow-lg transition-shadow ${i % 4 === 0 ? 'h-64' : i % 3 === 0 ? 'h-48' : 'h-56'}`}>
                    {item.url ? (
                      <img src={item.url} alt={item.title || 'Gallery'} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"/>
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-primary/20">
                        <div className="text-5xl">{EMOJIS[item.category] || '📷'}</div>
                        {item.title && <p className="text-xs text-text-main/40 mt-2">{item.title}</p>}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
