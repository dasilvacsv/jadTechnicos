// src/app/(tecnico)/ordenes/[id]/page.tsx

import { getServiceOrderByIdForTechnician } from "@/features/orden/actions";
import { ServiceOrderDetail } from "@/features/orden/service-order-detail"; // Reutilizamos el componente
import { auth } from "@/features/auth";
import { notFound, redirect } from "next/navigation";

export default async function TechnicianOrderDetailPage({ params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "TECHNICIAN") {
    redirect("/sign-in");
  }

  const { data: order, error } = await getServiceOrderByIdForTechnician(params.id, session.user.id);

  if (error || !order) {
    notFound();
  }

  // Pasamos la prop `isReadOnly` al detalle de la orden
  return <ServiceOrderDetail order={order} userId={session.user.id} isReadOnly={true} />;
}