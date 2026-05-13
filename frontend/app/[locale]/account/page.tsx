'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useLocale, useTranslations } from 'next-intl';
import toast from 'react-hot-toast';
import {
  User, CalendarDays, ShoppingBag, Heart, ShoppingCart, LogOut,
  Phone, Mail, X, Utensils, Trash2, Plus, Minus, CheckCircle,
  DollarSign, Star, MessageSquare, Send,
} from 'lucide-react';
import { useAuth, isStaff } from '@/lib/auth';
import { useCart } from '@/lib/cart';
import { useFavorites } from '@/lib/favorites';
import {
  getMyReservations, cancelMyReservation, getMyOrders, updateProfile,
  getMyKpi, submitFeedback, getMyFeedback,
} from '@/lib/api';
import { formatPrice, formatDate, cn } from '@/lib/utils';

type Tab = 'profile' | 'reservations' | 'orders' | 'favorites' | 'cart' | 'kpi' | 'feedback';

interface Reservation {
  id: number;
  name: string;
  date: string;
  time: string;
  guests: number;
  status: string;
  confirmationCode: string;
  notes?: string | null;
  hall: { name: string };
}

interface OrderItem { menuItemId: string; name: string; price: number; quantity: number; image_url?: string; }
interface Order {
  _id: string;
  createdAt: string;
  status: string;
  total: number;
  address: string;
  items: OrderItem[];
}

interface Favorite {
  id: string;
  name: string;
  name_hy: string;
  price: number;
  image_url?: string;
  is_available: boolean;
}

