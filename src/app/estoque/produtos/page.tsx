'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '../../../components/Header'; // Importe o Header corretamente

// Tipagem dos produtos e agrupados
interface Produto {
  id_produto: string;
  produtos: {
    nome: string;
    SKU: string;
    codBarras: string;
    quantidadeTotal: number;
  };
  prateleiras: { nome: string }[]; // Assumindo que é um array de objetos com a propriedade 'nome'
}

interface ProdutoAgrupado {
  id_produto: string;
  nome: string;
  SKU: string;
  codBarras: string;
  prateleiras: string; // String contendo os nomes das prateleiras
  quantidadeTotal: number;
}

export default function Produtos() {
  const router = useRouter();
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [filteredProdutos, setFilteredProdutos] = useState<Produto[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [searchBy, setSearchBy] = useState<string>('codBarras'); // Estado para armazenar a escolha do filtro

  useEffect(() => {
    // Verifica se o usuário está logado
    const token = localStorage.getItem('supabase_jwt');
    if (token) {
      const userEmailFromToken = localStorage.getItem('user_email');
      setUserEmail(userEmailFromToken);

      const fetchProdutos = async () => {
        try {
          const response = await fetch('https://eyezlckotjducyuknbel.supabase.co/rest/v1/estoques?select=id_produto,id_prateleira,prateleiras(nome),produtos(nome,SKU,codBarras,quantidadeTotal)', {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
              'apikey': process.env.SUPABASE_KEY || '',
            },
          });

          if (!response.ok) {
            const errorDetails = await response.text();
            throw new Error(`Erro ao carregar os dados. Status: ${response.status}, Mensagem: ${errorDetails}`);
          }

          const data = await response.json();
          setProdutos(data);
          setFilteredProdutos(data);
        } catch (error: any) {
          console.error('Erro ao buscar os produtos:', error);
          setError(error.message);
        } finally {
          setLoading(false);
        }
      };

      fetchProdutos();
    } else {
      setError('Token JWT não encontrado.');
      router.push('/error');
    }
  }, [router]);

  useEffect(() => {
    if (searchTerm) {
      setFilteredProdutos(produtos.filter(produto => {
        const produtoValue = produto.produtos[searchBy as keyof Produto["produtos"]];
        
        // Verifica se o valor é string e faz a busca, caso contrário trata como string
        return String(produtoValue).toLowerCase().includes(searchTerm.toLowerCase());
      }));
    } else {
      setFilteredProdutos(produtos);
    }
  }, [searchTerm, produtos, searchBy]);

  if (loading) {
    return <div className="text-center">Carregando...</div>;
  }

  if (error) {
    return <div className="text-red-500 text-center">{error}</div>;
  }

  // Função para transformar o produto em agrupado
  const transformarProdutoParaAgrupado = (produto: Produto): ProdutoAgrupado => {
    // Verifica se prateleiras é um array válido
    const prateleiras = Array.isArray(produto.prateleiras) && produto.prateleiras.length > 0
      ? produto.prateleiras.map((prateleira) => prateleira.nome).join(', ') // Mapeia o nome das prateleiras se for um array
      : ''; // Caso contrário, retorna uma string vazia

    return {
      id_produto: produto.id_produto,
      nome: produto.produtos.nome,
      SKU: produto.produtos.SKU,
      codBarras: produto.produtos.codBarras,
      prateleiras, // A string resultante das prateleiras
      quantidadeTotal: produto.produtos.quantidadeTotal,
    };
  };

  // Agrupando os produtos
  const produtosAgrupados = filteredProdutos.reduce((acc: ProdutoAgrupado[], produto) => {
    const produtoExistente = acc.find((item: ProdutoAgrupado) => item.id_produto === produto.id_produto);

    if (produtoExistente) {
      // Verifica se produto.prateleiras tem ao menos um item
      if (produto.prateleiras && produto.prateleiras.length > 0) {
        produtoExistente.prateleiras += `, ${produto.prateleiras[0].nome}`; // Assume que há pelo menos uma prateleira
      }
    } else {
      acc.push(transformarProdutoParaAgrupado(produto));
    }

    return acc;
  }, []);

  const formatarPrateleiras = (prateleiras: string) => {
    const prateleirasArray = prateleiras.split(', ');
    if (prateleirasArray.length > 3) {
      return `${prateleirasArray.slice(0, 3).join(', ')}...`;
    }
    return prateleiras;
  };

  const handleRetirarClick = (id_produto: string) => {
    router.push(`/estoque/retirar/${id_produto}`);
  };

  // Tornando a função onLogout assíncrona
  const handleLogout = async () => {
    localStorage.removeItem('supabase_jwt');
    localStorage.removeItem('user_email');
    await router.push('/login');
  };

  return (
    <div>
      <Header userEmail={userEmail} onLogout={handleLogout} />

      <div className="container mx-auto p-6">
        <button
          onClick={() => router.push('/estoque/cadastrar')}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
        >
          Cadastrar Estoque
        </button>
      </div>

      <div className="container mx-auto p-6 flex items-center">
        {/* Select para escolher o critério de busca */}
        <select
          value={searchBy}
          onChange={(e) => setSearchBy(e.target.value)}
          className="mr-4 p-2 border border-gray-300 rounded-lg shadow-sm"
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
              <th className="py-3 px-6 text-left text-sm font-medium text-gray-600">Prateleiras</th>
              <th className="py-3 px-6 text-left text-sm font-medium text-gray-600">Quantidade Total</th>
              <th className="py-3 px-6 text-left text-sm font-medium text-gray-600">Retirar</th>
            </tr>
          </thead>
          <tbody>
            {produtosAgrupados.length > 0 ? (
              produtosAgrupados.map((produto) => (
                <tr key={`${produto.id_produto}-${produto.prateleiras}`} className="border-t border-gray-200 hover:bg-gray-50">
                  <td className="py-3 px-6 text-sm text-gray-800">{produto.nome}</td>
                  <td className="py-3 px-6 text-sm text-gray-800">{produto.SKU}</td>
                  <td className="py-3 px-6 text-sm text-gray-800">{produto.codBarras}</td>
                  <td className="py-3 px-6 text-sm text-gray-800">{formatarPrateleiras(produto.prateleiras)}</td>
                  <td className="py-3 px-6 text-sm text-gray-800">{produto.quantidadeTotal}</td>
                  <td className="py-3 px-6 text-sm text-gray-800">
                    <button 
                      onClick={() => handleRetirarClick(produto.id_produto)} 
                      className="text-blue-600 hover:underline">
                      Retirar
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="text-center py-3 text-gray-500">Nenhum produto encontrado.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
