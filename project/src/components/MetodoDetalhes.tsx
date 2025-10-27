import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, TrendingUp, TrendingDown, Calendar } from 'lucide-react';
import useBancaStore from '../store/bancaStore';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import SimuladorLucro from './SimuladorLucro';

const MetodoDetalhes = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { metodos, apostas } = useBancaStore();

  const metodo = metodos.find((m) => m.id === id);
  if (!metodo) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">Método não encontrado</p>
        <button
          onClick={() => navigate('/metodos')}
          className="mt-4 text-blue-600 hover:text-blue-700"
        >
          Voltar para Métodos
        </button>
      </div>
    );
  }

  const apostasDoMetodo = apostas.filter((a) => a.metodo === id);
  const apostasGanhas = apostasDoMetodo.filter((a) => a.resultado === 'green');
  const apostasPerdidas = apostasDoMetodo.filter((a) => a.resultado === 'red');

  const condicoes = metodo.condicoes || [];
  const parametrosIA = metodo.parametrosIA || {
    sensibilidade: 0.5,
    minimoValorEsperado: 0.1,
    confiancaMinima: 0.5,
  };
  const notificacoesAtivas = metodo.notificacoesAtivas ?? true;

  const calcularLucroAcumulado = () => {
    let lucroAcumulado = 0;
    return apostasDoMetodo
      .sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime())
      .map((aposta) => {
        const lucro =
          aposta.resultado === 'green'
            ? aposta.stake * (aposta.odd || 1) - aposta.stake
            : -aposta.stake;
        lucroAcumulado += lucro;
        return {
          data: format(new Date(aposta.data), 'dd/MM'),
          lucro: lucroAcumulado,
        };
      });
  };

  const dadosGrafico = calcularLucroAcumulado();

  const taxaAcerto =
    apostasDoMetodo.length > 0
      ? (apostasGanhas.length / apostasDoMetodo.length) * 100
      : 0;

  const lucroTotal = apostasDoMetodo.reduce((acc, aposta) => {
    const lucro =
      aposta.resultado === 'green'
        ? aposta.stake * (aposta.odd || 1) - aposta.stake
        : -aposta.stake;
    return acc + lucro;
  }, 0);

  // Calcular odd média
  const oddMedia = apostasDoMetodo.reduce((acc, aposta) => acc + (aposta.odd || 1), 0) / 
    (apostasDoMetodo.length || 1);

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <button
          onClick={() => navigate('/metodos')}
          className="text-gray-600 hover:text-gray-800"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h2 className="text-2xl font-bold text-gray-800">{metodo.nome}</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-sm font-medium text-gray-500">Tipo de estratégia</h3>
          <p className="text-xl font-semibold text-gray-900 mt-2 capitalize">
            {metodo.tipo === 'ao-vivo' ? 'Ao vivo' : metodo.tipo === 'pre-live' ? 'Pré-jogo' : 'Híbrido'}
          </p>
          <p className="text-sm text-gray-500 mt-3">
            Notificações automáticas {notificacoesAtivas ? 'ativadas' : 'desativadas'}.
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-sm font-medium text-gray-500">Parâmetros de IA</h3>
          <ul className="mt-3 space-y-2 text-gray-700 text-sm">
            <li>Sensibilidade: {(parametrosIA.sensibilidade * 100).toFixed(0)}%</li>
            <li>Valor mínimo: {(parametrosIA.minimoValorEsperado * 100).toFixed(0)}%</li>
            <li>Confiança mínima: {(parametrosIA.confiancaMinima * 100).toFixed(0)}%</li>
          </ul>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-sm font-medium text-gray-500">Configurações gerais</h3>
          <p className="text-sm text-gray-600 mt-2">
            Mercado preferencial:{' '}
            {metodo.mercadoPreferencial ? metodo.mercadoPreferencial : 'não especificado'}
          </p>
          {parametrosIA.comentario && (
            <p className="text-sm text-gray-600 mt-2">Comentário padrão: {parametrosIA.comentario}</p>
          )}
        </div>
      </div>

      {metodo.descricao && (
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Resumo da estratégia</h3>
          <p className="text-gray-600">{metodo.descricao}</p>
        </div>
      )}

      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Condições configuradas</h3>
        {condicoes.length ? (
          <div className="space-y-3">
            {condicoes.map((condicao) => (
              <div
                key={condicao.id}
                className="border border-blue-200 bg-blue-50 rounded-lg p-4 text-sm text-gray-700"
              >
                <p className="font-medium text-blue-700">
                  {condicao.campo.replace(/_/g, ' ')} {condicao.operador} {condicao.valor}
                  {condicao.valorSecundario ? ` e ${condicao.valorSecundario}` : ''}
                </p>
                {condicao.descricao && (
                  <p className="mt-2 text-gray-600">{condicao.descricao}</p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500">Nenhuma condição cadastrada para esta estratégia.</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-500">Total de Apostas</h3>
            <Calendar className="w-5 h-5 text-gray-400" />
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {apostasDoMetodo.length}
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-500">Taxa de Acerto</h3>
            <TrendingUp className="w-5 h-5 text-green-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {taxaAcerto.toFixed(1)}%
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-500">Lucro Total</h3>
            {lucroTotal >= 0 ? (
              <TrendingUp className="w-5 h-5 text-green-500" />
            ) : (
              <TrendingDown className="w-5 h-5 text-red-500" />
            )}
          </div>
          <p
            className={`text-2xl font-bold ${
              lucroTotal >= 0 ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {new Intl.NumberFormat('pt-BR', {
              style: 'currency',
              currency: 'BRL',
              signDisplay: 'always',
            }).format(lucroTotal)}
          </p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Evolução do Lucro
        </h3>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={dadosGrafico}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="data" />
              <YAxis />
              <Tooltip
                formatter={(value) =>
                  new Intl.NumberFormat('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                  }).format(Number(value))
                }
              />
              <Line
                type="monotone"
                dataKey="lucro"
                stroke="#2563eb"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <SimuladorLucro 
        aproveitamento={taxaAcerto} 
        oddMedia={oddMedia}
      />

      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Histórico de Apostas
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left border-b">
                <th className="pb-3 px-4">Data</th>
                <th className="pb-3 px-4">Stake</th>
                <th className="pb-3 px-4">Odd</th>
                <th className="pb-3 px-4">Resultado</th>
                <th className="pb-3 px-4">Lucro/Prejuízo</th>
              </tr>
            </thead>
            <tbody>
              {apostasDoMetodo
                .sort(
                  (a, b) =>
                    new Date(b.data).getTime() - new Date(a.data).getTime()
                )
                .map((aposta) => {
                  const lucro =
                    aposta.resultado === 'green'
                      ? aposta.stake * (aposta.odd || 1) - aposta.stake
                      : -aposta.stake;

                  return (
                    <tr key={aposta.id} className="border-b">
                      <td className="py-3 px-4">
                        {format(new Date(aposta.data), "dd/MM/yyyy 'às' HH:mm", {
                          locale: ptBR,
                        })}
                      </td>
                      <td className="py-3 px-4">
                        {new Intl.NumberFormat('pt-BR', {
                          style: 'currency',
                          currency: 'BRL',
                        }).format(aposta.stake)}
                      </td>
                      <td className="py-3 px-4">{aposta.odd?.toFixed(2) || '-'}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-1 rounded-full text-sm ${
                            aposta.resultado === 'green'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {aposta.resultado === 'green' ? 'Green' : 'Red'}
                        </span>
                      </td>
                      <td
                        className={`py-3 px-4 font-medium ${
                          lucro >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}
                      >
                        {new Intl.NumberFormat('pt-BR', {
                          style: 'currency',
                          currency: 'BRL',
                          signDisplay: 'always',
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

export default MetodoDetalhes;