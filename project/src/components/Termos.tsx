import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Termos = () => {
  const navigate = useNavigate();

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center space-x-4 mb-6">
        <button
          onClick={() => navigate(-1)}
          className="text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Termos de Uso e Licença</h1>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm p-6 space-y-8">
        <section>
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">1. Termos de Uso</h2>
          <div className="space-y-4 text-gray-600 dark:text-gray-300">
            <p>
              Ao acessar e usar o BancaPro, você concorda com os seguintes termos:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>O BancaPro é uma ferramenta de gestão de apostas para uso pessoal.</li>
              <li>Você é responsável por manter suas credenciais de acesso seguras.</li>
              <li>O uso do aplicativo é por sua conta e risco.</li>
              <li>Não nos responsabilizamos por perdas financeiras.</li>
              <li>Você deve respeitar as leis locais sobre apostas.</li>
            </ul>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">2. Licença de Uso</h2>
          <div className="space-y-4 text-gray-600 dark:text-gray-300">
            <p>
              O BancaPro é distribuído sob a seguinte licença:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Uso pessoal e não comercial.</li>
              <li>Proibida a redistribuição do software.</li>
              <li>Proibida a modificação do código-fonte.</li>
              <li>Proibido o uso para fins ilegais.</li>
            </ul>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">3. Privacidade e Dados</h2>
          <div className="space-y-4 text-gray-600 dark:text-gray-300">
            <p>
              Sobre seus dados:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Seus dados são armazenados localmente no seu navegador.</li>
              <li>Não coletamos informações pessoais.</li>
              <li>Você pode exportar ou excluir seus dados a qualquer momento.</li>
              <li>Recomendamos fazer backup regular dos seus dados.</li>
            </ul>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">4. Limitação de Responsabilidade</h2>
          <div className="space-y-4 text-gray-600 dark:text-gray-300">
            <p>
              O BancaPro é fornecido "como está", sem garantias:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Não garantimos resultados específicos.</li>
              <li>Não nos responsabilizamos por decisões de apostas.</li>
              <li>O usuário é responsável por suas ações.</li>
              <li>Não garantimos disponibilidade contínua do serviço.</li>
            </ul>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">5. Atualizações dos Termos</h2>
          <div className="space-y-4 text-gray-600 dark:text-gray-300">
            <p>
              Podemos atualizar estes termos a qualquer momento:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Alterações serão comunicadas através do aplicativo.</li>
              <li>O uso continuado implica aceitação dos novos termos.</li>
              <li>Você pode parar de usar o serviço se não concordar.</li>
            </ul>
          </div>
        </section>

        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Última atualização: {new Date().toLocaleDateString()}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Termos;