import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Calculator } from 'lucide-react';

const simuladorSchema = z.object({
  periodo: z.number().min(1, 'Período deve ser maior que 0'),
  stake: z.number().min(1, 'Stake deve ser maior que 0'),
  apostaspormes: z.number().min(1, 'Número de apostas deve ser maior que 0'),
  margemerro: z.number().min(0, 'Margem de erro deve ser maior ou igual a 0').max(100, 'Margem de erro deve ser menor que 100'),
});

type SimuladorFormData = z.infer<typeof simuladorSchema>;

interface SimuladorLucroProps {
  aproveitamento: number;
  oddMedia: number;
}

const SimuladorLucro: React.FC<SimuladorLucroProps> = ({ aproveitamento, oddMedia }) => {
  const {
    register,
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

  const watchedValues = watch();

  const calcularLucroEstimado = (data: SimuladorFormData) => {
    const quantidadeApostas = data.apostaspormes * data.periodo;
    const aproveitamentoDecimal = aproveitamento / 100;
    const lucroBase = quantidadeApostas * aproveitamentoDecimal * data.stake * (oddMedia - 1);
    
    // Cálculo do desvio padrão (simplificado)
    const margemErroDecimal = data.margemerro / 100;
    const desvioMinimo = lucroBase * (1 - margemErroDecimal);
    const desvioMaximo = lucroBase * (1 + margemErroDecimal);

    return {
      lucroBase,
      desvioMinimo,
      desvioMaximo,
    };
  };

  const gerarDadosGrafico = (data: SimuladorFormData) => {
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

  const resultados = calcularLucroEstimado(watchedValues);
  const dadosGrafico = gerarDadosGrafico(watchedValues);

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm dark:bg-gray-900">
      <div className="flex items-center space-x-2 mb-6">
        <Calculator className="w-6 h-6 text-blue-600" />
        <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
          Simulador de Lucro
        </h3>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <form className="space-y-4">
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
          </form>

          <div className="mt-6 p-4 bg-gray-50 rounded-lg dark:bg-gray-800">
            <h4 className="text-lg font-medium text-gray-800 dark:text-white mb-4">
              Resultados Estimados
            </h4>
            <div className="space-y-2">
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Aproveitamento: {aproveitamento.toFixed(1)}%
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Odd Média: {oddMedia.toFixed(2)}
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white">
                Lucro Estimado: {' '}
                <span className="text-green-600">
                  {new Intl.NumberFormat('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                  }).format(resultados.lucroBase)}
                </span>
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Variação possível: entre{' '}
                {new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                }).format(resultados.desvioMinimo)}{' '}
                e{' '}
                {new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                }).format(resultados.desvioMaximo)}
              </p>
            </div>
          </div>
        </div>

        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={dadosGrafico}>
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
        </div>
      </div>
    </div>
  );
};

export default SimuladorLucro;