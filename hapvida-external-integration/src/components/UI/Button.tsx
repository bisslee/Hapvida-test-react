import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/utils/cn';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  children: ReactNode;
}

/**
 * Botão reutilizável com variantes e estados
 * Mobile-first: tamanhos otimizados para touch
 */
export function Button({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled,
  className,
  children,
  ...props
}: ButtonProps) {
  const baseStyles =
    'inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

  const variants = {
    primary:
      'bg-secondary-blue text-white hover:bg-blue-700 focus:ring-blue-500 active:bg-blue-800',
    secondary:
      'bg-primary-dark text-white hover:bg-gray-800 focus:ring-gray-500 active:bg-gray-900',
    outline:
      'border-2 border-secondary-blue text-secondary-blue hover:bg-blue-50 focus:ring-blue-500 active:bg-blue-100',
    ghost: 'text-primary-dark hover:bg-gray-100 focus:ring-gray-500 active:bg-gray-200',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm min-h-[36px]',
    md: 'px-4 py-2 text-base min-h-[44px]', // Mobile: altura mínima para touch
    lg: 'px-6 py-3 text-lg min-h-[48px]',
  };

  return (
    <button
      className={cn(
        baseStyles,
        variants[variant],
        sizes[size],
        className
      )}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <>
          <i className="ri-loader-4-line animate-spin mr-2" />
          <span>Carregando...</span>
        </>
      ) : (
        children
      )}
    </button>
  );
}

