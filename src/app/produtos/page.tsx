'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '../../context/UserContext';
import Header from '../../components/Header';
import ConfirmDeleteModal from '../../components/modals/ConfirmDeleteModal';
import { supabase } from '@/lib/supabase';

export default function Produtos() {
  const { user, setUser } = useUser();
  const router = useRouter();
  const [produtos, setProdutos] = useState<any[]>([]);
  const [filteredProdutos, setFilteredProdutos] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isClient, setIsClient] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [searchBy, setSearchBy] = useState<string>('codBarras');
  
  console.log(user)// Estado para armazenar a escolha do filtro (codBarras, SKU, nome)

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [produtoParaExcluir, setProdutoParaExcluir] = useState<any | null>(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;

    const token = localStorage.getItem('supabase_jwt');
    if (!token) {
      setError('Token JWT não encontrado.');
      router.push('/error');
      return;
    }

    const userEmailFromToken = localStorage.getItem('user_email');
    setUserEmail(userEmailFromToken);

    const fetchProdutos = async () => {
      try {
        // Criar a consulta com o Supabase
        let query = supabase
          .from('produtos')
          .select('*');

        // Se houver um termo de busca, aplicar filtro baseado na escolha do usuário
        if (searchTerm) {
          query = query.ilike(searchBy, `%${searchTerm}%`);
        }

        const { data, error } = await query;

        if (error) {
          setError('Erro ao carregar os dados.');
          console.error('Erro ao carregar os dados:', error);
        }

        if (data) {
          setProdutos(data);
          setFilteredProdutos(data);
        } else {
          setError('Nenhum produto encontrado.');
        }
      } catch (error: any) {
        console.error('Erro ao buscar os produtos:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProdutos();
  }, [isClient, searchTerm, searchBy, router]); // Recarregar sempre que o termo de busca ou o filtro mudar

  const handleLogout = async () => {
    localStorage.removeItem('supabase_jwt');
    localStorage.removeItem('user_email');
    setUser(null);
    router.push('/login');
  };

  const handleCadastrarProduto = () => {
    router.push('/produtos/cadastrar');
  };

  const handleEditProduto = (id: number) => {
    router.push(`/produtos/edit/${id}`);
  };

  const handleOpenModal = (produto: any) => {
    setProdutoParaExcluir(produto);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setProdutoParaExcluir(null);
  };

  const handleConfirmDelete = async () => {
    if (!produtoParaExcluir) return;

    const token = localStorage.getItem('supabase_jwt');

    // Passo 1: Excluir os registros de estoque relacionados ao produto
    const deleteEstoquesResponse = await fetch(`https://eyezlckotjducyuknbel.supabase.co/rest/v1/estoques?id_produto=eq.${produtoParaExcluir.id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'apikey': process.env.SUPABASE_KEY || '',
      },
    });

    if (!deleteEstoquesResponse.ok) {
      console.error('Erro ao excluir os registros de estoque');
      return;
    }

    // Passo 2: Excluir o produto
    const deleteProdutoResponse = await fetch(`https://eyezlckotjducyuknbel.supabase.co/rest/v1/produtos?id=eq.${produtoParaExcluir.id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'apikey': process.env.SUPABASE_KEY || '',
      },
    });

    if (deleteProdutoResponse.ok) {
      // Remover o produto da lista após a exclusão
      setProdutos(produtos.filter(p => p.id !== produtoParaExcluir.id));
      setFilteredProdutos(filteredProdutos.filter(p => p.id !== produtoParaExcluir.id));
    } else {
      console.error('Erro ao excluir o produto');
    }

    handleCloseModal();
  };

  if (loading) {
    return <div className="text-center">Carregando...</div>;
  }

  if (error) {
    return <div className="text-red-500 text-center">{error}</div>;
  }

  return (
    <div>
      <Header userEmail={userEmail} onLogout={handleLogout} />

      <div className="container mx-auto p-6">
        <button
          onClick={handleCadastrarProduto}
          className="mb-4 bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-all"
        >
          Cadastrar Produto
        </button>

        {/* Select para escolher o critério de busca */}
        <select
          value={searchBy}
          onChange={(e) => setSearchBy(e.target.value)}
          className="mb-4 p-2 border border-gray-300 rounded-lg shadow-sm mr-4"
        >
          <option value="codBarras">Código de Barras</option>
          <option value="SKU">SKU</option>
          <option value="nome">Nome</option>
        </select>

        {/* Barra de pesquisa */}
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder={`Buscar por ${searchBy}...`}
          className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      <div className="container mx-auto p-6">
        <table className="min-w-full bg-white border border-gray-200 shadow-md rounded-lg">
          <thead>
            <tr className="bg-gray-100">
              <th className="py-3 px-6 text-left text-sm font-medium text-gray-600">Produto</th>
              <th className="py-3 px-6 text-left text-sm font-medium text-gray-600">SKU</th>
              <th className="py-3 px-6 text-left text-sm font-medium text-gray-600">Código de Barras</th>
              <th className="py-3 px-6 text-left text-sm font-medium text-gray-600">Quantidade Total</th>
              <th className="py-3 px-6 text-left text-sm font-medium text-gray-600">Ação</th>
            </tr>
          </thead>
          <tbody>
            {filteredProdutos.length > 0 ? (
              filteredProdutos.map((produto) => (
                <tr key={produto.id} className="border-t border-gray-200 hover:bg-gray-50">
                  <td className="py-3 px-6 text-sm text-gray-800">{produto.nome}</td>
                  <td className="py-3 px-6 text-sm text-gray-800">{produto.SKU}</td>
                  <td className="py-3 px-6 text-sm text-gray-800">{produto.codBarras}</td>
                  <td className="py-3 px-6 text-sm text-gray-800">{produto.quantidadeTotal}</td>
                  <td className="py-3 px-6 text-sm text-gray-800">
                    <button 
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 mr-2"
                      onClick={() => handleEditProduto(produto.id)} 
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleOpenModal(produto)}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                    >
                      Excluir
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="text-center py-3 text-gray-500">Nenhum produto encontrado.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <ConfirmDeleteModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onConfirm={handleConfirmDelete}
        produtoNome={produtoParaExcluir?.nome || ''}
      />
    </div>
  );
}
