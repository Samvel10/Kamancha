'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTranslations, useLocale } from 'next-intl';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { getMenu, createOrder } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { useCart } from '@/lib/cart';
import { formatPrice } from '@/lib/utils';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { ShoppingCart, Plus, Minus, Trash2, LogIn } from 'lucide-react';

interface MenuItem { id: string; name: string; description: string; price: number; category: string; image_url?: string; is_available: boolean; }

const schema = z.object({
  name: z.string().min(2),
  phone: z.string().min(9),
  address: z.string().min(5),
  notes: z.string().optional(),
});
type FormData = z.infer<typeof schema>;

export default function DeliveryPage() {
  const t = useTranslations('delivery');
  const locale = useLocale();
  const { user } = useAuth();
  const cart = useCart();
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [orderDone, setOrderDone] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { name: user?.name || '', phone: user?.phone || '', address: '' },
  });

  useEffect(() => {
    if (user) {
      setValue('name', user.name);
      if (user.phone) setValue('phone', user.phone);
    }
  }, [user, setValue]);

  useEffect(() => {
    getMenu(locale)
      .then((data) => setItems((data.data || []).filter((i: MenuItem) => i.is_available)))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [locale]);

  const MIN_ORDER = 5000;

  const onSubmit = async (data: FormData) => {
    if (cart.total < MIN_ORDER) { toast.error(t('minOrder')); return; }
    if (!user) { toast.error(t('loginRequired')); return; }
    setSubmitting(true);
    try {
      const res = await createOrder({
        name: data.name,
        phone: data.phone,
        address: data.address,
        notes: data.notes,
        items: cart.items,
      });
      setOrderDone(res.data?._id || 'ok');
      cart.clear();
      reset();
      toast.success(t('orderSuccess'));
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      toast.error(msg || t('error'));
    } finally {
      setSubmitting(false);
    }
  };

  if (orderDone) {
    return (
      <div className="pt-16 min-h-screen bg-bg flex items-center justify-center px-4">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-2xl shadow-xl p-10 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-accent text-2xl font-bold">✓</span>
          </div>
          <h2 className="text-2xl font-bold text-primary mb-3">{t('orderSuccess')}</h2>
          <p className="text-text-secondary text-sm mb-5">{t('orderTrack')}</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href={`/${locale}/account`} className="btn-gold flex-1 text-center">{t('viewOrders')}</Link>
            <Button onClick={() => setOrderDone(null)} variant="outline" className="flex-1">{t('orderMore')}</Button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="pt-16 min-h-screen bg-bg">
      <div className="bg-primary py-16 text-center">
        <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold mb-3" style={{ color: '#F5ECD7' }}>{t('title')}</h1>
        <hr className="section-divider" />
        <p className="text-text-muted-green text-base">{t('subtitle')}</p>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Array.from({ length: 6 }).map((_, i) => <div key={i} className="bg-white rounded-lg border border-border animate-pulse h-32"/>)}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {items.map((item) => {
                  const cartItem = cart.items.find((c) => c.id === item.id);
                  return (
                    <div key={item.id} className="bg-white rounded-lg border border-border p-4 flex items-center gap-4 hover:shadow-md transition-shadow">
                      <div className="w-16 h-16 bg-green-border rounded-lg flex items-center justify-center text-2xl shrink-0 overflow-hidden">
                        {item.image_url
                          ? <img src={item.image_url} alt={item.name} className="w-full h-full object-cover rounded-lg"/>
                          : <span className="text-accent/40 text-xs">img</span>}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-primary text-sm truncate">{item.name}</h3>
                        <p className="text-accent font-bold text-sm">{formatPrice(item.price)}</p>
                      </div>
                      {cartItem ? (
                        <div className="flex items-center gap-2">
                          <button onClick={() => cart.update(item.id, -1)} className="w-7 h-7 bg-bg-dark rounded-full flex items-center justify-center hover:bg-accent/20 transition-colors"><Minus size={12}/></button>
                          <span className="text-sm font-bold w-4 text-center">{cartItem.quantity}</span>
                          <button onClick={() => cart.update(item.id, 1)} className="w-7 h-7 bg-accent rounded-full flex items-center justify-center text-primary hover:bg-accent-dark transition-colors"><Plus size={12}/></button>
                        </div>
                      ) : (
                        <button
                          onClick={() => cart.add({ id: item.id, name: item.name, price: item.price, image_url: item.image_url })}
                          className="bg-accent text-primary text-xs px-3 py-2 rounded-md hover:bg-accent-dark transition-colors"
                        >
                          <Plus size={14}/>
                        </button>
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
                {cart.count > 0 && <span className="bg-accent text-primary text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">{cart.count}</span>}
              </h2>
              {cart.items.length === 0 ? (
                <p className="text-text-dark/50 text-sm text-center py-4">{t('cartEmpty')}</p>
              ) : (
                <>
                  <div className="space-y-3 mb-4">
                    {cart.items.map((item) => (
                      <div key={item.id} className="flex items-center justify-between text-sm">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-text-dark truncate">{item.name}</p>
                          <p className="text-text-dark/50 text-xs">×{item.quantity}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-accent font-bold">{formatPrice(item.price * item.quantity)}</span>
                          <button onClick={() => cart.remove(item.id)} className="text-red-400 hover:text-red-600"><Trash2 size={14}/></button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="border-t border-bg-dark pt-3">
                    <div className="flex justify-between font-bold text-primary">
                      <span>{t('total')}</span>
                      <span>{formatPrice(cart.total)}</span>
                    </div>
                    {cart.total < MIN_ORDER && <p className="text-red-500 text-xs mt-1">{t('minOrder')}</p>}
                  </div>
                </>
              )}
            </div>

            {cart.items.length > 0 && (
              !user ? (
                <div className="bg-primary-deeper border border-green-border rounded-2xl shadow-md p-6 text-center">
                  <LogIn size={28} className="mx-auto text-accent mb-3" />
                  <p className="text-text-on-green mb-4">{t('loginToOrder')}</p>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Link href={`/${locale}/login?redirect=/${locale}/delivery`} className="btn-gold flex-1 text-center">{t('login')}</Link>
                    <Link href={`/${locale}/register?redirect=/${locale}/delivery`} className="btn-outline-gold flex-1 text-center">{t('register')}</Link>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-2xl shadow-md p-6 space-y-4">
                  <h3 className="font-bold text-primary">{t('address')}</h3>
                  <Input label={t('form.name')} error={errors.name?.message} {...register('name')}/>
                  <Input label={t('form.phone')} type="tel" error={errors.phone?.message} {...register('phone')}/>
                  <Input label={t('form.address')} placeholder={t('addressPlaceholder')} error={errors.address?.message} {...register('address')}/>
                  <div>
                    <label className="block text-sm font-medium text-text-dark mb-1">{t('form.notes')}</label>
                    <textarea {...register('notes')} rows={2} className="input-field resize-none" />
                  </div>
                  <Button type="submit" variant="accent" size="lg" loading={submitting} className="w-full">{t('form.submit')}</Button>
                </form>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
