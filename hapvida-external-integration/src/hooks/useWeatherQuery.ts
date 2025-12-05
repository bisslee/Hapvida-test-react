import { useQuery } from '@tanstack/react-query';
import { fetchWeatherForecast, getCoordinatesFromCep } from '@/services/api/weather';
import type { CepAddress, WeatherData } from '@/types';

/**
 * Hook customizado para buscar dados de clima baseado no CEP
 * Usa TanStack Query para cache automático (10 minutos)
 */
export function useWeatherQuery(cepAddress: CepAddress | null, days: number = 3) {
  return useQuery<WeatherData>({
    queryKey: ['weather', cepAddress?.city, cepAddress?.state, days],
    queryFn: async () => {
      if (!cepAddress) {
        console.error('[useWeatherQuery] CEP não selecionado');
        throw new Error('CEP não selecionado');
      }

      console.log('[useWeatherQuery] Iniciando busca de clima para:', {
        city: cepAddress.city,
        state: cepAddress.state,
        hasLocation: !!cepAddress.location,
        location: cepAddress.location,
        days,
      });

      // Obtém coordenadas (do CEP ou geocodifica)
      console.log('[useWeatherQuery] Obtendo coordenadas...');
      const coordinates = await getCoordinatesFromCep(cepAddress);
      console.log('[useWeatherQuery] Coordenadas obtidas:', coordinates);

      // Valida se as coordenadas são números válidos
      if (
        !coordinates ||
        typeof coordinates.lat !== 'number' ||
        typeof coordinates.lon !== 'number' ||
        isNaN(coordinates.lat) ||
        isNaN(coordinates.lon) ||
        !isFinite(coordinates.lat) ||
        !isFinite(coordinates.lon)
      ) {
        console.error('[useWeatherQuery] Coordenadas inválidas:', coordinates);
        throw new Error('Não foi possível obter coordenadas para consultar o clima. Tente outro CEP.');
      }

      console.log('[useWeatherQuery] Coordenadas válidas, buscando previsão...', {
        lat: coordinates.lat,
        lon: coordinates.lon,
      });

      // Busca previsão do tempo
      const weatherData = await fetchWeatherForecast(
        {
          lat: coordinates.lat,
          lon: coordinates.lon,
          city: cepAddress.city,
          state: cepAddress.state,
        },
        days
      );

      console.log('[useWeatherQuery] Previsão obtida com sucesso:', weatherData);
      return weatherData;
    },
    enabled: !!cepAddress, // Só busca se houver CEP selecionado
    staleTime: 10 * 60 * 1000, // 10 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
    retry: (failureCount, error) => {
      // Não retry para erros de coordenadas
      if (error instanceof Error) {
        const errorMsg = error.message.toLowerCase();
        if (errorMsg.includes('coordenadas') || errorMsg.includes('não foi possível obter')) {
          return false;
        }
      }
      // Retry apenas uma vez para outros erros
      return failureCount < 1;
    },
    retryDelay: 1000,
  });
}

