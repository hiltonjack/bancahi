import {
  Metodo,
  PartidaAnalise,
  ResultadoMetodoPartida,
  CampoCondicao,
  OperadorCondicao,
  OddsCasa,
} from '../types';

const normalizarNumero = (valor: string | number | undefined) => {
  if (typeof valor === 'number') return valor;
  if (!valor) return 0;
  return Number(valor.toString().replace(',', '.'));
};

const obterValorCampo = (partida: PartidaAnalise, campo: CampoCondicao): string | number => {
  switch (campo) {
    case 'minuto':
      return partida.minuto ?? 0;
    case 'placar_favorito': {
      const favorito = partida.equipes.favorito;
      const saldo =
        favorito === 'casa'
          ? partida.placar.casa - partida.placar.fora
          : partida.placar.fora - partida.placar.casa;
      return saldo;
    }
    case 'odd_favorito': {
      const favorito = partida.equipes.favorito;
      const mercado = favorito === 'casa' ? 'vitoria_casa' : 'vitoria_fora';
      return obterMelhorOdd(partida.odds, mercado)?.odd ?? 0;
    }
    case 'odd_underdog': {
      const favorito = partida.equipes.favorito === 'casa' ? 'vitoria_fora' : 'vitoria_casa';
      return obterMelhorOdd(partida.odds, favorito)?.odd ?? 0;
    }
    case 'posse_favorito':
      return partida.estatisticas.posseFavorito;
    case 'finalizacoes_favorito':
      return partida.estatisticas.finalizacoesFavorito;
    case 'escanteios_total':
      return partida.estatisticas.escanteiosTotal;
    case 'gols_total':
      return partida.placar.casa + partida.placar.fora;
    case 'liga':
      return partida.campeonato.toLowerCase();
    case 'status':
      return partida.status;
    default:
      return 0;
  }
};

const comparar = (
  valorCampo: string | number,
  operador: OperadorCondicao,
  valor: string,
  valorSecundario?: string,
): boolean => {
  if (operador === 'contem') {
    return valorCampo
      .toString()
      .toLowerCase()
      .includes((valor ?? '').toString().toLowerCase());
  }

  if (operador === 'igual' || operador === 'diferente') {
    const resultado = valorCampo.toString().toLowerCase() === valor.toLowerCase();
    return operador === 'igual' ? resultado : !resultado;
  }

  const numeroCampo = normalizarNumero(valorCampo);
  const numeroValor = normalizarNumero(valor);

  switch (operador) {
    case 'maior':
      return numeroCampo > numeroValor;
    case 'maior_ou_igual':
      return numeroCampo >= numeroValor;
    case 'menor':
      return numeroCampo < numeroValor;
    case 'menor_ou_igual':
      return numeroCampo <= numeroValor;
    case 'entre': {
      const numeroSecundario = normalizarNumero(valorSecundario);
      return numeroCampo >= Math.min(numeroValor, numeroSecundario) &&
        numeroCampo <= Math.max(numeroValor, numeroSecundario);
    }
    default:
      return false;
  }
};

export const avaliarPartidaComMetodo = (
  partida: PartidaAnalise,
  metodo: Metodo,
): ResultadoMetodoPartida => {
  const condicoes = metodo.condicoes || [];
  const parametrosIA = metodo.parametrosIA || {
    sensibilidade: 0.5,
    minimoValorEsperado: 0.1,
    confiancaMinima: 0.5,
  };

  const resultadosCondicoes = condicoes.map((condicao) => {
    const valorCampo = obterValorCampo(partida, condicao.campo);
    return comparar(valorCampo, condicao.operador, condicao.valor, condicao.valorSecundario);
  });

  const condicoesAtendidas = resultadosCondicoes.filter(Boolean).length;
  const atende = condicoesAtendidas === condicoes.length && condicoes.length > 0;

  const ajusteSensibilidade = parametrosIA.sensibilidade || 0.5;
  const valorEsperadoAjustado =
    partida.analiseIA.valorEsperado * ajusteSensibilidade +
    (1 - ajusteSensibilidade) * parametrosIA.minimoValorEsperado;

  const confiancaAjustada = Math.min(
    1,
    (partida.analiseIA.confianca + parametrosIA.confiancaMinima) / 2,
  );

  const comentarioBase = atende
    ? 'Todas as condições definidas foram atendidas.'
    : condicoesAtendidas > 0
    ? `${condicoesAtendidas} de ${condicoes.length} condições atendidas.`
    : 'Nenhuma condição foi atendida.';

  const comentario = parametrosIA.comentario
    ? `${comentarioBase} ${parametrosIA.comentario}`
    : comentarioBase;

  return {
    metodoId: metodo.id,
    nomeMetodo: metodo.nome,
    atende,
    condicoesAtendidas,
    totalCondicoes: condicoes.length,
    valorEsperadoAjustado,
    confiancaAjustada,
    comentario,
  };
};

export const obterMelhorOdd = (odds: OddsCasa[], mercado: string) => {
  let melhor: { casa: string; odd: number; mercado: string } | undefined;
  odds.forEach((casa) => {
    casa.linhas.forEach((linha) => {
      if (linha.mercado === mercado) {
        if (!melhor || linha.odd > melhor.odd) {
          melhor = {
            casa: casa.casa,
            odd: linha.odd,
            mercado,
          };
        }
      }
    });
  });
  return melhor;
};

export const obterMelhorOddFavorito = (partida: PartidaAnalise) => {
  const mercado = partida.equipes.favorito === 'casa' ? 'vitoria_casa' : 'vitoria_fora';
  return obterMelhorOdd(partida.odds, mercado);
};
