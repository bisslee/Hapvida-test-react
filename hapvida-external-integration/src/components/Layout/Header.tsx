import { Container } from './Container';

/**
 * Header da aplicação - Mobile First
 */
export function Header() {
  return (
    <header className="bg-primary-dark text-white shadow-md">
      <Container>
        <div className="py-4 sm:py-6">
          <div className="flex items-center gap-3">
            <i className="ri-map-pin-line text-2xl sm:text-3xl" />
            <div>
              <h1 className="text-lg sm:text-xl md:text-2xl font-bold">
                Hapvida CEP & Clima
              </h1>
              <p className="text-xs sm:text-sm text-gray-300">
                Consulta de CEP e Previsão do Tempo
              </p>
            </div>
          </div>
        </div>
      </Container>
    </header>
  );
}

