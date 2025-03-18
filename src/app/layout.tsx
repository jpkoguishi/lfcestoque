'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../lib/supabase';
import { UserProvider } from '../context/UserContext';
import './globals.css';  // Certifique-se de que o CSS global está sendo importado

export default function Layout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<{ email: string | undefined } | null>(null);
  const router = useRouter();
  
  return (
    <>
      <html lang="pt-br">
        <body>
          <UserProvider>
            {/* Renderizando os filhos do layout */}
            {children}
          </UserProvider>
        </body>
      </html>
    </>
  );
}
