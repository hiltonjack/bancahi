import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import useBancaStore from '../store/bancaStore';

const apostaSchema = z.object({
  metodo: z.string().min(1, 'Selecione um método'),
  stake: z.number().min(1, 'Stake deve ser maior que 0'),
  resultado: z.enum(['green', 'red']),
  odd: z.number().optional(),
  observacoes: z.string().optional(),
});

type ApostaFormData = z.infer<typeof apostaSchema>;

const NovaAposta = () => {
  const { metodos, adicionarAposta, atualizarSaldoBanca } = useBancaStore();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ApostaFormData>({
    resolver: zodResolver(apostaSchema),
  });

  const onSubmit = (data: ApostaFormData) => {
    adicionarAposta({
      ...data,
      data: new Date().toISOString(),
    });

    // Atualiza o saldo da banca baseado no resultado
    const valorFinal = data.resultado === 'green' 
      ? data.stake * (data.odd || 1) - data.stake 
      : data.stake;
    
    atualizarSaldoBanca(valorFinal, 'aposta', data.resultado);
    reset();
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-sm">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Nova Aposta</h2>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Método
          </label>
          <select
            {...register('metodo')}
            className="w-full p-2 border rounded-md"
          >
            <option value="">Selecione um método</option>
            {metodos.map((metodo) => (
              <option key={metodo.id} value={metodo.id}>
                {metodo.nome}
              </option>
            ))}
          </select>
          {errors.metodo && (
            <p className="text-red-500 text-sm mt-1">{errors.metodo.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Stake
          </label>
          <input
            type="number"
            step="0.01"
            {...register('stake', { valueAsNumber: true })}
            className="w-full p-2 border rounded-md"
          />
          {errors.stake && (
            <p className="text-red-500 text-sm mt-1">{errors.stake.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Odd
          </label>
          <input
            type="number"
            step="0.01"
            {...register('odd', { valueAsNumber: true })}
            className="w-full p-2 border rounded-md"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Resultado
          </label>
          <select
            {...register('resultado')}
            className="w-full p-2 border rounded-md"
          >
            <option value="green">Green</option>
            <option value="red">Red</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Observações
          </label>
          <textarea
            {...register('observacoes')}
            className="w-full p-2 border rounded-md"
            rows={3}
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
        >
          Registrar Aposta
        </button>
      </form>
    </div>
  );
};

export default NovaAposta;