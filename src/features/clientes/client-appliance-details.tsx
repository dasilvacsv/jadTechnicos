import { formatDate } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Calendar, FileText, Tag, Settings, ExternalLink } from "lucide-react"

interface ClientApplianceDetailsProps {
  appliance: any
  orders: any[]
}

export function ClientApplianceDetails({ appliance, orders }: ClientApplianceDetailsProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"
      case "ASSIGNED":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
      case "IN_PROGRESS":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300"
      case "COMPLETED":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
      case "DELIVERED":
        return "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300"
      case "CANCELLED":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
      case "APROBADO":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
      case "NO_APROBADO":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
      case "PENDIENTE_AVISAR":
        return "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300"
      case "FACTURADO":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300"
      case "ENTREGA_GENERADA":
        return "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "PENDING":
        return "Pendiente"
      case "ASSIGNED":
        return "Asignada"
      case "IN_PROGRESS":
        return "En Progreso"
      case "COMPLETED":
        return "Completada"
      case "DELIVERED":
        return "Entregada"
      case "CANCELLED":
        return "Cancelada"
      case "APROBADO":
        return "Aprobada"
      case "NO_APROBADO":
        return "No Aprobada"
      case "PENDIENTE_AVISAR":
        return "Pendiente Avisar"
      case "FACTURADO":
        return "Facturada"
      case "ENTREGA_GENERADA":
        return "Entrega Generada"
      default:
        return status
    }
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">Detalles del Electrodoméstico</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div>
              <h3 className="font-medium text-muted-foreground">Marca</h3>
              <div className="flex items-center gap-2">
                <Tag className="h-4 w-4 text-primary" />
                <p>{appliance.brand?.name || "N/A"}</p>
              </div>
            </div>

            <div>
              <h3 className="font-medium text-muted-foreground">Tipo</h3>
              <div className="flex items-center gap-2">
                <Settings className="h-4 w-4 text-primary" />
                <p>{appliance.applianceType?.name || "N/A"}</p>
              </div>
            </div>

            <div>
              <h3 className="font-medium text-muted-foreground">Modelo</h3>
              <p>{appliance.model || "N/A"}</p>
            </div>

            <div>
              <h3 className="font-medium text-muted-foreground">Número de Serie</h3>
              <p className="font-mono text-xs">{appliance.serialNumber || "N/A"}</p>
            </div>

            <div>
              <h3 className="font-medium text-muted-foreground">Fecha de Registro</h3>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary" />
                <p>{formatDate(appliance.createdAt)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">Historial de Órdenes</CardTitle>
          </CardHeader>
          <CardContent>
            {orders && orders.length > 0 ? (
              <div className="space-y-3">
                {orders.map((order) => (
                  <div key={order.id} className="border rounded-md p-3 hover:bg-muted/20 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-medium flex items-center gap-2">
                          <FileText className="h-4 w-4 text-primary" />
                          Orden #{order.orderNumber}
                        </h4>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(order.receivedDate || order.createdAt)}
                        </p>
                      </div>
                      <Badge variant="outline" className={getStatusColor(order.status)}>
                        {getStatusText(order.status)}
                      </Badge>
                    </div>

                    {order.description && (
                      <div className="mt-2 text-xs">
                        <p className="text-muted-foreground font-medium">Descripción:</p>
                        <p className="line-clamp-2">{order.description}</p>
                      </div>
                    )}

                    <div className="mt-2 flex justify-end">
                      <Button variant="ghost" size="sm" asChild className="h-7 text-xs">
                        <Link href={`/ordenes/${order.id}`}>
                          <ExternalLink className="h-3.5 w-3.5 mr-1" />
                          Ver detalles
                        </Link>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-6 text-center text-muted-foreground">
                <FileText className="h-10 w-10 mx-auto mb-2 opacity-20" />
                <p>No hay órdenes registradas para este electrodoméstico</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
