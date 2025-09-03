import { getServiceOrderById } from "@/features/orden/actions"
import { ServiceOrderDetail } from "@/features/orden/service-order-detail"
import { notFound } from "next/navigation"
import { auth } from "@/features/auth"

export default async function ServiceOrderDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const session = await auth()
  const userId = session?.user?.id || ""

  const { data: order, error } = await getServiceOrderById(params.id)

  if (error || !order) {
    notFound()
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <ServiceOrderDetail order={order} userId={userId} />
    </div>
  )
}
