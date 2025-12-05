/**
 * Utility function para combinar classes CSS condicionalmente
 * Similar ao cn do shadcn/ui
 */
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

