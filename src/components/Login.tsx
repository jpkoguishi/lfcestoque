'use client';

import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useRouter } from 'next/navigation';
import { successToast, errorToast } from './ToastNotifications'; // Importar as funções

export default function Login() {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setError(null); // Resetar erro antes de tentar login
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // Armazenar o token JWT no localStorage
      if (data?.session?.access_token) {
        localStorage.setItem('supabase_jwt', data.session.access_token);
        localStorage.setItem('user_email', email); // Armazenar o e-mail do usuário
      }

      // Usuário logado com sucesso, redirecionar para a página de estoque
      router.push('/estoque/produtos');
      
      // Exibir notificação de sucesso
      successToast("Login bem-sucedido! Redirecionando...");

      console.log('Usuário logado:', data);
    } catch (err: any) {
      setError(err.message);
      
      // Exibir notificação de erro
      errorToast(`Erro: ${err.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-purple-600 to-indigo-600 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-lg shadow-2xl border border-gray-200">
        <h2 className="text-3xl font-extrabold text-center text-gray-700">LFC Estoque</h2>

        {error && (
          <div className="bg-red-500 text-white text-center p-3 mb-4 rounded-lg shadow-md">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full mt-1 p-4 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full mt-1 p-4 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
            />
          </div>

          <div>
            <button
              type="submit"
              className="w-full py-3 px-4 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-300 transition-all"
            >
              Entrar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
