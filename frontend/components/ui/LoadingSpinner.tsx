import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function LoadingSpinner({ size = 'md', className }: LoadingSpinnerProps) {
  const sizes = { sm: 'w-5 h-5', md: 'w-8 h-8', lg: 'w-12 h-12' };
  return (
    <div className={cn('flex justify-center items-center', className)}>
      <div className={cn('border-4 border-[#EDD9B5] border-t-[#C8860A] rounded-full animate-spin', sizes[size])} />
    </div>
  );
}
