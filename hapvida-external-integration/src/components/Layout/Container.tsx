import type { ReactNode } from 'react';

interface ContainerProps {
  children: ReactNode;
  className?: string;
}

/**
 * Container responsivo com mobile-first
 * Mobile: padding lateral pequeno
 * Desktop: padding lateral maior e max-width
 */
export function Container({ children, className = '' }: ContainerProps) {
  return (
    <div className={`w-full px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto ${className}`}>
      {children}
    </div>
  );
}

