'use client';
import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations, useLocale } from 'next-intl';
import { Search } from 'lucide-react';
import { getMenu, getCategories } from '@/lib/api';
import { formatPrice, cn } from '@/lib/utils';

interface MenuItem {
  id: string; name: string; description: string; price: number;
  category: string; image_url?: string; is_popular: boolean; is_available: boolean;
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
    const matchSearch = !search || item.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="pt-16 min-h-screen bg-bg">
      <div className="bg-primary py-16 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-bg mb-3">{t('title')}</h1>
        <p className="text-accent text-lg">{t('subtitle')}</p>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input type="text" placeholder={t('search')} value={search} onChange={(e) => setSearch(e.target.value)} className="input-field pl-11" />
        </div>
        <div className="flex flex-wrap gap-2 mb-8">
          <button onClick={() => setActiveCategory('')} className={cn('px-4 py-2 rounded-full text-sm font-medium transition-colors', !activeCategory ? 'bg-primary text-bg' : 'bg-white text-text-main hover:bg-bg-dark border border-bg-dark')}>
            {t('allCategories')}
          </button>
          {categories.map((cat) => (
            <button key={cat.slug} onClick={() => setActiveCategory(cat.slug)} className={cn('px-4 py-2 rounded-full text-sm font-medium transition-colors', activeCategory === cat.slug ? 'bg-primary text-bg' : 'bg-white text-text-main hover:bg-bg-dark border border-bg-dark')}>
              {cat.icon} {cat.name}
            </button>
          ))}
        </div>
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 9 }).map((_, i) => (
              <div key={i} className="card animate-pulse"><div className="h-48 bg-bg-dark"/><div className="p-4 space-y-2"><div className="h-4 bg-bg-dark rounded w-3/4"/><div className="h-3 bg-bg-dark rounded"/></div></div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-text-main/50"><div className="text-5xl mb-4">🍽️</div><p>{t('noResults')}</p></div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div key={activeCategory + search} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((item) => (
                <div key={item.id} className={cn('card group hover:shadow-xl transition-all', !item.is_available && 'opacity-60')}>
                  <div className="relative h-48 bg-bg-dark overflow-hidden">
                    {item.image_url ? <img src={item.image_url} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"/> : <div className="w-full h-full flex items-center justify-center text-5xl">🍽️</div>}
                    {item.is_popular && <span className="absolute top-2 left-2 bg-accent text-white text-xs px-2 py-1 rounded-full">⭐ {t('popular')}</span>}
                    {!item.is_available && <div className="absolute inset-0 bg-black/40 flex items-center justify-center"><span className="text-white text-sm font-medium bg-black/50 px-3 py-1 rounded">{t('unavailable')}</span></div>}
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-primary text-lg mb-1">{item.name}</h3>
                    <p className="text-text-main/70 text-sm mb-3 line-clamp-2">{item.description}</p>
                    <span className="text-accent font-bold text-lg">{formatPrice(item.price)} {t('currency')}</span>
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
