import { TechnicianNav } from "./_components/TechnicianNav"; 
import { auth } from "@/features/auth"; // Aún lo necesitamos para pasar el nombre

// Ya no necesitamos 'redirect' aquí

export default async function ProtectedTechnicianLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Obtenemos la sesión solo para pasar los datos del usuario al sidebar
  const session = await auth();

  // 🔽 YA NO NECESITAMOS ESTE BLOQUE DE CÓDIGO 🔽
  // if (!session?.user || session.user.role !== "TECHNICIAN") {
  //   redirect("/tecnico/sign-in");
  // }

  return (
    <div className="flex h-screen bg-muted/40">
      <aside className="w-60 flex-shrink-0 bg-gray-800 text-white">
        {/* Pasamos el objeto 'user' para que el sidebar muestre el nombre */}
        <TechnicianNav user={session?.user} />
      </aside>
      <main className="flex-1 overflow-y-auto">
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
}