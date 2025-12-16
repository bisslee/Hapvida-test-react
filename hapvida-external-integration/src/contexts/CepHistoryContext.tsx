import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { CepHistoryItem, CepAddress } from '@/types';

const HISTORY_STORAGE_KEY = 'cep_history';
const MAX_HISTORY_ITEMS = 10;

interface CepHistoryContextType {
  history: CepHistoryItem[];
  addToHistory: (address: CepAddress) => void;
  removeFromHistory: (id: string) => void;
  clearHistory: () => void;
  getHistoryItem: (id: string) => CepHistoryItem | undefined;
}

const CepHistoryContext = createContext<CepHistoryContextType | undefined>(undefined);

export function CepHistoryProvider({ children }: { children: ReactNode }) {
  const [history, setHistory] = useState<CepHistoryItem[]>([]);

  // Carrega histórico do localStorage ao montar
  useEffect(() => {
    try {
      const stored = localStorage.getItem(HISTORY_STORAGE_KEY);
      console.log('[CepHistoryContext] Carregando histórico do localStorage:', stored ? 'encontrado' : 'vazio');
      if (stored) {
        const parsed = JSON.parse(stored) as CepHistoryItem[];
        console.log('[CepHistoryContext] Histórico carregado:', parsed.length, 'itens', parsed);
        setHistory(parsed);
      } else {
        console.log('[CepHistoryContext] Nenhum histórico encontrado no localStorage');
        setHistory([]);
      }
    } catch (error) {
      console.error('[CepHistoryContext] Erro ao carregar histórico:', error);
      setHistory([]);
    }
  }, []);

  // Escuta mudanças no localStorage de outras abas
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === HISTORY_STORAGE_KEY && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue) as CepHistoryItem[];
          setHistory(parsed);
        } catch (error) {
          console.error('Erro ao carregar histórico de outra aba:', error);
        }
      } else if (e.key === HISTORY_STORAGE_KEY && !e.newValue) {
        setHistory([]);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Salva histórico no localStorage sempre que mudar
  useEffect(() => {
    try {
      if (history.length > 0) {
        const serialized = JSON.stringify(history);
        localStorage.setItem(HISTORY_STORAGE_KEY, serialized);
        console.log('[CepHistoryContext] Histórico salvo no localStorage:', history.length, 'itens');
      } else {
        localStorage.removeItem(HISTORY_STORAGE_KEY);
        console.log('[CepHistoryContext] Histórico removido do localStorage');
      }
    } catch (error) {
      console.error('[CepHistoryContext] Erro ao salvar histórico:', error);
    }
  }, [history]);

  const addToHistory = useCallback((address: CepAddress) => {
    console.log('[CepHistoryContext] Adicionando ao histórico:', address);
    setHistory((prev) => {
      // Remove duplicatas (mesmo CEP)
      const filtered = prev.filter((item) => item.zipCode !== address.zipCode);

      // Adiciona no início
      const newItem: CepHistoryItem = {
        id: `${Date.now()}-${Math.random()}`,
        zipCode: address.zipCode,
        city: address.city,
        state: address.state,
        timestamp: Date.now(),
        address,
      };

      // Mantém apenas os últimos MAX_HISTORY_ITEMS
      const updated = [newItem, ...filtered].slice(0, MAX_HISTORY_ITEMS);
      console.log('[CepHistoryContext] Histórico atualizado:', updated.length, 'itens');
      return updated;
    });
  }, []);

  const removeFromHistory = useCallback((id: string) => {
    setHistory((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
    localStorage.removeItem(HISTORY_STORAGE_KEY);
  }, []);

  const getHistoryItem = useCallback(
    (id: string): CepHistoryItem | undefined => {
      return history.find((item) => item.id === id);
    },
    [history]
  );

  return (
    <CepHistoryContext.Provider
      value={{
        history,
        addToHistory,
        removeFromHistory,
        clearHistory,
        getHistoryItem,
      }}
    >
      {children}
    </CepHistoryContext.Provider>
  );
}

export function useCepHistory() {
  const context = useContext(CepHistoryContext);
  if (context === undefined) {
    throw new Error('useCepHistory deve ser usado dentro de CepHistoryProvider');
  }
  return context;
}

