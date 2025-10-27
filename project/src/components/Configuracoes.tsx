import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import useBancaStore from '../store/bancaStore';
import useAuthStore from '../store/authStore';
import { format } from 'date-fns';

const configuracoesSchema = z.object({
  tema: z.enum(['claro', 'escuro']),
  stakepadrao: z.number().min(0, 'Stake padrão deve ser maior ou igual a 0'),
  metalucro: z.number().min(0, 'Meta de lucro deve ser maior ou igual a 0'),
  notificacoes: z.boolean(),
  idioma: z.enum(['pt-BR']),
});

const credenciaisSchema = z.object({
  username: z.string().min(3, 'O usuário deve ter pelo menos 3 caracteres'),
  password: z.string().min(4, 'A senha deve ter pelo menos 4 caracteres'),
  confirmarPassword: z.string(),
}).refine((data) => data.password === data.confirmarPassword, {
  message: "As senhas não coincidem",
  path: ["confirmarPassword"],
});

type ConfiguracoesFormData = z.infer<typeof configuracoesSchema>;
type CredenciaisFormData = z.infer<typeof credenciaisSchema>;

const Configuracoes = () => {
  const { configuracoes, atualizarConfiguracoes, apostas, metodos } = useBancaStore();
  const { setCredentials } = useAuthStore();
  
  const {
    register: registerConfig,
    handleSubmit: handleSubmitConfig,
    formState: { errors: errorsConfig },
  } = useForm<ConfiguracoesFormData>({
    resolver: zodResolver(configuracoesSchema),
    defaultValues: configuracoes,
  });

  const {
    register: registerCredenciais,
    handleSubmit: handleSubmitCredenciais,
    formState: { errors: errorsCredenciais },
    reset: resetCredenciais,
  } = useForm<CredenciaisFormData>({
    resolver: zodResolver(credenciaisSchema),
  });

  const onSubmitConfig = (data: ConfiguracoesFormData) => {
    atualizarConfiguracoes(data);
  };

  const onSubmitCredenciais = (data: CredenciaisFormData) => {
    setCredentials(data.username, data.password);
    resetCredenciais();
    alert('Credenciais atualizadas com sucesso!');
  };

  const exportarPDF = () => {
    const doc = new jsPDF();
    
    // Título
    doc.setFontSize(20);
    doc.text('Relatório de Apostas', 14, 20);
    
    // Resumo
    doc.setFontSize(14);
    doc.text('Resumo Geral', 14, 30);
    
    const totalApostas = apostas.length;
    const apostasGanhas = apostas.filter(a => a.resultado === 'green').length;
    const taxaAcerto = totalApostas > 0 ? (apostasGanhas / totalApostas * 100).toFixed(1) : '0';
    
    doc.setFontSize(12);
    doc.text(`Total de Apostas: ${totalApostas}`, 14, 40);
    doc.text(`Apostas Ganhas: ${apostasGanhas}`, 14, 47);
    doc.text(`Taxa de Acerto: ${taxaAcerto}%`, 14, 54);
    
    // Tabela de apostas
    type TabelaAposta = [string, string, string, string, string];
    const tableData: TabelaAposta[] = apostas.map((aposta) => {
      const metodo = metodos.find(m => m.id === aposta.metodo);
      return [
        format(new Date(aposta.data), 'dd/MM/yyyy'),
        metodo?.nome || 'N/A',
        aposta.stake.toFixed(2),
        aposta.odd?.toFixed(2) || 'N/A',
        aposta.resultado === 'green' ? 'Ganhou' : 'Perdeu'
      ];
    });

    autoTable(doc, {
      startY: 65,
      head: [['Data', 'Método', 'Stake', 'Odd', 'Resultado']],
      body: tableData,
      theme: 'striped',
      headStyles: { fillColor: [37, 99, 235] },
    });
    
    doc.save(`relatorio-apostas-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-sm">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Configurações</h2>

        <form onSubmit={handleSubmitConfig(onSubmitConfig)} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Tema
            </label>
            <select {...registerConfig('tema')} className="w-full p-2 border rounded-md dark:bg-gray-800 dark:border-gray-700 dark:text-white">
              <option value="claro">Claro</option>
              <option value="escuro">Escuro</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Stake Padrão (R$)
            </label>
            <input
              type="number"
              step="0.01"
              {...registerConfig('stakepadrao', { valueAsNumber: true })}
              className="w-full p-2 border rounded-md dark:bg-gray-800 dark:border-gray-700 dark:text-white"
            />
            {errorsConfig.stakepadrao && (
              <p className="text-red-500 text-sm mt-1">
                {errorsConfig.stakepadrao.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Meta de Lucro Mensal (R$)
            </label>
            <input
              type="number"
              step="0.01"
              {...registerConfig('metalucro', { valueAsNumber: true })}
              className="w-full p-2 border rounded-md dark:bg-gray-800 dark:border-gray-700 dark:text-white"
            />
            {errorsConfig.metalucro && (
              <p className="text-red-500 text-sm mt-1">
                {errorsConfig.metalucro.message}
              </p>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              {...registerConfig('notificacoes')}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 dark:border-gray-600"
            />
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Ativar notificações
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Idioma
            </label>
            <select
              {...registerConfig('idioma')}
              className="w-full p-2 border rounded-md dark:bg-gray-800 dark:border-gray-700 dark:text-white"
              disabled
            >
              <option value="pt-BR">Português (Brasil)</option>
            </select>
          </div>

          <div className="pt-6 border-t dark:border-gray-700">
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
            >
              Salvar Configurações
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-sm">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Alterar Credenciais</h2>
        
        <form onSubmit={handleSubmitCredenciais(onSubmitCredenciais)} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Novo Usuário
            </label>
            <input
              type="text"
              {...registerCredenciais('username')}
              className="w-full p-2 border rounded-md dark:bg-gray-800 dark:border-gray-700 dark:text-white"
            />
            {errorsCredenciais.username && (
              <p className="text-red-500 text-sm mt-1">
                {errorsCredenciais.username.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Nova Senha
            </label>
            <input
              type="password"
              {...registerCredenciais('password')}
              className="w-full p-2 border rounded-md dark:bg-gray-800 dark:border-gray-700 dark:text-white"
            />
            {errorsCredenciais.password && (
              <p className="text-red-500 text-sm mt-1">
                {errorsCredenciais.password.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Confirmar Nova Senha
            </label>
            <input
              type="password"
              {...registerCredenciais('confirmarPassword')}
              className="w-full p-2 border rounded-md dark:bg-gray-800 dark:border-gray-700 dark:text-white"
            />
            {errorsCredenciais.confirmarPassword && (
              <p className="text-red-500 text-sm mt-1">
                {errorsCredenciais.confirmarPassword.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors"
          >
            Atualizar Credenciais
          </button>
        </form>
      </div>

      <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-sm">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
          Backup e Exportação
        </h3>
        <div className="space-y-4">
          <button
            onClick={exportarPDF}
            className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors"
          >
            Exportar Relatório PDF
          </button>

          <button
            onClick={() => {
              const dados = localStorage.getItem('banca-storage');
              const blob = new Blob([dados || ''], { type: 'application/json' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `backup-banca-${format(
                new Date(),
                'yyyy-MM-dd'
              )}.json`;
              a.click();
              URL.revokeObjectURL(url);
            }}
            className="w-full bg-gray-800 text-white py-2 px-4 rounded-md hover:bg-gray-900 transition-colors dark:bg-gray-700 dark:hover:bg-gray-600"
          >
            Exportar Dados JSON
          </button>

          <div className="relative">
            <input
              type="file"
              accept=".json"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onload = (evento) => {
                    try {
                      const dados = JSON.parse(evento.target?.result as string);
                      localStorage.setItem('banca-storage', JSON.stringify(dados));
                      window.location.reload();
                    } catch (err) {
                      console.error('Erro ao importar dados', err);
                      alert('Erro ao importar dados');
                    }
                  };
                  reader.readAsText(file);
                }
              }}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <button className="w-full bg-gray-100 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-200 transition-colors dark:bg-gray-600 dark:text-white dark:hover:bg-gray-500">
              Importar Dados
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Configuracoes;