import type { ReactNode } from 'react';

interface LayoutProps {
  children: ReactNode;
}

/**
 * Layout principal da aplicação (Mobile First)
 */
export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-primary-dark text-white shadow-md">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-xl md:text-2xl font-bold flex items-center gap-2">
            <i className="ri-map-pin-line text-2xl"></i>
            <span>Consulta CEP e Clima</span>
          </h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 md:py-8">
        {children}
      </main>

      <footer className="bg-primary-dark text-white mt-auto py-4">
        <div className="container mx-auto px-4 text-center text-sm">
          <p>Hapvida - Integração CEP e Clima</p>
        </div>
      </footer>
    </div>
  );
}

