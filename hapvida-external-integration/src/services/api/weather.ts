import type {
  WeatherData,
  WeatherLocation,
  OpenMeteoForecastResponse,
  OpenMeteoGeocodingResponse,
} from '@/types';

const OPEN_METEO_FORECAST_URL = 'https://api.open-meteo.com/v1/forecast';
const OPEN_METEO_GEOCODING_URL = 'https://geocoding-api.open-meteo.com/v1/search';

/**
 * Remove acentos de uma string
 */
function removeAccents(str: string): string {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

/**
 * Geocodifica usando Nominatim (OpenStreetMap) como fallback
 */
async function geocodeWithNominatim(
  city: string,
  state: string,
): Promise<{ lat: number; lon: number } | null> {
  // Tenta diferentes variações da query
  const queries = [
    `${city}, ${state}, Brazil`,
    `${removeAccents(city)}, ${state}, Brazil`,
    `${city}, ${state}`,
    `${removeAccents(city)}, ${state}`,
    `${city}, Brazil`,
    `${removeAccents(city)}, Brazil`,
  ];

  for (const query of queries) {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5&countrycodes=br`;

    console.log('[geocodeWithNominatim] Tentando geocodificação:', { city, state, query, url });

    try {
      const response = await fetch(url, {
        signal: AbortSignal.timeout(5000),
        headers: {
          'User-Agent': 'Hapvida-CEP-Clima/1.0', // Nominatim requer User-Agent
        },
      });

      console.log('[geocodeWithNominatim] Resposta recebida:', {
        status: response.status,
        ok: response.ok,
        query,
      });

      if (!response.ok) {
        console.error('[geocodeWithNominatim] Erro na resposta:', response.status);
        continue; // Tenta próxima query
      }

      const data = await response.json();
      console.log('[geocodeWithNominatim] Dados recebidos:', {
        query,
        resultsCount: Array.isArray(data) ? data.length : 0,
        results: data,
      });

      if (Array.isArray(data) && data.length > 0) {
        // Tenta encontrar resultado que corresponda à cidade e estado
        let result = data.find((r: any) => {
          const displayName = (r.display_name || '').toLowerCase();
          const cityLower = city.toLowerCase();
          const cityNoAccent = removeAccents(cityLower);
          return (
            displayName.includes(cityLower) ||
            displayName.includes(cityNoAccent) ||
            (r.name && (r.name.toLowerCase().includes(cityLower) || removeAccents(r.name.toLowerCase()).includes(cityNoAccent)))
          );
        }) || data[0];

        const coords = {
          lat: parseFloat(result.lat),
          lon: parseFloat(result.lon),
        };
        
        // Valida coordenadas
        if (isNaN(coords.lat) || isNaN(coords.lon) || !isFinite(coords.lat) || !isFinite(coords.lon)) {
          console.warn('[geocodeWithNominatim] Coordenadas inválidas:', coords);
          continue; // Tenta próxima query
        }
        
        console.log('[geocodeWithNominatim] Coordenadas encontradas:', {
          query,
          result: result.display_name || result.name,
          coords,
        });
        return coords;
      }

      console.warn('[geocodeWithNominatim] Nenhum resultado encontrado para query:', query);
    } catch (error) {
      console.error('[geocodeWithNominatim] Erro na geocodificação para query:', query, error);
      if (error instanceof Error && error.name === 'AbortError') {
        continue; // Tenta próxima query
      }
    }
  }

  console.warn('[geocodeWithNominatim] Todas as tentativas falharam');
  return null;
}

/**
 * Geocodifica cidade e estado para obter coordenadas
 */
export async function geocodeCityState(
  city: string,
  state: string,
): Promise<{ lat: number; lon: number } | null> {
  // Tenta diferentes formatos de query para melhorar a taxa de sucesso
  const cityNoAccent = removeAccents(city);
  const queries = [
    `${city}, ${state}, Brazil`,
    `${cityNoAccent}, ${state}, Brazil`,
    `${city}, ${state}`,
    `${cityNoAccent}, ${state}`,
    `${city}, Brazil`,
    `${cityNoAccent}, Brazil`,
  ];

  for (const query of queries) {
    const url = `${OPEN_METEO_GEOCODING_URL}?name=${encodeURIComponent(query)}&count=5&language=pt&format=json`;

    console.log('[geocodeCityState] Tentando geocodificação:', { city, state, query, url });

    try {
      const response = await fetch(url, {
        signal: AbortSignal.timeout(5000),
      });

      console.log('[geocodeCityState] Resposta recebida:', {
        status: response.status,
        ok: response.ok,
        query,
      });

      if (!response.ok) {
        console.error('[geocodeCityState] Erro na resposta:', response.status);
        continue; // Tenta próxima query
      }

      const data: OpenMeteoGeocodingResponse = await response.json();
      console.log('[geocodeCityState] Dados recebidos:', {
        query,
        resultsCount: data.results?.length || 0,
        results: data.results,
      });

      if (data.results && Array.isArray(data.results) && data.results.length > 0) {
        // Tenta encontrar resultado que corresponda ao estado brasileiro
        const cityLower = city.toLowerCase();
        const cityNoAccentLower = removeAccents(cityLower);
        
        let result = data.results.find((r) => {
          const nameLower = r.name?.toLowerCase() || '';
          const nameNoAccent = removeAccents(nameLower);
          return (
            r.country_code === 'BR' && 
            (r.admin1 === state || 
             nameLower.includes(cityLower) || 
             nameNoAccent.includes(cityNoAccentLower))
          );
        }) || data.results[0];

        const coords = {
          lat: Number(result.latitude),
          lon: Number(result.longitude),
        };
        
        // Valida coordenadas
        if (isNaN(coords.lat) || isNaN(coords.lon) || !isFinite(coords.lat) || !isFinite(coords.lon)) {
          console.warn('[geocodeCityState] Coordenadas inválidas do resultado:', result);
          continue; // Tenta próxima query
        }
        
        console.log('[geocodeCityState] Coordenadas encontradas:', {
          query,
          result: result.name,
          coords,
        });
        return coords;
      }

      console.warn('[geocodeCityState] Nenhum resultado encontrado para query:', query);
    } catch (error) {
      console.error('[geocodeCityState] Erro na geocodificação para query:', query, error);
      if (error instanceof Error && error.name === 'AbortError') {
        continue; // Tenta próxima query
      }
      // Continua para próxima tentativa
    }
  }

  console.warn('[geocodeCityState] Todas as tentativas com Open-Meteo falharam, tentando Nominatim...');
  
  // Fallback para Nominatim (OpenStreetMap)
  const nominatimResult = await geocodeWithNominatim(city, state);
  if (nominatimResult) {
    console.log('[geocodeCityState] Coordenadas obtidas via Nominatim:', nominatimResult);
    return nominatimResult;
  }

  console.warn('[geocodeCityState] Todas as tentativas de geocodificação falharam');
  return null;
}

/**
 * Consulta previsão do tempo no Open-Meteo
 */
export async function fetchWeatherForecast(
  location: WeatherLocation,
  days: number = 3,
): Promise<WeatherData> {
  const { lat, lon } = location;
  const url = `${OPEN_METEO_FORECAST_URL}?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature&daily=temperature_2m_max,temperature_2m_min&timezone=America/Sao_Paulo&forecast_days=${days}`;

  console.log('[fetchWeatherForecast] Iniciando consulta:', {
    location,
    lat,
    lon,
    days,
    url,
    latType: typeof lat,
    lonType: typeof lon,
    isLatNaN: isNaN(lat),
    isLonNaN: isNaN(lon),
    isLatFinite: isFinite(lat),
    isLonFinite: isFinite(lon),
  });

  try {
    const response = await fetch(url, {
      signal: AbortSignal.timeout(10000), // 10 segundos para clima
    });

    console.log('[fetchWeatherForecast] Resposta recebida:', {
      status: response.status,
      ok: response.ok,
      statusText: response.statusText,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[fetchWeatherForecast] Erro na resposta:', {
        status: response.status,
        statusText: response.statusText,
        errorText,
      });
      throw new Error(`Open-Meteo API returned ${response.status}: ${errorText}`);
    }

    const data: OpenMeteoForecastResponse = await response.json();
    console.log('[fetchWeatherForecast] Dados recebidos:', {
      latitude: data.latitude,
      longitude: data.longitude,
      current: data.current,
      dailyCount: data.daily?.time?.length || 0,
    });

    // Mapear dados atuais
    const current: WeatherData['current'] = {
      temperatureC: data.current.temperature_2m,
      apparentTemperatureC: data.current.apparent_temperature,
      humidity: data.current.relative_humidity_2m / 100, // Converter de 0-100 para 0-1
      observedAt: data.current.time,
    };

    // Mapear previsão diária
    const daily: WeatherData['daily'] = data.daily.time.map((date, index) => ({
      date,
      tempMinC: data.daily.temperature_2m_min[index],
      tempMaxC: data.daily.temperature_2m_max[index],
    }));

    const result: WeatherData = {
      location,
      current,
      daily,
      provider: 'open-meteo' as const,
    };

    console.log('[fetchWeatherForecast] Dados mapeados com sucesso:', result);
    return result;
  } catch (error) {
    console.error('[fetchWeatherForecast] Erro na consulta:', error);
    if (error instanceof Error) {
      if (error.name === 'AbortError' || error.message.includes('timeout')) {
        throw new Error('Timeout ao consultar previsão do tempo. Tente novamente.');
      }
      if (error.message.includes('fetch') || error.message.includes('network')) {
        throw new Error('Erro de conectividade ao consultar clima. Verifique sua internet.');
      }
    }
    throw new Error('Erro ao consultar previsão do tempo. Tente novamente mais tarde.');
  }
}

/**
 * Obtém coordenadas do CEP ou geocodifica se necessário
 */
export async function getCoordinatesFromCep(
  cepAddress: { city: string; state: string; location: { lat: number; lon: number } | null },
): Promise<{ lat: number; lon: number } | null> {
  console.log('[getCoordinatesFromCep] Iniciando obtenção de coordenadas:', {
    city: cepAddress.city,
    state: cepAddress.state,
    hasLocation: !!cepAddress.location,
    location: cepAddress.location,
  });

  // Se já tem coordenadas, valida e retorna
  if (cepAddress.location) {
    const { lat, lon } = cepAddress.location;
    console.log('[getCoordinatesFromCep] Coordenadas do CEP:', { lat, lon });
    console.log('[getCoordinatesFromCep] Validação:', {
      latType: typeof lat,
      lonType: typeof lon,
      isLatNaN: isNaN(lat),
      isLonNaN: isNaN(lon),
      isLatFinite: isFinite(lat),
      isLonFinite: isFinite(lon),
    });

    // Valida se são números válidos
    if (
      typeof lat === 'number' &&
      typeof lon === 'number' &&
      !isNaN(lat) &&
      !isNaN(lon) &&
      isFinite(lat) &&
      isFinite(lon)
    ) {
      console.log('[getCoordinatesFromCep] Coordenadas válidas do CEP, retornando');
      return cepAddress.location;
    } else {
      console.warn('[getCoordinatesFromCep] Coordenadas do CEP inválidas, tentando geocodificar');
    }
  } else {
    console.log('[getCoordinatesFromCep] Sem coordenadas no CEP, tentando geocodificar');
  }

  // Caso contrário, tenta geocodificar
  console.log('[getCoordinatesFromCep] Iniciando geocodificação...');
  const coords = await geocodeCityState(cepAddress.city, cepAddress.state);
  
  if (!coords) {
    console.warn('[getCoordinatesFromCep] Geocodificação não retornou coordenadas');
    return null; // Retorna null em vez de lançar erro
  }

  console.log('[getCoordinatesFromCep] Coordenadas obtidas via geocodificação:', coords);
  return coords;
}

