export interface Aposta {
  id: string;
  metodo: string;
  stake: number;
  resultado: 'green' | 'red';
  data: string;
  odd?: number;
  observacoes?: string;
}

export interface Metodo {
  id: string;
  nome: string;
  descricao?: string;
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