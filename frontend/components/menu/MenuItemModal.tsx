'use client';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Utensils, Star, Tag } from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';
import Link from 'next/link';
import { getMenuItem } from '@/lib/api';
import { formatPrice } from '@/lib/utils';

interface ItemDetail {
  id: string;
  name: string;
  name_hy: string;
  name_en: string;
  name_ru: string;
  description: string;
  description_hy: string;
  description_en: string;
  price: number;
  category: string;
  image_url?: string;
  is_available: boolean;
  is_popular: boolean;
  tags: string[];
}

export default function MenuItemModal({
  itemId,
  onClose,
}: {
  itemId: string | null;
  onClose: () => void;
}) {
  const t = useTranslations('menu');
  const common = useTranslations('common');
  const locale = useLocale();
  const [item, setItem] = useState<ItemDetail | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!itemId) {
      setItem(null);
      return;
    }
    setLoading(true);
    getMenuItem(itemId, locale)
      .then((res) => setItem(res.data))
      .catch(() => setItem(null))
      .finally(() => setLoading(false));
  }, [itemId, locale]);

  useEffect(() => {
    if (itemId) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [itemId]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <AnimatePresence>
      {itemId && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] flex items-center justify-center p-4"
        >
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.22 }}
            className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <button
              onClick={onClose}
              aria-label="Close"
              className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full bg-white/90 hover:bg-white text-primary flex items-center justify-center shadow-md transition-colors"
            >
              <X size={20} />
            </button>

            {loading ? (
              <div className="p-10 text-center text-text-secondary">
                <div className="w-12 h-12 border-4 border-accent/30 border-t-accent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-sm">{common('loading')}…</p>
              </div>
            ) : !item ? (
              <div className="p-10 text-center text-text-secondary">
                <p>{t('noResults')}</p>
              </div>
            ) : (
              <>
                <div
                  className="bg-green-border flex items-center justify-center overflow-hidden rounded-t-2xl"
                  style={{ height: '260px' }}
                >
                  {item.image_url ? (
                    <img
                      src={item.image_url}
                      alt={item.name_hy || item.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Utensils size={64} className="text-accent/60" />
                  )}
                </div>

                <div className="p-6 sm:p-8">
                  {item.is_popular && (
                    <div className="inline-flex items-center gap-1 bg-accent/15 text-accent text-xs font-semibold uppercase tracking-wider px-3 py-1 rounded-full mb-3">
                      <Star size={12} fill="currentColor" />
                      {t('popular')}
                    </div>
                  )}

                  <h2 className="font-display text-2xl sm:text-3xl font-bold text-primary leading-tight mb-1">
                    {item.name_hy || item.name}
                  </h2>
                  {locale !== 'hy' && item.name && item.name !== item.name_hy && (
                    <p className="text-text-secondary text-base mb-1">{item.name}</p>
                  )}
                  {locale !== 'en' && locale !== 'hy' && item.name_en && (
                    <p className="text-text-faint text-sm">{item.name_en}</p>
                  )}

                  <div className="flex items-center gap-3 mt-4 mb-5">
                    <span className="text-accent font-display font-bold text-2xl">
                      {formatPrice(item.price)}
                    </span>
                    <span className="text-text-faint text-xs uppercase tracking-wider border border-border rounded-full px-3 py-1">
                      {item.category}
                    </span>
                  </div>

                  {item.description && (
                    <p className="text-text-secondary leading-relaxed mb-4">
                      {item.description}
                    </p>
                  )}

                  {locale !== 'hy' && item.description_hy && item.description_hy !== item.description && (
                    <p className="text-text-faint text-sm italic leading-relaxed mb-4 border-l-2 border-accent/40 pl-3">
                      {item.description_hy}
                    </p>
                  )}

                  {item.tags && item.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-5">
                      {item.tags.map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center gap-1 text-xs text-text-secondary bg-bg-dark px-2.5 py-1 rounded-full"
                        >
                          <Tag size={11} />
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {!item.is_available && (
                    <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-md p-3 mb-5">
                      {t('unavailable')}
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row gap-3 pt-3 border-t border-border">
                    <Link
                      href={`/${locale}/delivery`}
                      onClick={onClose}
                      className="btn-gold flex-1 text-center"
                    >
                      {common('orderNow') || 'Order'}
                    </Link>
                    <Link
                      href={`/${locale}/booking`}
                      onClick={onClose}
                      className="btn-outline-gold flex-1 text-center"
                    >
                      {common('bookTable')}
                    </Link>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
