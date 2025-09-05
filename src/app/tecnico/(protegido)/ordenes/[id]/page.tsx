// src/app/(tecnico)/ordenes/[id]/page.tsx

import { getServiceOrderByIdForTechnician } from "@/features/orden/actions";
// 👇 1. IMPORTAMOS LA NUEVA VISTA
import { TechnicianOrderDetailView } from "@/features/orden/technician-order-detail-view"; 
import { auth } from "@/features/auth";
import { notFound, redirect } from "next/navigation";

export default async function TechnicianOrderDetailPage({ params }: { params: { id: string } }) {
  const session = await auth();

  if (!session?.user?.id || session.user.role !== "TECHNICIAN") {
    redirect("/tecnico/sign-in");
  }

  const { data: order, error } = await getServiceOrderByIdForTechnician(
    params.id,
    session.user.id
  );

  if (error || !order) {
    notFound();
  }

  // 👇 2. USAMOS EL NUEVO COMPONENTE
  return <TechnicianOrderDetailView order={order} />;
}