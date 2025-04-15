import React, { useState } from 'react';
import { TrendingUp, TrendingDown, Star, ArrowUpRight, Calculator } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import useBancaStore from '../store/bancaStore';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, LineChart, Line, XAxis, YAxis, CartesianGrid } from 'recharts';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const simuladorSchema = z.object({
  metodoId: z.string().min(1, 'Selecione um método'),
  periodo: z.number().min(1, 'Período deve ser maior que 0'),
  stake: z.number().min(1, 'Stake deve ser maior que 0'),
  apostaspormes: z.number().min(1, 'Número de apostas deve ser maior que 0'),
  margemerro: z.number().min(0, 'Margem de erro deve ser maior ou igual a 0').max(100, 'Margem de erro deve ser menor que 100'),
});

type SimuladorFormData = z.infer<typeof simuladorSchema>;

const Dashboard = () => {
  const navigate = useNavigate();
  const { banca, apostas, metodos, configuracoes, atualizarConfiguracoes } = useBancaStore();
  const [simulacaoResultado, setSimulacaoResultado] = useState<any>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<SimuladorFormData>({
    resolver: zodResolver(simuladorSchema),
    defaultValues: {
      periodo: 6,
      stake: 100,
      apostaspormes: 30,
      margemerro: 10,
    },
  });

  // Cálculos para o dashboard
  const lucroHoje = apostas
    .filter(
      (aposta) =>
        format(new Date(aposta.data), 'yyyy-MM-dd') ===
        format(new Date(), 'yyyy-MM-dd')
    )
    .reduce((acc, aposta) => {
      const valor = aposta.resultado === 'green' 
        ? aposta.stake * (aposta.odd || 1) - aposta.stake 
        : -aposta.stake;
      return acc + valor;
    }, 0);

  const totalApostas = apostas.length;
  const apostasGanhas = apostas.filter((a) => a.resultado === 'green').length;
  const taxaAcerto = totalApostas > 0 ? (apostasGanhas / totalApostas) * 100 : 0;

  // Cálculo do ROI mensal
  const apostasDoMes = apostas.filter(
    (aposta) =>
      format(new Date(aposta.data), 'yyyy-MM') ===
      format(new Date(), 'yyyy-MM')
  );

  const investimentoTotal = apostasDoMes.reduce(
    (acc, aposta) => acc + aposta.stake,
    0
  );

  const retornoTotal = apostasDoMes.reduce((acc, aposta) => {
    const valor = aposta.resultado === 'green' 
      ? aposta.stake * (aposta.odd || 1) - aposta.stake 
      : -aposta.stake;
    return acc + valor;
  }, 0);

  const roiMensal =
    investimentoTotal > 0 ? (retornoTotal / investimentoTotal) * 100 : 0;

  // Encontrar o melhor método da semana
  const calcularLucroMetodo = (metodoId: string) => {
    return apostas
      .filter((a) => a.metodo === metodoId)
      .reduce((acc, aposta) => {
        const valor =
          aposta.resultado === 'green'
            ? aposta.stake * (aposta.odd || 1) - aposta.stake
            : -aposta.stake;
        return acc + valor;
      }, 0);
  };

  const metodosComLucro = metodos.map((metodo) => ({
    ...metodo,
    lucro: calcularLucroMetodo(metodo.id),
  }));

  const melhorMetodo = metodosComLucro.length > 0
    ? metodosComLucro.reduce((prev, current) =>
        prev.lucro > current.lucro ? prev : current
      )
    : null;

  // Dados para o gráfico de pizza
  const dadosGrafico = metodosComLucro
    .filter((m) => m.lucro !== 0)
    .map((metodo) => ({
      name: metodo.nome,
      value: Math.abs(metodo.lucro),
      lucro: metodo.lucro,
    }));

  const CORES = ['#2563eb', '#16a34a', '#dc2626', '#9333ea', '#ea580c'];

  // Cálculo do valor da stake baseado na porcentagem da banca
  const valorStake = (banca.saldoAtual * configuracoes.porcentagembanca) / 100;

  const handlePorcentagemChange = (valor: number) => {
    atualizarConfiguracoes({
      ...configuracoes,
      porcentagembanca: valor
    });
  };

  // Funções do Simulador
  const calcularAproveitamentoMetodo = (metodoId: string) => {
    const apostasDoMetodo = apostas.filter(a => a.metodo === metodoId);
    const totalApostasMetodo = apostasDoMetodo.length;
    const apostasGanhasMetodo = apostasDoMetodo.filter(a => a.resultado === 'green').length;
    return totalApostasMetodo > 0 ? (apostasGanhasMetodo / totalApostasMetodo) * 100 : 0;
  };

  const calcularOddMediaMetodo = (metodoId: string) => {
    const apostasDoMetodo = apostas.filter(a => a.metodo === metodoId);
    return apostasDoMetodo.reduce((acc, aposta) => acc + (aposta.odd || 1), 0) / 
      (apostasDoMetodo.length || 1);
  };

  const watchedValues = watch();

  const calcularLucroEstimado = (data: SimuladorFormData) => {
    const aproveitamento = calcularAproveitamentoMetodo(data.metodoId);
    const oddMedia = calcularOddMediaMetodo(data.metodoId);
    const quantidadeApostas = data.apostaspormes * data.periodo;
    const aproveitamentoDecimal = aproveitamento / 100;
    const lucroBase = quantidadeApostas * aproveitamentoDecimal * data.stake * (oddMedia - 1);
    
    const margemErroDecimal = data.margemerro / 100;
    const desvioMinimo = lucroBase * (1 - margemErroDecimal);
    const desvioMaximo = lucroBase * (1 + margemErroDecimal);

    return {
      lucroBase,
      desvioMinimo,
      desvioMaximo,
      aproveitamento,
      oddMedia,
    };
  };

  const gerarDadosGraficoSimulacao = (data: SimuladorFormData) => {
    const { lucroBase, desvioMinimo, desvioMaximo } = calcularLucroEstimado(data);
    const lucroMensal = lucroBase / data.periodo;
    const desvioMinimoMensal = desvioMinimo / data.periodo;
    const desvioMaximoMensal = desvioMaximo / data.periodo;

    return Array.from({ length: data.periodo + 1 }, (_, i) => ({
      mes: i,
      lucro: i * lucroMensal,
      minimo: i * desvioMinimoMensal,
      maximo: i * desvioMaximoMensal,
    }));
  };

  const onSubmitSimulador = (data: SimuladorFormData) => {
    const resultados = calcularLucroEstimado(data);
    const dadosGrafico = gerarDadosGraficoSimulacao(data);
    setSimulacaoResultado({ ...resultados, dadosGrafico });
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Dashboard</h2>
      
      {/* Cards principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="col-span-1 md:col-span-2 bg-white dark:bg-gray-900 p-6 rounded-lg shadow-sm">
          <div className="flex flex-col space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Saldo da Banca</h3>
              <span className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-xs px-2.5 py-0.5 rounded-full">
                Atual
              </span>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL',
              }).format(banca.saldoAtual)}
            </p>
            <div className="flex items-center space-x-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                  Porcentagem da Banca (%)
                </label>
                <input
                  type="number"
                  value={configuracoes.porcentagembanca}
                  onChange={(e) => handlePorcentagemChange(Number(e.target.value))}
                  className="w-full p-2 border rounded-md dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                  min="0"
                  max="100"
                  step="0.1"
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                  Valor da Stake
                </label>
                <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded-md">
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                    }).format(valorStake)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Lucro do Dia</h3>
            {lucroHoje >= 0 ? (
              <TrendingUp className="w-5 h-5 text-green-500" />
            ) : (
              <TrendingDown className="w-5 h-5 text-red-500" />
            )}
          </div>
          <p
            className={`text-2xl font-bold ${
              lucroHoje >= 0 ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {new Intl.NumberFormat('pt-BR', {
              style: 'currency',
              currency: 'BRL',
              signDisplay: 'always',
            }).format(lucroHoje)}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Taxa de Acerto</h3>
            <Star className="w-5 h-5 text-yellow-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {taxaAcerto.toFixed(1)}%
          </p>
        </div>
      </div>

      {/* Simulador de Lucro */}
      <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-sm mb-8">
        <div className="flex items-center space-x-2 mb-6">
          <Calculator className="w-6 h-6 text-blue-600" />
          <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
            Simulador de Lucro
          </h3>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <form onSubmit={handleSubmit(onSubmitSimulador)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Método
                </label>
                <select
                  {...register('metodoId')}
                  className="w-full p-2 border rounded-md dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                >
                  <option value="">Selecione um método</option>
                  {metodos.map((metodo) => (
                    <option key={metodo.id} value={metodo.id}>
                      {metodo.nome}
                    </option>
                  ))}
                </select>
                {errors.metodoId && (
                  <p className="text-red-500 text-sm mt-1">{errors.metodoId.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Período (meses)
                </label>
                <input
                  type="number"
                  {...register('periodo', { valueAsNumber: true })}
                  className="w-full p-2 border rounded-md dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                />
                {errors.periodo && (
                  <p className="text-red-500 text-sm mt-1">{errors.periodo.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Stake por aposta (R$)
                </label>
                <input
                  type="number"
                  step="0.01"
                  {...register('stake', { valueAsNumber: true })}
                  className="w-full p-2 border rounded-md dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                />
                {errors.stake && (
                  <p className="text-red-500 text-sm mt-1">{errors.stake.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Apostas por mês
                </label>
                <input
                  type="number"
                  {...register('apostaspormes', { valueAsNumber: true })}
                  className="w-full p-2 border rounded-md dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                />
                {errors.apostaspormes && (
                  <p className="text-red-500 text-sm mt-1">{errors.apostaspormes.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Margem de erro (%)
                </label>
                <input
                  type="number"
                  {...register('margemerro', { valueAsNumber: true })}
                  className="w-full p-2 border rounded-md dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                />
                {errors.margemerro && (
                  <p className="text-red-500 text-sm mt-1">{errors.margemerro.message}</p>
                )}
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
              >
                Calcular Simulação
              </button>
            </form>

            {simulacaoResultado && (
              <div className="mt-6 p-4 bg-gray-50 rounded-lg dark:bg-gray-800">
                <h4 className="text-lg font-medium text-gray-800 dark:text-white mb-4">
                  Resultados Estimados
                </h4>
                <div className="space-y-2">
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Aproveitamento: {simulacaoResultado.aproveitamento.toFixed(1)}%
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Odd Média: {simulacaoResultado.oddMedia.toFixed(2)}
                  </p>
                  <p className="text-sm font-medium text-gray-800 dark:text-white">
                    Lucro Estimado: {' '}
                    <span className="text-green-600">
                      {new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                      }).format(simulacaoResultado.lucroBase)}
                    </span>
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Variação possível: entre{' '}
                    {new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                    }).format(simulacaoResultado.desvioMinimo)}{' '}
                    e{' '}
                    {new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                    }).format(simulacaoResultado.desvioMaximo)}
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="h-[400px]">
            {simulacaoResultado && (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={simulacaoResultado.dadosGrafico}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="mes" 
                    label={{ 
                      value: 'Meses', 
                      position: 'insideBottom', 
                      offset: -5 
                    }} 
                  />
                  <YAxis
                    label={{
                      value: 'Lucro (R$)',
                      angle: -90,
                      position: 'insideLeft',
                    }}
                  />
                  <Tooltip
                    formatter={(value) =>
                      new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                      }).format(Number(value))
                    }
                  />
                  <Line
                    type="monotone"
                    dataKey="maximo"
                    stroke="#16a34a"
                    strokeDasharray="3 3"
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="lucro"
                    stroke="#2563eb"
                    strokeWidth={2}
                  />
                  <Line
                    type="monotone"
                    dataKey="minimo"
                    stroke="#dc2626"
                    strokeDasharray="3 3"
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Melhor Método da Semana */}
        <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
            Melhor Método da Semana
          </h3>
          {melhorMetodo ? (
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  {melhorMetodo.nome}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Lucro: {new Intl.NumberFormat('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                  }).format(melhorMetodo.lucro)}
                </p>
              </div>
              <button
                onClick={() => navigate(`/metodos/${melhorMetodo.id}`)}
                className="flex items-center text-blue-600 hover:text-blue-700"
              >
                Ver detalhes
                <ArrowUpRight className="w-4 h-4 ml-1" />
              </button>
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400">Nenhum método cadastrado ainda</p>
          )}
        </div>

        {/* Gráfico de Distribuição de Lucro por Método */}
        <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
            Distribuição de Lucro por Método
          </h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={dadosGrafico}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={({
                    cx,
                    cy,
                    midAngle,
                    innerRadius,
                    outerRadius,
                    value,
                    index,
                  }) => {
                    const RADIAN = Math.PI / 180;
                    const radius = 25 + innerRadius + (outerRadius - innerRadius);
                    const x = cx + radius * Math.cos(-midAngle * RADIAN);
                    const y = cy + radius * Math.sin(-midAngle * RADIAN);

                    return (
                      <text
                        x={x}
                        y={y}
                        fill="#374151"
                        textAnchor={x > cx ? 'start' : 'end'}
                        dominantBaseline="central"
                      >
                        {dadosGrafico[index].name}{' '}
                        ({((value / dadosGrafico.reduce((acc, curr) => acc + curr.value, 0)) * 100).toFixed(0)}%)
                      </text>
                    );
                  }}
                >
                  {dadosGrafico.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={CORES[index % CORES.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value, name, props) => [
                    new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                    }).format(props.payload.lucro),
                    name,
                  ]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Ações Rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <button
          onClick={() => navigate('/nova-aposta')}
          className="bg-blue-600 text-white p-4 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Nova Aposta
        </button>
        <button
          onClick={() => navigate('/novo-metodo')}
          className="bg-gray-800 text-white p-4 rounded-lg hover:bg-gray-900 transition-colors dark:bg-gray-700 dark:hover:bg-gray-600"
        >
          Novo Método
        </button>
        <button
          onClick={() => navigate('/estatisticas')}
          className="bg-green-600 text-white p-4 rounded-lg hover:bg-green-700 transition-colors"
        >
          Ver Estatísticas
        </button>
      </div>
    </div>
  );
};

export default Dashboard;