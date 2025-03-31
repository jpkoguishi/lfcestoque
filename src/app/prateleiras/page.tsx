'use client';

import { useState, useEffect } from 'react';
import Header from '../../components/Header';
import { supabase } from '../../lib/supabase'; // Supondo que você tenha configurado o Supabase dessa forma
import { useRouter } from 'next/navigation';

export default function PrateleirasPage() {
  const [userEmail, setUserEmail] = useState<string | null>(null); // Definindo o estado do email do usuário
  const [prateleiras, setPrateleiras] = useState<any[]>([]); // Lista de prateleiras
  const [produtosPorPrateleira, setProdutosPorPrateleira] = useState<any>({}); // Dicionário de produtos por prateleira
  const [searchQuery, setSearchQuery] = useState<string>(''); // Estado para o campo de busca
  const router = useRouter();

  // Função para verificar se o usuário está logado
  const checkUserLoggedIn = () => {
    const jwt = localStorage.getItem('supabase_jwt');
    if (!jwt) {
      // Se não houver o JWT no localStorage, redireciona para /error
      router.push('/error');
    }
  };

  // Função assíncrona para realizar o logout
  const onLogout = async (): Promise<void> => {
    try {
      // Remover informações do usuário do localStorage
      localStorage.removeItem('supabase_jwt');
      localStorage.removeItem('user_email');
      
      // Realizar logout no Supabase
      await supabase.auth.signOut();

      console.log('Usuário deslogado');
      
      // Usando router.push para navegar para a página de login
      router.push('/login'); // Usando router.push para garantir a navegação correta no Next.js
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  // Carregar prateleiras e produtos ao carregar a página
  useEffect(() => {
    checkUserLoggedIn(); // Verifica se o usuário está logado na inicialização da página

    const fetchUserEmail = () => {
      const email = localStorage.getItem('user_email'); // Recuperando o email do usuário do localStorage
      setUserEmail(email); // Atualizando o estado com o email do usuário
    };

    const fetchData = async () => {
      // Buscar todas as prateleiras
      const { data: prateleirasData, error: prateleirasError } = await supabase
        .from('prateleiras')
        .select('*');

      if (prateleirasError) {
        console.error('Erro ao carregar prateleiras:', prateleirasError);
      } else {
        setPrateleiras(prateleirasData);
      }

      // Para cada prateleira, buscar os produtos associados a ela na tabela 'estoques'
      prateleirasData?.forEach(async (prateleira: any) => {
        const { data: produtosData, error: produtosError } = await supabase
          .from('estoques')
          .select('produtos(*)')
          .eq('id_prateleira', prateleira.id);

        if (produtosError) {
          console.error(`Erro ao carregar produtos da prateleira ${prateleira.id}:`, produtosError);
        } else {
          // Se não houver produtos, definimos um valor padrão
          setProdutosPorPrateleira((prev: any) => ({
            ...prev,
            [prateleira.id]: produtosData.length > 0 ? produtosData.map((estoque: any) => estoque.produtos) : 'Nenhum produto armazenado',
          }));
        }
      });
    };

    fetchUserEmail(); // Chama a função para pegar o email do usuário
    fetchData(); // Chama a função para carregar as prateleiras e produtos
  }, []); // O array de dependências está vazio agora, garantindo que o useEffect seja chamado uma única vez.

  // Filtra as prateleiras com base no nome
  const filteredPrateleiras = prateleiras.filter((prateleira) =>
    prateleira.nome.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Função para excluir uma prateleira
  const handleDelete = async (id: string) => {
    try {
      if (window.confirm('Tem certeza que deseja excluir esta prateleira?')) {
        const { error } = await supabase
          .from('prateleiras')
          .delete()
          .eq('id', id);

        if (error) {
          console.error('Erro ao excluir a prateleira:', error.message);
        } else {
          setPrateleiras(prateleiras.filter((prateleira) => prateleira.id !== id)); // Atualiza a lista de prateleiras após a exclusão
        }
      }
    } catch (error) {
      console.error('Erro ao excluir prateleira:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Passa o email do usuário para o Header */}
      <Header userEmail={userEmail} onLogout={onLogout} />

      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold text-center mb-6">Prateleiras e Produtos</h1>

        {/* Campo de busca */}
        <div className="mb-4">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar prateleira pelo nome"
            className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Botão Criar Prateleira */}
        <div className="mb-4 text-right">
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
            onClick={() => window.location.href = '/prateleiras/criar'} // Redirecionar para a página de criação
          >
            Criar Prateleira
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-md">
            <thead>
              <tr className="bg-gray-200 text-left">
                <th className="px-6 py-3 font-semibold text-gray-800">Prateleira</th>
                <th className="px-6 py-3 font-semibold text-gray-800">Produtos</th>
                <th className="px-6 py-3 font-semibold text-gray-800">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredPrateleiras.length > 0 ? (
                filteredPrateleiras.map((prateleira) => (
                  <tr key={prateleira.id} className="border-t border-gray-200">
                    <td className="px-6 py-4 text-sm text-gray-800">{prateleira.nome}</td>
                    <td className="px-6 py-4 text-sm text-gray-800">
                      {produtosPorPrateleira[prateleira.id] === 'Nenhum produto armazenado' ? (
                        <span className="text-gray-500">Nenhum produto armazenado</span>
                      ) : (
                        <ul className="list-disc pl-5">
                          {produtosPorPrateleira[prateleira.id]?.map((produto: any) => (
                            <li key={produto.SKU}>
                              <strong>{produto.nome}</strong> (SKU: {produto.SKU}, Código de Barras: {produto.codBarras})
                            </li>
                          ))}
                        </ul>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-800">
                      <button
                        onClick={() => handleDelete(prateleira.id)}
                        className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600"
                      >
                        Excluir
                      </button>
                      <button
                        onClick={() => window.location.href = `/prateleiras/edit/${prateleira.id}`} // Redireciona para a página de edição
                        className="bg-yellow-500 text-white px-4 py-2 rounded-md hover:bg-yellow-600 ml-2"
                      >
                        Editar
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="px-6 py-4 text-center text-gray-500">Nenhuma prateleira encontrada.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
