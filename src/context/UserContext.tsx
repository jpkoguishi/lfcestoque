// src/context/UserContext.tsx
'use client';  // Marca o arquivo como um componente de cliente

import { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

// Definindo o tipo de dados do contexto
interface UserContextType {
  user: { email: string | undefined } | null;
  setUser: React.Dispatch<React.SetStateAction<{ email: string | undefined } | null>>;
}

// Criando o contexto
const UserContext = createContext<UserContextType | undefined>(undefined);

// Componente para fornecer o contexto
export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<{ email: string | undefined } | null>(null);

  useEffect(() => {
    // Função para pegar a sessão do Supabase
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser({ email: session.user.email });
      } else {
        setUser(null);
      }
    };

    // Chama a função para pegar a sessão
    getSession();

    // Escuta mudanças de autenticação
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (session?.user) {
          setUser({ email: session.user.email });
        } else {
          setUser(null);
        }
      }
    );

    // Limpeza do ouvinte de mudanças de autenticação
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
};

// Hook customizado para consumir o contexto
export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
