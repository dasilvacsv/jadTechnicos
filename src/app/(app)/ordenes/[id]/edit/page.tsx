import { getServiceOrderForEdit } from "@/features/orden/actions"
import { getBrands } from "@/features/marcas/actions"
import { getApplianceTypes } from "@/features/appliance-types/actions"
import { OrdenForm } from "@/features/orden/orden-form"
import { notFound } from "next/navigation"
import { auth } from "@/features/auth"

export default async function EditServiceOrderPage({
  params,
}: {
  params: { id: string }
}) {
  const session = await auth()
  const userId = session?.user?.id || ""

  // Fetch order data
  const { data: order, error } = await getServiceOrderForEdit(params.id)

  if (error || !order) {
    notFound()
  }

  // Fetch brands and appliance types
  const { data: brands } = (await getBrands()) || { data: [] }
  const { data: applianceTypes } = (await getApplianceTypes()) || { data: [] }

  return (
    <div className="container py-6 space-y-6">
      <h1 className="text-2xl font-bold">Editar Orden #{order.orderNumber}</h1>

      <div className="bg-white shadow-sm rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Información de la Orden</h2>

        <OrdenForm
          brands={brands || []}
          applianceTypes={applianceTypes || []}
          userId={userId}
          initialData={order}
          mode="edit"
        />
      </div>
    </div>
  )
}
