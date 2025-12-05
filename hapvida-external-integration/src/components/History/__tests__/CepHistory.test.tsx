import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactElement } from 'react';
import { CepHistory } from '../CepHistory';
import { CepHistoryProvider } from '@/contexts/CepHistoryContext';
import toast from 'react-hot-toast';

// Mock do toast
vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock do window.confirm
const mockConfirm = vi.fn();
window.confirm = mockConfirm;

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

describe('CepHistory', () => {
  const mockOnSelectCep = vi.fn();

  const mockHistory = [
    {
      id: '1',
      zipCode: '01001000',
      city: 'São Paulo',
      state: 'SP',
      timestamp: Date.now() - 1000 * 60 * 5, // 5 minutos atrás
      address: {
        zipCode: '01001000',
        city: 'São Paulo',
        state: 'SP',
        street: 'Praça da Sé',
        district: 'Sé',
        ibge: null,
        location: null,
        provider: 'brasilapi',
      },
    },
    {
      id: '2',
      zipCode: '20020000',
      city: 'Rio de Janeiro',
      state: 'RJ',
      timestamp: Date.now() - 1000 * 60 * 10, // 10 minutos atrás
      address: {
        zipCode: '20020000',
        city: 'Rio de Janeiro',
        state: 'RJ',
        street: 'Praça Mauá',
        district: 'Centro',
        ibge: null,
        location: null,
        provider: 'brasilapi',
      },
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.clear();
    // Preenche localStorage com histórico mockado
    localStorageMock.setItem('cep_history', JSON.stringify(mockHistory));
  });

  const renderWithProvider = (component: ReactElement) => {
    return render(<CepHistoryProvider>{component}</CepHistoryProvider>);
  };

  it('deve renderizar histórico quando há itens', async () => {
    renderWithProvider(<CepHistory onSelectCep={mockOnSelectCep} />);
    
    await waitFor(() => {
      expect(screen.getByText(/2 registros salvos/i)).toBeInTheDocument();
    });
    expect(screen.getByText(/01001-000/i)).toBeInTheDocument();
    expect(screen.getByText(/20020-000/i)).toBeInTheDocument();
  });

  it('deve renderizar mensagem quando histórico está vazio', () => {
    localStorageMock.clear();
    renderWithProvider(<CepHistory onSelectCep={mockOnSelectCep} />);
    expect(screen.getByText(/nenhum cep consultado ainda/i)).toBeInTheDocument();
    expect(screen.getByText(/0 registros salvos/i)).toBeInTheDocument();
  });

  it('deve selecionar item quando clicado', async () => {
    const user = userEvent.setup();
    renderWithProvider(<CepHistory onSelectCep={mockOnSelectCep} />);

    await waitFor(() => {
      expect(screen.getByText(/01001-000/i)).toBeInTheDocument();
    });

    const firstItem = screen.getByLabelText(/selecionar cep 01001-000/i);
    expect(firstItem).toBeInTheDocument();

    await user.click(firstItem);

    await waitFor(() => {
      expect(mockOnSelectCep).toHaveBeenCalledWith('01001000');
      expect(toast.success).toHaveBeenCalledWith('CEP carregado do histórico');
    });
  });

  it('deve remover item quando clicado no botão de remover', async () => {
    const user = userEvent.setup();
    renderWithProvider(<CepHistory onSelectCep={mockOnSelectCep} />);

    await waitFor(() => {
      expect(screen.getByText(/01001-000/i)).toBeInTheDocument();
    });

    const removeButtons = screen.getAllByLabelText(/remover/i);
    expect(removeButtons.length).toBeGreaterThan(0);

    await user.click(removeButtons[0]);

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith('Item removido do histórico');
    });
  });

  it('deve limpar histórico quando clicado em limpar', async () => {
    mockConfirm.mockReturnValue(true);
    const user = userEvent.setup();
    renderWithProvider(<CepHistory onSelectCep={mockOnSelectCep} />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /limpar/i })).toBeInTheDocument();
    });

    const clearButton = screen.getByRole('button', { name: /limpar/i });
    await user.click(clearButton);

    expect(mockConfirm).toHaveBeenCalled();
    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith('Histórico limpo com sucesso');
    });
  });

  it('não deve limpar histórico quando usuário cancela', async () => {
    mockConfirm.mockReturnValue(false);
    const user = userEvent.setup();
    renderWithProvider(<CepHistory onSelectCep={mockOnSelectCep} />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /limpar/i })).toBeInTheDocument();
    });

    const clearButton = screen.getByRole('button', { name: /limpar/i });
    await user.click(clearButton);

    expect(mockConfirm).toHaveBeenCalled();
    // Histórico não deve ser limpo - ainda deve ter os itens
    expect(screen.getByText(/2 registros salvos/i)).toBeInTheDocument();
    expect(screen.getByText(/01001-000/i)).toBeInTheDocument();
  });

  it('deve exibir erro quando onSelectCep lança erro', async () => {
    const error = new Error('Erro ao carregar CEP');
    mockOnSelectCep.mockRejectedValue(error);
    const user = userEvent.setup();
    renderWithProvider(<CepHistory onSelectCep={mockOnSelectCep} />);

    await waitFor(() => {
      expect(screen.getByText(/01001-000/i)).toBeInTheDocument();
    });

    const firstItem = screen.getByLabelText(/selecionar cep 01001-000/i);
    await user.click(firstItem);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalled();
    });
  });
});

