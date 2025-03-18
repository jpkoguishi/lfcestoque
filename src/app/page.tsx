// app/page.tsx
import { User } from '@supabase/supabase-js';

interface PageProps {
  user: User | null;
}

export default function Home({ user }: PageProps) {
  return (
    <div>
      <h1>Bem-vindo ao nosso site</h1>
      {user ? (
        <p>Seu e-mail: {user.email}</p>
      ) : (
        <p>Faça login para ver seu e-mail</p>
      )}
    </div>
  );
}
