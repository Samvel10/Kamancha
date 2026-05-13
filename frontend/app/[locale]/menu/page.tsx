'use client';
import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations, useLocale } from 'next-intl';
import { Search } from 'lucide-react';
import { getMenu, getCategories } from '@/lib/api';
import { formatPrice, cn } from '@/lib/utils';

interface MenuItem {
  id: string;
  name: string;
  name_hy: string;
  description: string;
  price: number;
  category: string;
  image_url?: string;
  is_popular: boolean;
  is_available: boolean;
}
interface Category { slug: string; name: string; icon: string; }

export default function MenuPage() {
  const t = useTranslations('menu');
  const locale = useLocale();
  const [items, setItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeCategory, setActiveCategory] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    const [menuData, catData] = await Promise.all([
      getMenu(locale).catch(() => ({ data: [] })),
      getCategories(locale).catch(() => ({ data: [] })),
    ]);
    setItems(menuData.data || []);
    setCategories(catData.data || []);
    setLoading(false);
  }, [locale]);

  useEffect(() => { loadData(); }, [loadData]);

  const filtered = items.filter((item) => {
    const matchCat = !activeCategory || item.category === activeCategory;
    const searchTerm = search.toLowerCase();
    const matchSearch = !search ||
      item.name.toLowerCase().includes(searchTerm) ||
      (item.name_hy && item.name_hy.toLowerCase().includes(searchTerm));
    return matchCat && matchSearch;
  });

  return (
    <div className="pt-16 min-h-screen bg-bg">
      <div className="bg-primary py-16 text-center">
        <h1 className="font-display text-4xl md:text-5xl font-bold text-white mb-3">{t('title')}</h1>
        <p className="text-accent text-lg">{t('subtitle')}</p>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary" size={18} />
          <input
            type="text"
            placeholder={t('search')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3 rounded-xl border border-border bg-white text-text-dark placeholder-text-secondary/50 focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>

        <div className="flex flex-wrap gap-2 mb-8">
          <button
            onClick={() => setActiveCategory('')}
            className={cn(
              'px-4 py-2 rounded-full text-sm font-medium transition-colors',
              !activeCategory
                ? 'bg-primary text-white'
                : 'bg-white text-text-dark hover:bg-bg-dark border border-border'
            )}
          >
            {t('allCategories')}
          </button>
          {categories.map((cat) => (
            <button
              key={cat.slug}
              onClick={() => setActiveCategory(cat.slug)}
              className={cn(
                'px-4 py-2 rounded-full text-sm font-medium transition-colors',
                activeCategory === cat.slug
                  ? 'bg-primary text-white'
                  : 'bg-white text-text-dark hover:bg-bg-dark border border-border'
              )}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 9 }).map((_, i) => (
              <div key={i} className="bg-white rounded-xl border border-border animate-pulse overflow-hidden">
                <div className="h-48 bg-bg-dark" />
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-bg-dark rounded w-3/4" />
                  <div className="h-3 bg-bg-dark rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-text-secondary">
            <p className="text-lg">{t('noResults')}</p>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={activeCategory + search}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {filtered.map((item) => (
                <div
                  key={item.id}
                  className={cn(
                    'bg-white rounded-xl border border-border overflow-hidden shadow-sm hover:shadow-lg transition-all group',
                    !item.is_available && 'opacity-60'
                  )}
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
                    {item.is_popular && (
                      <span className="absolute top-2 left-2 bg-accent text-white text-xs px-2 py-1 rounded-full font-medium">
                        {t('popular')}
                      </span>
                    )}
                    {!item.is_available && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <span className="text-white text-sm font-medium bg-black/50 px-3 py-1 rounded">
                          {t('unavailable')}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-display font-bold text-primary text-lg leading-tight">
                      {item.name_hy && item.name_hy !== item.name ? item.name_hy : item.name}
                    </h3>
                    {item.name_hy && item.name_hy !== item.name && locale !== 'hy' && (
                      <p className="text-text-secondary text-sm">{item.name}</p>
                    )}
                    <p className="text-text-secondary text-sm mt-1 mb-3 line-clamp-2">{item.description}</p>
                    <span className="text-accent font-bold text-lg">{formatPrice(item.price)}</span>
                  </div>
                </div>
              ))}
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
