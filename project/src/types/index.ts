export interface Aposta {
  id: string;
  metodo: string;
  stake: number;
  resultado: 'green' | 'red';
  data: string;
  odd?: number;
  observacoes?: string;
}

export type CampoCondicao =
  | 'minuto'
  | 'placar_favorito'
  | 'odd_favorito'
  | 'odd_underdog'
  | 'posse_favorito'
  | 'finalizacoes_favorito'
  | 'escanteios_total'
  | 'gols_total'
  | 'liga'
  | 'status';

export type OperadorCondicao =
  | 'maior'
  | 'maior_ou_igual'
  | 'menor'
  | 'menor_ou_igual'
  | 'igual'
  | 'diferente'
  | 'entre'
  | 'contem';

export interface CondicaoMetodo {
  id: string;
  campo: CampoCondicao;
  operador: OperadorCondicao;
  valor: string;
  valorSecundario?: string;
  descricao?: string;
}

export interface ParametrosIA {
  sensibilidade: number;
  minimoValorEsperado: number;
  confiancaMinima: number;
  comentario?: string;
}

export interface Metodo {
  id: string;
  nome: string;
  descricao?: string;
  tipo: 'ao-vivo' | 'pre-live' | 'hibrido';
  notificacoesAtivas: boolean;
  mercadoPreferencial?: string;
  condicoes: CondicaoMetodo[];
  parametrosIA: ParametrosIA;
  apostas: Aposta[];
  ativo: boolean;
}

export interface Banca {
  saldoAtual: number;
  historicoSaldo: {
    data: string;
    valor: number;
    tipo: 'deposito' | 'saque' | 'aposta';
    resultado?: 'green' | 'red';
  }[];
}

export interface Configuracoes {
  tema: 'claro' | 'escuro';
  stakepadrao: number;
  metalucro: number;
  notificacoes: boolean;
  idioma: 'pt-BR';
  porcentagembanca: number;
}

export type StatusPartida = 'ao-vivo' | 'pre-live' | 'encerrada';

export interface EquipesPartida {
  casa: string;
  fora: string;
  favorito: 'casa' | 'fora';
}

export interface PlacarPartida {
  casa: number;
  fora: number;
}

export interface EstatisticasPartida {
  posseFavorito: number;
  finalizacoesFavorito: number;
  finalizacoesContra: number;
  escanteiosTotal: number;
  ataquesPerigososFavorito: number;
}

export interface LinhaOdd {
  mercado:
    | 'vitoria_casa'
    | 'vitoria_fora'
    | 'empate'
    | 'over_2_5'
    | 'under_2_5';
  odd: number;
}

export interface OddsCasa {
  casa: string;
  linhas: LinhaOdd[];
  atualizadaEm: string;
}

export interface AnaliseIA {
  valorEsperado: number;
  confianca: number;
  comentario: string;
  sugestaoMercado?: string;
}

export interface ResultadoMetodoPartida {
  metodoId: string;
  nomeMetodo: string;
  atende: boolean;
  condicoesAtendidas: number;
  totalCondicoes: number;
  valorEsperadoAjustado: number;
  confiancaAjustada: number;
  comentario?: string;
}

export interface PartidaAnalise {
  id: string;
  campeonato: string;
  pais: string;
  status: StatusPartida;
  inicio: string;
  minuto?: number;
  equipes: EquipesPartida;
  placar: PlacarPartida;
  odds: OddsCasa[];
  estatisticas: EstatisticasPartida;
  analiseIA: AnaliseIA;
  resultadosMetodos?: ResultadoMetodoPartida[];
}

export interface AlertaAnalise {
  id: string;
  partidaId: string;
  metodoId: string;
  mensagem: string;
  horario: string;
  melhorOdd?: { casa: string; odd: number; mercado: string };
}