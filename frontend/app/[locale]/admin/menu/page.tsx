'use client';
import { useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import { getMenu, deleteMenuItem, addMenuItem } from '@/lib/api';
import { formatPrice } from '@/lib/utils';
import toast from 'react-hot-toast';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import { useForm } from 'react-hook-form';

interface MenuItem { id: string; name: string; description: string; price: number; category: string; is_available: boolean; }

export default function AdminMenuPage() {
  const t = useTranslations('admin');
  const locale = useLocale();
  const router = useRouter();
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const { register, handleSubmit, reset } = useForm<{ name: string; price: number; category: string }>();

  useEffect(() => {
    const stored = localStorage.getItem('admin_token');
    if (!stored) { router.push(`/${locale}/admin/login`); return; }
    setToken(stored);
    getMenu('en', undefined).then((data) => setItems(data.data || [])).catch(() => {}).finally(() => setLoading(false));
  }, [locale, router]);

  const handleDelete = async (id: string) => {
    if (!token || !confirm('Delete?')) return;
    try {
      await deleteMenuItem(token, id);
      setItems((prev) => prev.filter((i) => i.id !== id));
      toast.success('Deleted');
    } catch { toast.error('Failed'); }
  };

  const onAddItem = async (data: { name: string; price: number; category: string }) => {
    if (!token) return;
    try {
      await addMenuItem(token, { name: { en: data.name }, description: { en: '' }, price: Number(data.price), category: data.category });
      toast.success('Added');
      setModalOpen(false);
      reset();
      getMenu('en').then((d) => setItems(d.data || []));
    } catch { toast.error('Failed'); }
  };

  return (
    <div className="pt-16 min-h-screen bg-bg">
      <div className="bg-primary py-6 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href={`/${locale}/admin`} className="text-bg/60 hover:text-accent"><ArrowLeft size={20}/></Link>
            <h1 className="text-xl font-bold text-bg">{t('menu')}</h1>
          </div>
          <Button onClick={() => setModalOpen(true)} variant="accent" size="sm">
            <Plus size={16} className="mr-1"/>{t('actions.add')}
          </Button>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 py-6">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1,2,3,4,5,6].map(i => <div key={i} className="bg-white rounded-xl p-4 animate-pulse h-24"/>)}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((item) => (
              <div key={item.id} className="bg-white rounded-xl shadow-sm p-4 flex justify-between items-center hover:shadow-md transition-shadow">
                <div>
                  <h3 className="font-semibold text-primary">{item.name}</h3>
                  <p className="text-xs text-text-main/50 mt-0.5">{item.category}</p>
                  <p className="text-accent font-bold text-sm mt-1">{formatPrice(item.price)}</p>
                </div>
                <button onClick={() => handleDelete(item.id)} className="text-red-400 hover:text-red-600 p-2 rounded-lg hover:bg-red-50 transition-colors">
                  <Trash2 size={18}/>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={t('actions.add')}>
        <form onSubmit={handleSubmit(onAddItem)} className="space-y-4">
          <Input label="Name (EN)" {...register('name', { required: true })}/>
          <Input label="Price (AMD)" type="number" {...register('price', { required: true })}/>
          <div>
            <label className="block text-sm font-medium text-text-main mb-1">Category</label>
            <select {...register('category', { required: true })} className="input-field">
              {['appetizers','soups','mains','grill','salads','desserts','drinks'].map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <Button type="submit" variant="accent" className="w-full">{t('actions.save')}</Button>
        </form>
      </Modal>
    </div>
  );
}
