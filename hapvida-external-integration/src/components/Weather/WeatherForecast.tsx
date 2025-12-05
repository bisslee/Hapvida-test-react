import { Card } from '@/components/UI/Card';
import { formatDate } from '@/utils/date';
import type { DailyForecast } from '@/types';

interface WeatherForecastProps {
  daily: DailyForecast[];
}

/**
 * Componente de previsão diária - Mobile First
 * Grid responsivo: 1 coluna no mobile, 2-3 no tablet, 4+ no desktop
 */
export function WeatherForecast({ daily }: WeatherForecastProps) {
  return (
    <Card className="mt-4 sm:mt-6">
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-primary-dark flex items-center gap-2 border-b pb-3">
          <i className="ri-calendar-line" />
          Previsão Diária
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {daily.map((day, index) => (
            <div
              key={index}
              className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
            >
              <p className="text-sm font-semibold text-primary-dark mb-3">
                {formatDate(day.date)}
              </p>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500 flex items-center gap-1">
                    <i className="ri-arrow-down-line text-blue-500" />
                    Mín
                  </span>
                  <span className="font-semibold text-blue-600">
                    {Math.round(day.tempMinC)}°C
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500 flex items-center gap-1">
                    <i className="ri-arrow-up-line text-red-500" />
                    Máx
                  </span>
                  <span className="font-semibold text-red-600">
                    {Math.round(day.tempMaxC)}°C
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}

