// CEP Types
export interface CepAddress {
  zipCode: string;
  street: string | null;
  district: string | null;
  city: string;
  state: string;
  ibge: string | null;
  location: {
    lat: number;
    lon: number;
  } | null;
  provider: 'brasilapi' | 'viacep';
}

export interface BrasilApiResponse {
  cep: string;
  state: string;
  city: string;
  neighborhood?: string;
  street?: string;
  service: string;
  location?: {
    type: string;
    coordinates: {
      longitude: number;
      latitude: number;
    };
  };
}

export interface ViaCepResponse {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
  ibge: string;
  gia: string;
  ddd: string;
  siafi: string;
  erro?: boolean;
}

// Weather Types
export interface WeatherLocation {
  lat: number;
  lon: number;
  city: string;
  state: string;
}

export interface CurrentWeather {
  temperatureC: number;
  apparentTemperatureC: number;
  humidity: number;
  observedAt: string;
}

export interface DailyForecast {
  date: string;
  tempMinC: number;
  tempMaxC: number;
}

export interface WeatherData {
  location: WeatherLocation;
  current: CurrentWeather;
  daily: DailyForecast[];
  provider: 'open-meteo';
}

export interface OpenMeteoForecastResponse {
  latitude: number;
  longitude: number;
  generationtime_ms: number;
  utc_offset_seconds: number;
  timezone: string;
  timezone_abbreviation: string;
  elevation: number;
  current_units: {
    time: string;
    interval: string;
    temperature_2m: string;
    relative_humidity_2m: string;
    apparent_temperature: string;
  };
  current: {
    time: string;
    interval: number;
    temperature_2m: number;
    relative_humidity_2m: number;
    apparent_temperature: number;
  };
  daily_units: {
    time: string;
    temperature_2m_max: string;
    temperature_2m_min: string;
  };
  daily: {
    time: string[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
  };
}

export interface OpenMeteoGeocodingResponse {
  results: Array<{
    id: number;
    name: string;
    latitude: number;
    longitude: number;
    elevation: number;
    feature_code: string;
    country_code: string;
    admin1?: string;
    admin2?: string;
    timezone: string;
    population?: number;
    country_id: number;
    country: string;
  }>;
  generationtime_ms: number;
}

// History Types
export interface CepHistoryItem {
  id: string;
  zipCode: string;
  city: string;
  state: string;
  timestamp: number;
  address: CepAddress;
}

// Form Types
export interface CepFormData {
  zipCode: string;
}

export interface WeatherFormData {
  days: number;
}

