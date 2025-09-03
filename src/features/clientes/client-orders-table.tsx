"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Eye, MoreHorizontal, Printer, Truck, AlertCircle } from "lucide-react"
import { formatCurrency, formatDate } from "@/lib/utils"
import { getClientOrders } from "./clients"
import { Skeleton } from "@/components/ui/skeleton"

interface ServiceOrder {
  id: string
  orderNumber: string
  status: string
  receivedDate: Date
  totalAmount: string | number
  paymentStatus: string
  appliance: {
    name: string
    brand: {
      name: string
    }
    applianceType: {
      name: string
    }
  }
  technicianAssignments: Array<{
    technician: {
      name: string
    }
  }>
}

interface ClientOrdersTableProps {
  clientId: string
}

export function ClientOrdersTable({ clientId }: ClientOrdersTableProps) {
  const router = useRouter()
  const [orders, setOrders] = useState<ServiceOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true)
        const result = await getClientOrders(clientId)

        if (result.success) {
          setOrders(result.data || [])
        } else {
          setError(result.error || "Error al cargar las órdenes")
        }
      } catch (error) {
        console.error("Error fetching client orders:", error)
        setError("Ocurrió un error inesperado")
      } finally {
        setLoading(false)
      }
    }

    fetchOrders()
  }, [clientId])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-200 dark:bg-yellow-900/50 dark:text-yellow-300 dark:hover:bg-yellow-900/80"
      case "ASSIGNED":
        return "bg-blue-100 text-blue-800 hover:bg-blue-200 dark:bg-blue-900/50 dark:text-blue-300 dark:hover:bg-blue-900/80"
      case "IN_PROGRESS":
        return "bg-purple-100 text-purple-800 hover:bg-purple-200 dark:bg-purple-900/50 dark:text-purple-300 dark:hover:bg-purple-900/80"
      case "COMPLETED":
        return "bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900/50 dark:text-green-300 dark:hover:bg-green-900/80"
      case "DELIVERED":
        return "bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-gray-800/50 dark:text-gray-300 dark:hover:bg-gray-800/80"
      case "CANCELLED":
        return "bg-red-100 text-red-800 hover:bg-red-200 dark:bg-red-900/50 dark:text-red-300 dark:hover:bg-red-900/80"
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-gray-800/50 dark:text-gray-300 dark:hover:bg-gray-800/80"
    }
  }

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case "PAID":
        return "bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900/50 dark:text-green-300 dark:hover:bg-green-900/80"
      case "PARTIAL":
        return "bg-blue-100 text-blue-800 hover:bg-blue-200 dark:bg-blue-900/50 dark:text-blue-300 dark:hover:bg-blue-900/80"
      case "PENDING":
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-200 dark:bg-yellow-900/50 dark:text-yellow-300 dark:hover:bg-yellow-900/80"
      case "CANCELLED":
        return "bg-red-100 text-red-800 hover:bg-red-200 dark:bg-red-900/50 dark:text-red-300 dark:hover:bg-red-900/80"
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-gray-800/50 dark:text-gray-300 dark:hover:bg-gray-800/80"
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
      default:
        return status
    }
  }

  const getPaymentStatusText = (status: string) => {
    switch (status) {
      case "PAID":
        return "Pagado"
      case "PARTIAL":
        return "Parcial"
      case "PENDING":
        return "Pendiente"
      case "CANCELLED":
        return "Cancelado"
      default:
        return status
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-[400px] w-full rounded-xl" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-10 px-4 border rounded-xl bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-900/30">
        <AlertCircle className="h-8 w-8 text-red-500 dark:text-red-400 mb-2" />
        <p className="text-red-500 dark:text-red-400 mb-4">{error}</p>
        <Button 
          onClick={() => router.refresh()}
          variant="outline"
          className="shadow-sm"
        >
          Reintentar
        </Button>
      </div>
    )
  }

  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 px-4 border rounded-xl bg-muted/30">
        <div className="rounded-full bg-muted p-4 mb-4">
          <Eye className="h-8 w-8 text-muted-foreground" />
        </div>
        <p className="text-muted-foreground mb-4 text-center">Este cliente no tiene órdenes de servicio</p>
        <Button 
          asChild
          className="bg-primary hover:bg-primary/90 transition-colors shadow-sm"
        >
          <Link href="/orden">Crear orden para este cliente</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="rounded-xl border shadow-sm overflow-hidden">
      <Table>
        <TableHeader className="bg-muted/30">
          <TableRow>
            <TableHead>Número</TableHead>
            <TableHead>Electrodoméstico</TableHead>
            <TableHead>Técnico</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Pago</TableHead>
            <TableHead>Monto</TableHead>
            <TableHead>Fecha</TableHead>
            <TableHead className="w-[80px]">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order, index) => (
            <TableRow 
              key={order.id}
              className={index % 2 === 0 ? "bg-transparent hover:bg-muted/5" : "bg-muted/5 hover:bg-muted/10"}
            >
              <TableCell className="font-medium">
                <Link href={`/ordenes/${order.id}`} className="hover:underline text-primary">
                  {order.orderNumber}
                </Link>
              </TableCell>
              <TableCell>
                <div className="flex flex-col">
                  <span>{order.appliance.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {order.appliance.brand.name} - {order.appliance.applianceType.name}
                  </span>
                </div>
              </TableCell>
              <TableCell>
                {order.technicianAssignments.length > 0
                  ? order.technicianAssignments[0].technician.name
                  : <span className="text-muted-foreground text-sm italic">Sin asignar</span>}
              </TableCell>
              <TableCell>
                <Badge 
                  variant="outline" 
                  className={`${getStatusColor(order.status)} border-0 font-medium transition-colors min-w-[100px] justify-center shadow-sm`}
                >
                  {getStatusText(order.status)}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge
                  variant="outline"
                  className={`${getPaymentStatusColor(order.paymentStatus)} border-0 font-medium transition-colors min-w-[80px] justify-center shadow-sm`}
                >
                  {getPaymentStatusText(order.paymentStatus)}
                </Badge>
              </TableCell>
              <TableCell className="font-medium">{formatCurrency(Number(order.totalAmount) || 0)}</TableCell>
              <TableCell>{formatDate(order.receivedDate)}</TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      className="h-8 w-8 rounded-full hover:bg-muted/20"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                      <span className="sr-only">Menú</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-[160px]">
                    <DropdownMenuItem 
                      onClick={() => router.push(`/ordenes/${order.id}`)}
                      className="cursor-pointer"
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      Ver detalles
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => router.push(`/ordenes/${order.id}/print`)}
                      className="cursor-pointer"
                    >
                      <Printer className="mr-2 h-4 w-4" />
                      Imprimir
                    </DropdownMenuItem>
                    {order.status === "COMPLETED" && (
                      <DropdownMenuItem 
                        onClick={() => router.push(`/ordenes/${order.id}/delivery`)}
                        className="cursor-pointer"
                      >
                        <Truck className="mr-2 h-4 w-4" />
                        Crear nota de entrega
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}