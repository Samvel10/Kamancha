'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { useLocale, useTranslations } from 'next-intl';
import toast from 'react-hot-toast';
import { LogIn } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import Button from '@/components/ui/Button';

export default function LoginPage() {
  const t = useTranslations('account');
  const locale = useLocale();
  const router = useRouter();
  const search = useSearchParams();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast.success(t('loginSuccess'));
      const redirect = search.get('redirect') || `/${locale}/account`;
      router.push(redirect);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      toast.error(msg || t('loginError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-16 min-h-screen bg-primary flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-primary-deeper border border-green-border rounded-2xl shadow-2xl p-6 sm:p-8 w-full max-w-md"
      >
        <div className="text-center mb-6">
          <div className="w-14 h-14 bg-accent/15 rounded-full flex items-center justify-center mx-auto mb-3">
            <LogIn size={26} className="text-accent" />
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold" style={{ color: '#F5ECD7' }}>{t('loginTitle')}</h1>
          <p className="text-text-muted-green-2 text-sm mt-1">{t('loginSubtitle')}</p>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-on-green mb-1">{t('email')}</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-dark"
              autoComplete="email"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-on-green mb-1">{t('password')}</label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-dark"
              autoComplete="current-password"
            />
          </div>
          <Button type="submit" variant="accent" size="lg" loading={loading} className="w-full">
            {t('loginButton')}
          </Button>
        </form>

        <p className="text-center text-text-muted-green-2 text-sm mt-6">
          {t('noAccount')}{' '}
          <Link href={`/${locale}/register`} className="text-accent hover:underline font-semibold">
            {t('registerHere')}
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
