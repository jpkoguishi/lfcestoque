'use client';

import React, { useState } from 'react';

interface RetirarProps {
  estoqueId: string;
  quantidadeDisponivel: number;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (quantidade: number) => void;
}

const Retirar: React.FC<RetirarProps> = ({ estoqueId, quantidadeDisponivel, isOpen, onClose, onSubmit }) => {
  const [quantidade, setQuantidade] = useState<number>(1);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Verificando se a quantidade é válida
    if (quantidade <= 0 || quantidade > quantidadeDisponivel) {
      setError('Quantidade inválida');
      return;
    }

    // Atualizar a quantidade no Supabase
    setLoading(true);
    try {
      // Atualizando a quantidade
      const response = await fetch(
        `https://eyezlckotjducyuknbel.supabase.co/rest/v1/estoques?id=eq.${estoqueId}`,
        {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('supabase_jwt')}`,
            'apikey': process.env.SUPABASE_KEY || '',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify([
            {
              quantidade: quantidadeDisponivel - quantidade, // Atualiza a quantidade
            },
          ]),
        }
      );

      // Verificando se a resposta não é um erro
      if (!response.ok) {
        throw new Error('Erro ao atualizar o estoque');
      }

      // Se a quantidade após a retirada for zero, deleta o estoque
      const quantidadeAtualizada = quantidadeDisponivel - quantidade;
      if (quantidadeAtualizada === 0) {
        // Deletando o estoque
        const deleteResponse = await fetch(
          `https://eyezlckotjducyuknbel.supabase.co/rest/v1/estoques?id=eq.${estoqueId}`,
          {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('supabase_jwt')}`,
              'apikey': process.env.SUPABASE_KEY || '',
            },
          }
        );

        if (!deleteResponse.ok) {
          throw new Error('Erro ao deletar o estoque');
        }
      }

      // Chama o onSubmit com a quantidade retirada
      onSubmit(quantidade);

      setQuantidade(1); // Resetando a quantidade
      onClose(); // Fechando o modal após sucesso
    } catch (error: unknown) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('Erro desconhecido ao atualizar estoque');
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null; // Se o modal não estiver aberto, não renderiza nada

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-500 bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96">
        <h2 className="text-2xl font-semibold text-center text-gray-700 mb-4">Retirar do Estoque</h2>

        {/* Exibindo erro, se houver */}
        {error && (
          <div className="bg-red-500 text-white p-3 mb-4 rounded-md">
            {error}
          </div>
        )}

        {/* Formulário para retirar quantidade */}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="quantidade" className="block text-sm font-medium text-gray-700">Quantidade</label>
            <input
              type="number"
              id="quantidade"
              value={quantidade}
              onChange={(e) => setQuantidade(Number(e.target.value))}
              min="1"
              max={quantidadeDisponivel}
              required
              className="w-full mt-1 p-4 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
            <small className="text-gray-500">Disponível: {quantidadeDisponivel}</small>
          </div>

          <div className="flex justify-between">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
            >
              Cancelar
            </button>

            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              disabled={loading}
            >
              {loading ? 'Processando...' : 'Confirmar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Retirar;
