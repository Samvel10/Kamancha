import { cn } from '@/lib/utils';

interface StarRatingProps {
  rating: number;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function StarRating({ rating, max = 5, size = 'md', className }: StarRatingProps) {
  const sizes = { sm: 'text-sm', md: 'text-xl', lg: 'text-2xl' };
  return (
    <div className={cn('flex gap-0.5', sizes[size], className)}>
      {Array.from({ length: max }, (_, i) => (
        <span key={i} className={i < Math.round(rating) ? 'text-[#C8860A]' : 'text-[#EDD9B5]'}>
          ★
        </span>
      ))}
    </div>
  );
}
