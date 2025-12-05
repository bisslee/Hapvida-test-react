import type { ReactNode } from 'react';
import { cn } from '@/utils/cn';

interface CardProps {
  children: ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

/**
 * Card reutilizável com padding responsivo
 * Mobile-first: padding menor no mobile, maior no desktop
 */
export function Card({ children, className = '', padding = 'md' }: CardProps) {
  const paddings = {
    none: '',
    sm: 'p-3 sm:p-4',
    md: 'p-4 sm:p-6',
    lg: 'p-6 sm:p-8',
  };

  return (
    <div
      className={cn(
        'bg-white rounded-lg shadow-md border border-gray-200',
        paddings[padding],
        className
      )}
    >
      {children}
    </div>
  );
}

