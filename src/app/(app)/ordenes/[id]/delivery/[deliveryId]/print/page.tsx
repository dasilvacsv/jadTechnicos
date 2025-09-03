import { getServiceOrderById } from "@/features/orden/actions"
import { getDeliveryNoteById } from "@/features/orden/delivery-actions"
import { PrintDeliveryNote } from "@/features/orden/print-delivery-note"
import { notFound } from "next/navigation"

export default async function PrintDeliveryNotePage({
  params,
}: {
  params: { id: string; deliveryId: string }
}) {
  const { data: order, error: orderError } = await getServiceOrderById(params.id)
  const { data: deliveryNote, error: deliveryError } = await getDeliveryNoteById(params.deliveryId)

  if (orderError || !order || deliveryError || !deliveryNote) {
    notFound()
  }

  return <PrintDeliveryNote order={order} deliveryNote={deliveryNote} />
}
