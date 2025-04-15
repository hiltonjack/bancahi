import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowUpCircle, ArrowDownCircle, Trash2 } from 'lucide-react';
import useBancaStore from '../store/bancaStore';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const transacaoSchema = z.object({
  tipo: z.enum(['deposito', 'saque']),
  valor: z.number().min(1, 'Valor deve ser maior que 0'),
  descricao: z.string().optional(),
});

type TransacaoFormData = z.infer<typeof transacaoSchema>;

const GestaoFinanceira = () => {
  const { banca, atualizarSaldoBanca, limparHistorico } = useBancaStore();
  const [showLimparModal, setShowLimparModal] = useState(false);
  
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TransacaoFormData>({
    resolver: zodResolver(transacaoSchema),
  });

  const onSubmit = (data: TransacaoFormData) => {
    atualizarSaldoBanca(data.valor, data.tipo);
    reset();
  };

  return (
    <div className="space-y-8">
      <div className="bg-white p-6 rounded-lg shadow-sm dark:bg-gray-900">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 dark:text-white">Gestão da Banca</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="bg-gray-50 p-6 rounded-lg dark:bg-gray-800">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 dark:text-white">
                Saldo Atual
              </h3>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                }).format(banca.saldoAtual)}
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
                  Tipo de Transação
                </label>
                <select
                  {...register('tipo')}
                  className="w-full p-2 border rounded-md dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                >
                  <option value="deposito">Depósito</option>
                  <option value="saque">Saque</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
                  Valor
                </label>
                <input
                  type="number"
                  step="0.01"
                  {...register('valor', { valueAsNumber: true })}
                  className="w-full p-2 border rounded-md dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                />
                {errors.valor && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.valor.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
                  Descrição (opcional)
                </label>
                <textarea
                  {...register('descricao')}
                  className="w-full p-2 border rounded-md dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                  rows={2}
                />
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
              >
                Confirmar Transação
              </button>
            </form>
          </div>

          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                Histórico de Transações
              </h3>
              <button
                onClick={() => setShowLimparModal(true)}
                className="flex items-center text-red-600 hover:text-red-700"
              >
                <Trash2 className="w-4 h-4 mr-1" />
                Limpar Histórico
              </button>
            </div>
            <div className="space-y-4 max-h-[500px] overflow-y-auto">
              {banca.historicoSaldo.map((transacao, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg dark:bg-gray-800"
                >
                  <div className="flex items-center space-x-3">
                    {transacao.tipo === 'deposito' || (transacao.tipo === 'aposta' && transacao.resultado === 'green') ? (
                      <ArrowUpCircle className="w-5 h-5 text-green-500" />
                    ) : (
                      <ArrowDownCircle className="w-5 h-5 text-red-500" />
                    )}
                    <div>
                      <p className="font-medium text-gray-800 dark:text-white">
                        {transacao.tipo === 'deposito'
                          ? 'Depósito'
                          : transacao.tipo === 'saque'
                          ? 'Saque'
                          : transacao.resultado === 'green'
                          ? 'Ganho em Aposta'
                          : 'Perda em Aposta'}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {format(new Date(transacao.data), "dd 'de' MMMM 'às' HH:mm", {
                          locale: ptBR,
                        })}
                      </p>
                    </div>
                  </div>
                  <p
                    className={`font-semibold ${
                      transacao.tipo === 'deposito' || (transacao.tipo === 'aposta' && transacao.resultado === 'green')
                        ? 'text-green-600'
                        : 'text-red-600'
                    }`}
                  >
                    {new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                      signDisplay: transacao.tipo === 'deposito' || (transacao.tipo === 'aposta' && transacao.resultado === 'green') ? 'never' : 'always',
                    }).format(
                      transacao.tipo === 'deposito' || (transacao.tipo === 'aposta' && transacao.resultado === 'green')
                        ? transacao.valor
                        : -transacao.valor
                    )}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Modal de confirmação */}
      {showLimparModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full dark:bg-gray-900">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 dark:text-white">
              Limpar Histórico
            </h3>
            <p className="text-gray-700 mb-6 dark:text-gray-300">
              Escolha o que você deseja limpar:
            </p>
            <div className="space-y-4">
              <button
                onClick={() => {
                  limparHistorico(false);
                  setShowLimparModal(false);
                }}
                className="w-full bg-yellow-600 text-white py-2 px-4 rounded-md hover:bg-yellow-700 transition-colors"
              >
                Limpar Apenas Histórico
              </button>
              <button
                onClick={() => {
                  limparHistorico(true);
                  setShowLimparModal(false);
                }}
                className="w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition-colors"
              >
                Limpar Histórico e Zerar Saldo
              </button>
              <button
                onClick={() => setShowLimparModal(false)}
                className="w-full bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300 transition-colors dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GestaoFinanceira;