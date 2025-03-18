'use client';

import { supabase } from '../lib/supabase';
import { useUser } from '../context/UserContext'; // Para atualizar o contexto
import { useRouter } from 'next/navigation';

const Logout = () => {
  const { setUser } = useUser(); // Usando o setUser para limpar o estado do usuário
  const router = useRouter();

  const handleLogout = async () => {
    try {
      // Faz o logout usando o Supabase
      await supabase.auth.signOut();

      // Limpa os dados de autenticação do localStorage
      localStorage.removeItem('supabase_jwt');
      localStorage.removeItem('user_email');

      // Atualiza o estado do contexto para refletir que o usuário está deslogado
      setUser(null);

      // Redireciona para a página de login após o logout
      router.push('/login');
    } catch (error: any) {
      console.error('Erro ao fazer logout:', error.message);
    }
  };

  return (
    <button
      onClick={handleLogout}
      className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
    >
      Sair
    </button>
  );
};

export default Logout;
