import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { Header } from '@/components/Layout/Header';
import { Container } from '@/components/Layout/Container';
import { CepForm } from '@/components/Cep/CepForm';
import { CepResult } from '@/components/Cep/CepResult';
import { WeatherCard } from '@/components/Weather/WeatherCard';
import { WeatherForecast } from '@/components/Weather/WeatherForecast';
import { CepHistory } from '@/components/History/CepHistory';
import { ErrorDisplay } from '@/components/UI/ErrorDisplay';
import { Tabs } from '@/components/UI/Tabs';
import { useWeatherQuery } from '@/hooks/useWeatherQuery';
import { LoadingSpinner } from '@/components/UI/LoadingSpinner';
import { normalizeError } from '@/utils/errors';
import { CepHistoryProvider, useCepHistory } from '@/contexts/CepHistoryContext';
import type { CepAddress } from '@/types';

// Configuração do TanStack Query com cache de 10 minutos
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 10 * 60 * 1000, // 10 minutos
      gcTime: 10 * 60 * 1000, // 10 minutos (antigo cacheTime)
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function AppContent() {
  const [selectedCep, setSelectedCep] = useState<CepAddress | null>(null);
  const [days, setDays] = useState(3);
  const [activeTab, setActiveTab] = useState<'consultar' | 'historico'>('consultar');
  const { history } = useCepHistory();

  // Query para buscar clima quando um CEP é selecionado
  const {
    data: weatherData,
    isLoading: isLoadingWeather,
    error: weatherError,
    refetch: refetchWeather,
    isError: isWeatherError,
  } = useWeatherQuery(selectedCep, days);

  const handleCepFound = (address: CepAddress) => {
    setSelectedCep(address);
    // Muda para a aba de consulta quando um CEP é encontrado
    setActiveTab('consultar');
  };

  const handleSelectFromHistory = async (zipCode: string): Promise<void> => {
    // Busca o CEP novamente quando selecionado do histórico
    try {
      const { fetchCep } = await import('@/services/api/cep');
      const address = await fetchCep(zipCode);
      setSelectedCep(address);
      // Muda para a aba de consulta para mostrar o resultado
      setActiveTab('consultar');
    } catch (error) {
      const { normalizeError } = await import('@/utils/errors');
      const appError = normalizeError(error);
      throw appError; // Propaga o erro para o componente de histórico tratar
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="py-6 sm:py-8">
        <Container>
          <div className="space-y-6">
            {/* Abas de navegação */}
            <Tabs
              tabs={[
                {
                  id: 'consultar',
                  label: 'Consultar CEP',
                  icon: 'ri-search-line',
                },
                {
                  id: 'historico',
                  label: 'Histórico de Consultas',
                  icon: 'ri-history-line',
                  badge: history.length,
                },
              ]}
              activeTab={activeTab}
              onTabChange={(tabId) => setActiveTab(tabId as 'consultar' | 'historico')}
            >
              {activeTab === 'consultar' ? (
                <div className="space-y-6">
                  {/* Formulário de CEP */}
                  <CepForm onCepFound={handleCepFound} />

                  {/* Resultado do CEP */}
                  {selectedCep && <CepResult address={selectedCep} />}

                  {/* Seção de Clima */}
                  {selectedCep && (
                    <div className="space-y-4">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <h2 className="text-xl font-bold text-primary-dark flex items-center gap-2">
                          <i className="ri-cloudy-line text-secondary-blue" />
                          Previsão do Tempo
                        </h2>
                        <div className="flex items-center gap-2">
                          <label htmlFor="days" className="text-sm text-gray-600">
                            Dias:
                          </label>
                          <select
                            id="days"
                            value={days}
                            onChange={(e) => setDays(Number(e.target.value))}
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary-blue min-h-[44px] text-base"
                          >
                            {[1, 2, 3, 4, 5, 6, 7].map((day) => (
                              <option key={day} value={day}>
                                {day}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {isLoadingWeather && (
                        <div className="py-12 flex flex-col items-center justify-center gap-4">
                          <LoadingSpinner size="lg" />
                          <p className="text-gray-600 text-sm">Carregando previsão do tempo...</p>
                        </div>
                      )}

                      {isWeatherError && weatherError && (
                        <ErrorDisplay
                          error={normalizeError(weatherError)}
                          onRetry={() => refetchWeather()}
                          title="Erro ao carregar previsão do tempo"
                        />
                      )}

                      {!weatherError && !isLoadingWeather && !weatherData && selectedCep && (
                        <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                          <p className="text-gray-600 flex items-center gap-2">
                            <i className="ri-information-line" />
                            Coordenadas não disponíveis para este CEP. Não é possível consultar o clima.
                          </p>
                        </div>
                      )}

                      {weatherData && (
                        <>
                          <WeatherCard weather={weatherData} />
                          <WeatherForecast daily={weatherData.daily} />
                        </>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  {/* Histórico */}
                  <CepHistory onSelectCep={handleSelectFromHistory} />
                </div>
              )}
            </Tabs>
          </div>
        </Container>
      </main>
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            iconTheme: {
              primary: '#4CAF50',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#FF4336',
              secondary: '#fff',
            },
          },
        }}
      />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <CepHistoryProvider>
        <AppContent />
      </CepHistoryProvider>
    </QueryClientProvider>
  );
}

export default App;
