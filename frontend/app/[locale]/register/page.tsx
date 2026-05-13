'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useLocale, useTranslations } from 'next-intl';
import toast from 'react-hot-toast';
import { UserPlus } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import Button from '@/components/ui/Button';

export default function RegisterPage() {
  const t = useTranslations('account');
  const locale = useLocale();
  const router = useRouter();
  const { register } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' });
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register(form);
      toast.success(t('registerSuccess'));
      router.push(`/${locale}/account`);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      toast.error(msg || t('registerError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-16 min-h-screen bg-primary flex items-center justify-center px-4 py-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-primary-deeper border border-green-border rounded-2xl shadow-2xl p-6 sm:p-8 w-full max-w-md"
      >
        <div className="text-center mb-6">
          <div className="w-14 h-14 bg-accent/15 rounded-full flex items-center justify-center mx-auto mb-3">
            <UserPlus size={26} className="text-accent" />
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold" style={{ color: '#F5ECD7' }}>{t('registerTitle')}</h1>
          <p className="text-text-muted-green-2 text-sm mt-1">{t('registerSubtitle')}</p>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-on-green mb-1">{t('name')}</label>
            <input
              type="text" required minLength={2}
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="input-dark"
              autoComplete="name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-on-green mb-1">{t('email')}</label>
            <input
              type="email" required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="input-dark"
              autoComplete="email"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-on-green mb-1">{t('phone')} <span className="text-text-muted-green-2 text-xs">({t('optional')})</span></label>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="input-dark"
              placeholder="095 711-700"
              autoComplete="tel"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-on-green mb-1">{t('password')}</label>
            <input
              type="password" required minLength={6}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="input-dark"
              autoComplete="new-password"
            />
            <p className="text-xs text-text-muted-green-2 mt-1">{t('passwordHint')}</p>
          </div>
          <Button type="submit" variant="accent" size="lg" loading={loading} className="w-full">
            {t('registerButton')}
          </Button>
        </form>

        <p className="text-center text-text-muted-green-2 text-sm mt-6">
          {t('haveAccount')}{' '}
          <Link href={`/${locale}/login`} className="text-accent hover:underline font-semibold">
            {t('loginHere')}
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
