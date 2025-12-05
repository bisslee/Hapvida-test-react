import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery } from '@tanstack/react-query';
import { Input } from '@/components/UI/Input';
import { Button } from '@/components/UI/Button';
import { Card } from '@/components/UI/Card';
import { ErrorDisplay } from '@/components/UI/ErrorDisplay';
import { fetchCep } from '@/services/api/cep';
import { applyZipCodeMask, normalizeZipCode } from '@/utils';
import { useCepHistory } from '@/contexts/CepHistoryContext';
import { normalizeError } from '@/utils/errors';
import toast from 'react-hot-toast';
import { useEffect, useRef, useState } from 'react';
import type { CepAddress } from '@/types';

const cepSchema = z.object({
  zipCode: z
    .string()
    .min(1, 'CEP é obrigatório')
    .refine(
      (value) => {
        const normalized = normalizeZipCode(value);
        return normalized.length === 8 && /^\d{8}$/.test(normalized);
      },
      {
        message: 'CEP deve conter 8 dígitos',
      }
    ),
});

type CepFormData = z.infer<typeof cepSchema>;

interface CepFormProps {
  onCepFound?: (address: CepAddress) => void;
}

/**
 * Formulário de consulta de CEP com validação em tempo real
 * Mobile-first: inputs otimizados para touch
 */
export function CepForm({ onCepFound }: CepFormProps) {
  const { addToHistory } = useCepHistory();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<CepFormData>({
    resolver: zodResolver(cepSchema),
    mode: 'onChange',
  });

  const watchedZipCode = watch('zipCode');
  const [submittedZipCode, setSubmittedZipCode] = useState<string | null>(null);

  // Aplica máscara enquanto digita
  useEffect(() => {
    if (watchedZipCode) {
      const masked = applyZipCodeMask(watchedZipCode);
      if (masked !== watchedZipCode) {
        setValue('zipCode', masked, { shouldValidate: true });
      }
    }
  }, [watchedZipCode, setValue]);

  // Query para buscar CEP - só executa quando submittedZipCode muda (após submit)
  const {
    data: cepData,
    isLoading,
    error,
    isError,
  } = useQuery<CepAddress>({
    queryKey: ['cep', submittedZipCode],
    queryFn: () => {
      if (!submittedZipCode) {
        throw new Error('CEP não informado');
      }
      return fetchCep(submittedZipCode);
    },
    enabled: !!submittedZipCode, // Só busca quando há um CEP submetido
    retry: (failureCount, error) => {
      // Não retry para erros de CEP inválido ou não encontrado
      if (error instanceof Error) {
        const errorMsg = error.message.toLowerCase();
        if (
          errorMsg.includes('inválido') ||
          errorMsg.includes('não encontrado') ||
          errorMsg.includes('not found')
        ) {
          return false;
        }
      }
      // Retry apenas uma vez para outros erros
      return failureCount < 1;
    },
    retryDelay: 1000,
  });

  const onSubmit = async (data: CepFormData) => {
    const normalizedZipCode = normalizeZipCode(data.zipCode);
    setSubmittedZipCode(normalizedZipCode);
  };

  // Normaliza erro para exibição
  const appError = error ? normalizeError(error) : null;

  // Atualiza quando CEP é encontrado e adiciona ao histórico
  // Usa useRef para evitar adicionar o mesmo CEP múltiplas vezes
  const lastAddedCepRef = useRef<string | null>(null);
  useEffect(() => {
    if (cepData && cepData.zipCode !== lastAddedCepRef.current) {
      console.log('[CepForm] CEP encontrado, adicionando ao histórico:', cepData);
      lastAddedCepRef.current = cepData.zipCode;
      addToHistory(cepData);
      onCepFound?.(cepData);
      toast.success('CEP encontrado com sucesso!');
      // Limpa o campo após sucesso
      setValue('zipCode', '');
      setSubmittedZipCode(null); // Reseta para permitir nova busca do mesmo CEP
    }
  }, [cepData, onCepFound, addToHistory, setValue]);

  return (
    <Card>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <h2 className="text-xl font-bold text-primary-dark mb-4 flex items-center gap-2">
            <i className="ri-search-line" />
            Consultar CEP
          </h2>
        </div>

        <Input
          {...register('zipCode')}
          label="CEP"
          placeholder="00000-000"
          leftIcon="ri-map-pin-line"
          error={errors.zipCode?.message}
          helperText="Digite o CEP com ou sem hífen"
          maxLength={9}
          inputMode="numeric"
          autoComplete="postal-code"
        />

        <Button
          type="submit"
          variant="primary"
          size="lg"
          isLoading={isLoading}
          className="w-full sm:w-auto"
        >
          <i className="ri-search-line mr-2" />
          Consultar
        </Button>

        {/* Exibe erro se houver */}
        {isError && appError && (
          <div className="mt-4">
            <ErrorDisplay
              error={appError}
              onRetry={appError.retryable ? () => {
                const currentZipCode = normalizeZipCode(watchedZipCode || '');
                if (currentZipCode) {
                  setSubmittedZipCode(currentZipCode);
                }
              } : undefined}
              title="Erro ao consultar CEP"
            />
          </div>
        )}
      </form>
    </Card>
  );
}

