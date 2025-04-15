import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import useBancaStore from '../store/bancaStore';

const metodoSchema = z.object({
  nome: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
  descricao: z.string().optional(),
});

type MetodoFormData = z.infer<typeof metodoSchema>;

const NovoMetodo = () => {
  const { adicionarMetodo } = useBancaStore();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<MetodoFormData>({
    resolver: zodResolver(metodoSchema),
  });

  const onSubmit = (data: MetodoFormData) => {
    adicionarMetodo(data);
    reset();
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-sm">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Novo Método</h2>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nome do Método
          </label>
          <input
            type="text"
            {...register('nome')}
            className="w-full p-2 border rounded-md"
          />
          {errors.nome && (
            <p className="text-red-500 text-sm mt-1">{errors.nome.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Descrição
          </label>
          <textarea
            {...register('descricao')}
            className="w-full p-2 border rounded-md"
            rows={4}
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
        >
          Criar Método
        </button>
      </form>
    </div>
  );
};

export default NovoMetodo;