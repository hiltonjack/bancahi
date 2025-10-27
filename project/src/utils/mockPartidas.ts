import { PartidaAnalise, OddsCasa, LinhaOdd } from '../types';
import { gerarAnaliseIA } from './motorIA';

const casas = ['Bet365', 'Betano', 'Pinnacle', 'Stake'];

const criarOdds = (baseCasa: number, baseFora: number, baseEmpate: number): OddsCasa[] => {
  return casas.map((casa, index) => {
    const variacao = 0.05 * index;
    const linhas: LinhaOdd[] = [
      { mercado: 'vitoria_casa', odd: Number((baseCasa + variacao).toFixed(2)) },
      { mercado: 'empate', odd: Number((baseEmpate + variacao / 2).toFixed(2)) },
      { mercado: 'vitoria_fora', odd: Number((baseFora + variacao).toFixed(2)) },
      { mercado: 'over_2_5', odd: Number((2.1 + variacao).toFixed(2)) },
      { mercado: 'under_2_5', odd: Number((1.8 + variacao / 1.5).toFixed(2)) },
    ];

    return {
      casa,
      linhas,
      atualizadaEm: new Date().toISOString(),
    };
  });
};

export const gerarPartidasSimuladas = (): PartidaAnalise[] => {
  const agora = new Date();

  const partidas: PartidaAnalise[] = [
    {
      id: 'flamengo-palmeiras',
      campeonato: 'Brasileirão Série A',
      pais: 'Brasil',
      status: 'ao-vivo',
      inicio: new Date(agora.getTime() - 27 * 60 * 1000).toISOString(),
      minuto: 27,
      equipes: {
        casa: 'Flamengo',
        fora: 'Palmeiras',
        favorito: 'casa',
      },
      placar: {
        casa: 0,
        fora: 1,
      },
      estatisticas: {
        posseFavorito: 62,
        finalizacoesFavorito: 8,
        finalizacoesContra: 4,
        escanteiosTotal: 5,
        ataquesPerigososFavorito: 14,
      },
      odds: criarOdds(3.4, 2.2, 3.5),
      analiseIA: gerarAnaliseIA({
        minuto: 27,
        favoritoVencendo: false,
        posseFavorito: 62,
        finalizacoesFavorito: 8,
        finalizacoesContra: 4,
        ataquesPerigososFavorito: 14,
        escanteios: 5,
      }),
    },
    {
      id: 'benfica-porto',
      campeonato: 'Liga Portugal',
      pais: 'Portugal',
      status: 'ao-vivo',
      inicio: new Date(agora.getTime() - 52 * 60 * 1000).toISOString(),
      minuto: 52,
      equipes: {
        casa: 'Benfica',
        fora: 'Porto',
        favorito: 'casa',
      },
      placar: {
        casa: 1,
        fora: 1,
      },
      estatisticas: {
        posseFavorito: 55,
        finalizacoesFavorito: 6,
        finalizacoesContra: 5,
        escanteiosTotal: 7,
        ataquesPerigososFavorito: 10,
      },
      odds: criarOdds(2.1, 3.1, 3.4),
      analiseIA: gerarAnaliseIA({
        minuto: 52,
        favoritoVencendo: false,
        posseFavorito: 55,
        finalizacoesFavorito: 6,
        finalizacoesContra: 5,
        ataquesPerigososFavorito: 10,
        escanteios: 7,
      }),
    },
    {
      id: 'al-hilal-al-nassr',
      campeonato: 'Saudi Pro League',
      pais: 'Arábia Saudita',
      status: 'pre-live',
      inicio: new Date(agora.getTime() + 2 * 60 * 60 * 1000).toISOString(),
      equipes: {
        casa: 'Al Hilal',
        fora: 'Al Nassr',
        favorito: 'casa',
      },
      placar: {
        casa: 0,
        fora: 0,
      },
      estatisticas: {
        posseFavorito: 0,
        finalizacoesFavorito: 0,
        finalizacoesContra: 0,
        escanteiosTotal: 0,
        ataquesPerigososFavorito: 0,
      },
      odds: criarOdds(1.85, 3.6, 4.1),
      analiseIA: gerarAnaliseIA({
        minuto: 0,
        favoritoVencendo: false,
        posseFavorito: 55,
        finalizacoesFavorito: 0,
        finalizacoesContra: 0,
        ataquesPerigososFavorito: 0,
        escanteios: 0,
        preJogo: true,
      }),
    },
    {
      id: 'psg-lyon',
      campeonato: 'Ligue 1',
      pais: 'França',
      status: 'pre-live',
      inicio: new Date(agora.getTime() + 4 * 60 * 60 * 1000).toISOString(),
      equipes: {
        casa: 'Paris Saint-Germain',
        fora: 'Lyon',
        favorito: 'casa',
      },
      placar: {
        casa: 0,
        fora: 0,
      },
      estatisticas: {
        posseFavorito: 0,
        finalizacoesFavorito: 0,
        finalizacoesContra: 0,
        escanteiosTotal: 0,
        ataquesPerigososFavorito: 0,
      },
      odds: criarOdds(1.6, 4.5, 4.2),
      analiseIA: gerarAnaliseIA({
        minuto: 0,
        favoritoVencendo: false,
        posseFavorito: 60,
        finalizacoesFavorito: 0,
        finalizacoesContra: 0,
        ataquesPerigososFavorito: 0,
        escanteios: 0,
        preJogo: true,
      }),
    },
  ];

  return partidas;
};

export default gerarPartidasSimuladas;
