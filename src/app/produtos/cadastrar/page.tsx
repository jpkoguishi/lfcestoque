'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CadastrarProduto() {
  const [nome, setNome] = useState('');
  const [sku, setSku] = useState('');
  const [codBarras, setCodBarras] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const router = useRouter();

  // Função para enviar o formulário
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validação básica
    if (!nome || !sku || !codBarras) {
      setError('Todos os campos são obrigatórios.');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      // Enviar os dados para a API
      const response = await fetch('https://eyezlckotjducyuknbel.supabase.co/rest/v1/produtos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('supabase_jwt')}`,
          'apikey': process.env.SUPABASE_KEY || '',
        },
        body: JSON.stringify({
          nome,
          sku,
          codBarras,
        }),
      });

      if (!response.ok) {
        const errorDetails = await response.text();
        throw new Error(`Erro ao cadastrar o produto: ${errorDetails}`);
      }

      // Limpar o formulário e exibir sucesso
      setNome('');
      setSku('');
      setCodBarras('');
      setSuccessMessage('Produto cadastrado com sucesso!');
      setTimeout(() => router.push('/produtos'), 2000); // Redireciona para a página de produtos após 2 segundos
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-purple-600 to-indigo-600 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-lg shadow-2xl border border-gray-200">
        <h2 className="text-3xl font-extrabold text-center text-gray-700">Cadastrar Produto</h2>

        {/* Exibindo erro ou sucesso */}
        {error && (
          <div className="bg-red-500 text-white text-center p-3 mb-4 rounded-lg shadow-md">
            {error}
          </div>
        )}
        {successMessage && (
          <div className="bg-green-500 text-white text-center p-3 mb-4 rounded-lg shadow-md">
            {successMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="nome" className="block text-sm font-medium text-gray-700">Nome</label>
            <input
              id="nome"
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              required
              className="w-full mt-1 p-4 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
            />
          </div>

          <div>
            <label htmlFor="sku" className="block text-sm font-medium text-gray-700">SKU</label>
            <input
              id="sku"
              type="text"
              value={sku}
              onChange={(e) => setSku(e.target.value)}
              required
              className="w-full mt-1 p-4 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
            />
          </div>

          <div>
            <label htmlFor="codBarras" className="block text-sm font-medium text-gray-700">Código de Barras</label>
            <input
              id="codBarras"
              type="text"
              value={codBarras}
              onChange={(e) => setCodBarras(e.target.value)}
              required
              className="w-full mt-1 p-4 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
            />
          </div>

          <div>
            <button
              type="submit"
              className={`w-full py-3 px-4 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-300 transition-all ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={loading}
            >
              {loading ? 'Cadastrando...' : 'Cadastrar Produto'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
