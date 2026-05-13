import { cn } from '@/lib/utils';
import { InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  variant?: 'light' | 'dark';
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, variant = 'light', ...props }, ref) => {
    const labelClass = variant === 'dark' ? 'text-text-on-green' : 'text-text-dark';
    const fieldClass = variant === 'dark' ? 'input-dark' : 'input-field';
    return (
      <div className="w-full">
        {label && <label className={cn('block text-sm font-medium mb-1', labelClass)}>{label}</label>}
        <input
          ref={ref}
          className={cn(fieldClass, error && 'border-red-400', className)}
          {...props}
        />
        {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
      </div>
    );
  }
);
Input.displayName = 'Input';
export default Input;
