// tecnico/layout.tsx
import { auth } from "@/features/auth";
import { TechnicianLayoutClient } from "./_components/TechnicianLayoutClient";

// Este sigue siendo un Server Component para poder usar 'await'
export default async function ProtectedTechnicianLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Obtenemos la sesión en el servidor
  const session = await auth();

  // Pasamos la sesión y los children al componente cliente que manejará el estado y la interactividad
  return (
    <TechnicianLayoutClient user={session?.user}>
      {children}
    </TechnicianLayoutClient>
  );
}