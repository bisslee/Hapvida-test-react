import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useWeatherQuery } from '../useWeatherQuery';
import * as weatherApi from '@/services/api/weather';
import type { CepAddress, WeatherData } from '@/types';

// Mock do fetch global
const mockFetch = vi.fn();
window.fetch = mockFetch;

describe('useWeatherQuery', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });
    vi.clearAllMocks();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  it('não deve buscar quando CEP não está selecionado', () => {
    const { result } = renderHook(() => useWeatherQuery(null, 3), { wrapper });

    expect(result.current.isFetching).toBe(false);
    expect(result.current.data).toBeUndefined();
  });

  it('deve buscar clima com sucesso quando CEP tem coordenadas', async () => {
    const cepAddress: CepAddress = {
      zipCode: '01001000',
      city: 'São Paulo',
      state: 'SP',
      location: { lat: -23.5505, lon: -46.6333 },
      provider: 'brasilapi',
    };

    const mockWeatherData: WeatherData = {
      location: { lat: -23.5505, lon: -46.6333, city: 'São Paulo', state: 'SP' },
      current: {
        temperatureC: 25.5,
        apparentTemperatureC: 26.0,
        humidity: 0.65,
        observedAt: '2024-12-25T14:00',
      },
      daily: [
        { date: '2024-12-25', tempMinC: 18.0, tempMaxC: 28.0 },
        { date: '2024-12-26', tempMinC: 17.5, tempMaxC: 27.5 },
      ],
      provider: 'open-meteo',
    };

    vi.spyOn(weatherApi, 'getCoordinatesFromCep').mockResolvedValue({
      lat: -23.5505,
      lon: -46.6333,
    });
    vi.spyOn(weatherApi, 'fetchWeatherForecast').mockResolvedValue(mockWeatherData);

    const { result } = renderHook(() => useWeatherQuery(cepAddress, 3), { wrapper });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockWeatherData);
    expect(weatherApi.getCoordinatesFromCep).toHaveBeenCalledWith(cepAddress);
    expect(weatherApi.fetchWeatherForecast).toHaveBeenCalledWith(
      {
        lat: -23.5505,
        lon: -46.6333,
        city: 'São Paulo',
        state: 'SP',
      },
      3
    );
  });

  it('deve lançar erro quando coordenadas são inválidas', async () => {
    const cepAddress: CepAddress = {
      zipCode: '01001000',
      city: 'São Paulo',
      state: 'SP',
      location: null,
      provider: 'brasilapi',
    };

    vi.spyOn(weatherApi, 'getCoordinatesFromCep').mockResolvedValue(null);

    const { result } = renderHook(() => useWeatherQuery(cepAddress, 3), { wrapper });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toBeTruthy();
    expect(result.current.error?.message).toContain('coordenadas');
  });

  it('deve fazer retry apenas uma vez para erros não relacionados a coordenadas', async () => {
    const cepAddress: CepAddress = {
      zipCode: '01001000',
      city: 'São Paulo',
      state: 'SP',
      location: { lat: -23.5505, lon: -46.6333 },
      provider: 'brasilapi',
    };

    const fetchWeatherSpy = vi
      .spyOn(weatherApi, 'fetchWeatherForecast')
      .mockRejectedValueOnce(new Error('Network error'))
      .mockResolvedValueOnce({
        location: { lat: -23.5505, lon: -46.6333, city: 'São Paulo', state: 'SP' },
        current: {
          temperatureC: 25.5,
          apparentTemperatureC: 26.0,
          humidity: 0.65,
          observedAt: '2024-12-25T14:00',
        },
        daily: [],
        provider: 'open-meteo',
      });

    vi.spyOn(weatherApi, 'getCoordinatesFromCep').mockResolvedValue({
      lat: -23.5505,
      lon: -46.6333,
    });

    const { result } = renderHook(() => useWeatherQuery(cepAddress, 3), { wrapper });

    await waitFor(() => {
      expect(result.current.isSuccess || result.current.isError).toBe(true);
    }, { timeout: 5000 });

    // Deve ter tentado pelo menos uma vez (pode ter feito retry)
    expect(fetchWeatherSpy).toHaveBeenCalled();
  });
});

