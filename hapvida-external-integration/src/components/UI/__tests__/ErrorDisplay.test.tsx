import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ErrorDisplay } from '../ErrorDisplay';
import { ErrorType, createAppError } from '@/utils/errors';

describe('ErrorDisplay', () => {
  it('deve renderizar erro com título padrão', () => {
    const error = createAppError(ErrorType.UNKNOWN, 'Erro desconhecido');
    render(<ErrorDisplay error={error} />);
    expect(screen.getByText('Erro')).toBeInTheDocument();
    expect(screen.getByText('Erro desconhecido')).toBeInTheDocument();
  });

  it('deve renderizar erro com título customizado', () => {
    const error = createAppError(ErrorType.UNKNOWN, 'Erro desconhecido');
    render(<ErrorDisplay error={error} title="Erro ao processar" />);
    expect(screen.getByText('Erro ao processar')).toBeInTheDocument();
  });

  it('deve exibir ícone correto para INVALID_CEP', () => {
    const error = createAppError(ErrorType.INVALID_CEP, 'CEP inválido');
    const { container } = render(<ErrorDisplay error={error} />);
    expect(container.querySelector('.ri-error-warning-line')).toBeTruthy();
  });

  it('deve exibir ícone correto para CEP_NOT_FOUND', () => {
    const error = createAppError(ErrorType.CEP_NOT_FOUND, 'CEP não encontrado');
    const { container } = render(<ErrorDisplay error={error} />);
    expect(container.querySelector('.ri-error-warning-line')).toBeTruthy();
  });

  it('deve exibir ícone correto para NETWORK_ERROR', () => {
    const error = createAppError(ErrorType.NETWORK_ERROR, 'Erro de rede');
    const { container } = render(<ErrorDisplay error={error} />);
    expect(container.querySelector('.ri-wifi-off-line')).toBeTruthy();
  });

  it('deve exibir ícone correto para TIMEOUT', () => {
    const error = createAppError(ErrorType.TIMEOUT, 'Timeout');
    const { container } = render(<ErrorDisplay error={error} />);
    expect(container.querySelector('.ri-wifi-off-line')).toBeTruthy();
  });

  it('deve exibir ícone correto para COORDINATES_ERROR', () => {
    const error = createAppError(ErrorType.COORDINATES_ERROR, 'Erro de coordenadas');
    const { container } = render(<ErrorDisplay error={error} />);
    expect(container.querySelector('.ri-map-pin-line')).toBeTruthy();
  });

  it('deve exibir ícone correto para WEATHER_ERROR', () => {
    const error = createAppError(ErrorType.WEATHER_ERROR, 'Erro de clima');
    const { container } = render(<ErrorDisplay error={error} />);
    expect(container.querySelector('.ri-cloud-off-line')).toBeTruthy();
  });

  it('deve exibir ícone padrão para UNKNOWN', () => {
    const error = createAppError(ErrorType.UNKNOWN, 'Erro desconhecido');
    const { container } = render(<ErrorDisplay error={error} />);
    expect(container.querySelector('.ri-alert-line')).toBeTruthy();
  });

  it('deve exibir botão de retry quando erro é retryable e onRetry fornecido', async () => {
    const error = createAppError(ErrorType.NETWORK_ERROR, 'Erro de rede', undefined, true);
    const onRetry = vi.fn();
    const user = userEvent.setup();
    render(<ErrorDisplay error={error} onRetry={onRetry} />);

    const retryButton = screen.getByRole('button', { name: /tentar novamente/i });
    expect(retryButton).toBeInTheDocument();

    await user.click(retryButton);
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('não deve exibir botão de retry quando erro não é retryable', () => {
    const error = createAppError(ErrorType.INVALID_CEP, 'CEP inválido', undefined, false);
    const onRetry = vi.fn();
    render(<ErrorDisplay error={error} onRetry={onRetry} />);

    expect(screen.queryByRole('button', { name: /tentar novamente/i })).not.toBeInTheDocument();
  });

  it('não deve exibir botão de retry quando onRetry não é fornecido', () => {
    const error = createAppError(ErrorType.NETWORK_ERROR, 'Erro de rede', undefined, true);
    render(<ErrorDisplay error={error} />);

    expect(screen.queryByRole('button', { name: /tentar novamente/i })).not.toBeInTheDocument();
  });

  it('deve aplicar className customizada', () => {
    const error = createAppError(ErrorType.UNKNOWN, 'Erro');
    const { container } = render(<ErrorDisplay error={error} className="custom-class" />);
    expect(container.querySelector('.custom-class')).toBeInTheDocument();
  });

  it('deve aplicar cores corretas para diferentes tipos de erro', () => {
    const { rerender, container } = render(
      <ErrorDisplay error={createAppError(ErrorType.INVALID_CEP, 'Erro')} />
    );
    expect(container.querySelector('.bg-yellow-50')).toBeTruthy();

    rerender(<ErrorDisplay error={createAppError(ErrorType.NETWORK_ERROR, 'Erro')} />);
    expect(container.querySelector('.bg-orange-50')).toBeTruthy();

    rerender(<ErrorDisplay error={createAppError(ErrorType.COORDINATES_ERROR, 'Erro')} />);
    expect(container.querySelector('.bg-blue-50')).toBeTruthy();

    rerender(<ErrorDisplay error={createAppError(ErrorType.UNKNOWN, 'Erro')} />);
    expect(container.querySelector('.bg-red-50')).toBeTruthy();
  });
});

