'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { usePathname } from 'next/navigation';
import { Menu, X, Globe, ChevronDown, User as UserIcon, ShoppingCart, LogOut, LayoutDashboard } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth, isStaff } from '@/lib/auth';
import { useCart } from '@/lib/cart';

const LOCALES = [
  { code: 'hy', label: 'ՀԱՅ' }, { code: 'en', label: 'EN' }, { code: 'ru', label: 'RU' },
  { code: 'fr', label: 'FR' }, { code: 'de', label: 'DE' }, { code: 'it', label: 'IT' },
  { code: 'es', label: 'ES' }, { code: 'zh', label: '中文' }, { code: 'hi', label: 'HI' }, { code: 'ar', label: 'AR' },
];

export default function Navbar({ locale }: { locale: string }) {
  const t = useTranslations('nav');
  const tAccount = useTranslations('account');
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { count } = useCart();
  const [open, setOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  const links = [
    { href: `/${locale}`,          label: t('home')     },
    { href: `/${locale}/menu`,     label: t('menu')     },
    { href: `/${locale}/booking`,  label: t('booking')  },
    { href: `/${locale}/about`,    label: t('about')    },
    { href: `/${locale}/gallery`,  label: t('gallery')  },
    { href: `/${locale}/events`,   label: t('events')   },
    { href: `/${locale}/reviews`,  label: t('reviews')  },
    { href: `/${locale}/delivery`, label: t('delivery') },
  ];

  const switchLocale = (newLocale: string) => {
    const segments = pathname.split('/');
    segments[1] = newLocale;
    window.location.href = segments.join('/');
  };

  const isActive = (href: string) =>
    href === `/${locale}` ? pathname === href : pathname.startsWith(href);

  return (
    <nav className={cn(
      'fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-primary',
      scrolled && 'shadow-xl'
    )}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link href={`/${locale}`} className="flex items-center group">
            <span
              className="font-display text-2xl font-bold text-accent group-hover:text-accent-dark transition-colors"
              style={{ letterSpacing: '2px' }}
            >
              KAMANCHA
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center space-x-1">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'px-2 lg:px-3 py-2 rounded text-xs lg:text-sm font-medium transition-colors duration-200 whitespace-nowrap',
                  isActive(link.href)
                    ? 'text-accent'
                    : 'text-text-on-green hover:text-accent'
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right side */}
          <div className="flex items-center space-x-3">
            {/* Language picker */}
            <div className="relative">
              <button
                onClick={() => setLangOpen(!langOpen)}
                className="flex items-center space-x-1 text-text-on-green hover:text-accent transition-colors px-2 py-1 rounded"
              >
                <Globe size={15} />
                <span className="text-xs font-medium uppercase">{locale}</span>
                <ChevronDown size={12} className={cn('transition-transform', langOpen && 'rotate-180')} />
              </button>
              {langOpen && (
                <div className="absolute right-0 mt-2 w-28 bg-white rounded-md shadow-2xl z-50 py-1 border border-border">
                  {LOCALES.map((l) => (
                    <button
                      key={l.code}
                      onClick={() => { switchLocale(l.code); setLangOpen(false); }}
                      className={cn(
                        'block w-full text-left px-3 py-2 text-sm transition-colors',
                        l.code === locale
                          ? 'text-primary font-bold bg-bg'
                          : 'text-text-dark hover:bg-bg-dark'
                      )}
                    >
                      {l.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Cart icon */}
            <Link
              href={user ? `/${locale}/account` : `/${locale}/delivery`}
              className="relative text-text-on-green hover:text-accent transition-colors p-1"
              aria-label="Cart"
            >
              <ShoppingCart size={18} />
              {count > 0 && (
                <span className="absolute -top-1 -right-1 bg-accent text-primary text-[10px] rounded-full w-4 h-4 flex items-center justify-center font-bold">
                  {count}
                </span>
              )}
            </Link>

            {/* User menu */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserOpen(!userOpen)}
                  className="flex items-center gap-1 text-text-on-green hover:text-accent transition-colors px-2 py-1 rounded"
                >
                  <div className="w-7 h-7 rounded-full bg-accent text-primary flex items-center justify-center text-xs font-bold uppercase">
                    {user.name.charAt(0)}
                  </div>
                  <ChevronDown size={12} className={cn('transition-transform hidden sm:block', userOpen && 'rotate-180')} />
                </button>
                {userOpen && (
                  <div className="absolute right-0 mt-2 w-52 bg-white rounded-md shadow-2xl z-50 py-1 border border-border">
                    <div className="px-4 py-3 border-b border-border">
                      <p className="text-sm font-semibold text-primary truncate">{user.name}</p>
                      <p className="text-xs text-text-faint truncate">{user.email}</p>
                    </div>
                    <Link
                      href={`/${locale}/account`}
                      onClick={() => setUserOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-text-dark hover:bg-bg transition-colors"
                    >
                      <LayoutDashboard size={14} /> {tAccount('myAccount')}
                    </Link>
                    {isStaff(user.role) && (
                      <Link
                        href={`/${locale}/staff`}
                        onClick={() => setUserOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-text-dark hover:bg-bg transition-colors"
                      >
                        <UserIcon size={14} /> Staff
                      </Link>
                    )}
                    {user.role === 'ADMIN' && (
                      <Link
                        href={`/${locale}/admin`}
                        onClick={() => setUserOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-text-dark hover:bg-bg transition-colors"
                      >
                        <UserIcon size={14} /> Admin
                      </Link>
                    )}
                    <button
                      onClick={() => { logout(); setUserOpen(false); }}
                      className="w-full text-left flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <LogOut size={14} /> {tAccount('logout')}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href={`/${locale}/login`}
                className="hidden sm:inline-flex items-center gap-1 text-text-on-green hover:text-accent transition-colors text-sm font-medium px-2"
              >
                <UserIcon size={14} /> {tAccount('login')}
              </Link>
            )}

            {/* Book button */}
            <Link
              href={`/${locale}/booking`}
              className="hidden lg:inline-flex items-center px-5 py-2 rounded-md bg-accent text-primary text-sm font-semibold hover:bg-accent-dark transition-colors"
            >
              {t('booking')}
            </Link>

            {/* Mobile menu toggle */}
            <button
              className="md:hidden text-text-on-green hover:text-accent transition-colors p-1"
              onClick={() => setOpen(!open)}
              aria-label="Toggle menu"
            >
              {open ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-primary-deeper border-t border-green-border">
          <div className="px-4 py-2 space-y-0.5">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={cn(
                  'block px-4 py-3 rounded-md text-sm font-medium transition-colors',
                  isActive(link.href) ? 'text-accent bg-primary-darkest' : 'text-text-on-green hover:text-accent'
                )}
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-2 pb-1 space-y-2">
              {user ? (
                <Link
                  href={`/${locale}/account`}
                  onClick={() => setOpen(false)}
                  className="block text-center py-3 rounded-md border border-accent text-accent text-sm font-semibold hover:bg-accent hover:text-primary transition-colors"
                >
                  {tAccount('myAccount')}
                </Link>
              ) : (
                <Link
                  href={`/${locale}/login`}
                  onClick={() => setOpen(false)}
                  className="block text-center py-3 rounded-md border border-accent text-accent text-sm font-semibold hover:bg-accent hover:text-primary transition-colors"
                >
                  {tAccount('login')}
                </Link>
              )}
              <Link
                href={`/${locale}/booking`}
                onClick={() => setOpen(false)}
                className="block text-center py-3 rounded-md bg-accent text-primary text-sm font-semibold hover:bg-accent-dark transition-colors"
              >
                {t('booking')}
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
