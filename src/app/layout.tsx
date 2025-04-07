'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { UserProvider } from '../context/UserContext';
import { ToastNotifications } from '../components/ToastNotifications'; // Importando o ToastNotifications
import './globals.css';  // Certifique-se de que o CSS global está sendo importado

export default function Layout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<{ email: string | undefined } | null>(null);
  const router = useRouter();

  console.log(user, setUser, router);

  return (
    <>
      <html lang="pt-br">
        <body>
          <UserProvider>
            {/* Componente ToastNotifications com o ToastContainer */}
            <ToastNotifications />
            {/* Renderizando os filhos do layout */}
            {children}
          </UserProvider>
        </body>
      </html>
    </>
  );
}
