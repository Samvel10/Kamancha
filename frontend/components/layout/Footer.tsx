'use client';
import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';
import { MapPin, Phone, Mail, Clock } from 'lucide-react';

export default function Footer() {
  const t = useTranslations('footer');
  const nav = useTranslations('nav');
  const locale = useLocale();

  const navLinks = [
    { key: 'menu',     href: `/${locale}/menu`     },
    { key: 'booking',  href: `/${locale}/booking`  },
    { key: 'about',    href: `/${locale}/about`    },
    { key: 'gallery',  href: `/${locale}/gallery`  },
    { key: 'events',   href: `/${locale}/events`   },
    { key: 'reviews',  href: `/${locale}/reviews`  },
    { key: 'delivery', href: `/${locale}/delivery` },
  ];

  return (
    <footer className="bg-primary text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">

          {/* Brand */}
          <div>
            <h3 className="font-display text-2xl font-bold text-white mb-1">Kamancha</h3>
            <p className="text-accent text-xs tracking-widest uppercase mb-4">Restaurant · Yerevan</p>
            <p className="text-white/60 text-sm leading-relaxed mb-5">
              Authentic Armenian cuisine in the heart of Yerevan. TripAdvisor #3.
            </p>
            <div className="flex items-center space-x-4">
              <a
                href="https://www.instagram.com/kamancha_yerevan/"
                target="_blank" rel="noopener noreferrer"
                className="text-white/50 hover:text-accent transition-colors text-sm font-medium"
                aria-label="Instagram"
              >
                Instagram
              </a>
              <span className="text-white/20">·</span>
              <a
                href="https://www.facebook.com/kamancharest"
                target="_blank" rel="noopener noreferrer"
                className="text-white/50 hover:text-accent transition-colors text-sm font-medium"
                aria-label="Facebook"
              >
                Facebook
              </a>
            </div>
          </div>

          {/* Nav links */}
          <div>
            <h4 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider">Navigation</h4>
            <ul className="space-y-2">
              {navLinks.map(({ key, href }) => (
                <li key={key}>
                  <Link
                    href={href}
                    className="text-white/60 hover:text-accent transition-colors text-sm"
                  >
                    {nav(key as Parameters<typeof nav>[0])}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider">Contact</h4>
            <ul className="space-y-3">
              <li className="flex items-start space-x-3">
                <MapPin size={15} className="text-accent mt-0.5 shrink-0" />
                <span className="text-white/60 text-sm">{t('address')}</span>
              </li>
              <li className="flex items-center space-x-3">
                <Phone size={15} className="text-accent shrink-0" />
                <a href={`tel:${t('phone')}`} className="text-white/60 hover:text-accent transition-colors text-sm">
                  {t('phone')}
                </a>
              </li>
              <li className="flex items-center space-x-3">
                <Mail size={15} className="text-accent shrink-0" />
                <a href={`mailto:${t('email')}`} className="text-white/60 hover:text-accent transition-colors text-sm">
                  {t('email')}
                </a>
              </li>
              <li className="flex items-start space-x-3">
                <Clock size={15} className="text-accent mt-0.5 shrink-0" />
                <span className="text-white/60 text-sm">{t('hours')}</span>
              </li>
            </ul>
          </div>

          {/* Map */}
          <div>
            <h4 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider">Find Us</h4>
            <div className="rounded-xl border border-white/10 p-4 bg-white/5">
              <p className="text-white/70 text-sm mb-1">Թumanyani 23</p>
              <p className="text-white/50 text-xs mb-3">Yerevan, Armenia</p>
              <a
                href="https://maps.google.com/?q=Kamancha+Restaurant+Yerevan+Tumanyan+23"
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent hover:underline text-xs font-medium"
              >
                Open in Google Maps →
              </a>
            </div>
            <div className="mt-4 p-3 rounded-lg bg-accent/10 border border-accent/20">
              <p className="text-accent text-xs font-semibold">Live Music</p>
              <p className="text-white/60 text-xs mt-0.5">Every evening · 19:30</p>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 mt-10 pt-6 flex flex-col md:flex-row justify-between items-center text-xs text-white/30">
          <p>© {new Date().getFullYear()} Kamancha Restaurant. {t('rights')}.</p>
          <div className="flex space-x-6 mt-3 md:mt-0">
            <Link href={`/${locale}/privacy`} className="hover:text-accent/70 transition-colors">{t('links.privacy')}</Link>
            <Link href={`/${locale}/terms`}   className="hover:text-accent/70 transition-colors">{t('links.terms')}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
