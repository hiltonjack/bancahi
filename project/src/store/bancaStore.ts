import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Banca, Metodo, Aposta, Configuracoes } from '../types';

interface BancaState {
  banca: Banca;
  metodos: Metodo[];
  apostas: Aposta[];
  configuracoes: Configuracoes;
  adicionarMetodo: (metodo: Omit<Metodo, 'id' | 'apostas'>) => void;
  removerMetodo: (id: string) => void;
  toggleMetodoAtivo: (id: string) => void;
  adicionarAposta: (aposta: Omit<Aposta, 'id'>) => void;
  atualizarSaldoBanca: (valor: number, tipo: 'deposito' | 'saque' | 'aposta', resultado?: 'green' | 'red') => void;
  atualizarConfiguracoes: (novasConfiguracoes: Configuracoes) => void;
  limparHistorico: (incluirSaldo: boolean) => void;
}

const useBancaStore = create<BancaState>()(
  persist(
    (set) => ({
      banca: {
        saldoAtual: 0,
        historicoSaldo: [],
      },
      metodos: [],
      apostas: [],
      configuracoes: {
        tema: 'claro',
        stakepadrao: 10,
        metalucro: 1000,
        notificacoes: true,
        idioma: 'pt-BR',
        porcentagembanca: 10,
      },
      adicionarMetodo: (novoMetodo) => {
        set((state) => ({
          metodos: [
            ...state.metodos,
            {
              ...novoMetodo,
              id: crypto.randomUUID(),
              apostas: [],
              ativo: true,
            },
          ],
        }));
      },
      removerMetodo: (id) => {
        set((state) => ({
          metodos: state.metodos.filter((m) => m.id !== id),
        }));
      },
      toggleMetodoAtivo: (id) => {
        set((state) => ({
          metodos: state.metodos.map((m) =>
            m.id === id ? { ...m, ativo: !m.ativo } : m
          ),
        }));
      },
      adicionarAposta: (novaAposta) => {
        set((state) => ({
          apostas: [
            ...state.apostas,
            {
              ...novaAposta,
              id: crypto.randomUUID(),
            },
          ],
        }));
      },
      atualizarSaldoBanca: (valor, tipo, resultado) => {
        set((state) => {
          let novoSaldo = state.banca.saldoAtual;
          
          if (tipo === 'deposito') {
            novoSaldo += valor;
          } else if (tipo === 'saque') {
            novoSaldo -= valor;
          } else if (tipo === 'aposta') {
            if (resultado === 'green') {
              novoSaldo += valor;
            } else if (resultado === 'red') {
              novoSaldo -= valor;
            }
          }

          return {
            banca: {
              saldoAtual: novoSaldo,
              historicoSaldo: [
                ...state.banca.historicoSaldo,
                {
                  data: new Date().toISOString(),
                  valor,
                  tipo,
                  resultado,
                },
              ],
            },
          };
        });
      },
      atualizarConfiguracoes: (novasConfiguracoes) => {
        set({ configuracoes: novasConfiguracoes });
      },
      limparHistorico: (incluirSaldo) => {
        set((state) => ({
          banca: {
            saldoAtual: incluirSaldo ? 0 : state.banca.saldoAtual,
            historicoSaldo: [],
          },
          apostas: [],
        }));
      },
    }),
    {
      name: 'banca-storage',
    }
  )
);

export default useBancaStore;