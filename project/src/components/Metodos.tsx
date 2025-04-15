import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, TrendingUp, BarChart2, Trash2, Edit } from 'lucide-react';
import useBancaStore from '../store/bancaStore';

const Metodos = () => {
  const navigate = useNavigate();
  const { metodos, apostas, removerMetodo, toggleMetodoAtivo } = useBancaStore();

  const calcularEstatisticasMetodo = (metodoId: string) => {
    const apostasDoMetodo = apostas.filter(a => a.metodo === metodoId);
    const totalApostas = apostasDoMetodo.length;
    const apostasGanhas = apostasDoMetodo.filter(a => a.resultado === 'green').length;
    const investimentoTotal = apostasDoMetodo.reduce((acc, a) => acc + a.stake, 0);
    const retornoTotal = apostasDoMetodo.reduce((acc, a) => {
      const valor = a.resultado === 'green' ? a.stake * (a.odd || 1) - a.stake : -a.stake;
      return acc + valor;
    }, 0);

    return {
      totalApostas,
      taxaAcerto: totalApostas > 0 ? (apostasGanhas / totalApostas) * 100 : 0,
      roi: investimentoTotal > 0 ? (retornoTotal / investimentoTotal) * 100 : 0,
      lucroTotal: retornoTotal
    };
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Métodos de Apostas</h2>
        <button
          onClick={() => navigate('/novo-metodo')}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Novo Método
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {metodos.map((metodo) => {
          const stats = calcularEstatisticasMetodo(metodo.id);
          return (
            <div
              key={metodo.id}
              className="bg-white p-6 rounded-lg shadow-sm space-y-4"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-semibold text-gray-800">
                    {metodo.nome}
                  </h3>
                  <p className="text-gray-600 mt-1">{metodo.descricao}</p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => navigate(`/editar-metodo/${metodo.id}`)}
                    className="text-gray-600 hover:text-blue-600"
                  >
                    <Edit className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => removerMetodo(metodo.id)}
                    className="text-gray-600 hover:text-red-600"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                  <BookOpen className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-500">Total de Apostas</p>
                    <p className="text-lg font-semibold">{stats.totalApostas}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="text-sm text-gray-500">Taxa de Acerto</p>
                    <p className="text-lg font-semibold">
                      {stats.taxaAcerto.toFixed(1)}%
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                  <BarChart2 className="w-5 h-5 text-purple-600" />
                  <div>
                    <p className="text-sm text-gray-500">ROI</p>
                    <p className="text-lg font-semibold">
                      {stats.roi.toFixed(1)}%
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                  <div className="w-5 h-5 flex items-center justify-center text-yellow-600">
                    R$
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Lucro Total</p>
                    <p className="text-lg font-semibold">
                      {new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                      }).format(stats.lucroTotal)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center pt-4 border-t">
                <div className="flex items-center">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={metodo.ativo}
                      onChange={() => toggleMetodoAtivo(metodo.id)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    <span className="ml-3 text-sm font-medium text-gray-700">
                      {metodo.ativo ? 'Ativo' : 'Inativo'}
                    </span>
                  </label>
                </div>
                <button
                  onClick={() => navigate(`/metodos/${metodo.id}`)}
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  Ver detalhes
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Metodos;