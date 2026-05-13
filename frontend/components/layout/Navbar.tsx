'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';
import { usePathname } from 'next/navigation';
import { Menu, X, Globe } from 'lucide-react';
import { cn } from '@/lib/utils';

const LOCALES = [
  { code: 'hy', label: 'ՀԱՅ' }, { code: 'en', label: 'EN' }, { code: 'ru', label: 'RU' },
  { code: 'fr', label: 'FR' }, { code: 'de', label: 'DE' }, { code: 'it', label: 'IT' },
  { code: 'es', label: 'ES' }, { code: 'zh', label: '中' }, { code: 'hi', label: 'HI' }, { code: 'ar', label: 'AR' },
];

export default function Navbar({ locale }: { locale: string }) {
  const t = useTranslations('nav');
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [langOpen, setLangOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  const links = [
    { href: `/${locale}`, label: t('home') },
    { href: `/${locale}/menu`, label: t('menu') },
    { href: `/${locale}/booking`, label: t('booking') },
    { href: `/${locale}/about`, label: t('about') },
    { href: `/${locale}/gallery`, label: t('gallery') },
    { href: `/${locale}/events`, label: t('events') },
    { href: `/${locale}/reviews`, label: t('reviews') },
    { href: `/${locale}/delivery`, label: t('delivery') },
  ];

  const switchLocale = (newLocale: string) => {
    const segments = pathname.split('/');
    segments[1] = newLocale;
    window.location.href = segments.join('/');
  };

  return (
    <nav className={cn(
      'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
      scrolled ? 'bg-primary shadow-lg' : 'bg-primary/95'
    )}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href={`/${locale}`} className="flex items-center space-x-2">
            <span className="text-accent font-bold text-xl tracking-wide">🎻 Kamancha</span>
          </Link>

          <div className="hidden lg:flex items-center space-x-1">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'px-3 py-2 rounded-md text-sm font-medium transition-colors',
                  pathname === link.href
                    ? 'text-accent bg-primary-light'
                    : 'text-bg/80 hover:text-accent hover:bg-primary-light'
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center space-x-3">
            <div className="relative">
              <button
                onClick={() => setLangOpen(!langOpen)}
                className="flex items-center space-x-1 text-bg/80 hover:text-accent transition-colors"
              >
                <Globe size={18} />
                <span className="text-xs font-medium uppercase">{locale}</span>
              </button>
              {langOpen && (
                <div className="absolute right-0 mt-2 w-32 bg-white rounded-lg shadow-xl z-50 py-1">
                  {LOCALES.map((l) => (
                    <button
                      key={l.code}
                      onClick={() => { switchLocale(l.code); setLangOpen(false); }}
                      className={cn(
                        'block w-full text-left px-3 py-2 text-sm hover:bg-bg-dark transition-colors',
                        l.code === locale ? 'text-primary font-bold' : 'text-text-main'
                      )}
                    >
                      {l.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <Link
              href={`/${locale}/booking`}
              className="hidden md:block btn-accent text-sm px-4 py-2"
            >
              {t('booking')}
            </Link>

            <button
              className="lg:hidden text-bg hover:text-accent transition-colors"
              onClick={() => setOpen(!open)}
            >
              {open ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {open && (
        <div className="lg:hidden bg-primary border-t border-primary-light">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className={cn(
                'block px-4 py-3 text-sm font-medium transition-colors',
                pathname === link.href ? 'text-accent bg-primary-light' : 'text-bg/80 hover:text-accent'
              )}
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}
