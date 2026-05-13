import { cn } from '@/lib/utils';
import { InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, ...props }, ref) => (
    <div className="w-full">
      {label && <label className="block text-sm font-medium text-text-main mb-1">{label}</label>}
      <input
        ref={ref}
        className={cn(
          'w-full px-4 py-3 rounded-lg border bg-white text-text-main',
          'focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent',
          'placeholder:text-gray-400 transition-all',
          error ? 'border-red-400' : 'border-bg-dark',
          className
        )}
        {...props}
      />
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  )
);
Input.displayName = 'Input';
export default Input;
