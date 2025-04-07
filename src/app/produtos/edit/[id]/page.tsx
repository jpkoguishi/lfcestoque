'use client'; // Garantir que o código será executado no lado do cliente

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation'; // Importando useParams do next/navigation
import { supabase } from '../../../../lib/supabase'; // Ajuste o caminho conforme necessário
import Header from '../../../../components/Header';
import { successToast, errorToast } from '../../../../components/ToastNotifications'; // Funções de notificação
import { ToastContainer } from 'react-toastify'; // Container para renderizar os toasts

export default function EditProdutoPage() {
  const [produto, setProduto] = useState<any | null>(null);
  const [nome, setNome] = useState<string>('');
  const [codBarras, setcodBarras] = useState<string>(''); 
  const [SKU, setSKU] = useState<string>(''); 
  const [loading, setLoading] = useState<boolean>(true);
  const [userEmail, setUserEmail] = useState<string | null>(null); // Estado para o email do usuário
  const router = useRouter(); // Acesso ao router para redirecionamento
  const { id } = useParams(); // Usando useParams() para pegar o parâmetro da URL

  // Função assíncrona para carregar dados do produto
  useEffect(() => {
    // Recuperando o email do usuário
    const email = localStorage.getItem('user_email'); // Recuperando o email do usuário do localStorage
    setUserEmail(email); // Atualizando o estado com o email do usuário

    if (!id) return; // Se não tiver ID na URL, não faz nada

    const fetchProduto = async () => {
      const { data, error } = await supabase
        .from('produtos')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Erro ao carregar produto:', error.message);
      } else {
        setProduto(data);
        setNome(data.nome); // Preenche o campo de nome com o valor atual
        setcodBarras(data.codBarras); // Preenche o código de barras
        setSKU(data.SKU); // Preenche o SKU
      }

      setLoading(false);
    };

    fetchProduto();
  }, [id]);

  // Função para salvar o produto editado
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!nome || !codBarras || !SKU) {
      alert('Todos os campos devem ser preenchidos!');
      return;
    }

    try {
      const { error } = await supabase
        .from('produtos')
        .update({ nome, codBarras, SKU })
        .eq('id', id);

      if (error) {
        console.error('Erro ao atualizar produto:', error.message);
        errorToast('Erro ao atualizar produto. Tente novamente.');
      } else {
        successToast('Produto atualizado com sucesso!');
        
        // Delay de 1 segundo antes de redirecionar
        setTimeout(() => {
          router.push('/produtos'); // Redireciona para a lista de produtos
        }, 1000);
      }
    } catch (error) {
      console.error('Erro ao atualizar produto:', error);
      errorToast('Erro ao atualizar produto. Tente novamente.');
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

  if (!produto) {
    return <div>Produto não encontrado!</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Passa o email do usuário para o Header */}
      <Header userEmail={userEmail} onLogout={onLogout} />

      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold text-center mb-6">Editar Produto</h1>

        <form onSubmit={handleSave} className="max-w-lg mx-auto bg-white p-6 rounded-md shadow-md">
          <div className="mb-4">
            <label htmlFor="nome" className="block text-sm font-medium text-gray-700">
              Nome do Produto
            </label>
            <input
              type="text"
              id="nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className="mt-2 w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Digite o nome do produto"
            />
          </div>

          <div className="mb-4">
            <label htmlFor="codBarras" className="block text-sm font-medium text-gray-700">
              Código de Barras
            </label>
            <input
              type="text"
              id="codBarras"
              value={codBarras}
              onChange={(e) => setcodBarras(e.target.value)}
              className="mt-2 w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Digite o código de barras"
            />
          </div>

          <div className="mb-4">
            <label htmlFor="SKU" className="block text-sm font-medium text-gray-700">
              SKU
            </label>
            <input
              type="text"
              id="SKU"
              value={SKU}
              onChange={(e) => setSKU(e.target.value)}
              className="mt-2 w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Digite o SKU"
            />
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => router.push('/produtos')}
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
