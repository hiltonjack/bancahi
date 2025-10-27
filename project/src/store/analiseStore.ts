import { create } from 'zustand';
import {
  AlertaAnalise,
  PartidaAnalise,
  ResultadoMetodoPartida,
} from '../types';
import { gerarPartidasSimuladas } from '../utils/mockPartidas';
import { avaliarPartidaComMetodo, obterMelhorOddFavorito } from '../utils/avaliadorMetodos';
import useBancaStore from './bancaStore';

interface AnaliseState {
  partidas: PartidaAnalise[];
  carregando: boolean;
  ultimaAtualizacao?: string;
  alertas: AlertaAnalise[];
  alertasAtivos: Record<string, string>;
  atualizarPartidas: () => Promise<void>;
  limparAlertas: () => void;
  removerAlerta: (id: string) => void;
}

export const useAnaliseStore = create<AnaliseState>((set, get) => ({
  partidas: [],
  carregando: false,
  alertas: [],
  alertasAtivos: {},
  async atualizarPartidas() {
    set({ carregando: true });
    const metodosAtivos = useBancaStore.getState().metodos.filter((m) => m.ativo);
    const partidas = gerarPartidasSimuladas();

    const agora = new Date().toISOString();

    const partidasComResultados = partidas.map((partida) => {
      const resultadosMetodos: ResultadoMetodoPartida[] = metodosAtivos.map((metodo) =>
        avaliarPartidaComMetodo(partida, metodo)
      );
      const melhorOdd = obterMelhorOddFavorito(partida);

      return {
        ...partida,
        resultadosMetodos,
        analiseIA: {
          ...partida.analiseIA,
          sugestaoMercado: partida.analiseIA.sugestaoMercado ||
            (melhorOdd ? `Aproveitar ${melhorOdd.casa} @ ${melhorOdd.odd.toFixed(2)}` : undefined),
        },
      };
    });

    const alertasAtivos = { ...get().alertasAtivos };
    const novosAlertas: AlertaAnalise[] = [];

    partidasComResultados.forEach((partida) => {
      partida.resultadosMetodos?.forEach((resultado) => {
        const chave = `${partida.id}-${resultado.metodoId}`;
        if (resultado.atende) {
          const metodo = metodosAtivos.find((m) => m.id === resultado.metodoId);
          const notificacoesAtivas = metodo?.notificacoesAtivas ?? true;
          if (!notificacoesAtivas) {
            return;
          }
          if (!alertasAtivos[chave]) {
            const melhorOdd = obterMelhorOddFavorito(partida);
            novosAlertas.push({
              id: crypto.randomUUID(),
              partidaId: partida.id,
              metodoId: resultado.metodoId,
              mensagem: `${partida.equipes.casa} x ${partida.equipes.fora}: ${resultado.nomeMetodo} encontrou oportunidade (valor ${resultado.valorEsperadoAjustado.toFixed(2)})`,
              horario: agora,
              melhorOdd,
            });
          }
          alertasAtivos[chave] = agora;
        } else if (alertasAtivos[chave]) {
          delete alertasAtivos[chave];
        }
      });
    });

    set((state) => ({
      partidas: partidasComResultados,
      carregando: false,
      ultimaAtualizacao: agora,
      alertas: [...novosAlertas, ...state.alertas].slice(0, 20),
      alertasAtivos,
    }));
  },
  limparAlertas() {
    set({ alertas: [] });
  },
  removerAlerta(id) {
    set((state) => ({ alertas: state.alertas.filter((alerta) => alerta.id !== id) }));
  },
}));

export default useAnaliseStore;
