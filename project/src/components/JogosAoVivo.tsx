import React, { useEffect, useMemo, useState } from 'react';
import {
  Activity,
  AlertTriangle,
  Filter,
  RefreshCw,
  Search,
  Trophy,
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import useAnaliseStore from '../store/analiseStore';
import { PartidaAnalise } from '../types';
import useBancaStore from '../store/bancaStore';
import { obterMelhorOddFavorito } from '../utils/avaliadorMetodos';

const JogosAoVivo: React.FC = () => {
  const { partidas, carregando, atualizarPartidas, alertas, removerAlerta, ultimaAtualizacao } = useAnaliseStore((state) => ({
    partidas: state.partidas,
    carregando: state.carregando,
    alertas: state.alertas,
    removerAlerta: state.removerAlerta,
    atualizarPartidas: state.atualizarPartidas,
    ultimaAtualizacao: state.ultimaAtualizacao,
  }));
  const metodos = useBancaStore((state) => state.metodos);

  const [busca, setBusca] = useState('');
  const [ligaFiltro, setLigaFiltro] = useState('todas');
  const [oddMin, setOddMin] = useState(1.2);
  const [oddMax, setOddMax] = useState(6);

  useEffect(() => {
    atualizarPartidas();
    const intervalo = setInterval(() => {
      atualizarPartidas();
    }, 15000);

    return () => clearInterval(intervalo);
  }, [atualizarPartidas]);

  useEffect(() => {
    if (metodos.length === 0) {
      return;
    }
    atualizarPartidas();
  }, [metodos, atualizarPartidas]);

  const partidasAoVivo = partidas.filter((partida) => partida.status === 'ao-vivo');

  const ligasDisponiveis = useMemo(() => {
    const ligas = new Set<string>();
    partidasAoVivo.forEach((partida) => ligas.add(partida.campeonato));
    return Array.from(ligas);
  }, [partidasAoVivo]);

  const partidasFiltradas = useMemo(() => {
    return partidasAoVivo.filter((partida) => {
      if (ligaFiltro !== 'todas' && partida.campeonato !== ligaFiltro) {
        return false;
      }

      const termo = busca.trim().toLowerCase();
      if (
        termo &&
        !partida.equipes.casa.toLowerCase().includes(termo) &&
        !partida.equipes.fora.toLowerCase().includes(termo)
      ) {
        return false;
      }

      const melhorOdd = obterMelhorOddFavorito(partida);
      if (!melhorOdd) {
        return false;
      }
      if (melhorOdd.odd < oddMin || melhorOdd.odd > oddMax) {
        return false;
      }

      return true;
    });
  }, [partidasAoVivo, ligaFiltro, busca, oddMin, oddMax]);

  const renderResultadosMetodo = (partida: PartidaAnalise) => {
    if (!partida.resultadosMetodos?.length) {
      return (
        <p className="text-sm text-gray-500">Nenhuma estratégia aplicada até o momento.</p>
      );
    }

    return (
      <div className="space-y-3">
        {partida.resultadosMetodos.map((resultado) => (
          <div
            key={resultado.metodoId}
            className={`p-3 rounded-lg border ${
              resultado.atende
                ? 'border-green-500 bg-green-50'
                : 'border-gray-200 bg-gray-50'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-medium text-gray-700">{resultado.nomeMetodo}</span>
              <span
                className={`text-xs font-semibold uppercase ${
                  resultado.atende ? 'text-green-600' : 'text-gray-500'
                }`}
              >
                {resultado.atende ? 'Condição atendida' : 'Em análise'}
              </span>
            </div>
            <p className="text-sm text-gray-600 mt-2">{resultado.comentario}</p>
            <div className="flex items-center justify-between mt-3 text-sm text-gray-600">
              <span>
                Condições: {resultado.condicoesAtendidas}/{resultado.totalCondicoes}
              </span>
              <span>
                Valor: {resultado.valorEsperadoAjustado.toFixed(2)} | Confiança:{' '}
                {(resultado.confiancaAjustada * 100).toFixed(0)}%
              </span>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderAlertas = () => {
    if (!alertas.length) return null;

    return (
      <div className="mb-6 space-y-2">
        {alertas.map((alerta) => (
          <div
            key={alerta.id}
            className="bg-yellow-100 border border-yellow-300 text-yellow-800 p-4 rounded-lg flex items-start justify-between"
          >
            <div>
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5" />
                <span className="font-semibold">Alerta de oportunidade</span>
              </div>
              <p className="mt-2 text-sm">{alerta.mensagem}</p>
              {alerta.melhorOdd && (
                <p className="text-sm mt-1">
                  Melhor odd: {alerta.melhorOdd.casa} @ {alerta.melhorOdd.odd.toFixed(2)} ({
                    alerta.melhorOdd.mercado === 'vitoria_casa' ? 'Vitória mandante' : 'Vitória visitante'
                  })
                </p>
              )}
              <p className="text-xs text-yellow-700 mt-1">
                {format(parseISO(alerta.horario), "dd/MM/yyyy 'às' HH:mm:ss", { locale: ptBR })}
              </p>
            </div>
            <button
              className="text-sm text-yellow-800 hover:underline"
              onClick={() => removerAlerta(alerta.id)}
            >
              Fechar
            </button>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between lg:space-x-6 space-y-4 lg:space-y-0">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Jogos ao vivo</h2>
          <p className="text-gray-500">
            Monitoramento em tempo real com avaliação de IA e estratégias personalizadas.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={atualizarPartidas}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            <RefreshCw className={`w-4 h-4 ${carregando ? 'animate-spin' : ''}`} />
            <span>Atualizar agora</span>
          </button>
          <div className="text-sm text-gray-500">
            Última atualização:{' '}
            {ultimaAtualizacao
              ? format(parseISO(ultimaAtualizacao), "dd/MM/yyyy 'às' HH:mm:ss", { locale: ptBR })
              : 'carregando...'}
          </div>
        </div>
      </div>

      {renderAlertas()}

      <div className="bg-white p-4 rounded-lg shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="flex items-center border rounded-lg px-3 py-2">
            <Search className="w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por equipe"
              className="flex-1 ml-2 focus:outline-none"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
            />
          </div>
          <div className="flex items-center border rounded-lg px-3 py-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              className="flex-1 ml-2 focus:outline-none"
              value={ligaFiltro}
              onChange={(e) => setLigaFiltro(e.target.value)}
            >
              <option value="todas">Todas as ligas</option>
              {ligasDisponiveis.map((liga) => (
                <option key={liga} value={liga}>
                  {liga}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col">
            <label className="text-xs text-gray-500">Odd mínima do favorito</label>
            <input
              type="range"
              min={1.1}
              max={4}
              step={0.1}
              value={oddMin}
              onChange={(e) => setOddMin(Number(e.target.value))}
            />
            <span className="text-sm text-gray-600 mt-1">{oddMin.toFixed(2)}</span>
          </div>
          <div className="flex flex-col">
            <label className="text-xs text-gray-500">Odd máxima do favorito</label>
            <input
              type="range"
              min={2}
              max={10}
              step={0.1}
              value={oddMax}
              onChange={(e) => setOddMax(Number(e.target.value))}
            />
            <span className="text-sm text-gray-600 mt-1">{oddMax.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {partidasFiltradas.map((partida) => {
          const melhorOdd = obterMelhorOddFavorito(partida);
          return (
            <div key={partida.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">{partida.campeonato} · {partida.pais}</p>
                  <h3 className="text-xl font-semibold text-gray-800">
                    {partida.equipes.casa} x {partida.equipes.fora}
                  </h3>
                </div>
                <div className="text-right">
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    <Activity className="w-3 h-3 mr-1" /> Ao vivo · {partida.minuto}'
                  </span>
                  <p className="text-lg font-bold text-gray-800 mt-2">
                    {partida.placar.casa} - {partida.placar.fora}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                <div className="bg-gray-50 rounded-lg p-3">
                  <p><strong>Posse do favorito:</strong> {partida.estatisticas.posseFavorito}%</p>
                  <p><strong>Finalizações:</strong> {partida.estatisticas.finalizacoesFavorito} x {partida.estatisticas.finalizacoesContra}</p>
                  <p><strong>Escanteios:</strong> {partida.estatisticas.escanteiosTotal}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p><strong>Análise IA:</strong> valor {partida.analiseIA.valorEsperado.toFixed(2)}</p>
                  <p><strong>Confiança:</strong> {(partida.analiseIA.confianca * 100).toFixed(0)}%</p>
                  <p><strong>Sugestão:</strong> {partida.analiseIA.sugestaoMercado}</p>
                </div>
              </div>

              {melhorOdd && (
                <div className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-lg px-4 py-3">
                  <div className="flex items-center space-x-2 text-blue-700">
                    <Trophy className="w-5 h-5" />
                    <div>
                      <p className="text-sm font-medium">Melhor odd para o favorito</p>
                      <p className="text-sm">{melhorOdd.casa} · {melhorOdd.odd.toFixed(2)}</p>
                    </div>
                  </div>
                  <button className="text-sm font-semibold text-blue-700 hover:text-blue-800">
                    Ver casas
                  </button>
                </div>
              )}

              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-2">Estratégias aplicadas</h4>
                {renderResultadosMetodo(partida)}
              </div>
            </div>
          );
        })}
      </div>

      {partidasFiltradas.length === 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-6 text-center text-gray-500">
          Nenhuma partida ao vivo atende aos filtros selecionados.
        </div>
      )}
    </div>
  );
};

export default JogosAoVivo;
