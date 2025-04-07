'use client'; // Garantir que o código será executado no lado do cliente

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation'; // Importando useParams do next/navigation
import { supabase } from '../../../../lib/supabase'; // Ajuste o caminho conforme necessário
import Header from '../../../../components/Header';
import { successToast, errorToast } from '../../../../components/ToastNotifications'; // Funções de notificação
import { ToastContainer } from 'react-toastify'; // Container para renderizar os toasts

export default function EditPrateleiraPage() {
  const [prateleira, setPrateleira] = useState<any | null>(null);
  const [nome, setNome] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [userEmail, setUserEmail] = useState<string | null>(null); // Estado para o email do usuário
  const router = useRouter(); // Acesso ao router para redirecionamento
  const { id } = useParams(); // Usando useParams() para pegar o parâmetro da URL

  // Função assíncrona para carregar dados da prateleira
  useEffect(() => {
    // Recuperando o email do usuário
    const email = localStorage.getItem('user_email'); // Recuperando o email do usuário do localStorage
    setUserEmail(email); // Atualizando o estado com o email do usuário

    if (!id) return; // Se não tiver ID na URL, não faz nada

    const fetchPrateleira = async () => {
      const { data, error } = await supabase
        .from('prateleiras')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Erro ao carregar prateleira:', error.message);
      } else {
        setPrateleira(data);
        setNome(data.nome); // Preenche o campo de nome com o valor atual
      }

      setLoading(false);
    };

    fetchPrateleira();
  }, [id]);

  // Função para salvar a prateleira editada
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!nome) {
      alert('O nome da prateleira não pode estar vazio!');
      return;
    }

    try {
      const { error } = await supabase
        .from('prateleiras')
        .update({ nome })
        .eq('id', id);

      if (error) {
        console.error('Erro ao atualizar prateleira:', error.message);
        errorToast('Erro ao atualizar prateleira. Tente novamente.');
      } else {
        successToast('Prateleira atualizada com sucesso!');
        
        // Delay de 1 segundo antes de redirecionar
        setTimeout(() => {
          router.push('/prateleiras'); // Redireciona para a lista de prateleiras
        }, 1000);
      }
    } catch (error) {
      console.error('Erro ao atualizar prateleira:', error);
      errorToast('Erro ao atualizar prateleira. Tente novamente.');
    }
  };

  // Função para logout
  const onLogout = async (): Promise<void> => {
    try {
      await supabase.auth.signOut();
      console.log('Usuário deslogado');
      // Redirecionar o usuário para a página de login após o logout
      router.push('/login');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  if (loading) {
    return <div>Carregando...</div>;
  }

  if (!prateleira) {
    return <div>Prateleira não encontrada!</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Passa o email do usuário para o Header */}
      <Header userEmail={userEmail} onLogout={onLogout} />

      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold text-center mb-6">Editar Prateleira</h1>

        <form onSubmit={handleSave} className="max-w-lg mx-auto bg-white p-6 rounded-md shadow-md">
          <div className="mb-4">
            <label htmlFor="nome" className="block text-sm font-medium text-gray-700">
              Nome da Prateleira
            </label>
            <input
              type="text"
              id="nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className="mt-2 w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Digite o nome da prateleira"
            />
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => router.push('/prateleiras')}
              className="bg-gray-400 text-white px-4 py-2 rounded-md hover:bg-gray-500"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
            >
              Salvar
            </button>
          </div>
        </form>
      </div>

      {/* ToastContainer para renderizar as notificações */}
      <ToastContainer />
    </div>
  );
}
