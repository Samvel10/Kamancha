'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import { getAdminStats } from '@/lib/api';
import { Calendar, UtensilsCrossed, Image, Music, LogOut, BarChart3 } from 'lucide-react';

export default function AdminDashboardPage() {
  const t = useTranslations('admin');
  const locale = useLocale();
  const router = useRouter();
  const [stats, setStats] = useState({ totalReservations: 0, pendingReservations: 0, totalMenuItems: 0 });
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('admin_token');
    if (!stored) { router.push(`/${locale}/admin/login`); return; }
    setToken(stored);
    getAdminStats(stored).then(setStats).catch(() => {});
  }, [locale, router]);

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    router.push(`/${locale}/admin/login`);
  };

  if (!token) return null;

  const statCards = [
    { label: t('stats.total'), value: stats.totalReservations, icon: Calendar, color: 'bg-primary/10 text-primary' },
    { label: t('stats.pending'), value: stats.pendingReservations, icon: BarChart3, color: 'bg-accent/10 text-accent' },
    { label: t('stats.menuItems'), value: stats.totalMenuItems, icon: UtensilsCrossed, color: 'bg-secondary/10 text-secondary' },
  ];

  const menuItems = [
    { href: `/${locale}/admin/reservations`, icon: Calendar, label: t('reservations') },
    { href: `/${locale}/admin/menu`, icon: UtensilsCrossed, label: t('menu') },
    { href: `/${locale}/admin/gallery`, icon: Image, label: t('gallery') },
    { href: `/${locale}/admin/events`, icon: Music, label: t('events') },
  ];

  return (
    <div className="pt-16 min-h-screen bg-bg">
      <div className="bg-primary py-8 px-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold text-bg">{t('dashboard')}</h1>
          <button onClick={handleLogout} className="flex items-center gap-2 text-bg/70 hover:text-accent transition-colors text-sm">
            <LogOut size={18}/>{t('logout')}
          </button>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {statCards.map((card) => (
            <div key={card.label} className="bg-white rounded-2xl shadow-md p-6 flex items-center gap-4">
              <div className={`p-3 rounded-xl ${card.color}`}><card.icon size={24}/></div>
              <div><p className="text-3xl font-bold text-primary">{card.value}</p><p className="text-text-main/60 text-sm">{card.label}</p></div>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {menuItems.map((item) => (
            <Link key={item.href} href={item.href} className="bg-white rounded-2xl shadow-md p-6 text-center hover:shadow-lg transition-shadow group">
              <item.icon size={32} className="mx-auto mb-3 text-primary group-hover:text-accent transition-colors"/>
              <p className="font-semibold text-primary group-hover:text-accent transition-colors">{item.label}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
