import { clsx, type ClassValue } from 'clsx';

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

// Formats price as "2,700֏" — Armenian dram symbol, comma thousands separator
export function formatPrice(amount: number): string {
  return `${amount.toLocaleString('en-US')}֏`;
}

export function formatDate(date: string | Date, locale = 'en') {
  return new Date(date).toLocaleDateString(locale, {
    year: 'numeric', month: 'long', day: 'numeric',
  });
}

export function getStars(rating: number) {
  return '★'.repeat(Math.floor(rating)) + '☆'.repeat(5 - Math.floor(rating));
}

// Live music starts at 19:30, ends at 23:00
export function getMusicCountdown(): { hours: number; minutes: number; seconds: number; isLive: boolean } {
  const now = new Date();
  const start = new Date();
  start.setHours(19, 30, 0, 0);
  const end = new Date();
  end.setHours(23, 0, 0, 0);

  if (now >= start && now < end) {
    return { hours: 0, minutes: 0, seconds: 0, isLive: true };
  }

  // If past end time, countdown to tomorrow's start
  const target = now >= end ? new Date(start.getTime() + 86400000) : start;
  const diff = target.getTime() - now.getTime();
  return {
    hours:   Math.floor(diff / 3600000),
    minutes: Math.floor((diff % 3600000) / 60000),
    seconds: Math.floor((diff % 60000) / 1000),
    isLive:  false,
  };
}
