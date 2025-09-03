import { Suspense } from "react"
import { auth } from "@/features/auth"
import { SucursalesClient } from "@/features/sucursales/sucursales-client"
import { SucursalesHeader } from "@/features/sucursales/components/sucursales-header"
import { getSucursales } from "@/features/sucursales/sucursales"
import { getClientsBySucursal } from "@/features/sucursales/actions"
import { Skeleton } from "@/components/ui/skeleton"

export const metadata = {
  title: "Sucursales | Sistema de Gestión",
  description: "Administración de sucursales y sus clientes asociados",
}

interface Sucursal {
  id: string
  name: string
  header: string | null
  logo: string | null
  bottom: string | null
  createdAt: Date | null
  updatedAt: Date | null
  createdBy: string | null
  updatedBy: string | null
}

export default async function SucursalesPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const session = await auth()
  const userId = session?.user?.id || ""
  
  // Get sorting parameters
  const sortField = typeof searchParams.sort === "string" ? searchParams.sort : "name"
  const sortDirection = typeof searchParams.direction === "string" ? searchParams.direction : "asc"
  
  // Get filter parameters
  const filterValue = typeof searchParams.filter === "string" ? searchParams.filter : ""
  
  // Fetch data
  const sucursalesResult = await getSucursales()
  const sucursales: Sucursal[] = sucursalesResult.success ? sucursalesResult.data : []
  
  // Fetch clients data for each sucursal
  const clientsData = await Promise.all(
    sucursales.map(async (sucursal) => {
      const result = await getClientsBySucursal(sucursal.id)
      return {
        sucursalId: sucursal.id,
        clients: result.success ? result.data : []
      }
    })
  )
  
  const clientsMap = clientsData.reduce<Record<string, any[]>>((acc, item) => {
    acc[item.sucursalId] = item.clients
    return acc
  }, {})
  
  return (
    <div className="container mx-auto px-4 py-6 space-y-8">
      <SucursalesHeader userId={userId} />
      
      <Suspense fallback={<SucursalesLoading />}>
        <SucursalesClient 
          initialSucursales={sucursales} 
          clientsMap={clientsMap}
          userId={userId}
          initialSort={{
            field: sortField,
            direction: sortDirection
          }}
          initialFilter={filterValue}
        />
      </Suspense>
    </div>
  )
}

function SucursalesLoading() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array(6).fill(0).map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow-md overflow-hidden">
            <Skeleton className="h-32 w-full" />
            <div className="p-6 space-y-3">
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
              <div className="pt-4">
                <Skeleton className="h-8 w-full" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}