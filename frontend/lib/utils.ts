import { clsx, type ClassValue } from 'clsx';

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatPrice(amount: number, currency = 'AMD') {
  return `${amount.toLocaleString()} ${currency}`;
}

export function formatDate(date: string | Date, locale = 'en') {
  return new Date(date).toLocaleDateString(locale, {
    year: 'numeric', month: 'long', day: 'numeric',
  });
}

export function getStars(rating: number) {
  return '★'.repeat(Math.floor(rating)) + '☆'.repeat(5 - Math.floor(rating));
}

export function getMusicCountdown(): { hours: number; minutes: number; seconds: number; isLive: boolean } {
  const now = new Date();
  const target = new Date();
  target.setHours(20, 0, 0, 0);
  if (now >= target) {
    const endTime = new Date(target);
    endTime.setHours(23, 0, 0, 0);
    return { hours: 0, minutes: 0, seconds: 0, isLive: now < endTime };
  }
  const diff = target.getTime() - now.getTime();
  const hours = Math.floor(diff / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);
  const seconds = Math.floor((diff % 60000) / 1000);
  return { hours, minutes, seconds, isLive: false };
}
