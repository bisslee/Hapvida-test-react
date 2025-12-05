import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fetchCepFromBrasilApi, fetchCepFromViaCep, fetchCep } from '../cep';
import type { BrasilApiResponse, ViaCepResponse } from '@/types';

// Mock do fetch global
const mockFetch = vi.fn();
window.fetch = mockFetch;

describe('cep API service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('fetchCepFromBrasilApi', () => {
    it('deve buscar CEP com sucesso na BrasilAPI', async () => {
      const mockResponse: BrasilApiResponse = {
        cep: '01001000',
        state: 'SP',
        city: 'São Paulo',
        neighborhood: 'Sé',
        street: 'Praça da Sé',
        service: 'open-cep',
        location: {
          type: 'Point',
          coordinates: {
            latitude: -23.5505,
            longitude: -46.6333,
          },
        },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockResponse,
      });

      const result = await fetchCepFromBrasilApi('01001000');

      expect(result).toBeTruthy();
      expect(result?.zipCode).toBe('01001000');
      expect(result?.city).toBe('São Paulo');
      expect(result?.state).toBe('SP');
      expect(result?.provider).toBe('brasilapi');
      expect(result?.location).toEqual({ lat: -23.5505, lon: -46.6333 });
      expect(mockFetch).toHaveBeenCalledWith(
        'https://brasilapi.com.br/api/cep/v2/01001000',
        expect.objectContaining({
          signal: expect.any(AbortSignal),
        })
      );
    });

    it('deve retornar null quando CEP não encontrado (404)', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
      });

      const result = await fetchCepFromBrasilApi('00000000');

      expect(result).toBeNull();
    });

    it('deve lançar erro quando API retorna erro', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      await expect(fetchCepFromBrasilApi('01001000')).rejects.toThrow();
    });

    it('deve lançar erro de timeout', async () => {
      const abortError = new Error('Timeout');
      abortError.name = 'AbortError';
      mockFetch.mockRejectedValueOnce(abortError);

      await expect(fetchCepFromBrasilApi('01001000')).rejects.toThrow('Timeout');
    });
  });

  describe('fetchCepFromViaCep', () => {
    it('deve buscar CEP com sucesso na ViaCEP', async () => {
      const mockResponse: ViaCepResponse = {
        cep: '01001-000',
        logradouro: 'Praça da Sé',
        complemento: '',
        bairro: 'Sé',
        localidade: 'São Paulo',
        uf: 'SP',
        ibge: '3550308',
        erro: false,
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockResponse,
      });

      const result = await fetchCepFromViaCep('01001000');

      expect(result).toBeTruthy();
      expect(result?.zipCode).toBe('01001000');
      expect(result?.city).toBe('São Paulo');
      expect(result?.state).toBe('SP');
      expect(result?.provider).toBe('viacep');
      expect(result?.location).toBeNull();
      expect(mockFetch).toHaveBeenCalledWith(
        'https://viacep.com.br/ws/01001000/json/',
        expect.objectContaining({
          signal: expect.any(AbortSignal),
        })
      );
    });

    it('deve retornar null quando CEP não encontrado (erro: true)', async () => {
      const mockResponse: ViaCepResponse = {
        cep: '',
        logradouro: '',
        complemento: '',
        bairro: '',
        localidade: '',
        uf: '',
        ibge: '',
        erro: true,
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockResponse,
      });

      const result = await fetchCepFromViaCep('00000000');

      expect(result).toBeNull();
    });

    it('deve lançar erro quando API retorna erro', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      await expect(fetchCepFromViaCep('01001000')).rejects.toThrow();
    });
  });

  describe('fetchCep', () => {
    it('deve buscar CEP com sucesso usando BrasilAPI', async () => {
      const mockResponse: BrasilApiResponse = {
        cep: '01001000',
        state: 'SP',
        city: 'São Paulo',
        neighborhood: 'Sé',
        street: 'Praça da Sé',
        service: 'open-cep',
        location: {
          type: 'Point',
          coordinates: {
            latitude: -23.5505,
            longitude: -46.6333,
          },
        },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockResponse,
      });

      const result = await fetchCep('01001000');

      expect(result.zipCode).toBe('01001000');
      expect(result.provider).toBe('brasilapi');
    });

    it('deve usar ViaCEP como fallback quando BrasilAPI falha', async () => {
      // BrasilAPI retorna 404
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
      });

      // ViaCEP retorna sucesso
      const viaCepResponse: ViaCepResponse = {
        cep: '01001-000',
        logradouro: 'Praça da Sé',
        complemento: '',
        bairro: 'Sé',
        localidade: 'São Paulo',
        uf: 'SP',
        ibge: '3550308',
        erro: false,
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => viaCepResponse,
      });

      const result = await fetchCep('01001000');

      expect(result.zipCode).toBe('01001000');
      expect(result.provider).toBe('viacep');
    });

    it('deve lançar erro quando CEP é inválido', async () => {
      await expect(fetchCep('123')).rejects.toThrow('inválido');
      await expect(fetchCep('abc')).rejects.toThrow('inválido');
    });

    it('deve lançar erro quando nenhum provedor encontra o CEP', async () => {
      // BrasilAPI retorna 404
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
      });

      // ViaCEP retorna erro
      const viaCepResponse: ViaCepResponse = {
        cep: '',
        logradouro: '',
        complemento: '',
        bairro: '',
        localidade: '',
        uf: '',
        ibge: '',
        erro: true,
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => viaCepResponse,
      });

      await expect(fetchCep('00000000')).rejects.toThrow('não encontrado');
    });
  });
});

