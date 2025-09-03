// src/app/(tecnico)/ordenes/page.tsx

import { getServiceOrdersForTechnician } from "@/features/orden/actions";
import { ServiceOrdersTable } from "@/features/orden/service-orders-table";
import { auth } from "@/features/auth"; // Importa la sesión
import { redirect } from "next/navigation";

export const dynamic = 'force-dynamic';

export default async function TechnicianOrdersPage() {
  const session = await auth();
  // Si no hay sesión o no es un técnico, lo sacamos
  if (!session?.user?.id || (session.user.role !== "TECHNICIAN" && session.user.role !== "ADMIN")) {
      redirect("/sign-in");
  }

  const { data: orders = [], error } = await getServiceOrdersForTechnician(session.user.id);

  return (
    <div className="container mx-auto py-4 space-y-4">
      <h1 className="text-2xl font-bold">Mis Órdenes de Servicio</h1>
      {error ? (
        <div className="p-4 bg-red-50 text-red-500 rounded">{error}</div>
      ) : (
        // Pasamos una nueva prop `isReadOnly` al componente de la tabla
        <ServiceOrdersTable orders={orders} isReadOnly={true} />
      )}
    </div>
  );
}