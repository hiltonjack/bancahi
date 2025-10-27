import React, { useEffect, useMemo, useState } from 'react';
import { Calendar, Clock, Filter, RefreshCw, Search, Trophy } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import useAnaliseStore from '../store/analiseStore';
import useBancaStore from '../store/bancaStore';
import { obterMelhorOddFavorito } from '../utils/avaliadorMetodos';

const PreJogos: React.FC = () => {
  const { partidas, carregando, atualizarPartidas, ultimaAtualizacao } = useAnaliseStore((state) => ({
    partidas: state.partidas,
    carregando: state.carregando,
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
    }, 30000);

    return () => clearInterval(intervalo);
  }, [atualizarPartidas]);

  useEffect(() => {
    if (metodos.length === 0) {
      return;
    }
    atualizarPartidas();
  }, [metodos, atualizarPartidas]);

  const partidasPre = partidas.filter((partida) => partida.status === 'pre-live');

  const ligasDisponiveis = useMemo(() => {
    const ligas = new Set<string>();
    partidasPre.forEach((partida) => ligas.add(partida.campeonato));
    return Array.from(ligas);
  }, [partidasPre]);

  const partidasFiltradas = useMemo(() => {
    return partidasPre.filter((partida) => {
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
  }, [partidasPre, ligaFiltro, busca, oddMin, oddMax]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between lg:space-x-6 space-y-4 lg:space-y-0">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Pré-jogos</h2>
          <p className="text-gray-500">
            Analise confrontos futuros com base nas estratégias personalizadas e na IA.
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    <Calendar className="w-3 h-3 mr-1" />
                    {format(parseISO(partida.inicio), "dd/MM HH:mm", { locale: ptBR })}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 text-sm text-gray-600">
                <div className="bg-gray-50 rounded-lg p-3">
                  <p><strong>Modelo IA:</strong> {partida.analiseIA.sugestaoMercado}</p>
                  <p><strong>Valor esperado:</strong> {partida.analiseIA.valorEsperado.toFixed(2)}</p>
                  <p><strong>Confiança:</strong> {(partida.analiseIA.confianca * 100).toFixed(0)}%</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p><strong>Favorito:</strong> {partida.equipes.favorito === 'casa' ? partida.equipes.casa : partida.equipes.fora}</p>
                  {melhorOdd && (
                    <p><strong>Melhor odd:</strong> {melhorOdd.casa} · {melhorOdd.odd.toFixed(2)}</p>
                  )}
                  <p><strong>Tendência:</strong> {partida.analiseIA.comentario}</p>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 flex items-center justify-between">
                <div className="flex items-center space-x-2 text-blue-700">
                  <Trophy className="w-5 h-5" />
                  <div>
                    <p className="text-sm font-medium">Comparador de odds</p>
                    {melhorOdd ? (
                      <p className="text-sm">Melhor preço: {melhorOdd.casa} ({melhorOdd.odd.toFixed(2)})</p>
                    ) : (
                      <p className="text-sm">Aguardando atualização das odds</p>
                    )}
                  </div>
                </div>
                <Clock className="w-5 h-5 text-blue-600" />
              </div>

              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-2">Estratégias compatíveis</h4>
                {partida.resultadosMetodos?.filter((resultado) => resultado.atende).length ? (
                  <div className="space-y-2">
                    {partida.resultadosMetodos
                      ?.filter((resultado) => resultado.atende)
                      .map((resultado) => (
                        <div
                          key={resultado.metodoId}
                          className="border border-green-200 bg-green-50 rounded-lg p-3 text-sm text-gray-700"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-medium">{resultado.nomeMetodo}</span>
                            <span className="text-xs text-green-600 font-semibold">
                              Valor {resultado.valorEsperadoAjustado.toFixed(2)} · Confiança{' '}
                              {(resultado.confiancaAjustada * 100).toFixed(0)}%
                            </span>
                          </div>
                          <p className="mt-1 text-xs text-gray-600">{resultado.comentario}</p>
                        </div>
                      ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">
                    Nenhuma estratégia encontrou condições completas neste confronto.
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {partidasFiltradas.length === 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-6 text-center text-gray-500">
          Nenhuma partida pré-jogo atende aos filtros selecionados.
        </div>
      )}
    </div>
  );
};

export default PreJogos;
