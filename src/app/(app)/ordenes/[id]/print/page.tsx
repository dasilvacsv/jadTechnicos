// page.tsx
import { getServiceOrderById } from "@/features/orden/actions";
import { PrintServiceOrder } from "@/features/orden/print-service-order";
import { notFound } from "next/navigation";

export default async function PrintServiceOrderPage({
  params,
}: {
  params: { id: string };
}) {
  const { data: order, error } = await getServiceOrderById(params.id);

  if (error || !order) {
    notFound();
  }

  return <PrintServiceOrder order={order} />;
}