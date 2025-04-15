import React, { useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Check, X, Filter } from 'lucide-react';
import useBancaStore from '../store/bancaStore';

const Historico = () => {
  const { apostas, metodos } = useBancaStore();
  const [filtro, setFiltro] = useState<'todos' | 'green' | 'red'>('todos');

  const apostasFiltradas = apostas
    .filter(aposta => filtro === 'todos' || aposta.resultado === filtro)
    .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());

  const totalApostas = apostas.length;
  const apostasGanhas = apostas.filter(a => a.resultado === 'green').length;
  const apostasPerdidas = apostas.filter(a => a.resultado === 'red').length;
  const taxaAcerto = totalApostas > 0 ? (apostasGanhas / totalApostas) * 100 : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Histórico de Apostas</h2>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Filter className="w-5 h-5 text-gray-500" />
            <select
              value={filtro}
              onChange={(e) => setFiltro(e.target.value as 'todos' | 'green' | 'red')}
              className="p-2 border rounded-md dark:bg-gray-800 dark:border-gray-700 dark:text-white"
            >
              <option value="todos">Todos</option>
              <option value="green">Greens</option>
              <option value="red">Reds</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-900 p-4 rounded-lg shadow-sm">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total de Apostas</h3>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">{totalApostas}</p>
        </div>

        <div className="bg-white dark:bg-gray-900 p-4 rounded-lg shadow-sm">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Greens</h3>
          <p className="text-2xl font-bold text-green-600 mt-2">{apostasGanhas}</p>
        </div>

        <div className="bg-white dark:bg-gray-900 p-4 rounded-lg shadow-sm">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Reds</h3>
          <p className="text-2xl font-bold text-red-600 mt-2">{apostasPerdidas}</p>
        </div>

        <div className="bg-white dark:bg-gray-900 p-4 rounded-lg shadow-sm">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Taxa de Acerto</h3>
          <p className="text-2xl font-bold text-blue-600 mt-2">{taxaAcerto.toFixed(1)}%</p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-800">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Data</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Observações</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Método</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Stake</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Odd</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Resultado</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Lucro/Prejuízo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {apostasFiltradas.map((aposta) => {
                const metodo = metodos.find(m => m.id === aposta.metodo);
                const lucro = aposta.resultado === 'green'
                  ? aposta.stake * (aposta.odd || 1) - aposta.stake
                  : -aposta.stake;

                return (
                  <tr key={aposta.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200">
                      {format(new Date(aposta.data), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-200">
                      {aposta.observacoes || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200">
                      {metodo?.nome || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200">
                      {new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL'
                      }).format(aposta.stake)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200">
                      {aposta.odd?.toFixed(2) || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                        aposta.resultado === 'green'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                      }`}>
                        {aposta.resultado === 'green' ? (
                          <Check className="w-4 h-4 mr-1" />
                        ) : (
                          <X className="w-4 h-4 mr-1" />
                        )}
                        {aposta.resultado === 'green' ? 'Green' : 'Red'}
                      </span>
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                      lucro >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                        signDisplay: 'always'
                      }).format(lucro)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Historico;