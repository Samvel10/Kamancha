'use client';
import { useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { ArrowLeft, Trash2, Plus } from 'lucide-react';
import Link from 'next/link';
import { api } from '@/lib/api';
import Button from '@/components/ui/Button';

interface Event { _id: string; title: Record<string,string>; date: string; time: string; type: string; }

export default function AdminEventsPage() {
  const t = useTranslations('admin');
  const locale = useLocale();
  const router = useRouter();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);
  const [form, setForm] = useState({ titleEn: '', date: '', time: '20:00', type: 'music' });

  useEffect(() => {
    const stored = localStorage.getItem('admin_token');
    if (!stored) { router.push(`/${locale}/admin/login`); return; }
    setToken(stored);
    api.get('/api/admin/events', { headers: { Authorization: `Bearer ${stored}` } })
      .then((r: { data: { data: Event[] } }) => setEvents(r.data.data || [])).catch(() => {}).finally(() => setLoading(false));
  }, [locale, router]);

  const handleDelete = async (id: string) => {
    if (!token) return;
    try {
      await api.delete(`/api/admin/events/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      setEvents((prev) => prev.filter((e) => e._id !== id));
      toast.success('Deleted');
    } catch { toast.error('Failed'); }
  };

  const handleAdd = async () => {
    if (!token || !form.titleEn || !form.date) return;
    try {
      const r = await api.post('/api/admin/events', {
        title: { en: form.titleEn, hy: form.titleEn },
        description: { en: '' },
        date: form.date, time: form.time, type: form.type,
      }, { headers: { Authorization: `Bearer ${token}` } });
      setEvents((prev) => [r.data, ...prev]);
      setForm({ titleEn: '', date: '', time: '20:00', type: 'music' });
      toast.success('Added');
    } catch { toast.error('Failed'); }
  };

  return (
    <div className="pt-16 min-h-screen bg-bg">
      <div className="bg-primary py-6 px-4">
        <div className="max-w-7xl mx-auto flex items-center gap-4">
          <Link href={`/${locale}/admin`} className="text-bg/60 hover:text-accent"><ArrowLeft size={20}/></Link>
          <h1 className="text-xl font-bold text-bg">{t('events')}</h1>
        </div>
      </div>
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="bg-white rounded-xl p-4 mb-6 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <input value={form.titleEn} onChange={(e) => setForm({...form, titleEn: e.target.value})} placeholder="Title (EN)" className="input-field col-span-2"/>
            <input type="date" value={form.date} onChange={(e) => setForm({...form, date: e.target.value})} className="input-field"/>
            <input type="time" value={form.time} onChange={(e) => setForm({...form, time: e.target.value})} className="input-field"/>
          </div>
          <div className="flex gap-3">
            <select value={form.type} onChange={(e) => setForm({...form, type: e.target.value})} className="input-field flex-1">
              {['music','special','holiday','other'].map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            <Button onClick={handleAdd} variant="accent"><Plus size={16}/> Add</Button>
          </div>
        </div>
        {loading ? (
          <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="bg-white rounded-xl p-4 animate-pulse h-16"/>)}</div>
        ) : (
          <div className="space-y-3">
            {events.map((event) => (
              <div key={event._id} className="bg-white rounded-xl shadow-sm p-4 flex items-center justify-between hover:shadow-md transition-shadow">
                <div>
                  <p className="font-semibold text-primary">{event.title?.en || ''}</p>
                  <p className="text-sm text-text-main/50">{event.date?.split('T')[0]} · {event.time} · {event.type}</p>
                </div>
                <button onClick={() => handleDelete(event._id)} className="text-red-400 hover:text-red-600 p-2 rounded-lg hover:bg-red-50 transition-colors"><Trash2 size={18}/></button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
