import { getServiceOrdersForTechnician } from "@/features/orden/actions";
import { ReportsView } from "@/features/reportes/reports-view";
import { auth } from "@/features/auth";
import { redirect } from "next/navigation";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function TechnicianReportsPage() {
  const session = await auth();
  
  // Es buena práctica volver a verificar, aunque el layout ya lo haga
  if (!session?.user?.id || session.user.role !== "TECHNICIAN") {
      redirect("/tecnico/sign-in");
  }

  const { data: orders = [], error } = await getServiceOrdersForTechnician(session.user.id);

  if (error) {
    return <div className="p-6">Error al cargar los datos de los reportes.</div>;
  }
  
  return (
    <ReportsView 
        initialOrders={orders} 
        // Le pasamos el nombre del usuario de la sesión al componente
        currentTechnicianName={session.user.name || "Técnico"}
    />
  );
}