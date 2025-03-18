'use client';

import { useRouter } from 'next/navigation'; // Para redirecionar o usuário

const ErrorPage = () => {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-r from-purple-600 to-indigo-600 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-lg shadow-2xl border border-gray-200 text-center">
        <h2 className="text-2xl font-bold text-gray-700 mb-4">Você não está logado.</h2>
        <p className="text-gray-600 mb-4">Para acessar a página de produtos, faça login.</p>
        <button
          onClick={() => router.push('/login')} // Redireciona para a página de login
          className="w-full py-3 px-4 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-300 transition-all"
        >
          Fazer Login
        </button>
      </div>
    </div>
  );
};

export default ErrorPage;
