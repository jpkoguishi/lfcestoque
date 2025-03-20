'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../lib/supabase';

interface Produto {
  id: number;
  nome: string;
  SKU: string;
  codBarras: string;
}

interface Prateleira {
  id: number;
  nome: string;
}

const CadastrarEstoque = () => {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [prateleiras, setPrateleiras] = useState<Prateleira[]>([]);
  const [filteredProdutos, setFilteredProdutos] = useState<Produto[]>([]);
  const [filteredPrateleiras, setFilteredPrateleiras] = useState<Prateleira[]>([]);
  const [searchTermProduto, setSearchTermProduto] = useState<string>('');
  const [searchTermPrateleira, setSearchTermPrateleira] = useState<string>('');
  const [searchBy, setSearchBy] = useState<'nome' | 'SKU' | 'codBarras'>('codBarras');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [produtoSelecionado, setProdutoSelecionado] = useState<Produto | null>(null);
  const [prateleiraSelecionada, setPrateleiraSelecionada] = useState<Prateleira | null>(null);
  const [quantidade, setQuantidade] = useState<number>(0);
  const router = useRouter();

  console.log(produtos);

  useEffect(() => {
    const fetchProdutos = async () => {
      setLoading(true);
      try {
        let query = supabase.from('produtos').select('*');
        if (searchTermProduto && searchBy === 'nome') {
          query = query.ilike('nome', `%${searchTermProduto}%`);
        } else if (searchTermProduto && searchBy === 'SKU') {
          query = query.ilike('SKU', `%${searchTermProduto}%`);
        } else if (searchTermProduto && searchBy === 'codBarras') {
          query = query.ilike('codBarras', `%${searchTermProduto}%`);
        }

        const { data, error } = await query;
        if (error) {
          setError('Erro ao carregar os produtos.');
          console.error(error);
        } else {
          setProdutos(data || []);
          setFilteredProdutos(data || []);
        }
      } catch (error) {
        setError('Erro ao carregar os produtos.');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    const fetchPrateleiras = async () => {
      try {
        const { data, error } = await supabase.from('prateleiras').select('*');
        if (error) {
          console.error(error);
          setError('Erro ao carregar as prateleiras.');
        } else {
          setPrateleiras(data || []);
          setFilteredPrateleiras(data || []);
        }
      } catch (error) {
        console.error(error);
        setError('Erro ao carregar as prateleiras.');
      }
    };

    fetchProdutos();
    fetchPrateleiras();
  }, [searchTermProduto, searchBy]);

  const handleSearchProdutoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTermProduto(e.target.value);
  };

  const handleSearchPrateleiraChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTermPrateleira(value);

    if (value === '') {
      setFilteredPrateleiras(prateleiras); // Retorna todas as prateleiras se o termo estiver vazio
    } else {
      const filtered = prateleiras.filter((prateleira) =>
        prateleira.nome.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredPrateleiras(filtered);
    }
  };

  const handleSearchByChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSearchBy(e.target.value as 'nome' | 'SKU' | 'codBarras');
  };

  const handleProdutoClick = (produto: Produto) => {
    setProdutoSelecionado(produto);
    setSearchTermProduto(produto.nome);
    setFilteredProdutos([]); // Limpa os resultados após seleção
  };

  const handlePrateleiraClick = (prateleira: Prateleira) => {
    setPrateleiraSelecionada(prateleira);
    setSearchTermPrateleira(prateleira.nome); // Atualiza a pesquisa com o nome da prateleira selecionada
    setFilteredPrateleiras([]); // Limpa a lista de resultados após seleção
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!produtoSelecionado || !prateleiraSelecionada || quantidade <= 0) {
      setError('Todos os campos são obrigatórios');
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('supabase_jwt');
      if (!token) {
        setError('Token JWT não encontrado.');
        setLoading(false);
        return;
      }

      const data = {
        id_produto: produtoSelecionado.id,
        id_prateleira: prateleiraSelecionada.id,
        quantidade: quantidade,
      };

      const { data: estoqueExistente, error: estoqueError } = await supabase
        .from('estoques')
        .select('*')
        .eq('id_produto', produtoSelecionado.id)
        .eq('id_prateleira', prateleiraSelecionada.id);

      if (estoqueError) {
        setError('Erro ao verificar o estoque existente.');
        console.error(estoqueError);
        setLoading(false);
        return;
      }

      if (estoqueExistente.length > 0) {
        const estoqueId = estoqueExistente[0].id;
        const updatedQuantity = estoqueExistente[0].quantidade + quantidade;

        const updateResponse = await fetch(
          `https://eyezlckotjducyuknbel.supabase.co/rest/v1/estoques?id=eq.${estoqueId}`,
          {
            method: 'PATCH',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
              'apikey': process.env.SUPABASE_KEY || '',
            },
            body: JSON.stringify({
              quantidade: updatedQuantity,
            }),
          }
        );

        if (!updateResponse.ok) {
          const errorDetails = await updateResponse.text();
          console.error('Erro ao atualizar estoque:', errorDetails);
          throw new Error('Erro ao atualizar estoque');
        }

        alert('Estoque atualizado com sucesso!');
      } else {
        const response = await fetch(
          'https://eyezlckotjducyuknbel.supabase.co/rest/v1/estoques',
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
              'apikey': process.env.SUPABASE_KEY || '',
            },
            body: JSON.stringify(data),
          }
        );

        if (!response.ok) {
          const errorDetails = await response.text();
          console.error('Erro ao cadastrar estoque:', errorDetails);
          throw new Error('Erro ao cadastrar estoque');
        }

        alert('Estoque cadastrado com sucesso!');
      }

      // Atualizar a quantidade total do produto
      const produtoResponse = await fetch(
        `https://eyezlckotjducyuknbel.supabase.co/rest/v1/produtos?id=eq.${produtoSelecionado.id}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'apikey': process.env.SUPABASE_KEY || '',
          },
        }
      );

      const produtoData = await produtoResponse.json();
      const produtoAtual = produtoData[0];
      const quantidadeTotalAtual = produtoAtual?.quantidadeTotal ?? 0;
      const quantidadeTotalAtualizada = quantidadeTotalAtual + quantidade;

      const updateProdutoResponse = await fetch(
        `https://eyezlckotjducyuknbel.supabase.co/rest/v1/produtos?id=eq.${produtoSelecionado.id}`,
        {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'apikey': process.env.SUPABASE_KEY || '',
          },
          body: JSON.stringify({
            quantidadeTotal: quantidadeTotalAtualizada,
          }),
        }
      );

      if (!updateProdutoResponse.ok) {
        const errorDetails = await updateProdutoResponse.text();
        console.error('Erro ao atualizar produto:', errorDetails);
        throw new Error('Erro ao atualizar produto');
      }

      // router.push('/estoque/produtos');
    } catch (error) {
      console.error('Erro no processamento:', error);
      setError('Erro ao processar o estoque');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-purple-600 to-indigo-600 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-lg shadow-2xl border border-gray-200">
        <h2 className="text-3xl font-extrabold text-center text-gray-700">Cadastrar Estoque</h2>

        {error && (
          <div className="bg-red-500 text-white text-center p-3 mb-4 rounded-lg shadow-md">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <select
            value={searchBy}
            onChange={handleSearchByChange}
            className="mb-4 p-2 border border-gray-300 rounded-lg shadow-sm"
          >
            <option value="codBarras">Código de Barras</option>
            <option value="SKU">SKU</option>
            <option value="nome">Nome</option>
          </select>

          <div>
            <input
              type="text"
              value={searchTermProduto}
              onChange={handleSearchProdutoChange}
              placeholder="Digite o nome, SKU ou código de barras do produto"
              className="w-full p-4 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {searchTermProduto && filteredProdutos.length > 0 && (
            <div className="space-y-2">
              {filteredProdutos.map((produto) => (
                <div
                  key={produto.id}
                  onClick={() => handleProdutoClick(produto)}
                  className="p-2 cursor-pointer border border-gray-300 rounded-md hover:bg-gray-100"
                >
                  {produto.nome} ({produto.SKU})
                </div>
              ))}
            </div>
          )}

          <div>
            <input
              type="text"
              value={searchTermPrateleira}
              onChange={handleSearchPrateleiraChange}
              placeholder="Pesquisar prateleira por nome"
              className="w-full p-4 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {searchTermPrateleira && filteredPrateleiras.length > 0 && (
            <div className="space-y-2">
              {filteredPrateleiras.map((prateleira) => (
                <div
                  key={prateleira.id}
                  onClick={() => handlePrateleiraClick(prateleira)}
                  className="p-2 cursor-pointer border border-gray-300 rounded-md hover:bg-gray-100"
                >
                  {prateleira.nome}
                </div>
              ))}
            </div>
          )}

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Quantidade</label>
            <input
              type="number"
              value={quantidade}
              onChange={(e) => setQuantidade(Number(e.target.value))}
              className="w-full p-4 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500"
              min="1"
            />
          </div>

          <div className="flex items-center justify-between">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-6 text-white bg-indigo-600 rounded-md shadow-md disabled:bg-gray-500"
            >
              {loading ? 'Carregando...' : 'Cadastrar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CadastrarEstoque;
