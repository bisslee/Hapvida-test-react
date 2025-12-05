import { Button } from './Button';
import { Card } from './Card';
import type { AppError } from '@/utils/errors';

interface ErrorDisplayProps {
  error: AppError;
  onRetry?: () => void;
  title?: string;
  className?: string;
}

/**
 * Componente para exibir erros de forma amigável
 * Mobile-first: otimizado para telas pequenas
 */
export function ErrorDisplay({
  error,
  onRetry,
  title = 'Erro',
  className = '',
}: ErrorDisplayProps) {
  const getErrorIcon = () => {
    switch (error.type) {
      case 'INVALID_CEP':
      case 'CEP_NOT_FOUND':
        return 'ri-error-warning-line';
      case 'NETWORK_ERROR':
      case 'TIMEOUT':
        return 'ri-wifi-off-line';
      case 'COORDINATES_ERROR':
        return 'ri-map-pin-line';
      case 'WEATHER_ERROR':
        return 'ri-cloud-off-line';
      default:
        return 'ri-alert-line';
    }
  };

  const getErrorColor = () => {
    switch (error.type) {
      case 'INVALID_CEP':
      case 'CEP_NOT_FOUND':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'NETWORK_ERROR':
      case 'TIMEOUT':
        return 'bg-orange-50 border-orange-200 text-orange-800';
      case 'COORDINATES_ERROR':
      case 'WEATHER_ERROR':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      default:
        return 'bg-red-50 border-red-200 text-red-800';
    }
  };

  return (
    <Card className={className}>
      <div className={`p-4 rounded-lg border ${getErrorColor()}`}>
        <div className="flex items-start gap-3">
          <i className={`${getErrorIcon()} text-xl flex-shrink-0 mt-0.5`} />
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold mb-1">{title}</h3>
            <p className="text-sm leading-relaxed">{error.message}</p>
            {error.retryable && onRetry && (
              <div className="mt-4">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={onRetry}
                  className="w-full sm:w-auto"
                >
                  <i className="ri-refresh-line mr-2" />
                  Tentar Novamente
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}

