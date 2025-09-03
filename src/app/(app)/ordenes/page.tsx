import { getServiceOrders } from "@/features/orden/actions"
import { ServiceOrdersTable } from "@/features/orden/service-orders-table"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { PlusCircle } from "lucide-react"
import { Suspense } from "react"

// Use a dynamic page with a unique timestamp to prevent caching
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function ServiceOrdersPage() {
  const { data: orders = [], error } = (await getServiceOrders()) || { data: [] }

  return (
    <div className="container mx-auto py-4 space-y-4 h-full overflow-hidden flex flex-col">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Órdenes de Servicio</h1>
        <Button asChild>
          <Link href="/ordenes/new" className="flex items-center gap-2">
            <PlusCircle className="w-4 h-4" />
            Nueva Orden
          </Link>
        </Button>
      </div>

      {error ? (
        <div className="p-4 bg-red-50 text-red-500 rounded">{error}</div>
      ) : (
        <div className="flex-1 overflow-hidden">
          <Suspense fallback={<div>Cargando órdenes...</div>}>
            <ServiceOrdersTable orders={orders} />
          </Suspense>
        </div>
      )}
    </div>
  )
}