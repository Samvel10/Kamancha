'use client';
import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { adminLogin } from '@/lib/api';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

const schema = z.object({ email: z.string().email(), password: z.string().min(6) });
type FormData = z.infer<typeof schema>;

export default function AdminLoginPage() {
  const t = useTranslations('admin');
  const locale = useLocale();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      const result = await adminLogin(data.email, data.password);
      localStorage.setItem('admin_token', result.accessToken);
      router.push(`/${locale}/admin`);
    } catch {
      toast.error('Invalid credentials');
    } finally { setLoading(false); }
  };

  return (
    <div className="pt-16 min-h-screen bg-bg flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-sm w-full mx-4">
        <div className="text-center mb-6">
          <div className="text-4xl mb-3">🔐</div>
          <h1 className="text-2xl font-bold text-primary">{t('login')}</h1>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input label="Email" type="email" error={errors.email?.message} {...register('email')}/>
          <Input label="Password" type="password" error={errors.password?.message} {...register('password')}/>
          <Button type="submit" variant="primary" size="lg" loading={loading} className="w-full">Login</Button>
        </form>
      </div>
    </div>
  );
}
