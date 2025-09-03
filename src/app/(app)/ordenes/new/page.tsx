import { getBrands } from "@/features/marcas/actions"
import { getApplianceTypes } from "@/features/appliance-types/actions"
import { getClientsWithAppliances } from "@/features/orden/form/actions"

import { auth } from "@/features/auth"
import { OrdenForm } from "@/features/orden/form/orden-form"

export default async function OrdenPage() {
  const session = await auth()
  const userId = session?.user?.id || ""

  // Fetch brands, appliance types, and clients with appliances
  const { data: brands } = (await getBrands()) || { data: [] }
  const { data: applianceTypes } = (await getApplianceTypes()) || { data: [] }
  const { data: clientsWithAppliances } = (await getClientsWithAppliances()) || { data: [] }

  return (
    <div className="container py-6 space-y-6">
      <h1 className="text-2xl font-bold">Nueva Orden</h1>

      <div className="bg-background shadow-sm rounded-lg p-6 border">
        <h2 className="text-xl font-semibold mb-4">Información Básica</h2>

        <OrdenForm 
          brands={brands || []} 
          applianceTypes={applianceTypes || []} 
          userId={userId}
          clients={clientsWithAppliances || []}
        />
      </div>
    </div>
  )
}
