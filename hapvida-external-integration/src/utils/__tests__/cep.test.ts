import { describe, it, expect } from 'vitest';
import { normalizeZipCode, formatZipCode, isValidZipCode, applyZipCodeMask } from '../cep';

describe('CEP Utils', () => {
  describe('normalizeZipCode', () => {
    it('deve remover hífen e espaços', () => {
      expect(normalizeZipCode('01001-000')).toBe('01001000');
      expect(normalizeZipCode('01001 000')).toBe('01001000');
      expect(normalizeZipCode('01001- 000')).toBe('01001000');
    });

    it('deve retornar apenas dígitos', () => {
      expect(normalizeZipCode('01001000')).toBe('01001000');
    });
  });

  describe('formatZipCode', () => {
    it('deve formatar CEP com hífen quando tem 8 dígitos', () => {
      expect(formatZipCode('01001000')).toBe('01001-000');
    });

    it('deve retornar sem formatação se não tiver 8 dígitos', () => {
      expect(formatZipCode('01001')).toBe('01001');
    });
  });

  describe('isValidZipCode', () => {
    it('deve validar CEP com 8 dígitos', () => {
      expect(isValidZipCode('01001000')).toBe(true);
      expect(isValidZipCode('01001-000')).toBe(true);
    });

    it('deve rejeitar CEPs inválidos', () => {
      expect(isValidZipCode('123')).toBe(false);
      expect(isValidZipCode('123456789')).toBe(false);
      expect(isValidZipCode('abc12345')).toBe(false);
    });
  });

  describe('applyZipCodeMask', () => {
    it('deve aplicar máscara enquanto digita', () => {
      expect(applyZipCodeMask('01001')).toBe('01001');
      expect(applyZipCodeMask('01001000')).toBe('01001-000');
      expect(applyZipCodeMask('010010001')).toBe('01001-000');
    });
  });
});

