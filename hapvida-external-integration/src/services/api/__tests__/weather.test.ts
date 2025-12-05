import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  geocodeCityState,
  fetchWeatherForecast,
  getCoordinatesFromCep,
} from '../weather';
import type { OpenMeteoForecastResponse, OpenMeteoGeocodingResponse } from '@/types';

// Mock do fetch global
const mockFetch = vi.fn();
window.fetch = mockFetch;

describe('weather API service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('geocodeCityState', () => {
    it('deve geocodificar cidade e estado com sucesso', async () => {
      const mockResponse: OpenMeteoGeocodingResponse = {
        results: [
          {
            id: 1,
            name: 'São Paulo',
            latitude: -23.5505,
            longitude: -46.6333,
            elevation: 760,
            feature_code: 'PPLA',
            country_code: 'BR',
            admin1: 'SP',
            timezone: 'America/Sao_Paulo',
            population: 12325232,
          },
        ],
        generationtime_ms: 0.5,
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockResponse,
      });

      const result = await geocodeCityState('São Paulo', 'SP');

      expect(result).toBeTruthy();
      expect(result?.lat).toBe(-23.5505);
      expect(result?.lon).toBe(-46.6333);
    });

    it('deve retornar null quando nenhum resultado encontrado', async () => {
      const mockResponse: OpenMeteoGeocodingResponse = {
        results: [],
        generationtime_ms: 0.5,
      };

      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => mockResponse,
      });

      const result = await geocodeCityState('CidadeInexistente', 'XX');

      expect(result).toBeNull();
    });
  });

  describe('fetchWeatherForecast', () => {
    it('deve buscar previsão do tempo com sucesso', async () => {
      const mockResponse: OpenMeteoForecastResponse = {
        latitude: -23.5505,
        longitude: -46.6333,
        generationtime_ms: 0.5,
        utc_offset_seconds: -10800,
        timezone: 'America/Sao_Paulo',
        timezone_abbreviation: 'BRT',
        elevation: 760,
        current_units: {
          time: 'iso8601',
          interval: 'seconds',
          temperature_2m: '°C',
          relative_humidity_2m: '%',
          apparent_temperature: '°C',
        },
        current: {
          time: '2024-12-25T14:00',
          interval: 3600,
          temperature_2m: 25.5,
          relative_humidity_2m: 65,
          apparent_temperature: 26.0,
        },
        daily_units: {
          time: 'iso8601',
          temperature_2m_max: '°C',
          temperature_2m_min: '°C',
        },
        daily: {
          time: ['2024-12-25', '2024-12-26', '2024-12-27'],
          temperature_2m_max: [28.0, 27.5, 29.0],
          temperature_2m_min: [18.0, 17.5, 19.0],
        },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockResponse,
      });

      const result = await fetchWeatherForecast(
        { lat: -23.5505, lon: -46.6333, city: 'São Paulo', state: 'SP' },
        3
      );

      expect(result).toBeTruthy();
      expect(result.location.city).toBe('São Paulo');
      expect(result.current.temperatureC).toBe(25.5);
      expect(result.current.humidity).toBe(0.65); // Convertido de 65% para 0.65
      expect(result.daily).toHaveLength(3);
      expect(result.daily[0].tempMaxC).toBe(28.0);
      expect(result.daily[0].tempMinC).toBe(18.0);
      expect(result.provider).toBe('open-meteo');
    });

    it('deve lançar erro quando API retorna erro', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        text: async () => 'Internal Server Error',
      });

      await expect(
        fetchWeatherForecast(
          { lat: -23.5505, lon: -46.6333, city: 'São Paulo', state: 'SP' },
          3
        )
      ).rejects.toThrow();
    });
  });

  describe('getCoordinatesFromCep', () => {
    it('deve retornar coordenadas quando já existem no CEP', async () => {
      const cepAddress = {
        city: 'São Paulo',
        state: 'SP',
        location: { lat: -23.5505, lon: -46.6333 },
      };

      const result = await getCoordinatesFromCep(cepAddress);

      expect(result).toEqual({ lat: -23.5505, lon: -46.6333 });
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it('deve geocodificar quando não há coordenadas no CEP', async () => {
      const cepAddress = {
        city: 'São Paulo',
        state: 'SP',
        location: null,
      };

      const mockResponse: OpenMeteoGeocodingResponse = {
        results: [
          {
            id: 1,
            name: 'São Paulo',
            latitude: -23.5505,
            longitude: -46.6333,
            elevation: 760,
            feature_code: 'PPLA',
            country_code: 'BR',
            admin1: 'SP',
            timezone: 'America/Sao_Paulo',
            population: 12325232,
          },
        ],
        generationtime_ms: 0.5,
      };

      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => mockResponse,
      });

      const result = await getCoordinatesFromCep(cepAddress);

      expect(result).toBeTruthy();
      expect(result?.lat).toBe(-23.5505);
      expect(result?.lon).toBe(-46.6333);
    });

    it('deve retornar null quando geocodificação falha', async () => {
      const cepAddress = {
        city: 'CidadeInexistente',
        state: 'XX',
        location: null,
      };

      const mockResponse: OpenMeteoGeocodingResponse = {
        results: [],
        generationtime_ms: 0.5,
      };

      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => mockResponse,
      });

      const result = await getCoordinatesFromCep(cepAddress);

      expect(result).toBeNull();
    });

    it('deve retornar null quando coordenadas são inválidas (NaN)', async () => {
      const cepAddress = {
        city: 'São Paulo',
        state: 'SP',
        location: { lat: NaN, lon: NaN },
      };

      const mockResponse: OpenMeteoGeocodingResponse = {
        results: [
          {
            id: 1,
            name: 'São Paulo',
            latitude: -23.5505,
            longitude: -46.6333,
            elevation: 760,
            feature_code: 'PPLA',
            country_code: 'BR',
            admin1: 'SP',
            timezone: 'America/Sao_Paulo',
            population: 12325232,
          },
        ],
        generationtime_ms: 0.5,
      };

      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => mockResponse,
      });

      const result = await getCoordinatesFromCep(cepAddress);

      expect(result).toBeTruthy();
      expect(result?.lat).toBe(-23.5505);
      expect(result?.lon).toBe(-46.6333);
    });
  });
});

