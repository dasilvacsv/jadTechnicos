import { getServiceOrders } from "@/features/orden/actions";
import { ReportsView } from "@/features/reportes/reports-view";
import { Skeleton } from "@/components/ui/skeleton"; // Componente para el fallback
import { Suspense } from "react";

// Forzar la revalidación para obtener siempre datos frescos
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Un componente de carga simple y elegante que se mostrará mientras se cargan los datos.
function ReportsLoadingSkeleton() {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Skeleton className="h-[105px]" />
        <Skeleton className="h-[105px]" />
        <Skeleton className="h-[105px]" />
        <Skeleton className="h-[105px]" />
      </div>
      <div className="space-y-3">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    </div>
  );
}

// Componente intermedio para resolver la promesa y manejar los datos o errores.
// Esto permite que el componente principal (ReportsPage) se renderice de inmediato.
async function ReportDataFetcher({ promise }: { promise: ReturnType<typeof getServiceOrders> }) {
  // Esperamos a que la promesa de los datos se resuelva aquí.
  const { data: orders = [], error } = await promise || { data: [] };

  // Si hay un error, lo mostramos.
  if (error) {
    return <div className="p-4 bg-red-50 text-red-500 rounded">{error}</div>;
  }

  // Si todo está bien, renderizamos la vista con los datos.
  return <ReportsView initialOrders={orders} />;
}


export default async function ReportsPage() {
  // Iniciamos la petición de datos en el servidor, pero no la esperamos aquí.
  const promise = getServiceOrders();

  return (
    <div className="container mx-auto py-4 space-y-4 h-full overflow-hidden flex flex-col">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Reportes por Técnico</h1>
      </div>

      <div className="flex-1 overflow-hidden">
        {/* Usamos Suspense para hacer streaming del componente cliente.
            Mientras ReportDataFetcher espera los datos, se mostrará el fallback. */}
        <Suspense fallback={<ReportsLoadingSkeleton />}>
          <ReportDataFetcher promise={promise} />
        </Suspense>
      </div>
    </div>
  );
}