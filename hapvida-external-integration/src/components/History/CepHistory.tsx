import { useState } from 'react';
import { Button } from '@/components/UI/Button';
import { LoadingSpinner } from '@/components/UI/LoadingSpinner';
import { useCepHistory } from '@/contexts/CepHistoryContext';
import { formatRelativeTime, formatDateTime } from '@/utils/date';
import { formatZipCode } from '@/utils/cep';
import { normalizeError } from '@/utils/errors';
import toast from 'react-hot-toast';

interface CepHistoryProps {
  onSelectCep: (zipCode: string) => void;
}

/**
 * Componente de histórico de consultas - Mobile First
 * Lista vertical no mobile, pode expandir no desktop
 */
export function CepHistory({ onSelectCep }: CepHistoryProps) {
  const { history, clearHistory, removeFromHistory } = useCepHistory();
  const [loadingItemId, setLoadingItemId] = useState<string | null>(null);
  const [isClearing, setIsClearing] = useState(false);

  const handleSelect = async (zipCode: string, itemId: string) => {
    setLoadingItemId(itemId);
    try {
      await onSelectCep(zipCode);
      toast.success('CEP carregado do histórico');
    } catch (error) {
      const appError = normalizeError(error);
      toast.error(appError.message);
    } finally {
      setLoadingItemId(null);
    }
  };

  const handleClear = async () => {
    if (!window.confirm('Deseja limpar todo o histórico?')) {
      return;
    }

    setIsClearing(true);
    try {
      clearHistory();
      toast.success('Histórico limpo com sucesso');
    } catch (error) {
      toast.error('Erro ao limpar histórico');
    } finally {
      setIsClearing(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b pb-3">
        <h3 className="text-lg font-bold text-primary-dark flex items-center gap-2">
          <i className="ri-history-line" />
          <span className="text-sm font-normal text-gray-500 ml-2">
            {history.length} {history.length === 1 ? 'registro' : 'registros'} salvos
          </span>
        </h3>
        {history.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClear}
            disabled={isClearing}
            className="text-xs"
            aria-label="Limpar todo o histórico"
          >
            {isClearing ? (
              <>
                <LoadingSpinner size="sm" className="mr-1" />
                Limpando...
              </>
            ) : (
              <>
                <i className="ri-delete-bin-line mr-1" />
                Limpar
              </>
            )}
          </Button>
        )}
      </div>

        {history.length === 0 ? (
          <div className="py-8 text-center text-gray-500">
            <i className="ri-inbox-line text-4xl mb-2 block" />
            <p className="text-sm">Nenhum CEP consultado ainda</p>
            <p className="text-xs mt-1">Os CEPs consultados aparecerão aqui</p>
          </div>
        ) : (
          <div className="space-y-2" role="list" aria-label="Histórico de consultas de CEP">
            {history.map((item) => {
            const isLoading = loadingItemId === item.id;
            return (
              <div
                key={item.id}
                role="listitem"
                className="relative"
              >
                <div
                  onClick={() => handleSelect(item.zipCode, item.id)}
                  className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 hover:border-secondary-blue transition-colors active:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed focus-within:ring-2 focus-within:ring-secondary-blue focus-within:ring-offset-2 cursor-pointer"
                  role="button"
                  tabIndex={0}
                  aria-label={`Selecionar CEP ${formatZipCode(item.zipCode)} de ${item.city}, ${item.state}`}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleSelect(item.zipCode, item.id);
                    }
                  }}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-primary-dark truncate">
                          {formatZipCode(item.zipCode)}
                        </p>
                        {isLoading && (
                          <LoadingSpinner size="sm" />
                        )}
                      </div>
                      <p className="text-sm text-gray-600 truncate">
                        {item.city}, {item.state}
                      </p>
                      <p className="text-xs text-gray-400 mt-1" title={formatDateTime(new Date(item.timestamp))}>
                        {formatRelativeTime(item.timestamp)}
                      </p>
                    </div>
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFromHistory(item.id);
                        toast.success('Item removido do histórico');
                      }}
                      className="text-gray-400 hover:text-accent-red p-1 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-accent-red focus:ring-offset-1 cursor-pointer"
                      role="button"
                      tabIndex={0}
                      aria-label={`Remover ${formatZipCode(item.zipCode)} do histórico`}
                      title="Remover do histórico"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          e.stopPropagation();
                          removeFromHistory(item.id);
                          toast.success('Item removido do histórico');
                        }
                      }}
                    >
                      <i className="ri-close-line" />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          </div>
        )}
    </div>
  );
}
