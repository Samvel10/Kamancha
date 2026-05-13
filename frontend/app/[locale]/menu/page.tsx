'use client';
import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations, useLocale } from 'next-intl';
import { Search, Utensils } from 'lucide-react';
import { getMenu, getCategories } from '@/lib/api';
import { formatPrice, cn } from '@/lib/utils';
import MenuItemModal from '@/components/menu/MenuItemModal';

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
  const [openItemId, setOpenItemId] = useState<string | null>(null);

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
        <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold mb-3" style={{ color: '#F5ECD7' }}>
          {t('title')}
        </h1>
        <hr className="section-divider" />
        <p className="text-text-muted-green text-base">{t('subtitle')}</p>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="relative mb-8 max-w-xl mx-auto">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary" size={18} />
          <input
            type="text"
            placeholder={t('search')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-11"
          />
        </div>

        <div className="flex flex-wrap gap-2 justify-center mb-10">
          <button
            onClick={() => setActiveCategory('')}
            className={cn(
              'px-5 py-2 rounded-full text-sm font-medium transition-colors border',
              !activeCategory
                ? 'bg-primary text-accent border-primary'
                : 'bg-transparent text-primary border-primary hover:bg-primary hover:text-accent'
            )}
          >
            {t('allCategories')}
          </button>
          {categories.map((cat) => (
            <button
              key={cat.slug}
              onClick={() => setActiveCategory(cat.slug)}
              className={cn(
                'px-5 py-2 rounded-full text-sm font-medium transition-colors border',
                activeCategory === cat.slug
                  ? 'bg-primary text-accent border-primary'
                  : 'bg-transparent text-primary border-primary hover:bg-primary hover:text-accent'
              )}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white rounded-lg border border-border animate-pulse p-5 flex gap-4">
                <div className="w-20 h-20 bg-bg-dark rounded shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-bg-dark rounded w-3/4" />
                  <div className="h-3 bg-bg-dark rounded w-full" />
                  <div className="h-4 bg-bg-dark rounded w-1/4" />
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
              className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto"
            >
              {filtered.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setOpenItemId(item.id)}
                  className={cn(
                    'bg-white rounded-lg border border-border overflow-hidden hover:shadow-md transition-shadow flex text-left w-full focus:outline-none focus:ring-2 focus:ring-accent/40',
                    !item.is_available && 'opacity-60'
                  )}
                >
                  <div className="w-28 bg-green-border flex items-center justify-center shrink-0 overflow-hidden">
                    {item.image_url ? (
                      <img
                        src={item.image_url}
                        alt={item.name_hy || item.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Utensils size={28} className="text-accent/50" />
                    )}
                  </div>
                  <div className="p-4 flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <h3 className="font-display font-bold text-primary text-base leading-tight">
                          {item.name_hy && item.name_hy !== item.name ? item.name_hy : item.name}
                        </h3>
                        {item.name_hy && item.name_hy !== item.name && locale !== 'hy' && (
                          <p className="text-text-secondary text-xs mt-0.5">{item.name}</p>
                        )}
                      </div>
                      <span className="text-accent font-bold shrink-0" style={{ fontSize: '15px' }}>
                        {formatPrice(item.price)}
                      </span>
                    </div>
                    <p className="mt-2 line-clamp-2 text-text-faint" style={{ fontSize: '11px' }}>
                      {item.description}
                    </p>
                    {item.is_popular && (
                      <span className="inline-block mt-2 text-accent text-xs font-semibold uppercase tracking-wider">
                        ★ {t('popular')}
                      </span>
                    )}
                    {!item.is_available && (
                      <p className="mt-2 text-xs text-red-600">{t('unavailable')}</p>
                    )}
                  </div>
                </button>
              ))}
            </motion.div>
          </AnimatePresence>
        )}
      </div>

      <MenuItemModal itemId={openItemId} onClose={() => setOpenItemId(null)} />
    </div>
  );
}
