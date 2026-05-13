'use client';
import { useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import { getAdminReservations, updateReservationStatus } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface Reservation {
  id: number; name: string; phone: string; email: string;
  date: string; time: string; guests: number; status: string;
  confirmationCode: string; notes?: string;
  hall?: { name: string };
}

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  CONFIRMED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-red-100 text-red-800',
  COMPLETED: 'bg-gray-100 text-gray-600',
};

export default function AdminReservationsPage() {
  const t = useTranslations('admin');
  const locale = useLocale();
  const router = useRouter();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('admin_token');
    if (!stored) { router.push(`/${locale}/admin/login`); return; }
    setToken(stored);
  }, [locale, router]);

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    getAdminReservations(token, filterStatus || undefined).then((data) => {
      setReservations(data.data || []);
      setTotal(data.total || 0);
    }).catch(() => {}).finally(() => setLoading(false));
  }, [token, filterStatus]);

  const updateStatus = async (id: number, status: string) => {
    if (!token) return;
    try {
      await updateReservationStatus(token, id, status);
      setReservations((prev) => prev.map((r) => r.id === id ? { ...r, status } : r));
      toast.success('Status updated');
    } catch { toast.error('Failed'); }
  };

  const STATUSES = ['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED'];

  return (
    <div className="pt-16 min-h-screen bg-bg">
      <div className="bg-primary py-6 px-4">
        <div className="max-w-7xl mx-auto flex items-center gap-4">
          <Link href={`/${locale}/admin`} className="text-bg/60 hover:text-accent"><ArrowLeft size={20}/></Link>
          <h1 className="text-xl font-bold text-bg">{t('reservations')} ({total})</h1>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex flex-wrap gap-2 mb-6">
          <button onClick={() => setFilterStatus('')} className={cn('px-3 py-1 rounded-full text-xs font-medium', !filterStatus ? 'bg-primary text-bg' : 'bg-white border border-bg-dark text-text-main')}>All</button>
          {STATUSES.map((s) => (
            <button key={s} onClick={() => setFilterStatus(s)} className={cn('px-3 py-1 rounded-full text-xs font-medium', filterStatus === s ? 'bg-primary text-bg' : 'bg-white border border-bg-dark text-text-main')}>
              {t(`status.${s}`)}
            </button>
          ))}
        </div>
        {loading ? (
          <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="bg-white rounded-xl p-4 animate-pulse h-20"/>)}</div>
        ) : (
          <div className="space-y-3">
            {reservations.map((r) => (
              <div key={r.id} className="bg-white rounded-xl shadow-sm p-4 hover:shadow-md transition-shadow">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <span className="font-bold text-primary">{r.name}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[r.status] || ''}`}>{t(`status.${r.status}`)}</span>
                      <span className="text-xs text-text-main/40 font-mono">{r.confirmationCode}</span>
                    </div>
                    <div className="text-sm text-text-main/60 space-x-3">
                      <span>{formatDate(r.date, locale)}</span>
                      <span>{r.time}</span>
                      <span>{r.guests} guests</span>
                      <span>{r.hall?.name}</span>
                    </div>
                    <div className="text-xs text-text-main/40 mt-1">{r.phone} · {r.email}</div>
                    {r.notes && <div className="text-xs text-text-main/50 mt-1 italic">{r.notes}</div>}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {r.status === 'PENDING' && (
                      <>
                        <button onClick={() => updateStatus(r.id, 'CONFIRMED')} className="text-xs px-3 py-1 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors">{t('actions.confirm')}</button>
                        <button onClick={() => updateStatus(r.id, 'CANCELLED')} className="text-xs px-3 py-1 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors">{t('actions.cancel')}</button>
                      </>
                    )}
                    {r.status === 'CONFIRMED' && (
                      <button onClick={() => updateStatus(r.id, 'COMPLETED')} className="text-xs px-3 py-1 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">{t('actions.complete')}</button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
