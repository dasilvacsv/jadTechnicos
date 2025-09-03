import { Suspense } from "react"
import { notFound } from "next/navigation"
import { getClientById } from "@/features/clientes/clients"
import { getBrands } from "@/features/marcas/actions"
import { getApplianceTypes } from "@/features/appliance-types/actions"
import { ClientDetail } from "@/features/clientes/client-detail"
import { Skeleton } from "@/components/ui/skeleton"
import { auth } from "@/features/auth"

export const dynamic = "force-dynamic"

interface ClientPageProps {
  params: {
    id: string
  }
}

export default async function ClientPage({ params }: ClientPageProps) {
  const session = await auth()
  if (!session?.user) return notFound()

  const userId = session.user.id
  const { id } = params

  // Fetch client data
  const clientResult = await getClientById(id)
  if (!clientResult.success || !clientResult.data) {
    return notFound()
  }

  // Fetch brands and appliance types for the form
  const brandsResult = await getBrands()
  const applianceTypesResult = await getApplianceTypes()

  const brands = brandsResult.success ? brandsResult.data : []
  const applianceTypes = applianceTypesResult.success ? applianceTypesResult.data : []

  return (
    <div className="container py-6 space-y-6">
      <Suspense fallback={<Skeleton className="h-[500px] w-full" />}>
        <ClientDetail client={clientResult.data} userId={userId} brands={brands} applianceTypes={applianceTypes} />
      </Suspense>
    </div>
  )
}
