'use client';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { useTranslations, useLocale } from 'next-intl';
import toast from 'react-hot-toast';
import { createReservation, checkAvailability } from '@/lib/api';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { CheckCircle, AlertCircle } from 'lucide-react';

const schema = z.object({
  name: z.string().min(2),
  phone: z.string().min(9),
  email: z.string().email(),
  date: z.string().min(1),
  time: z.string().min(1),
  guests: z.coerce.number().min(1).max(80),
  hallId: z.coerce.number().min(1),
  notes: z.string().optional(),
});
type FormData = z.infer<typeof schema>;
const TIME_SLOTS = ['12:00','13:00','14:00','15:00','18:00','19:00','20:00','21:00','22:00'];

export default function BookingPage() {
  const t = useTranslations('booking');
  const locale = useLocale();
  const [loading, setLoading] = useState(false);
  const [availability, setAvailability] = useState<boolean | null>(null);
  const [confirmationCode, setConfirmationCode] = useState<string | null>(null);

  const { register, handleSubmit, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { guests: 2, hallId: 1 },
  });
  const [date, time, hallId] = watch(['date', 'time', 'hallId']);

  const handleCheckAvailability = async () => {
    if (!date || !time || !hallId) return;
    try {
      const result = await checkAvailability(date, time, Number(hallId));
      setAvailability(result.available);
    } catch { toast.error('Could not check availability'); }
  };

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      const result = await createReservation({ ...data, lang: locale });
      setConfirmationCode(result.confirmationCode);
    } catch (error: unknown) {
      const msg = (error as { response?: { data?: { error?: string } } })?.response?.data?.error || t('error');
      toast.error(msg);
    } finally { setLoading(false); }
  };

  if (confirmationCode) {
    return (
      <div className="pt-16 min-h-screen bg-bg flex items-center justify-center">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-2xl shadow-xl p-10 max-w-md w-full text-center">
          <CheckCircle size={64} className="text-secondary mx-auto mb-6"/>
          <h2 className="text-2xl font-bold text-primary mb-3">{t('success.title')}</h2>
          <p className="text-text-main/70 mb-4">{t('success.text')}</p>
          <div className="bg-accent/10 rounded-xl p-4 mb-6"><span className="text-accent font-bold text-3xl tracking-widest">{confirmationCode}</span></div>
          <p className="text-sm text-text-main/60">{t('success.note')}</p>
        </motion.div>
      </div>
    );
  }

  const halls = [
    { id: 1, name: t('halls.1.name'), desc: t('halls.1.desc') },
    { id: 2, name: t('halls.2.name'), desc: t('halls.2.desc') },
    { id: 3, name: t('halls.3.name'), desc: t('halls.3.desc') },
  ];

  return (
    <div className="pt-16 min-h-screen bg-bg">
      <div className="bg-primary py-16 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-bg mb-3">{t('title')}</h1>
        <p className="text-accent text-lg">{t('subtitle')}</p>
      </div>
      <div className="max-w-3xl mx-auto px-4 py-12">
        <motion.form initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-2xl shadow-xl p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label={t('name')} placeholder={t('namePlaceholder')} error={errors.name?.message} {...register('name')}/>
            <Input label={t('phone')} placeholder={t('phonePlaceholder')} type="tel" error={errors.phone?.message} {...register('phone')}/>
          </div>
          <Input label={t('email')} placeholder={t('emailPlaceholder')} type="email" error={errors.email?.message} {...register('email')}/>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-main mb-1">{t('date')}</label>
              <input type="date" min={new Date().toISOString().split('T')[0]} {...register('date')} className="input-field"/>
              {errors.date && <p className="text-red-500 text-xs mt-1">{errors.date.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-text-main mb-1">{t('time')}</label>
              <select {...register('time')} className="input-field">
                <option value="">--</option>
                {TIME_SLOTS.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
              {errors.time && <p className="text-red-500 text-xs mt-1">{errors.time.message}</p>}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-main mb-1">{t('guests')}</label>
              <input type="number" min={1} max={80} {...register('guests')} className="input-field"/>
            </div>
            <div>
              <label className="block text-sm font-medium text-text-main mb-1">{t('hall')}</label>
              <select {...register('hallId')} className="input-field">
                {halls.map((h) => <option key={h.id} value={h.id}>{h.name}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            {halls.map((h) => (
              <div key={h.id} className="bg-bg rounded-lg p-3 text-sm">
                <p className="font-semibold text-primary">{h.name}</p>
                <p className="text-text-main/60 text-xs">{h.desc}</p>
              </div>
            ))}
          </div>
          <Button type="button" variant="outline" size="sm" onClick={handleCheckAvailability}>{t('checkAvailability')}</Button>
          {availability !== null && (
            <div className={`flex items-center space-x-2 text-sm p-3 rounded-lg ${availability ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
              {availability ? <CheckCircle size={18}/> : <AlertCircle size={18}/>}
              <span>{availability ? t('available') : t('unavailable')}</span>
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-text-main mb-1">{t('notes')}</label>
            <textarea {...register('notes')} placeholder={t('notesPlaceholder')} rows={3} className="input-field resize-none"/>
          </div>
          <Button type="submit" variant="accent" size="lg" loading={loading} className="w-full">{t('submit')}</Button>
        </motion.form>
      </div>
    </div>
  );
}
