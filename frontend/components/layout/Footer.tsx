'use client';
import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';
import { MapPin, Phone, Mail, Clock, Share2, ExternalLink } from 'lucide-react';

export default function Footer() {
  const t = useTranslations('footer');
  const nav = useTranslations('nav');
  const locale = useLocale();

  return (
    <footer className="bg-primary text-bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-accent font-bold text-xl mb-4">🎻 Kamancha</h3>
            <p className="text-bg/70 text-sm leading-relaxed mb-4">
              Authentic Armenian cuisine in the heart of Yerevan. TripAdvisor #3.
            </p>
            <div className="flex space-x-3">
              <a href="https://instagram.com/restormania" target="_blank" rel="noopener noreferrer"
                className="text-bg/60 hover:text-accent transition-colors" aria-label="Instagram">
                <Share2 size={20} />
              </a>
              <a href="https://facebook.com/kamancha" target="_blank" rel="noopener noreferrer"
                className="text-bg/60 hover:text-accent transition-colors" aria-label="Facebook">
                <ExternalLink size={20} />
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-bg mb-4">{nav('menu')}</h4>
            <ul className="space-y-2 text-sm text-bg/70">
              {['home', 'menu', 'booking', 'about', 'gallery', 'events', 'reviews', 'delivery'].map((key) => (
                <li key={key}>
                  <Link href={`/${locale}/${key === 'home' ? '' : key}`}
                    className="hover:text-accent transition-colors">
                    {nav(key as Parameters<typeof nav>[0])}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-bg mb-4">Contact</h4>
            <ul className="space-y-3 text-sm text-bg/70">
              <li className="flex items-start space-x-2">
                <MapPin size={16} className="text-accent mt-0.5 shrink-0" />
                <span>{t('address')}</span>
              </li>
              <li className="flex items-center space-x-2">
                <Phone size={16} className="text-accent shrink-0" />
                <a href={`tel:${t('phone')}`} className="hover:text-accent">{t('phone')}</a>
              </li>
              <li className="flex items-center space-x-2">
                <Mail size={16} className="text-accent shrink-0" />
                <a href={`mailto:${t('email')}`} className="hover:text-accent">{t('email')}</a>
              </li>
              <li className="flex items-center space-x-2">
                <Clock size={16} className="text-accent shrink-0" />
                <span>{t('hours')}</span>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-bg mb-4">Find Us</h4>
            <div className="bg-primary-light rounded-lg p-3 text-sm text-bg/70">
              <p className="mb-2">Yerevan, Tumanyan 23</p>
              <a
                href="https://maps.google.com/?q=Kamancha+Restaurant+Yerevan"
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent hover:underline text-xs"
              >
                Open in Google Maps →
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-primary-light mt-8 pt-6 flex flex-col md:flex-row justify-between items-center text-xs text-bg/50">
          <p>© {new Date().getFullYear()} Kamancha Restaurant. {t('rights')}.</p>
          <div className="flex space-x-4 mt-2 md:mt-0">
            <Link href={`/${locale}/privacy`} className="hover:text-accent">{t('links.privacy')}</Link>
            <Link href={`/${locale}/terms`} className="hover:text-accent">{t('links.terms')}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
