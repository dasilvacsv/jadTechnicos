import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2, CircleDashed, List, XCircle } from "lucide-react"

interface ReportMetricsCardsProps {
  totales: number
  terminadas: number
  pendientes: number
  canceladas: number
}

export function ReportMetricsCards({
  totales,
  terminadas,
  pendientes,
  canceladas,
}: ReportMetricsCardsProps) {
  const metrics = [
    { title: "Órdenes Totales", value: totales, icon: List, color: "text-blue-500" },
    { title: "Órdenes Pendientes", value: pendientes, icon: CircleDashed, color: "text-amber-500" },
    { title: "Órdenes Terminadas", value: terminadas, icon: CheckCircle2, color: "text-green-500" },
    { title: "Canceladas / No Aprobadas", value: canceladas, icon: XCircle, color: "text-red-500" },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {metrics.map((metric, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{metric.title}</CardTitle>
            <metric.icon className={`h-4 w-4 text-muted-foreground ${metric.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metric.value}</div>
            <p className="text-xs text-muted-foreground">
              {`en el rango de filtros seleccionado`}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}