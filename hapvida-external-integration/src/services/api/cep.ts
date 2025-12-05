import type { CepAddress, BrasilApiResponse, ViaCepResponse } from '@/types';

const BRASIL_API_BASE_URL = 'https://brasilapi.com.br/api/cep/v2';
const VIACEP_BASE_URL = 'https://viacep.com.br/ws';

/**
 * Normaliza CEP para formato sem hífen
 */
function normalizeZipCode(zipCode: string): string {
  return zipCode.replace(/\D/g, '');
}

/**
 * Mapeia resposta da BrasilAPI para formato unificado
 */
function mapBrasilApiResponse(data: BrasilApiResponse): CepAddress {
  console.log('[mapBrasilApiResponse] Dados recebidos da BrasilAPI:', {
    cep: data.cep,
    city: data.city,
    state: data.state,
    hasLocation: !!data.location,
    location: data.location,
    locationType: typeof data.location,
    coordinates: data.location?.coordinates,
  });

  let location: { lat: number; lon: number } | null = null;

  // Verifica se há location e se coordinates não está vazio
  if (data.location?.coordinates && Object.keys(data.location.coordinates).length > 0) {
    const lat = data.location.coordinates.latitude;
    const lon = data.location.coordinates.longitude;

    console.log('[mapBrasilApiResponse] Coordenadas brutas:', { lat, lon, latType: typeof lat, lonType: typeof lon });

    // Verifica se latitude e longitude existem e não são undefined/null
    if (lat !== undefined && lat !== null && lon !== undefined && lon !== null) {
      const latNum = Number(lat);
      const lonNum = Number(lon);

      console.log('[mapBrasilApiResponse] Coordenadas convertidas:', {
        latNum,
        lonNum,
        isLatNaN: isNaN(latNum),
        isLonNaN: isNaN(lonNum),
        isLatFinite: isFinite(latNum),
        isLonFinite: isFinite(lonNum),
      });

      if (!isNaN(latNum) && !isNaN(lonNum) && isFinite(latNum) && isFinite(lonNum)) {
        location = { lat: latNum, lon: lonNum };
        console.log('[mapBrasilApiResponse] Coordenadas válidas mapeadas:', location);
      } else {
        console.warn('[mapBrasilApiResponse] Coordenadas inválidas após conversão, não será mapeada');
      }
    } else {
      console.warn('[mapBrasilApiResponse] Coordenadas são undefined/null, não será mapeada');
    }
  } else {
    console.log('[mapBrasilApiResponse] Sem coordenadas na resposta ou coordinates vazio');
  }

  return {
    zipCode: normalizeZipCode(data.cep),
    street: data.street || null,
    district: data.neighborhood || null,
    city: data.city,
    state: data.state,
    ibge: null,
    location,
    provider: 'brasilapi',
  };
}

/**
 * Mapeia resposta da ViaCEP para formato unificado
 */
function mapViaCepResponse(data: ViaCepResponse): CepAddress {
  return {
    zipCode: normalizeZipCode(data.cep),
    street: data.logradouro || null,
    district: data.bairro || null,
    city: data.localidade,
    state: data.uf,
    ibge: data.ibge || null,
    location: null, // ViaCEP não retorna coordenadas
    provider: 'viacep',
  };
}

/**
 * Consulta CEP na BrasilAPI (provedor primário)
 */
export async function fetchCepFromBrasilApi(zipCode: string): Promise<CepAddress | null> {
  const normalized = normalizeZipCode(zipCode);
  const url = `${BRASIL_API_BASE_URL}/${normalized}`;

  try {
    const response = await fetch(url, {
      signal: AbortSignal.timeout(5000), // 5 segundos de timeout
    });

    if (response.status === 404) {
      return null;
    }

    if (!response.ok) {
      throw new Error(`BrasilAPI returned ${response.status}`);
    }

    const data: BrasilApiResponse = await response.json();
    console.log('[fetchCepFromBrasilApi] Resposta completa da BrasilAPI:', JSON.stringify(data, null, 2));
    return mapBrasilApiResponse(data);
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Timeout ao consultar BrasilAPI');
    }
    throw error;
  }
}

/**
 * Consulta CEP na ViaCEP (fallback)
 */
export async function fetchCepFromViaCep(zipCode: string): Promise<CepAddress | null> {
  const normalized = normalizeZipCode(zipCode);
  const url = `${VIACEP_BASE_URL}/${normalized}/json/`;

  try {
    const response = await fetch(url, {
      signal: AbortSignal.timeout(5000), // 5 segundos de timeout
    });

    if (!response.ok) {
      throw new Error(`ViaCEP returned ${response.status}`);
    }

    const data: ViaCepResponse = await response.json();

    if (data.erro) {
      return null;
    }

    return mapViaCepResponse(data);
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Timeout ao consultar ViaCEP');
    }
    throw error;
  }
}

/**
 * Consulta CEP com fallback automático
 * Tenta BrasilAPI primeiro, se falhar tenta ViaCEP
 */
export async function fetchCep(zipCode: string): Promise<CepAddress> {
  const normalized = normalizeZipCode(zipCode);

  // Valida formato antes de consultar
  if (normalized.length !== 8 || !/^\d{8}$/.test(normalized)) {
    throw new Error('CEP inválido. Deve conter 8 dígitos.');
  }

  // Tenta BrasilAPI primeiro
  try {
    const result = await fetchCepFromBrasilApi(normalized);
    if (result) {
      return result;
    }
  } catch (error) {
    console.warn('BrasilAPI falhou, tentando ViaCEP:', error);
    
    // Se for timeout ou erro de rede, propaga o erro
    if (error instanceof Error) {
      if (error.name === 'AbortError' || error.message.includes('timeout')) {
        throw new Error('Timeout ao consultar CEP. Tente novamente.');
      }
      if (error.message.includes('fetch') || error.message.includes('network')) {
        throw new Error('Erro de conectividade. Verifique sua internet.');
      }
    }
  }

  // Fallback para ViaCEP
  try {
    const result = await fetchCepFromViaCep(normalized);
    if (!result) {
      throw new Error('CEP não encontrado em nenhum provedor');
    }
    return result;
  } catch (error) {
    // Se ViaCEP também falhar, verifica o tipo de erro
    if (error instanceof Error) {
      if (error.name === 'AbortError' || error.message.includes('timeout')) {
        throw new Error('Timeout ao consultar CEP. Tente novamente.');
      }
      if (error.message.includes('fetch') || error.message.includes('network')) {
        throw new Error('Erro de conectividade. Verifique sua internet.');
      }
      // Se já é uma mensagem de erro específica, propaga
      if (error.message.includes('não encontrado') || error.message.includes('not found')) {
        throw error;
      }
    }
    throw new Error('CEP não encontrado em nenhum provedor');
  }
}

