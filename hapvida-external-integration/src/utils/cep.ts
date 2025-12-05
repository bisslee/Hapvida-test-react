/**
 * Normaliza CEP removendo caracteres não numéricos
 */
export function normalizeZipCode(zipCode: string): string {
  return zipCode.replace(/\D/g, '');
}

/**
 * Formata CEP com hífen (XXXXX-XXX)
 */
export function formatZipCode(zipCode: string): string {
  const normalized = normalizeZipCode(zipCode);
  if (normalized.length === 8) {
    return `${normalized.slice(0, 5)}-${normalized.slice(5)}`;
  }
  return normalized;
}

/**
 * Valida se o CEP tem 8 dígitos
 */
export function isValidZipCode(zipCode: string): boolean {
  const normalized = normalizeZipCode(zipCode);
  return normalized.length === 8 && /^\d{8}$/.test(normalized);
}

/**
 * Aplica máscara de CEP enquanto o usuário digita
 */
export function applyZipCodeMask(value: string): string {
  const normalized = normalizeZipCode(value);
  
  if (normalized.length <= 5) {
    return normalized;
  }
  
  return `${normalized.slice(0, 5)}-${normalized.slice(5, 8)}`;
}

