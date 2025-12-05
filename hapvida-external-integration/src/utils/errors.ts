/**
 * Tipos de erro customizados para melhor tratamento
 */

export const ErrorType = {
  INVALID_CEP: 'INVALID_CEP',
  CEP_NOT_FOUND: 'CEP_NOT_FOUND',
  NETWORK_ERROR: 'NETWORK_ERROR',
  TIMEOUT: 'TIMEOUT',
  COORDINATES_ERROR: 'COORDINATES_ERROR',
  WEATHER_ERROR: 'WEATHER_ERROR',
  UNKNOWN: 'UNKNOWN',
} as const;

export type ErrorType = typeof ErrorType[keyof typeof ErrorType];

export interface AppError {
  type: ErrorType;
  message: string;
  originalError?: Error;
  retryable: boolean;
}

/**
 * Cria um erro customizado da aplicação
 */
export function createAppError(
  type: ErrorType,
  message: string,
  originalError?: Error,
  retryable = true
): AppError {
  return {
    type,
    message,
    originalError,
    retryable,
  };
}

/**
 * Converte um erro genérico em AppError
 */
export function normalizeError(error: unknown): AppError {
  if (error instanceof Error) {
    const errorMessage = error.message.toLowerCase();

    // Timeout
    if (error.name === 'AbortError' || errorMessage.includes('timeout')) {
      return createAppError(
        ErrorType.TIMEOUT,
        'A requisição demorou muito para responder. Verifique sua conexão e tente novamente.',
        error,
        true
      );
    }

    // CEP inválido
    if (
      errorMessage.includes('cep inválido') ||
      errorMessage.includes('deve conter 8 dígitos') ||
      errorMessage.includes('obrigatório')
    ) {
      return createAppError(
        ErrorType.INVALID_CEP,
        'CEP inválido. Digite um CEP com 8 dígitos.',
        error,
        false
      );
    }

    // CEP não encontrado
    if (
      errorMessage.includes('não encontrado') ||
      errorMessage.includes('not found') ||
      errorMessage.includes('404')
    ) {
      return createAppError(
        ErrorType.CEP_NOT_FOUND,
        'CEP não encontrado. Verifique se o CEP está correto.',
        error,
        false
      );
    }

    // Erro de coordenadas
    if (
      errorMessage.includes('coordenadas') ||
      errorMessage.includes('coordenadas inválidas')
    ) {
      return createAppError(
        ErrorType.COORDINATES_ERROR,
        'Não foi possível obter as coordenadas para este CEP. Tente outro CEP.',
        error,
        false
      );
    }

    // Erro de clima
    if (errorMessage.includes('clima') || errorMessage.includes('weather')) {
      return createAppError(
        ErrorType.WEATHER_ERROR,
        'Erro ao consultar previsão do tempo. Tente novamente mais tarde.',
        error,
        true
      );
    }

    // Erro de rede
    if (
      errorMessage.includes('network') ||
      errorMessage.includes('fetch') ||
      errorMessage.includes('failed to fetch') ||
      errorMessage.includes('conectividade')
    ) {
      return createAppError(
        ErrorType.NETWORK_ERROR,
        'Erro de conexão. Verifique sua internet e tente novamente.',
        error,
        true
      );
    }
  }

  // Erro desconhecido
  return createAppError(
    ErrorType.UNKNOWN,
    'Ocorreu um erro inesperado. Tente novamente.',
    error instanceof Error ? error : new Error(String(error)),
    true
  );
}

/**
 * Obtém mensagem amigável baseada no tipo de erro
 */
export function getErrorMessage(error: AppError): string {
  return error.message;
}

/**
 * Verifica se o erro permite retry
 */
export function isRetryable(error: AppError): boolean {
  return error.retryable;
}

