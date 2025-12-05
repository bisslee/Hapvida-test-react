import { Card } from '@/components/UI/Card';
import { formatDate, formatTime } from '@/utils/date';
import type { WeatherData } from '@/types';

interface WeatherCardProps {
  weather: WeatherData;
}

/**
 * Card de clima atual - Mobile First
 */
export function WeatherCard({ weather }: WeatherCardProps) {
  return (
    <Card className="mt-4 sm:mt-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b pb-3">
          <h3 className="text-lg font-bold text-primary-dark flex items-center gap-2">
            <i className="ri-sun-line text-yellow-500" />
            Clima Atual
          </h3>
          <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800">
            {weather.provider}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500 mb-1">Localização</p>
            <p className="font-semibold text-primary-dark">
              {weather.location.city}, {weather.location.state}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              {weather.location.lat.toFixed(4)}, {weather.location.lon.toFixed(4)}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500 mb-1">Temperatura</p>
            <p className="text-3xl font-bold text-secondary-blue flex items-center gap-2">
              {Math.round(weather.current.temperatureC)}°
              <i className="ri-celsius-line text-2xl" />
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500 mb-1">Sensação Térmica</p>
            <p className="font-semibold text-primary-dark">
              {Math.round(weather.current.apparentTemperatureC)}°C
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500 mb-1">Umidade</p>
            <p className="font-semibold text-primary-dark flex items-center gap-2">
              <i className="ri-drop-line text-blue-500" />
              {Math.round(weather.current.humidity * 100)}%
            </p>
          </div>

          <div className="sm:col-span-2">
            <p className="text-sm text-gray-500 mb-1">Observado em</p>
            <p className="font-semibold text-primary-dark">
              {formatDate(weather.current.observedAt)} às{' '}
              {formatTime(weather.current.observedAt)}
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
}

