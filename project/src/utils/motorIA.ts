interface AnaliseContexto {
  minuto: number;
  favoritoVencendo: boolean;
  posseFavorito: number;
  finalizacoesFavorito: number;
  finalizacoesContra: number;
  ataquesPerigososFavorito: number;
  escanteios: number;
  preJogo?: boolean;
}

export const gerarAnaliseIA = (contexto: AnaliseContexto) => {
  const {
    minuto,
    favoritoVencendo,
    posseFavorito,
    finalizacoesFavorito,
    finalizacoesContra,
    ataquesPerigososFavorito,
    escanteios,
    preJogo,
  } = contexto;

  const pressãoOfensiva = finalizacoesFavorito + ataquesPerigososFavorito * 0.6;
  const pressaoOponente = finalizacoesContra * 1.1;
  const diferencaPressao = pressãoOfensiva - pressaoOponente;

  const vantagemPosse = posseFavorito - 50;

  const fatorTempo = preJogo ? 0.4 : Math.min(minuto / 90, 1);
  const penalidadeResultado = favoritoVencendo ? 0.1 : 0.35;

  const valorEsperadoBase =
    (diferencaPressao / 20 + vantagemPosse / 100 + (escanteios * 0.02)) * (preJogo ? 0.8 : 1);

  const valorEsperado = Math.max(
    -0.5,
    Math.min(0.9, valorEsperadoBase + (favoritoVencendo ? -penalidadeResultado : penalidadeResultado))
  );

  const confiancaBase = 0.45 + Math.min(0.4, Math.abs(diferencaPressao) / 30);
  const confianca = Math.max(0.2, Math.min(0.95, confiancaBase + fatorTempo * 0.2));

  const sugestaoMercado = preJogo
    ? valorEsperado > 0.2
      ? 'Back favorito pré-jogo'
      : 'Buscar mercados alternativos'
    : valorEsperado > 0.3
    ? 'Back virada do favorito'
    : valorEsperado > 0
    ? 'Mercado de gols ou cantos'
    : 'Monitorar evolução do jogo';

  const comentario = preJogo
    ? 'Análise preditiva baseada em forma recente e projeções do modelo.'
    : 'Padrões ao vivo indicam possível valor para o favorito com base na pressão ofensiva.';

  return {
    valorEsperado,
    confianca,
    comentario,
    sugestaoMercado,
  };
};

export type AnaliseIAResultado = ReturnType<typeof gerarAnaliseIA>;
