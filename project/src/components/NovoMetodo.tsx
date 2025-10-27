import React, { useMemo, useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z, ZodType } from 'zod';
import { PlusCircle, Trash2 } from 'lucide-react';
import useBancaStore from '../store/bancaStore';
import { CampoCondicao, OperadorCondicao } from '../types';

const camposDisponiveis: { valor: CampoCondicao; label: string }[] = [
  { valor: 'minuto', label: 'Minuto de jogo' },
  { valor: 'placar_favorito', label: 'Saldo do favorito' },
  { valor: 'odd_favorito', label: 'Odd do favorito' },
  { valor: 'odd_underdog', label: 'Odd do azarão' },
  { valor: 'posse_favorito', label: 'Posse do favorito (%)' },
  { valor: 'finalizacoes_favorito', label: 'Finalizações do favorito' },
  { valor: 'escanteios_total', label: 'Escanteios totais' },
  { valor: 'gols_total', label: 'Gols totais' },
  { valor: 'liga', label: 'Liga/Campeonato' },
  { valor: 'status', label: 'Status do jogo' },
];

const operadoresDisponiveis: { valor: OperadorCondicao; label: string }[] = [
  { valor: 'maior', label: 'maior que' },
  { valor: 'maior_ou_igual', label: 'maior ou igual a' },
  { valor: 'menor', label: 'menor que' },
  { valor: 'menor_ou_igual', label: 'menor ou igual a' },
  { valor: 'igual', label: 'igual a' },
  { valor: 'diferente', label: 'diferente de' },
  { valor: 'entre', label: 'entre' },
  { valor: 'contem', label: 'contém' },
];

const condicaoSchema = z.object({
  campo: z.string() as ZodType<CampoCondicao>,
  operador: z.string() as ZodType<OperadorCondicao>,
  valor: z.string().min(1, 'Informe um valor'),
  valorSecundario: z.string().optional(),
  descricao: z.string().optional(),
});

const metodoSchema = z.object({
  nome: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
  descricao: z.string().optional(),
  tipo: z.enum(['ao-vivo', 'pre-live', 'hibrido']),
  mercadoPreferencial: z.string().optional(),
  sensibilidadeIA: z.coerce.number().min(0).max(100),
  minimoValorEsperado: z.coerce.number().min(-100).max(100),
  confiancaMinima: z.coerce.number().min(0).max(100),
  notificacoesAtivas: z.boolean().default(true),
  condicoes: z.array(condicaoSchema).min(1, 'Adicione pelo menos uma condição'),
  comentarioIA: z.string().optional(),
});

type MetodoFormData = z.infer<typeof metodoSchema>;

