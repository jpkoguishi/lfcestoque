import React, { useState } from 'react';
import Link from 'next/link'; // Importa o Link do Next.js
import { successToast, errorToast } from '../components/ToastNotifications'; // Importando as funções de notificação

interface HeaderProps {
  userEmail: string | null;
  onLogout: () => Promise<void>;
}

const Header: React.FC<HeaderProps> = ({ userEmail, onLogout }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Função para calcular o tamanho da fonte com base no comprimento do email
  const getEmailStyle = () => {
    if (userEmail && userEmail.length > 30) {
      return "text-sm"; // Reduz o tamanho da fonte se o email for muito longo
    }
    return "text-base"; // Mantém o tamanho padrão se o email não for muito longo
  };

  const handleLogout = async () => {
    try {
      // Chama a função de logout
      await onLogout(); // Assume que o onLogout é uma função que lida com o logout do usuário

      // Exibe a notificação de sucesso
      successToast('Você foi deslogado com sucesso!');
    } catch (error: unknown) {
      // Verifica se o error é uma instância de Error
      if (error instanceof Error) {
        // Se for um erro, exibe a notificação de erro com a mensagem
        errorToast(`Erro ao sair: ${error.message}`);
      } else {
        // Caso o erro não seja uma instância de Error, exibe uma mensagem genérica
        errorToast('Ocorreu um erro desconhecido ao tentar sair.');
      }
      console.error('Erro ao fazer logout:', error);
    }
  };

  return (
    <header className="bg-indigo-600 p-4 text-white">
      <div className="container mx-auto flex items-center justify-between">
        {/* Menu hambúrguer no canto esquerdo */}
        <button
          onClick={toggleMenu}
          className="text-white p-2 focus:outline-none"
        >
          <span className="block w-6 h-0.5 bg-white mb-1"></span>
          <span className="block w-6 h-0.5 bg-white mb-1"></span>
          <span className="block w-6 h-0.5 bg-white"></span>
        </button>

        {/* Título SaaS Estoque colado ao menu hambúrguer */}
        <h1 className="text-2xl font-bold ml-4">LFC Estoque</h1>

        {/* Links de navegação à direita */}
        <div className="flex space-x-4 ml-auto">
          <Link href="/produtos" className="text-white hover:bg-indigo-700 px-4 py-2 rounded-md">
            Produtos
          </Link>
          <Link href="/estoque/produtos" className="text-white hover:bg-indigo-700 px-4 py-2 rounded-md">
            Estoque
          </Link>
          {/* Link para Prateleiras */}
          <Link href="/prateleiras" className="text-white hover:bg-indigo-700 px-4 py-2 rounded-md">
            Prateleiras
          </Link>
        </div>
      </div>

      {/* Fundo escuro para a tela, visível apenas quando o menu está aberto */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 z-40 transition-all duration-300"
          onClick={toggleMenu}
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.5)', // Cor escura com opacidade
          }}
        />
      )}

      {/* Menu lateral sem links */}
      <div
        className={`fixed top-0 left-0 h-full bg-white w-64 transform transition-transform duration-300 ease-in-out ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'} z-50`}
      >
        <div className="flex justify-between items-center p-4 bg-indigo-600 text-white">
          <h2 className="text-lg font-bold">Menu</h2>
          <button
            onClick={toggleMenu}
            className="text-white text-2xl focus:outline-none"
          >
            &times; {/* Ícone de fechar */}
          </button>
        </div>

        {/* Exibição do email do usuário e botão de logout */}
        <div className="p-4 mt-6">
          {userEmail ? (
            <div className="mb-4">
              <p className={`text-gray-700 ${getEmailStyle()}`}>
                Olá bem-vindo, {userEmail}
              </p>
              <button
                onClick={handleLogout}  // Chamando a função de logout
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 w-full"
              >
                Sair
              </button>
            </div>
          ) : (
            <span className="text-gray-700">Não logado</span>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
