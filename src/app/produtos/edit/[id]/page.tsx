'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';  // Usando useParams para acessar o parâmetro da URL

export default function EditarProduto() {
  const { id } = useParams();  // Agora usamos useParams para pegar o id da URL
  const router = useRouter();
  const [produto, setProduto] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return; // Garante que a consulta só aconteça quando o id estiver disponível.

    const fetchProduto = async () => {
      try {
        const response = await fetch(`https://eyezlckotjducyuknbel.supabase.co/rest/v1/produtos?id=eq.${id}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('supabase_jwt')}`,
            'Content-Type': 'application/json',
            'apikey': process.env.SUPABASE_KEY || '',
          },
        });

        if (!response.ok) {
          const errorDetails = await response.text();
          throw new Error(`Erro ao carregar os dados. Status: ${response.status}, Mensagem: ${errorDetails}`);
        }

        const data = await response.json();
        if (Array.isArray(data) && data.length > 0) {
          setProduto(data[0]); // A API retorna um array de produtos
        } else {
          setError('Produto não encontrado.');
        }
      } catch (error: any) {
        console.error('Erro ao buscar o produto:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProduto();
  }, [id]); // Recarrega os dados quando o id muda

  const handleSave = async () => {
    if (!produto) return;

    try {
      const response = await fetch(`https://eyezlckotjducyuknbel.supabase.co/rest/v1/produtos?id=eq.${id}`, {
        method: 'PATCH', // Método para editar os dados
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('supabase_jwt')}`,
          'Content-Type': 'application/json',
          'apikey': process.env.SUPABASE_KEY || '',
        },
        body: JSON.stringify({
          nome: produto.nome,
          sku: produto.sku,
          codBarras: produto.codBarras,
        }),
      });

      if (!response.ok) {
        const errorDetails = await response.text();
        throw new Error(`Erro ao atualizar o produto. Status: ${response.status}, Mensagem: ${errorDetails}`);
      }

      router.push('/produtos'); // Redireciona para a lista de produtos após salvar
    } catch (error: any) {
      console.error('Erro ao salvar o produto:', error);
      setError(error.message);
    }
  };

  if (loading) {
    return <div className="text-center">Carregando...</div>;
  }

  if (error) {
    return <div className="text-red-500 text-center">{error}</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-purple-600 to-indigo-600 flex items-center justify-center py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-6 rounded-lg shadow-2xl border border-gray-200">
        <h2 className="text-2xl font-extrabold text-center text-gray-700">Editar Produto</h2>

        {/* Exibindo erro ou sucesso */}
        {error && (
          <div className="bg-red-500 text-white text-center p-3 mb-4 rounded-lg shadow-md">
            {error}
          </div>
        )}

        <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
          <div>
            <label htmlFor="nome" className="block text-sm font-medium text-gray-700">Nome</label>
            <input
              id="nome"
              type="text"
              value={produto?.nome || ''}
              onChange={(e) => setProduto({ ...produto, nome: e.target.value })}
              required
              className="w-full mt-1 p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
            />
          </div>

          <div>
            <label htmlFor="sku" className="block text-sm font-medium text-gray-700">SKU</label>
            <input
              id="sku"
              type="text"
              value={produto?.sku || ''}
              onChange={(e) => setProduto({ ...produto, sku: e.target.value })}
              required
              className="w-full mt-1 p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
            />
          </div>

          <div>
            <label htmlFor="codBarras" className="block text-sm font-medium text-gray-700">Código de Barras</label>
            <input
              id="codBarras"
              type="text"
              value={produto?.codBarras || ''}
              onChange={(e) => setProduto({ ...produto, codBarras: e.target.value })}
              required
              className="w-full mt-1 p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
            />
          </div>

          <div>
            <button
              type="button"
              onClick={handleSave}
              className={`w-full py-3 px-4 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-300 transition-all ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={loading}
            >
              {loading ? 'Salvando...' : 'Salvar Produto'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