export default function AccountPage() {
  const t = useTranslations('account');
  const locale = useLocale();
  const router = useRouter();
  const { user, loading: authLoading, logout, refreshUser } = useAuth();
  const cart = useCart();
  const { toggle: toggleFavorite } = useFavorites();
  const [tab, setTab] = useState<Tab>('reservations');

  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loadingTab, setLoadingTab] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) router.push(`/${locale}/login?redirect=/${locale}/account`);
  }, [authLoading, user, router, locale]);

  useEffect(() => {
    if (!user) return;
    setLoadingTab(true);
    const load = async () => {
      try {
        if (tab === 'reservations') {
          const res = await getMyReservations();
          setReservations(res.data || []);
        } else if (tab === 'orders') {
          const res = await getMyOrders();
          setOrders(res.data || []);
        } else if (tab === 'favorites') {
          const { getMyFavorites } = await import('@/lib/api');
          const res = await getMyFavorites(locale);
          setFavorites(res.data || []);
        }
      } catch { /* ignore */ }
      finally { setLoadingTab(false); }
    };
    load();
  }, [tab, user, locale]);

  if (authLoading || !user) {
    return (
      <div className="pt-16 min-h-screen bg-bg flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-accent/30 border-t-accent rounded-full animate-spin" />
      </div>
    );
  }

  const staffMode = isStaff(user.role);
  const tabs: { id: Tab; label: string; Icon: typeof User; show: boolean }[] = [
    { id: 'profile',      label: t('tabs.profile'),      Icon: User,         show: true },
    { id: 'reservations', label: t('tabs.reservations'), Icon: CalendarDays, show: !staffMode },
    { id: 'orders',       label: t('tabs.orders'),       Icon: ShoppingBag,  show: !staffMode },
    { id: 'favorites',    label: t('tabs.favorites'),    Icon: Heart,        show: !staffMode },
    { id: 'cart',         label: t('tabs.cart'),         Icon: ShoppingCart, show: !staffMode },
    { id: 'kpi',          label: t('tabs.kpi'),          Icon: DollarSign,   show: staffMode },
    { id: 'feedback',     label: t('tabs.feedback'),     Icon: MessageSquare, show: !staffMode },
  ];

  const handleCancel = async (id: number) => {
    if (!confirm(t('confirmCancel'))) return;
    try {
      await cancelMyReservation(id);
      setReservations((r) => r.map((x) => x.id === id ? { ...x, status: 'CANCELLED' } : x));
      toast.success(t('cancelled'));
    } catch {
      toast.error(t('error'));
    }
  };

  const handleRemoveFavorite = async (id: string) => {
    try {
      await toggleFavorite(id);
      setFavorites((f) => f.filter((x) => x.id !== id));
    } catch {
      toast.error(t('error'));
    }
  };

  const statusStyle = (s: string) => ({
    PENDING:   'bg-amber-100 text-amber-800',
    CONFIRMED: 'bg-green-100 text-green-800',
    CANCELLED: 'bg-red-100 text-red-800',
    COMPLETED: 'bg-blue-100 text-blue-800',
    PREPARING: 'bg-purple-100 text-purple-800',
    DELIVERED: 'bg-emerald-100 text-emerald-800',
  }[s] || 'bg-gray-100 text-gray-800');

  return (
    <div className="pt-16 min-h-screen bg-bg">
      <div className="bg-primary py-10 sm:py-14 text-center">
        <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold mb-2" style={{ color: '#F5ECD7' }}>
          {t('title')}
        </h1>
        <hr className="section-divider" />
        <p className="text-text-muted-green text-base">{t('hello')}, {user.name}</p>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-6 justify-center md:justify-start">
          {tabs.filter((x) => x.show).map(({ id, label, Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={cn(
                'inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors border',
                tab === id
                  ? 'bg-primary text-accent border-primary'
                  : 'bg-transparent text-primary border-primary/40 hover:bg-primary hover:text-accent'
              )}
            >
              <Icon size={15} />
              {label}
              {id === 'cart' && cart.count > 0 && (
                <span className="bg-accent text-primary text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                  {cart.count}
                </span>
              )}
            </button>
          ))}
        </div>

        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="bg-white rounded-2xl shadow-md p-5 sm:p-8 border border-border"
        >
          {/* PROFILE */}
          {tab === 'profile' && <ProfileTab user={user} onUpdated={refreshUser} onLogout={logout} />}

          {/* RESERVATIONS */}
          {tab === 'reservations' && (
            <div>
              <h2 className="font-display text-2xl font-bold text-primary mb-5 flex items-center gap-2">
                <CalendarDays size={22} className="text-accent" />
                {t('reservationsTitle')} {reservations.length > 0 && <span className="text-text-faint text-base font-normal">({reservations.length})</span>}
              </h2>
              {loadingTab ? <SkeletonList /> : reservations.length === 0 ? (
                <EmptyState
                  icon={CalendarDays}
                  title={t('noReservations')}
                  cta={t('makeReservation')}
                  href={`/${locale}/booking`}
                />
              ) : (
                <ul className="space-y-3">
                  {reservations.map((r) => (
                    <li key={r.id} className="border border-border rounded-lg p-4 hover:shadow-sm transition-shadow">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="font-bold text-primary">
                            {formatDate(r.date, locale)} · {r.time}
                          </p>
                          <p className="text-text-secondary text-sm mt-0.5">
                            {r.guests} {t('guests')} · {r.hall.name}
                          </p>
                          <p className="text-text-faint text-xs mt-1">
                            {t('code')}: <span className="font-mono font-bold text-primary">{r.confirmationCode}</span>
                          </p>
                          {r.notes && <p className="text-text-secondary text-xs mt-2 italic">&ldquo;{r.notes}&rdquo;</p>}
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <span className={cn('px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider', statusStyle(r.status))}>
                            {r.status}
                          </span>
                          {(r.status === 'PENDING' || r.status === 'CONFIRMED') && (
                            <button
                              onClick={() => handleCancel(r.id)}
                              className="text-red-500 hover:text-red-700 text-xs font-semibold inline-flex items-center gap-1"
                            >
                              <X size={12} /> {t('cancel')}
                            </button>
                          )}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {/* ORDERS */}
          {tab === 'orders' && (
            <div>
              <h2 className="font-display text-2xl font-bold text-primary mb-5 flex items-center gap-2">
                <ShoppingBag size={22} className="text-accent" />
                {t('ordersTitle')} {orders.length > 0 && <span className="text-text-faint text-base font-normal">({orders.length})</span>}
              </h2>
              {loadingTab ? <SkeletonList /> : orders.length === 0 ? (
                <EmptyState
                  icon={ShoppingBag}
                  title={t('noOrders')}
                  cta={t('browseMenu')}
                  href={`/${locale}/delivery`}
                />
              ) : (
                <ul className="space-y-4">
                  {orders.map((o) => (
                    <li key={o._id} className="border border-border rounded-lg p-4">
                      <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                        <div>
                          <p className="font-bold text-primary">{formatDate(o.createdAt, locale)}</p>
                          <p className="text-text-faint text-xs mt-0.5">{o.address}</p>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <span className={cn('px-3 py-1 rounded-full text-xs font-semibold uppercase', statusStyle(o.status))}>
                            {o.status}
                          </span>
                          <p className="text-accent font-bold text-lg">{formatPrice(o.total)}</p>
                        </div>
                      </div>
                      <ul className="text-sm text-text-secondary space-y-1 border-t border-border pt-3">
                        {o.items.map((it, i) => (
                          <li key={i} className="flex justify-between">
                            <span>×{it.quantity} {it.name}</span>
                            <span className="text-text-faint">{formatPrice(it.price * it.quantity)}</span>
                          </li>
                        ))}
                      </ul>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {/* FAVORITES */}
          {tab === 'favorites' && (
            <div>
              <h2 className="font-display text-2xl font-bold text-primary mb-5 flex items-center gap-2">
                <Heart size={22} className="text-accent" />
                {t('favoritesTitle')} {favorites.length > 0 && <span className="text-text-faint text-base font-normal">({favorites.length})</span>}
              </h2>
              {loadingTab ? <SkeletonList /> : favorites.length === 0 ? (
                <EmptyState
                  icon={Heart}
                  title={t('noFavorites')}
                  cta={t('browseMenu')}
                  href={`/${locale}/menu`}
                />
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {favorites.map((f) => (
                    <div key={f.id} className="bg-white border border-border rounded-lg p-3 flex gap-3 items-center">
                      <div className="w-16 h-16 bg-green-border rounded-lg overflow-hidden shrink-0 flex items-center justify-center">
                        {f.image_url
                          ? <img src={f.image_url} alt={f.name_hy || f.name} className="w-full h-full object-cover" />
                          : <Utensils size={20} className="text-accent/60" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-primary text-sm truncate">{f.name_hy || f.name}</p>
                        <p className="text-accent font-bold text-sm">{formatPrice(f.price)}</p>
                      </div>
                      <div className="flex flex-col gap-1">
                        <button
                          onClick={() => cart.add({ id: f.id, name: f.name_hy || f.name, price: f.price, image_url: f.image_url })}
                          className="text-xs bg-accent text-primary px-2 py-1 rounded hover:bg-accent-dark transition-colors"
                          title={t('addToCart')}
                        >
                          <Plus size={14} />
                        </button>
                        <button
                          onClick={() => handleRemoveFavorite(f.id)}
                          className="text-xs text-red-500 hover:text-red-700"
                          title={t('removeFavorite')}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* CART */}
          {tab === 'cart' && (
            <div>
              <h2 className="font-display text-2xl font-bold text-primary mb-5 flex items-center gap-2">
                <ShoppingCart size={22} className="text-accent" />
                {t('cartTitle')} {cart.count > 0 && <span className="text-text-faint text-base font-normal">({cart.count})</span>}
              </h2>
              {cart.items.length === 0 ? (
                <EmptyState
                  icon={ShoppingCart}
                  title={t('emptyCart')}
                  cta={t('browseMenu')}
                  href={`/${locale}/delivery`}
                />
              ) : (
                <>
                  <ul className="divide-y divide-border mb-5">
                    {cart.items.map((c) => (
                      <li key={c.id} className="py-3 flex items-center gap-3">
                        <div className="w-14 h-14 bg-green-border rounded-lg overflow-hidden shrink-0 flex items-center justify-center">
                          {c.image_url
                            ? <img src={c.image_url} alt={c.name} className="w-full h-full object-cover" />
                            : <Utensils size={18} className="text-accent/60" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-primary text-sm truncate">{c.name}</p>
                          <p className="text-accent font-bold text-sm">{formatPrice(c.price)}</p>
                        </div>
                        <div className="flex items-center gap-1">
                          <button onClick={() => cart.update(c.id, -1)} className="w-7 h-7 bg-bg-dark rounded-full flex items-center justify-center hover:bg-accent/20 transition-colors"><Minus size={12}/></button>
                          <span className="text-sm font-bold w-6 text-center">{c.quantity}</span>
                          <button onClick={() => cart.update(c.id, 1)} className="w-7 h-7 bg-accent rounded-full flex items-center justify-center text-primary hover:bg-accent-dark transition-colors"><Plus size={12}/></button>
                          <button onClick={() => cart.remove(c.id)} className="text-red-400 hover:text-red-600 ml-2"><Trash2 size={15}/></button>
                        </div>
                      </li>
                    ))}
                  </ul>
                  <div className="flex items-center justify-between pt-3 border-t-2 border-accent/20 mb-5">
                    <span className="font-bold text-primary text-lg">{t('total')}</span>
                    <span className="font-display font-bold text-accent text-2xl">{formatPrice(cart.total)}</span>
                  </div>
                  <Link href={`/${locale}/delivery`} className="btn-gold w-full text-center">
                    {t('checkout')}
                  </Link>
                </>
              )}
            </div>
          )}

          {/* KPI (staff only) */}
          {tab === 'kpi' && <KpiSelfTab />}

          {/* FEEDBACK (customers only) */}
          {tab === 'feedback' && <FeedbackTab />}
        </motion.div>
      </div>
    </div>
  );
}

interface KpiEntry { id: number; type: 'FINE' | 'BONUS'; amount: number; reason: string; createdAt: string; voided: boolean; issuedBy: { name: string; role: string } }
interface KpiData { profile: { position?: string; baseSalary?: number; hiredAt?: string } | null; entries: KpiEntry[]; summary: { baseSalary: number; fines: number; bonuses: number; net: number } }

function KpiSelfTab() {
  const t = useTranslations('account');
  const [data, setData] = useState<KpiData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyKpi().then((res) => setData(res.data)).catch(() => setData(null)).finally(() => setLoading(false));
  }, []);

  if (loading) return <SkeletonList />;
  if (!data) return <p className="text-text-faint text-sm py-4">{t('error')}</p>;

  return (
    <div>
      <h2 className="font-display text-2xl font-bold text-primary mb-5 flex items-center gap-2">
        <DollarSign size={22} className="text-accent" />{t('kpiTitle')}
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <div className="rounded-lg p-3 border border-border bg-bg">
          <p className="text-xs text-text-faint uppercase tracking-wider mb-1">{t('baseSalary')}</p>
          <p className="font-display font-bold text-xl text-primary">{formatPrice(data.summary.baseSalary)}</p>
        </div>
        <div className="rounded-lg p-3 border border-border bg-bg">
          <p className="text-xs text-text-faint uppercase tracking-wider mb-1">{t('bonuses')}</p>
          <p className="font-display font-bold text-xl text-green-600">+{formatPrice(data.summary.bonuses)}</p>
        </div>
        <div className="rounded-lg p-3 border border-border bg-bg">
          <p className="text-xs text-text-faint uppercase tracking-wider mb-1">{t('fines')}</p>
          <p className="font-display font-bold text-xl text-red-600">−{formatPrice(data.summary.fines)}</p>
        </div>
        <div className="rounded-lg p-3 border border-accent bg-accent/5">
          <p className="text-xs text-text-faint uppercase tracking-wider mb-1">{t('netPay')}</p>
          <p className="font-display font-bold text-xl text-accent">{formatPrice(data.summary.net)}</p>
        </div>
      </div>

      <h3 className="font-semibold text-primary mb-2">{t('history')} ({data.entries.length})</h3>
      {data.entries.length === 0 ? (
        <p className="text-text-faint text-sm py-4">{t('noKpiEntries')}</p>
      ) : (
        <ul className="space-y-2">
          {data.entries.map((e) => (
            <li key={e.id} className={cn('border rounded-lg p-3 flex items-center gap-3', e.voided && 'opacity-50 line-through')}>
              <div className={cn('w-2 h-2 rounded-full', e.type === 'BONUS' ? 'bg-green-500' : 'bg-red-500')} />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-primary">
                  {e.type === 'BONUS' ? '+' : '−'}{formatPrice(e.amount)} — {e.reason}
                </p>
                <p className="text-xs text-text-faint">
                  {t('issuedBy')} {e.issuedBy.name} ({e.issuedBy.role}) · {new Date(e.createdAt).toLocaleDateString()}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

interface UserFeedback { id: number; rating: number; text: string; approved: boolean; createdAt: string }

function FeedbackTab() {
  const t = useTranslations('account');
  const [rating, setRating] = useState(5);
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const [mine, setMine] = useState<UserFeedback[]>([]);

  const load = () => getMyFeedback().then((r) => setMine(r.data || [])).catch(() => {});
  useEffect(() => { load(); }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (text.length < 5) { toast.error(t('feedbackTooShort')); return; }
    setBusy(true);
    try {
      await submitFeedback(rating, text);
      toast.success(t('feedbackSent'));
      setText(''); setRating(5);
      load();
    } catch {
      toast.error(t('error'));
    } finally { setBusy(false); }
  };

  return (
    <div>
      <h2 className="font-display text-2xl font-bold text-primary mb-5 flex items-center gap-2">
        <MessageSquare size={22} className="text-accent" />{t('feedbackTitle')}
      </h2>

      <form onSubmit={submit} className="border border-border rounded-lg p-4 mb-6">
        <p className="text-sm text-text-secondary mb-3">{t('feedbackPrompt')}</p>
        <div className="flex items-center gap-1 mb-3">
          {[1, 2, 3, 4, 5].map((n) => (
            <button key={n} type="button" onClick={() => setRating(n)}>
              <Star size={28} className={n <= rating ? 'text-accent' : 'text-text-faint/30'} fill={n <= rating ? 'currentColor' : 'none'} />
            </button>
          ))}
        </div>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          minLength={5}
          maxLength={1000}
          rows={4}
          placeholder={t('feedbackPlaceholder')}
          className="input-field resize-none mb-3"
        />
        <button type="submit" disabled={busy} className="btn-primary inline-flex items-center gap-2 disabled:opacity-60">
          <Send size={16} /> {busy ? '…' : t('sendFeedback')}
        </button>
      </form>

      <h3 className="font-semibold text-primary mb-2">{t('myFeedback')}</h3>
      {mine.length === 0 ? (
        <p className="text-text-faint text-sm py-4">{t('noFeedbackYet')}</p>
      ) : (
        <ul className="space-y-2">
          {mine.map((f) => (
            <li key={f.id} className="border border-border rounded-lg p-3">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} size={13} className={i < f.rating ? 'text-accent' : 'text-text-faint/30'} fill={i < f.rating ? 'currentColor' : 'none'} />
                  ))}
                </div>
                {f.approved ? (
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-semibold">{t('approved')}</span>
                ) : (
                  <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-semibold">{t('pending')}</span>
                )}
              </div>
              <p className="text-sm text-text-dark">{f.text}</p>
              <p className="text-xs text-text-faint mt-1">{new Date(f.createdAt).toLocaleDateString()}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function SkeletonList() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map((i) => <div key={i} className="h-24 bg-bg-dark rounded-lg animate-pulse" />)}
    </div>
  );
}

function EmptyState({ icon: Icon, title, cta, href }: { icon: typeof User; title: string; cta: string; href: string }) {
  return (
    <div className="text-center py-12">
      <Icon size={42} className="mx-auto text-accent/40 mb-3" />
      <p className="text-text-secondary mb-4">{title}</p>
      <Link href={href} className="btn-primary inline-flex">{cta}</Link>
    </div>
  );
}

interface ProfileTabProps {
  user: { id: number; email: string; name: string; phone?: string | null };
  onUpdated: () => Promise<void>;
  onLogout: () => void;
}

function ProfileTab({ user, onUpdated, onLogout }: ProfileTabProps) {
  const t = useTranslations('account');
  const [form, setForm] = useState({ name: user.name, phone: user.phone || '', password: '' });
  const [saving, setSaving] = useState(false);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const data: { name: string; phone: string; password?: string } = { name: form.name, phone: form.phone };
      if (form.password) data.password = form.password;
      await updateProfile(data);
      await onUpdated();
      setForm({ ...form, password: '' });
      toast.success(t('profileSaved'));
    } catch {
      toast.error(t('error'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <h2 className="font-display text-2xl font-bold text-primary mb-5 flex items-center gap-2">
        <User size={22} className="text-accent" />
        {t('profileTitle')}
      </h2>

      <div className="grid sm:grid-cols-2 gap-3 mb-6">
        <div className="bg-bg rounded-lg p-3 border border-border flex items-center gap-3">
          <Mail size={18} className="text-accent shrink-0" />
          <div className="min-w-0">
            <p className="text-text-faint text-xs uppercase tracking-wider">{t('email')}</p>
            <p className="text-text-dark text-sm truncate">{user.email}</p>
          </div>
        </div>
        <div className="bg-bg rounded-lg p-3 border border-border flex items-center gap-3">
          <Phone size={18} className="text-accent shrink-0" />
          <div className="min-w-0">
            <p className="text-text-faint text-xs uppercase tracking-wider">{t('phone')}</p>
            <p className="text-text-dark text-sm truncate">{user.phone || '—'}</p>
          </div>
        </div>
      </div>

      <form onSubmit={save} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-text-dark mb-1">{t('name')}</label>
          <input
            type="text" minLength={2} required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="input-field"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-text-dark mb-1">{t('phone')}</label>
          <input
            type="tel"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            className="input-field"
            placeholder="095 711-700"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-text-dark mb-1">{t('newPassword')} <span className="text-text-faint text-xs">({t('optional')})</span></label>
          <input
            type="password" minLength={6}
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="input-field"
          />
        </div>
        <button type="submit" disabled={saving} className="btn-primary inline-flex items-center gap-2 disabled:opacity-60">
          <CheckCircle size={16} />
          {saving ? '…' : t('saveProfile')}
        </button>
      </form>

      <hr className="my-8 border-border" />
      <button
        onClick={onLogout}
        className="inline-flex items-center gap-2 text-red-600 hover:text-red-800 font-semibold"
      >
        <LogOut size={16} />
        {t('logout')}
      </button>
    </div>
  );
}
