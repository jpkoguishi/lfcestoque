'use client'; // Marca o componente como sendo de cliente

import { useUser } from '../../context/UserContext'; // Importando o hook de contexto
import Header from '../../components/Header'; // Importando o componente Header
import Logout from '../../components/Logout'; // Importando o componente de Logout

export default function Home() {
  const { user } = useUser(); // Usando o contexto de usuário

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      {/* Adicionando o Header no topo da página */}
      <Header />

      <div className="flex items-center justify-center flex-grow">
        {user ? (
          <div className="text-center">
            <h1 className="text-3xl font-semibold text-gray-800">
              Bem-vindo, {user.email}
            </h1>
            <Logout /> {/* Exibe o botão de logout */}
          </div>
        ) : (
          <h1 className="text-2xl text-gray-700">Você não está logado.</h1>
        )}
      </div>
    </div>
  );
}
