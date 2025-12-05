import { Card } from '@/components/UI/Card';
import { formatZipCode } from '@/utils/cep';
import type { CepAddress } from '@/types';

interface CepResultProps {
  address: CepAddress;
}

/**
 * Componente para exibir resultado da consulta de CEP
 * Mobile-first: layout em coluna no mobile, grid no desktop
 */
export function CepResult({ address }: CepResultProps) {
  return (
    <Card className="mt-4 sm:mt-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b pb-3">
          <h3 className="text-lg font-bold text-primary-dark flex items-center gap-2">
            <i className="ri-map-pin-2-line text-secondary-blue" />
            Endereço Encontrado
          </h3>
          <span
            className={`text-xs px-2 py-1 rounded-full ${
              address.provider === 'brasilapi'
                ? 'bg-blue-100 text-blue-800'
                : 'bg-green-100 text-green-800'
            }`}
          >
            {address.provider === 'brasilapi' ? 'BrasilAPI' : 'ViaCEP'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500 mb-1">CEP</p>
            <p className="font-semibold text-primary-dark">
              {formatZipCode(address.zipCode)}
            </p>
          </div>

          {address.street && (
            <div>
              <p className="text-sm text-gray-500 mb-1">Logradouro</p>
              <p className="font-semibold text-primary-dark">{address.street}</p>
            </div>
          )}

          {address.district && (
            <div>
              <p className="text-sm text-gray-500 mb-1">Bairro</p>
              <p className="font-semibold text-primary-dark">{address.district}</p>
            </div>
          )}

          <div>
            <p className="text-sm text-gray-500 mb-1">Cidade</p>
            <p className="font-semibold text-primary-dark">{address.city}</p>
          </div>

          <div>
            <p className="text-sm text-gray-500 mb-1">UF</p>
            <p className="font-semibold text-primary-dark">{address.state}</p>
          </div>

          {address.ibge && (
            <div>
              <p className="text-sm text-gray-500 mb-1">Código IBGE</p>
              <p className="font-semibold text-primary-dark">{address.ibge}</p>
            </div>
          )}

          <div className="sm:col-span-2">
            <p className="text-sm text-gray-500 mb-1">Coordenadas</p>
            <p className="font-semibold text-primary-dark flex items-center gap-2">
              <i className="ri-global-line" />
              {address.location &&
              !isNaN(Number(address.location.lat)) &&
              !isNaN(Number(address.location.lon)) ? (
                <>
                  {Number(address.location.lat).toFixed(6)},{' '}
                  {Number(address.location.lon).toFixed(6)}
                </>
              ) : (
                '--'
              )}
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
}

