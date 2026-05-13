'use client';
import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useTranslations, useLocale } from 'next-intl';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { getMenu } from '@/lib/api';
import { formatPrice } from '@/lib/utils';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { ShoppingCart, Plus, Minus, Trash2 } from 'lucide-react';

interface MenuItem { id: string; name: string; description: string; price: number; category: string; image_url?: string; is_available: boolean; }
interface CartItem extends MenuItem { quantity: number; }

const schema = z.object({
  name: z.string().min(2),
  phone: z.string().min(9),
  address: z.string().min(5),
});
type FormData = z.infer<typeof schema>;

export default function DeliveryPage() {
  const t = useTranslations('delivery');
  const locale = useLocale();
  const [items, setItems] = useState<MenuItem[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [orderDone, setOrderDone] = useState(false);

  const { register, handleSubmit, formState: { errors }, reset } = useForm<FormData>({ resolver: zodResolver(schema) });

  useEffect(() => {
    getMenu(locale).then((data) => setItems((data.data || []).filter((i: MenuItem) => i.is_available))).catch(() => {}).finally(() => setLoading(false));
  }, [locale]);

  const addToCart = (item: MenuItem) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.id === item.id);
      if (existing) return prev.map((c) => c.id === item.id ? { ...c, quantity: c.quantity + 1 } : c);
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const updateQty = (id: string, delta: number) => {
    setCart((prev) => prev.map((c) => c.id === id ? { ...c, quantity: Math.max(0, c.quantity + delta) } : c).filter((c) => c.quantity > 0));
  };

  const total = cart.reduce((s, c) => s + c.price * c.quantity, 0);
  const MIN_ORDER = 5000;

  const onSubmit = async (data: FormData) => {
    if (total < MIN_ORDER) { toast.error(t('minOrder')); return; }
    setSubmitting(true);
    await new Promise(r => setTimeout(r, 1000));
    setOrderDone(true);
    setCart([]);
    reset();
    setSubmitting(false);
    toast.success(t('orderSuccess'));
  };

  if (orderDone) {
    return (
      <div className="pt-16 min-h-screen bg-bg flex items-center justify-center">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-2xl shadow-xl p-10 max-w-md w-full text-center">
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-2xl font-bold text-primary mb-3">{t('orderSuccess')}</h2>
          <Button onClick={() => setOrderDone(false)} variant="accent" className="mt-4">{t('title')}</Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="pt-16 min-h-screen bg-bg">
      <div className="bg-primary py-16 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-bg mb-3">{t('title')}</h1>
        <p className="text-accent text-lg">{t('subtitle')}</p>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Array.from({ length: 6 }).map((_, i) => <div key={i} className="card animate-pulse h-32"/>)}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {items.map((item) => {
                  const cartItem = cart.find((c) => c.id === item.id);
                  return (
                    <div key={item.id} className="card p-4 flex items-center gap-4 hover:shadow-md transition-shadow">
                      <div className="w-16 h-16 bg-bg-dark rounded-lg flex items-center justify-center text-2xl shrink-0">
                        {item.image_url ? <img src={item.image_url} alt={item.name} className="w-full h-full object-cover rounded-lg"/> : '🍽️'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-primary text-sm truncate">{item.name}</h3>
                        <p className="text-accent font-bold text-sm">{formatPrice(item.price)}</p>
                      </div>
                      {cartItem ? (
                        <div className="flex items-center gap-2">
                          <button onClick={() => updateQty(item.id, -1)} className="w-7 h-7 bg-bg-dark rounded-full flex items-center justify-center hover:bg-accent/20 transition-colors"><Minus size={12}/></button>
                          <span className="text-sm font-bold w-4 text-center">{cartItem.quantity}</span>
                          <button onClick={() => updateQty(item.id, 1)} className="w-7 h-7 bg-accent rounded-full flex items-center justify-center text-white hover:bg-accent-light transition-colors"><Plus size={12}/></button>
                        </div>
                      ) : (
                        <button onClick={() => addToCart(item)} className="btn-accent text-xs px-3 py-2"><Plus size={14}/></button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-md p-6">
              <h2 className="font-bold text-primary text-xl mb-4 flex items-center gap-2">
                <ShoppingCart size={20}/>{t('cart')}
                {cart.length > 0 && <span className="bg-accent text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">{cart.length}</span>}
              </h2>
              {cart.length === 0 ? (
                <p className="text-text-main/50 text-sm text-center py-4">{t('cartEmpty')}</p>
              ) : (
                <>
                  <div className="space-y-3 mb-4">
                    {cart.map((item) => (
                      <div key={item.id} className="flex items-center justify-between text-sm">
                        <div className="flex-1">
                          <p className="font-medium text-text-main truncate">{item.name}</p>
                          <p className="text-text-main/50 text-xs">×{item.quantity}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-accent font-bold">{formatPrice(item.price * item.quantity)}</span>
                          <button onClick={() => updateQty(item.id, -item.quantity)} className="text-red-400 hover:text-red-600"><Trash2 size={14}/></button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="border-t border-bg-dark pt-3">
                    <div className="flex justify-between font-bold text-primary">
                      <span>{t('total')}</span>
                      <span>{formatPrice(total)}</span>
                    </div>
                    {total < MIN_ORDER && <p className="text-red-500 text-xs mt-1">{t('minOrder')}</p>}
                  </div>
                </>
              )}
            </div>

            {cart.length > 0 && (
              <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-2xl shadow-md p-6 space-y-4">
                <h3 className="font-bold text-primary">{t('address')}</h3>
                <Input label={t('form.name')} error={errors.name?.message} {...register('name')}/>
                <Input label={t('form.phone')} type="tel" error={errors.phone?.message} {...register('phone')}/>
                <Input label={t('form.address')} placeholder={t('addressPlaceholder')} error={errors.address?.message} {...register('address')}/>
                <Button type="submit" variant="accent" size="lg" loading={submitting} className="w-full">{t('form.submit')}</Button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
