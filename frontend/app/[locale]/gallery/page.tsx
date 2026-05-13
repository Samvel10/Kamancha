'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { Image as ImageIcon } from 'lucide-react';
import { getGallery } from '@/lib/api';
import { cn } from '@/lib/utils';

interface GalleryItem { _id: string; url: string; category: string; title?: string; }

const FILTERS = ['all', 'food', 'interior', 'events', 'team'] as const;
type Filter = typeof FILTERS[number];

export default function GalleryPage() {
  const t = useTranslations('gallery');
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [activeFilter, setActiveFilter] = useState<Filter>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getGallery().then((data) => setItems(data.data || [])).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const filtered = activeFilter === 'all' ? items : items.filter((i) => i.category === activeFilter);

  return (
    <div className="pt-16 min-h-screen bg-bg">
      <div className="bg-primary py-16 text-center">
        <h1 className="font-display text-4xl md:text-5xl font-bold mb-3" style={{ color: '#F5ECD7' }}>
          {t('title')}
        </h1>
        <hr className="section-divider" />
        <p className="text-text-muted-green text-base">{t('subtitle')}</p>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-wrap gap-2 mb-10 justify-center">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={cn(
                'px-5 py-2 rounded-full text-sm font-medium transition-colors border',
                activeFilter === f
                  ? 'bg-primary text-accent border-primary'
                  : 'bg-transparent text-primary border-primary hover:bg-primary hover:text-accent'
              )}
            >
              {t(`filter.${f}`)}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className={`animate-pulse bg-bg-dark rounded-lg ${i % 3 === 0 ? 'h-64' : 'h-48'} break-inside-avoid mb-4`} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-text-secondary">
            <ImageIcon size={48} className="mx-auto mb-4 text-text-faint" />
            <p>{t('noImages')}</p>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={activeFilter}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="columns-2 md:columns-3 lg:columns-4 gap-4"
            >
              {filtered.map((item, i) => (
                <motion.div
                  key={item._id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className="break-inside-avoid mb-4"
                >
                  <div className={`bg-green-border rounded-lg overflow-hidden cursor-pointer hover:shadow-lg transition-shadow ${i % 4 === 0 ? 'h-64' : i % 3 === 0 ? 'h-48' : 'h-56'}`}>
                    {item.url ? (
                      <img
                        src={item.url}
                        alt={item.title || 'Gallery'}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center">
                        <ImageIcon size={32} className="text-accent/40" />
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
