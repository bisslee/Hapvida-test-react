import { forwardRef } from 'react';
import type { InputHTMLAttributes } from 'react';
import { cn } from '@/utils/cn';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: string;
  rightIcon?: string;
}

/**
 * Input reutilizável com suporte a ícones e estados de erro
 * Mobile-first: tamanho otimizado para touch (min-height 44px)
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, leftIcon, rightIcon, className, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <i className={cn('text-lg', leftIcon)} />
            </div>
          )}
          <input
            ref={ref}
            className={cn(
              'w-full min-h-[44px] px-3 py-2.5',
              leftIcon && 'pl-10',
              rightIcon && 'pr-10',
              'border rounded-lg',
              'focus:outline-none focus:ring-2 focus:ring-offset-0',
              error
                ? 'border-accent-red focus:ring-accent-red focus:border-accent-red'
                : 'border-gray-300 focus:ring-secondary-blue focus:border-secondary-blue',
              'text-base', // Mobile: evitar zoom no iOS
              'disabled:bg-gray-100 disabled:cursor-not-allowed',
              className
            )}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
              <i className={cn('text-lg', rightIcon)} />
            </div>
          )}
        </div>
        {error && (
          <p className="mt-1.5 text-sm text-accent-red flex items-center gap-1">
            <i className="ri-error-warning-line" />
            {error}
          </p>
        )}
        {helperText && !error && (
          <p className="mt-1.5 text-sm text-gray-500">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

