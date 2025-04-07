'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase'; // Supondo que você tenha configurado o Supabase dessa forma
import Header from '../../../components/Header';
import { useRouter } from 'next/navigation';
import { successToast, errorToast } from '../../../components/ToastNotifications'; // Importando as funções de toast
import { ToastContainer } from 'react-toastify'; // Importando o ToastContainer

export default function CriarPrateleiraPage() {
  const [prateleiraNome, setPrateleiraNome] = useState<string>(''); // Estado para o nome da nova prateleira
  const [loading, setLoading] = useState<boolean>(false); // Estado de carregamento enquanto a prateleira está sendo criada
  const [error, setError] = useState<string | null>(null); // Estado para erros
  const [userEmail, setUserEmail] = useState<string | null>(null); // Estado para o email do usuário

  const router = useRouter(); // Usando o hook useRouter para redirecionar após a criação da prateleira

  // Função para carregar o email do usuário ao montar o componente
  useEffect(() => {
    const email = localStorage.getItem('user_email'); // Recuperando o email do usuário do localStorage
    setUserEmail(email); // Atualizando o estado com o email do usuário
  }, []);

  // Função que lida com o envio do formulário
  const handleCreatePrateleira = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Inserir a nova prateleira no banco de dados
      const { error } = await supabase
        .from('prateleiras')
        .insert([{ nome: prateleiraNome }])
        .single(); // O `.single()` garante que apenas uma linha será inserida

      if (error) {
        setError(error.message);
        errorToast(`Erro: ${error.message}`); // Notificação de erro
        return;
      }

      // Se a criação for bem-sucedida, exibe a notificação de sucesso
      successToast('Prateleira criada com sucesso!');
      // Limpa o campo de nome da prateleira
      setPrateleiraNome('');
      // Redireciona para a página de prateleiras após sucesso
    } catch (error) {
      console.error('Erro ao criar prateleira:', error);
      setError('Erro ao criar prateleira. Tente novamente.');
      errorToast('Erro ao criar prateleira. Tente novamente.'); // Notificação de erro
    } finally {
      setLoading(false);
    }
  };

  // Função de logout
  const onLogout = async (): Promise<void> => {
    try {
      // Remover informações do usuário do localStorage
      localStorage.removeItem('supabase_jwt');
      localStorage.removeItem('user_email');
      await supabase.auth.signOut(); // Realizar logout no Supabase
      console.log('Usuário deslogado');
      router.push('/login'); // Redireciona para a página de login
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Passa o email do usuário para o Header */}
      <Header userEmail={userEmail} onLogout={onLogout} /> 

      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold text-center mb-6">Criar Nova Prateleira</h1>

        {/* Exibindo erros, se houver */}
        {error && <div className="mb-4 text-red-500">{error}</div>}

        {/* Formulário para criar prateleira */}
        <form onSubmit={handleCreatePrateleira} className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-lg">
          <div className="mb-4">
            <label htmlFor="nome" className="block text-sm font-semibold text-gray-700">
              Nome da Prateleira
            </label>
            <input
              type="text"
              id="nome"
              value={prateleiraNome}
              onChange={(e) => setPrateleiraNome(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Digite o nome da prateleira"
              required
            />
          </div>

          {/* Botão para enviar o formulário */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 text-white font-semibold rounded-md ${
              loading ? 'bg-gray-400' : 'bg-blue-500 hover:bg-blue-600'
            }`}
          >
            {loading ? 'Criando...' : 'Criar Prateleira'}
          </button>
        </form>
      </div>

      {/* ToastContainer para renderizar as notificações */}
      <ToastContainer />
    </div>
  );
}
