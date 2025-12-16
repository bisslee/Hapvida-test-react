import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import type { ReactNode } from 'react';
import { useCepHistory, CepHistoryProvider } from '@/contexts/CepHistoryContext';
import type { CepAddress, CepHistoryItem } from '@/types';

// Mock do localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('useCepHistory', () => {
  const wrapper = ({ children }: { children: ReactNode }) => (
    <CepHistoryProvider>{children}</CepHistoryProvider>
  );

  beforeEach(() => {
    localStorageMock.clear();
  });

  const mockAddress: CepAddress = {
    zipCode: '01001000',
    street: 'Praça da Sé',
    district: 'Sé',
    city: 'São Paulo',
    state: 'SP',
    ibge: '3550308',
    location: {
      lat: -23.5507,
      lon: -46.6334,
    },
    provider: 'brasilapi',
  };

  it('deve inicializar com histórico vazio', () => {
    const { result } = renderHook(() => useCepHistory(), { wrapper });
    expect(result.current.history).toEqual([]);
  });

  it('deve adicionar item ao histórico', () => {
    const { result } = renderHook(() => useCepHistory(), { wrapper });

    act(() => {
      result.current.addToHistory(mockAddress);
    });

    expect(result.current.history).toHaveLength(1);
    expect(result.current.history[0].zipCode).toBe('01001000');
  });

  it('deve remover duplicatas ao adicionar mesmo CEP', () => {
    const { result } = renderHook(() => useCepHistory(), { wrapper });

    act(() => {
      result.current.addToHistory(mockAddress);
      result.current.addToHistory(mockAddress);
    });

    expect(result.current.history).toHaveLength(1);
  });

  it('deve manter apenas os últimos 10 itens', () => {
    const { result } = renderHook(() => useCepHistory(), { wrapper });

    act(() => {
      for (let i = 0; i < 12; i++) {
        result.current.addToHistory({
          ...mockAddress,
          zipCode: `0100100${i}`,
        });
      }
    });

    expect(result.current.history).toHaveLength(10);
  });

  it('deve remover item do histórico', () => {
    const { result } = renderHook(() => useCepHistory(), { wrapper });

    act(() => {
      result.current.addToHistory(mockAddress);
    });

    const itemId = result.current.history[0].id;

    act(() => {
      result.current.removeFromHistory(itemId);
    });

    expect(result.current.history).toHaveLength(0);
  });

  it('deve limpar todo o histórico', () => {
    const { result } = renderHook(() => useCepHistory(), { wrapper });

    act(() => {
      result.current.addToHistory(mockAddress);
      result.current.clearHistory();
    });

    expect(result.current.history).toHaveLength(0);
  });

  it('deve carregar histórico do localStorage ao inicializar', () => {
    const storedHistory: CepHistoryItem[] = [
      {
        id: '1',
        zipCode: '01001000',
        city: 'São Paulo',
        state: 'SP',
        timestamp: Date.now(),
        address: mockAddress,
      },
    ];
    localStorageMock.setItem('cep_history', JSON.stringify(storedHistory));

    const { result } = renderHook(() => useCepHistory(), { wrapper });

    expect(result.current.history).toHaveLength(1);
    expect(result.current.history[0].zipCode).toBe('01001000');
  });

  it('deve lidar com erro ao carregar histórico do localStorage (JSON inválido)', () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    localStorageMock.setItem('cep_history', 'invalid json');

    const { result } = renderHook(() => useCepHistory(), { wrapper });

    expect(result.current.history).toEqual([]);
    expect(consoleErrorSpy).toHaveBeenCalled();
    consoleErrorSpy.mockRestore();
  });

  it('deve lidar com erro ao salvar histórico no localStorage', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    // Simula erro ao salvar
    const originalSetItem = localStorageMock.setItem;
    let callCount = 0;
    localStorageMock.setItem = vi.fn((key: string, value: string) => {
      callCount++;
      // Erro na segunda chamada (quando tenta salvar após adicionar)
      if (callCount === 2) {
        throw new Error('Storage quota exceeded');
      }
      originalSetItem(key, value);
    });

    const { result } = renderHook(() => useCepHistory(), { wrapper });

    act(() => {
      result.current.addToHistory(mockAddress);
    });

    // Aguarda o useEffect executar
    await new Promise((resolve) => setTimeout(resolve, 50));

    // Verifica que o erro foi tratado (não quebrou a aplicação)
    expect(result.current.history).toHaveLength(1);
    
    localStorageMock.setItem = originalSetItem;
    consoleErrorSpy.mockRestore();
  });

  it('deve obter item do histórico por ID', () => {
    const { result } = renderHook(() => useCepHistory(), { wrapper });

    act(() => {
      result.current.addToHistory(mockAddress);
    });

    const itemId = result.current.history[0].id;
    const foundItem = result.current.getHistoryItem(itemId);

    expect(foundItem).toBeDefined();
    expect(foundItem?.zipCode).toBe('01001000');
  });

  it('deve retornar undefined quando item não é encontrado', () => {
    const { result } = renderHook(() => useCepHistory(), { wrapper });

    const foundItem = result.current.getHistoryItem('non-existent-id');

    expect(foundItem).toBeUndefined();
  });
});

