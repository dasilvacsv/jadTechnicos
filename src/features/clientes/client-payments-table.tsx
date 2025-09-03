"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { formatCurrency, formatDate } from "@/lib/utils"
import { getClientPayments } from "./clients"
import { Skeleton } from "@/components/ui/skeleton"
import { AlertCircle, RefreshCw, DollarSign, CreditCard, Info } from "lucide-react"

interface Payment {
  id: string
  amount: string | number
  paymentDate: Date
  paymentMethod: string
  reference: string | null
  notes: string | null
  serviceOrder: {
    id: string
    orderNumber: string
  }
}

interface ClientPaymentsTableProps {
  clientId: string
}

export function ClientPaymentsTable({ clientId }: ClientPaymentsTableProps) {
  const router = useRouter()
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [totalPaid, setTotalPaid] = useState(0)

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        setLoading(true)
        const result = await getClientPayments(clientId)

        if (result.success) {
          setPayments(result.data || [])

          // Calcular el total pagado
          const total = result.data.reduce((sum, payment) => {
            return sum + Number(payment.amount)
          }, 0)

          setTotalPaid(total)
        } else {
          setError(result.error || "Error al cargar los pagos")
        }
      } catch (error) {
        console.error("Error fetching client payments:", error)
        setError("Ocurrió un error inesperado")
      } finally {
        setLoading(false)
      }
    }

    fetchPayments()
  }, [clientId])

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
          className="shadow-sm flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Reintentar
        </Button>
      </div>
    )
  }

  if (payments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 px-4 border rounded-xl bg-muted/30">
        <div className="rounded-full bg-muted p-4 mb-4">
          <DollarSign className="h-8 w-8 text-muted-foreground" />
        </div>
        <p className="text-muted-foreground mb-2 text-center">Este cliente no tiene pagos registrados</p>
      </div>
    )
  }

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case "CASH":
        return <DollarSign className="h-4 w-4 text-green-500 dark:text-green-400" />
      case "CREDIT_CARD":
      case "DEBIT_CARD":
        return <CreditCard className="h-4 w-4 text-blue-500 dark:text-blue-400" />
      default:
        return <DollarSign className="h-4 w-4 text-muted-foreground" />
    }
  }

  const getPaymentMethodText = (method: string) => {
    switch (method) {
      case "CASH":
        return "Efectivo"
      case "CREDIT_CARD":
        return "Tarjeta de Crédito"
      case "DEBIT_CARD":
        return "Tarjeta de Débito"
      case "TRANSFER":
        return "Transferencia"
      case "MOBILE_PAYMENT":
        return "Pago Móvil"
      default:
        return method
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium flex items-center gap-2">
          <DollarSign className="h-5 w-5 text-primary" />
          Historial de Pagos
        </h3>
        <div className="bg-green-50 text-green-800 dark:bg-green-900/30 dark:text-green-300 px-4 py-2 rounded-lg shadow-sm flex items-center gap-2">
          <DollarSign className="h-4 w-4" />
          <span className="font-medium">Total Pagado:</span> 
          <span className="font-bold">{formatCurrency(totalPaid)}</span>
        </div>
      </div>

      <div className="rounded-xl border shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/30">
            <TableRow>
              <TableHead>Orden</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead>Método</TableHead>
              <TableHead>Referencia</TableHead>
              <TableHead>Monto</TableHead>
              <TableHead>Notas</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {payments.map((payment, index) => (
              <TableRow 
                key={payment.id}
                className={index % 2 === 0 ? "bg-transparent hover:bg-muted/5" : "bg-muted/5 hover:bg-muted/10"}
              >
                <TableCell className="font-medium">
                  <Button
                    variant="link"
                    className="p-0 h-auto text-primary hover:text-primary/80 transition-colors"
                    onClick={() => router.push(`/ordenes/${payment.serviceOrder.id}`)}
                  >
                    {payment.serviceOrder.orderNumber}
                  </Button>
                </TableCell>
                <TableCell>{formatDate(payment.paymentDate)}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {getPaymentMethodIcon(payment.paymentMethod)}
                    <span>{getPaymentMethodText(payment.paymentMethod)}</span>
                  </div>
                </TableCell>
                <TableCell>
                  {payment.reference || (
                    <span className="text-muted-foreground text-sm italic">N/A</span>
                  )}
                </TableCell>
                <TableCell className="font-medium">{formatCurrency(Number(payment.amount) || 0)}</TableCell>
                <TableCell>
                  {payment.notes ? (
                    <div className="flex items-center gap-1 max-w-[200px] overflow-hidden">
                      <Info className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                      <span className="truncate text-sm">{payment.notes}</span>
                    </div>
                  ) : (
                    <span className="text-muted-foreground text-sm italic">N/A</span>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}