import { describe, it, expect } from 'vitest';
import {
  ErrorType,
  createAppError,
  normalizeError,
  getErrorMessage,
  isRetryable,
} from '../errors';

describe('errors utils', () => {
  describe('createAppError', () => {
    it('deve criar erro customizado com todos os campos', () => {
      const originalError = new Error('Original error');
      const appError = createAppError(ErrorType.NETWORK_ERROR, 'Erro de rede', originalError, true);

      expect(appError.type).toBe(ErrorType.NETWORK_ERROR);
      expect(appError.message).toBe('Erro de rede');
      expect(appError.originalError).toBe(originalError);
      expect(appError.retryable).toBe(true);
    });

    it('deve criar erro sem originalError quando não fornecido', () => {
      const appError = createAppError(ErrorType.INVALID_CEP, 'CEP inválido', undefined, false);

      expect(appError.type).toBe(ErrorType.INVALID_CEP);
      expect(appError.message).toBe('CEP inválido');
      expect(appError.originalError).toBeUndefined();
      expect(appError.retryable).toBe(false);
    });

    it('deve usar retryable=true como padrão', () => {
      const appError = createAppError(ErrorType.UNKNOWN, 'Erro desconhecido');

      expect(appError.retryable).toBe(true);
    });
  });

  describe('normalizeError', () => {
    it('deve normalizar erro de timeout', () => {
      const error = new Error('Timeout');
      error.name = 'AbortError';
      const appError = normalizeError(error);

      expect(appError.type).toBe(ErrorType.TIMEOUT);
      expect(appError.retryable).toBe(true);
      expect(appError.message).toContain('demorou muito');
    });

    it('deve normalizar erro de CEP inválido', () => {
      const error = new Error('CEP inválido. Deve conter 8 dígitos.');
      const appError = normalizeError(error);

      expect(appError.type).toBe(ErrorType.INVALID_CEP);
      expect(appError.retryable).toBe(false);
      expect(appError.message).toContain('8 dígitos');
    });

    it('deve normalizar erro de CEP não encontrado', () => {
      const error = new Error('CEP não encontrado');
      const appError = normalizeError(error);

      expect(appError.type).toBe(ErrorType.CEP_NOT_FOUND);
      expect(appError.retryable).toBe(false);
      expect(appError.message).toContain('não encontrado');
    });

    it('deve normalizar erro de coordenadas', () => {
      const error = new Error('Coordenadas inválidas');
      const appError = normalizeError(error);

      expect(appError.type).toBe(ErrorType.COORDINATES_ERROR);
      expect(appError.retryable).toBe(false);
      expect(appError.message).toContain('coordenadas');
    });

    it('deve normalizar erro de clima', () => {
      const error = new Error('Erro ao consultar clima');
      const appError = normalizeError(error);

      expect(appError.type).toBe(ErrorType.WEATHER_ERROR);
      expect(appError.retryable).toBe(true);
      expect(appError.message).toContain('previsão do tempo');
    });

    it('deve normalizar erro de rede', () => {
      const error = new Error('Failed to fetch');
      const appError = normalizeError(error);

      expect(appError.type).toBe(ErrorType.NETWORK_ERROR);
      expect(appError.retryable).toBe(true);
      expect(appError.message).toContain('conexão');
    });

    it('deve normalizar erro desconhecido quando não é Error', () => {
      const appError = normalizeError('String error');

      expect(appError.type).toBe(ErrorType.UNKNOWN);
      expect(appError.retryable).toBe(true);
      expect(appError.message).toContain('inesperado');
    });

    it('deve normalizar erro desconhecido quando não corresponde a nenhum padrão', () => {
      const error = new Error('Erro genérico');
      const appError = normalizeError(error);

      expect(appError.type).toBe(ErrorType.UNKNOWN);
      expect(appError.retryable).toBe(true);
      expect(appError.message).toContain('inesperado');
    });
  });

  describe('getErrorMessage', () => {
    it('deve retornar mensagem do erro', () => {
      const appError = createAppError(ErrorType.NETWORK_ERROR, 'Erro de rede');
      expect(getErrorMessage(appError)).toBe('Erro de rede');
    });
  });

  describe('isRetryable', () => {
    it('deve retornar true para erro retryable', () => {
      const appError = createAppError(ErrorType.NETWORK_ERROR, 'Erro', undefined, true);
      expect(isRetryable(appError)).toBe(true);
    });

    it('deve retornar false para erro não retryable', () => {
      const appError = createAppError(ErrorType.INVALID_CEP, 'Erro', undefined, false);
      expect(isRetryable(appError)).toBe(false);
    });
  });
});

