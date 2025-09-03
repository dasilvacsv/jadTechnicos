import { getApplianceById } from "@/features/appliances/actions"
import { getServiceOrdersByApplianceId } from "@/features/orden/actions"
import { ApplianceDetail } from "@/features/appliances/appliance-detail"
import { notFound } from "next/navigation"
import { auth } from "@/features/auth"

export default async function ApplianceDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const session = await auth()
  const userId = session?.user?.id || ""

  const { data: appliance, error } = await getApplianceById(params.id)

  if (error || !appliance) {
    notFound()
  }

  // Get service orders for this appliance
  const { data: serviceOrders = [] } = (await getServiceOrdersByApplianceId(params.id)) || { data: [] }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <ApplianceDetail appliance={appliance} serviceOrders={serviceOrders} userId={userId} />
    </div>
  )
}
