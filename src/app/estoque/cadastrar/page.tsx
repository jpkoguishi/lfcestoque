'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../lib/supabase'; // Certifique-se de importar corretamente o cliente Supabase
import Select from 'react-select';

const CadastrarEstoque = () => {
  const [produtos, setProdutos] = useState<any[]>([]);
  const [prateleiras, setPrateleiras] = useState<any[]>([]);
  const [filteredProdutos, setFilteredProdutos] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [searchBy, setSearchBy] = useState<'nome' | 'SKU' | 'codBarras'>('codBarras'); // Modificado para 'codBarras' como valor padrão
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [produtoSelecionado, setProdutoSelecionado] = useState<any | null>(null);
  const [prateleiraSelecionada, setPrateleiraSelecionada] = useState<any | null>(null);
  const [quantidade, setQuantidade] = useState<number>(0);
  const router = useRouter();

  useEffect(() => {
    const fetchProdutos = async () => {
      setLoading(true);
      try {
        let query = supabase.from('produtos').select('*');
        if (searchTerm) {
          query = query.ilike(searchBy, `%${searchTerm}%`);
        }
        const { data, error } = await query;
        if (error) {
          setError('Erro ao carregar os dados.');
          console.error(error);
        } else {
          setProdutos(data || []);
          setFilteredProdutos(data || []);
        }
      } catch (error) {
        setError('Erro ao carregar os dados.');
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
        }
      } catch (error) {
        console.error(error);
        setError('Erro ao carregar as prateleiras.');
      }
    };

    fetchProdutos();
    fetchPrateleiras();
  }, [searchTerm, searchBy]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleSearchByChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSearchBy(e.target.value as 'nome' | 'SKU' | 'codBarras');
  };

  const handleProdutoClick = (produto: any) => {
    setProdutoSelecionado(produto);
    setSearchTerm(produto.nome);
    setFilteredProdutos([]);
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

      // Dados para a requisição de estoque
      const data = {
        id_produto: produtoSelecionado.id,
        id_prateleira: prateleiraSelecionada.value, // Alterei para pegar o ID correto de prateleira
        quantidade: quantidade,
      };

      // Verificar se já existe estoque para esse produto e prateleira
      const { data: estoqueExistente, error: estoqueError } = await supabase
        .from('estoques')
        .select('*')
        .eq('id_produto', produtoSelecionado.id)
        .eq('id_prateleira', prateleiraSelecionada.value);

      if (estoqueError) {
        setError('Erro ao verificar o estoque existente.');
        console.error(estoqueError);
        setLoading(false);
        return;
      }

      if (estoqueExistente.length > 0) {
        const estoqueId = estoqueExistente[0].id;
        const updatedQuantity = estoqueExistente[0].quantidade + quantidade;

        // Atualizando o estoque na tabela estoques
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
        // Caso contrário, cria um novo registro de estoque
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

      router.push('/estoque/produtos');
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
              value={searchTerm}
              onChange={handleSearchChange}
              placeholder="Digite o nome, SKU ou código de barras do produto"
              className="w-full p-4 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {searchTerm && filteredProdutos.length > 0 && (
            <div className="mt-2 bg-white border border-gray-300 rounded-lg shadow-sm">
              {filteredProdutos.map((produto) => (
                <div
                  key={produto.id}
                  className="p-2 cursor-pointer hover:bg-gray-100"
                  onClick={() => handleProdutoClick(produto)}
                >
                  {produto.nome} | SKU: {produto.SKU} | Código de Barras: {produto.codBarras}
                </div>
              ))}
            </div>
          )}

          <div>
            <label htmlFor="prateleira" className="block text-sm font-medium text-gray-700">
              Prateleira
            </label>
            <Select
              id="prateleira"
              options={prateleiras.map((prateleira) => ({
                value: prateleira.id,  // A propriedade value deve ser o ID da prateleira
                label: prateleira.nome,
              }))}
              onChange={(selectedOption) => setPrateleiraSelecionada(selectedOption)}
              placeholder="Selecione uma prateleira"
              className="mt-1 mb-4"
            />
          </div>

          <div>
            <label htmlFor="quantidade" className="block text-sm font-medium text-gray-700">
              Quantidade
            </label>
            <input
              type="number"
              id="quantidade"
              value={quantidade}
              onChange={(e) => setQuantidade(Number(e.target.value))}
              className="w-full p-4 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500"
              min="1"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full py-2 px-4 bg-indigo-600 text-white font-bold rounded-lg shadow-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            disabled={loading}
          >
            {loading ? 'Cadastrando...' : 'Cadastrar Estoque'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CadastrarEstoque;
