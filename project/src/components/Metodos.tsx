import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, TrendingUp, BarChart2, Trash2, Edit, Target, CheckCircle2 } from 'lucide-react';
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
          const condicoes = metodo.condicoes || [];
          const parametrosIA = metodo.parametrosIA || {
            sensibilidade: 0.5,
            minimoValorEsperado: 0.1,
            confiancaMinima: 0.5,
          };
          return (
            <div
              key={metodo.id}
              className="bg-white p-6 rounded-lg shadow-sm space-y-4"
            >
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <h3 className="text-xl font-semibold text-gray-800">
                      {metodo.nome}
                    </h3>
                    <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-700 capitalize">
                      {metodo.tipo === 'ao-vivo'
                        ? 'Ao vivo'
                        : metodo.tipo === 'pre-live'
                        ? 'Pré-jogo'
                        : 'Híbrido'}
                    </span>
                  </div>
                  {metodo.descricao && (
                    <p className="text-gray-600">{metodo.descricao}</p>
                  )}
                  <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
                    <span className="flex items-center space-x-1">
                      <Target className="w-4 h-4" />
                      <span>{condicoes.length} condições</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Sensibilidade IA {(parametrosIA.sensibilidade * 100).toFixed(0)}%</span>
                    </span>
                    {metodo.mercadoPreferencial && (
                      <span>Mercado: {metodo.mercadoPreferencial}</span>
                    )}
                  </div>
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

              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-gray-700 mb-3">Condições configuradas</h4>
                {condicoes.length ? (
                  <ul className="space-y-2 text-sm text-gray-600">
                    {condicoes.map((condicao) => (
                      <li key={condicao.id} className="flex items-start space-x-2">
                        <span className="mt-1 w-2 h-2 rounded-full bg-blue-500" />
                        <span>
                          <strong>{condicao.campo.replace(/_/g, ' ')}:</strong> {condicao.operador} {condicao.valor}
                          {condicao.valorSecundario ? ` / ${condicao.valorSecundario}` : ''}
                          {condicao.descricao ? ` – ${condicao.descricao}` : ''}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-500">Nenhuma condição cadastrada.</p>
                )}
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