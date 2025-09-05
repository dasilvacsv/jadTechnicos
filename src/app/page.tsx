import { redirect } from 'next/navigation';

export default function HomePage() {
  redirect('/tecnico/sign-in');
  
  // Opcionalmente, puedes retornar null o un componente de carga,
  // aunque en la práctica este código no se ejecutará debido a la redirección.
  return null;
}