'use client';
import { useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { ArrowLeft, Trash2, Plus } from 'lucide-react';
import Link from 'next/link';
import { api } from '@/lib/api';
import Button from '@/components/ui/Button';

interface GalleryItem { _id: string; url: string; category: string; title?: string; }

export default function AdminGalleryPage() {
  const t = useTranslations('admin');
  const locale = useLocale();
  const router = useRouter();
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);
  const [newUrl, setNewUrl] = useState('');
  const [newCat, setNewCat] = useState('food');

  useEffect(() => {
    const stored = localStorage.getItem('admin_token');
    if (!stored) { router.push(`/${locale}/admin/login`); return; }
    setToken(stored);
    api.get('/api/admin/gallery', { headers: { Authorization: `Bearer ${stored}` } })
      .then((r: { data: { data: GalleryItem[] } }) => setItems(r.data.data || [])).catch(() => {}).finally(() => setLoading(false));
  }, [locale, router]);

  const handleDelete = async (id: string) => {
    if (!token) return;
    try {
      await api.delete(`/api/admin/gallery/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      setItems((prev) => prev.filter((i) => i._id !== id));
      toast.success('Deleted');
    } catch { toast.error('Failed'); }
  };

  const handleAdd = async () => {
    if (!token || !newUrl) return;
    try {
      const r = await api.post('/api/admin/gallery', { url: newUrl, category: newCat }, { headers: { Authorization: `Bearer ${token}` } });
      setItems((prev) => [r.data, ...prev]);
      setNewUrl('');
      toast.success('Added');
    } catch { toast.error('Failed'); }
  };

  return (
    <div className="pt-16 min-h-screen bg-bg">
      <div className="bg-primary py-6 px-4">
        <div className="max-w-7xl mx-auto flex items-center gap-4">
          <Link href={`/${locale}/admin`} className="text-bg/60 hover:text-accent"><ArrowLeft size={20}/></Link>
          <h1 className="text-xl font-bold text-bg">{t('gallery')}</h1>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="bg-white rounded-xl p-4 mb-6 flex gap-3">
          <input value={newUrl} onChange={(e) => setNewUrl(e.target.value)} placeholder="Image URL" className="input-field flex-1"/>
          <select value={newCat} onChange={(e) => setNewCat(e.target.value)} className="input-field w-32">
            {['food','interior','events','team'].map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <Button onClick={handleAdd} variant="accent"><Plus size={16}/></Button>
        </div>
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">{[1,2,3,4].map(i => <div key={i} className="bg-white rounded-xl animate-pulse h-32"/>)}</div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {items.map((item) => (
              <div key={item._id} className="bg-white rounded-xl overflow-hidden shadow-sm">
                <div className="h-32 bg-bg-dark flex items-center justify-center">
                  {item.url ? <img src={item.url} alt={item.title || ''} className="w-full h-full object-cover"/> : <span className="text-4xl">📷</span>}
                </div>
                <div className="p-2 flex items-center justify-between">
                  <span className="text-xs text-text-main/50">{item.category}</span>
                  <button onClick={() => handleDelete(item._id)} className="text-red-400 hover:text-red-600"><Trash2 size={14}/></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