const NovoMetodo: React.FC = () => {
  const { adicionarMetodo } = useBancaStore();
  const [mensagem, setMensagem] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    watch,
    reset,
    formState: { errors },
  } = useForm<MetodoFormData>({
    resolver: zodResolver(metodoSchema),
    defaultValues: {
      tipo: 'ao-vivo',
      sensibilidadeIA: 60,
      minimoValorEsperado: 15,
      confiancaMinima: 55,
      notificacoesAtivas: true,
      condicoes: [
        {
          campo: 'minuto',
          operador: 'maior_ou_igual',
          valor: '20',
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    name: 'condicoes',
    control,
  });

  const operadorSelecionado = watch('condicoes');

  const onSubmit = (data: MetodoFormData) => {
    adicionarMetodo({
      nome: data.nome,
      descricao: data.descricao,
      tipo: data.tipo,
      notificacoesAtivas: data.notificacoesAtivas,
      mercadoPreferencial: data.mercadoPreferencial,
      condicoes: data.condicoes.map((condicao) => ({
        ...condicao,
        id: crypto.randomUUID(),
      })),
      parametrosIA: {
        sensibilidade: data.sensibilidadeIA / 100,
        minimoValorEsperado: data.minimoValorEsperado / 100,
        confiancaMinima: data.confiancaMinima / 100,
        comentario: data.comentarioIA,
      },
    });

    setMensagem('Estratégia salva com sucesso! Ela será usada nas análises automaticamente.');
    reset({
      nome: '',
      descricao: '',
      tipo: 'ao-vivo',
      mercadoPreferencial: '',
      sensibilidadeIA: 60,
      minimoValorEsperado: 15,
      confiancaMinima: 55,
      notificacoesAtivas: true,
      comentarioIA: '',
      condicoes: [
        {
          campo: 'minuto',
          operador: 'maior_ou_igual',
          valor: '20',
        },
      ],
    });
  };

  const mostrarValorSecundario = useMemo(() => {
    return operadorSelecionado?.map((condicao) => condicao.operador === 'entre');
  }, [operadorSelecionado]);

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-sm space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Nova estratégia personalizada</h2>
        <p className="text-gray-500">
          Defina as condições e parâmetros que a IA utilizará para identificar oportunidades de valor.
        </p>
      </div>

      {mensagem && (
        <div className="p-4 rounded-md bg-green-50 border border-green-200 text-green-800 text-sm">
          {mensagem}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nome da estratégia
            </label>
            <input
              type="text"
              {...register('nome')}
              className="w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500"
              placeholder="Ex: Virada do favorito"
            />
            {errors.nome && <p className="text-red-500 text-sm mt-1">{errors.nome.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de análise</label>
            <select
              {...register('tipo')}
              className="w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="ao-vivo">Ao vivo</option>
              <option value="pre-live">Pré-jogo</option>
              <option value="hibrido">Híbrido</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Descrição</label>
          <textarea
            {...register('descricao')}
            rows={3}
            className="w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500"
            placeholder="Explique rapidamente a lógica por trás da estratégia"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sensibilidade da IA (%)
            </label>
            <input
              type="number"
              min={0}
              max={100}
              {...register('sensibilidadeIA', { valueAsNumber: true })}
              className="w-full p-3 border rounded-md"
            />
            <p className="text-xs text-gray-500 mt-1">
              Quanto maior, mais peso o modelo dá à análise de IA.
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Valor esperado mínimo (%)
            </label>
            <input
              type="number"
              {...register('minimoValorEsperado', { valueAsNumber: true })}
              className="w-full p-3 border rounded-md"
            />
            <p className="text-xs text-gray-500 mt-1">
              Percentual mínimo para sinalizar oportunidade.
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Confiança mínima (%)</label>
            <input
              type="number"
              {...register('confiancaMinima', { valueAsNumber: true })}
              className="w-full p-3 border rounded-md"
            />
            <p className="text-xs text-gray-500 mt-1">
              Define o grau de convicção necessário da IA.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Mercado preferencial</label>
            <input
              type="text"
              {...register('mercadoPreferencial')}
              className="w-full p-3 border rounded-md"
              placeholder="Ex: Vitória favorita, Over 2.5, Ambas marcam"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Comentário para alertas (opcional)
            </label>
            <input
              type="text"
              {...register('comentarioIA')}
              className="w-full p-3 border rounded-md"
              placeholder="Mensagem adicional exibida nos alertas"
            />
          </div>
        </div>

        <div className="border rounded-lg p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-800">Condições da estratégia</h3>
            <button
              type="button"
              onClick={() =>
                append({ campo: 'minuto', operador: 'maior', valor: '0', valorSecundario: '' })
              }
              className="flex items-center space-x-2 text-blue-600 hover:text-blue-700"
            >
              <PlusCircle className="w-5 h-5" />
              <span>Adicionar condição</span>
            </button>
          </div>

          {errors.condicoes && (
            <p className="text-red-500 text-sm">{errors.condicoes.message as string}</p>
          )}

          <div className="space-y-4">
            {fields.map((field, index) => (
              <div key={field.id} className="grid grid-cols-1 md:grid-cols-6 gap-3 items-end">
                <div className="md:col-span-2">
                  <label className="text-sm text-gray-600">Campo</label>
                  <select
                    {...register(`condicoes.${index}.campo` as const)}
                    className="w-full p-3 border rounded-md"
                  >
                    {camposDisponiveis.map((campo) => (
                      <option key={campo.valor} value={campo.valor}>
                        {campo.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="text-sm text-gray-600">Operador</label>
                  <select
                    {...register(`condicoes.${index}.operador` as const)}
                    className="w-full p-3 border rounded-md"
                  >
                    {operadoresDisponiveis.map((operador) => (
                      <option key={operador.valor} value={operador.valor}>
                        {operador.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Valor</label>
                  <input
                    type="text"
                    {...register(`condicoes.${index}.valor` as const)}
                    className="w-full p-3 border rounded-md"
                  />
                </div>
                {mostrarValorSecundario?.[index] ? (
                  <div>
                    <label className="text-sm text-gray-600">Valor final</label>
                    <input
                      type="text"
                      {...register(`condicoes.${index}.valorSecundario` as const)}
                      className="w-full p-3 border rounded-md"
                    />
                  </div>
                ) : (
                  <div>
                    <label className="text-sm text-gray-600">Observação (opcional)</label>
                    <input
                      type="text"
                      {...register(`condicoes.${index}.descricao` as const)}
                      className="w-full p-3 border rounded-md"
                      placeholder="Ex: Aplicar apenas em finais de semana"
                    />
                  </div>
                )}
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => remove(index)}
                    className="p-2 text-red-500 hover:text-red-600"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <input
            type="checkbox"
            id="notificacoesAtivas"
            {...register('notificacoesAtivas')}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded"
          />
          <label htmlFor="notificacoesAtivas" className="text-sm text-gray-700">
            Desejo receber alertas automáticos quando a estratégia for atendida
          </label>
        </div>

        <button
          type="submit"
          className="w-full md:w-auto bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
        >
          Salvar estratégia
        </button>
      </form>
    </div>
  );
};

export default NovoMetodo;
