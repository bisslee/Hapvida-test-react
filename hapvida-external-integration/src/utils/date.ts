import { format, formatDistanceToNow, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale/pt-BR';

/**
 * Formata data para formato brasileiro (DD/MM/YYYY)
 */
export function formatDate(date: string | Date): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, 'dd/MM/yyyy', { locale: ptBR });
}

/**
 * Formata data e hora para formato brasileiro
 */
export function formatDateTime(date: string | Date): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
}

/**
 * Formata data relativa ("há 2 minutos", "há 1 hora", etc.)
 */
export function formatRelativeTime(timestamp: number): string {
  const date = new Date(timestamp);
  return formatDistanceToNow(date, {
    addSuffix: true,
    locale: ptBR,
  });
}

/**
 * Formata apenas a hora (HH:mm)
 */
export function formatTime(date: string | Date): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, 'HH:mm', { locale: ptBR });
}

