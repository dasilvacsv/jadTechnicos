"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import {
  getClientAppliances,
  removeClientAppliance,
  getApplianceDetails,
  createOrderFromAppliance,
} from "./client-appliances-actions"
import { Skeleton } from "@/components/ui/skeleton"
import { Laptop, Trash2, AlertCircle, ChevronDown, ChevronUp, ClipboardList, Loader2 } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useToast } from "@/hooks/use-toast"
import { ClientApplianceDetails } from "./client-appliance-details"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"

interface ClientAppliancesTableProps {
  clientId: string
  refreshTrigger?: number
  initialAppliances?: any[]
}

interface CreateOrderDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (data: { isOrder: boolean; falla: string }) => Promise<void>
  isLoading: boolean
}

function CreateOrderDialog({ open, onOpenChange, onConfirm, isLoading }: CreateOrderDialogProps) {
  const [isOrder, setIsOrder] = useState(true)
  const [falla, setFalla] = useState("")

  const handleConfirm = async () => {
    await onConfirm({ isOrder, falla })
    setFalla("")
    setIsOrder(true)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Crear nueva orden</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="flex items-center justify-between space-x-2">
            <Label htmlFor="order-type">Tipo de orden</Label>
            <div className="flex items-center space-x-2">
              <span className={!isOrder ? "text-primary" : "text-muted-foreground"}>Pre-orden</span>
              <Switch
                id="order-type"
                checked={isOrder}
                onCheckedChange={setIsOrder}
              />
              <span className={isOrder ? "text-primary" : "text-muted-foreground"}>Orden</span>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="falla">Descripción de la falla</Label>
            <Textarea
              id="falla"
              placeholder="Describa la falla del electrodoméstico..."
              value={falla}
              onChange={(e) => setFalla(e.target.value)}
              className="min-h-[100px]"
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isLoading || !falla.trim()}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creando...
              </>
            ) : (
              'Crear orden'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function ClientAppliancesTable({ clientId, refreshTrigger = 0, initialAppliances }: ClientAppliancesTableProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [appliances, setAppliances] = useState<any[]>(initialAppliances || [])
  const [loading, setLoading] = useState(!initialAppliances)
  const [error, setError] = useState<string | null>(null)
  const [applianceToDelete, setApplianceToDelete] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [expandedApplianceId, setExpandedApplianceId] = useState<string | null>(null)
  const [applianceDetails, setApplianceDetails] = useState<any | null>(null)
  const [loadingDetails, setLoadingDetails] = useState(false)
  const [creatingOrder, setCreatingOrder] = useState<string | null>(null)
  const [createOrderDialogOpen, setCreateOrderDialogOpen] = useState(false)
  const [selectedApplianceId, setSelectedApplianceId] = useState<string | null>(null)

  const fetchAppliances = async () => {
    try {
      setLoading(true)
      const result = await getClientAppliances(clientId)

      if (result.success) {
        setAppliances(result.data || [])
      } else {
        setError(result.error || "Error al cargar los electrodomésticos")
      }
    } catch (error) {
      console.error("Error fetching client appliances:", error)
      setError("Ocurrió un error inesperado")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!initialAppliances || initialAppliances.length === 0) {
      fetchAppliances()
    }
  }, [clientId, initialAppliances])

  // Refresh when the trigger changes
  useEffect(() => {
    if (refreshTrigger > 0) {
      fetchAppliances()
    }
  }, [refreshTrigger])

  const handleDeleteAppliance = async () => {
    if (!applianceToDelete) return

    setIsDeleting(true)
    try {
      const result = await removeClientAppliance(clientId, applianceToDelete)

      if (result.success) {
        toast({
          title: "Electrodoméstico eliminado",
          description: "El electrodoméstico ha sido eliminado exitosamente",
        })
        fetchAppliances()
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: result.error || "Error al eliminar el electrodoméstico",
        })
      }
    } catch (error) {
      console.error("Error deleting appliance:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Ocurrió un error inesperado",
      })
    } finally {
      setIsDeleting(false)
      setApplianceToDelete(null)
    }
  }

  const handleToggleDetails = async (applianceId: string) => {
    if (expandedApplianceId === applianceId) {
      // If already expanded, collapse it
      setExpandedApplianceId(null)
      setApplianceDetails(null)
      return
    }

    // Otherwise, expand it and fetch details
    setExpandedApplianceId(applianceId)
    setLoadingDetails(true)

    try {
      const result = await getApplianceDetails(clientId, applianceId)

      if (result.success) {
        setApplianceDetails(result.data)
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: result.error || "Error al cargar los detalles del electrodoméstico",
        })
      }
    } catch (error) {
      console.error("Error fetching appliance details:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Ocurrió un error inesperado al cargar los detalles",
      })
    } finally {
      setLoadingDetails(false)
    }
  }

  const handleCreateOrderClick = (applianceId: string) => {
    setSelectedApplianceId(applianceId)
    setCreateOrderDialogOpen(true)
  }

  const handleCreateOrderConfirm = async ({ isOrder, falla }: { isOrder: boolean; falla: string }) => {
    if (!selectedApplianceId) return

    setCreatingOrder(selectedApplianceId)

    try {
      const result = await createOrderFromAppliance(clientId, selectedApplianceId, {
        status: isOrder ? "PENDING" : "PREORDER",
        falla,
      })

      if (result.success && result.data) {
        toast({
          title: isOrder ? "Orden creada" : "Pre-orden creada",
          description: `La ${isOrder ? "orden" : "pre-orden"} ha sido creada exitosamente`,
        })
        router.push(`/ordenes/${result.data.id}`)
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: result.error || `Error al crear la ${isOrder ? "orden" : "pre-orden"}`,
        })
      }
    } catch (error) {
      console.error("Error creating order:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Ocurrió un error inesperado al crear la orden",
      })
    } finally {
      setCreatingOrder(null)
      setCreateOrderDialogOpen(false)
      setSelectedApplianceId(null)
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
        <p className="text-red-500 dark:text-red-400 mb-4 flex items-center gap-2">
          <AlertCircle className="h-5 w-5" /> {error}
        </p>
        <Button onClick={() => fetchAppliances()} variant="outline" className="shadow-sm">
          Reintentar
        </Button>
      </div>
    )
  }

  if (appliances.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 px-4 border rounded-xl bg-muted/30">
        <div className="rounded-full bg-muted p-4 mb-4">
          <Laptop className="h-8 w-8 text-muted-foreground" />
        </div>
        <p className="text-muted-foreground mb-4 text-center">Este cliente no tiene electrodomésticos registrados</p>
      </div>
    )
  }

  return (
    <>
      <div className="rounded-xl border shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/30">
            <TableRow>
              <TableHead className="w-10"></TableHead>
              <TableHead>Marca</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Modelo</TableHead>
              <TableHead>Número de Serie</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {appliances.map((appliance, index) => (
              <>
                <TableRow key={appliance.id} className={index % 2 === 0 ? "bg-transparent" : "bg-muted/5"}>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => handleToggleDetails(appliance.id)}
                    >
                      {expandedApplianceId === appliance.id ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </Button>
                  </TableCell>
                  <TableCell>{appliance.brand?.name || "N/A"}</TableCell>
                  <TableCell>{appliance.applianceType?.name || "N/A"}</TableCell>
                  <TableCell>{appliance.model || "N/A"}</TableCell>
                  <TableCell>{appliance.serialNumber || "N/A"}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCreateOrderClick(appliance.id)}
                        disabled={creatingOrder === appliance.id}
                        className="bg-transparent hover:bg-blue-50 dark:hover:bg-blue-900/10 border-muted-foreground/30 hover:border-blue-300 dark:hover:border-blue-700 hover:text-blue-500 transition-colors"
                      >
                        {creatingOrder === appliance.id ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <ClipboardList className="h-3.5 w-3.5" />
                        )}
                        <span className="sr-only">Crear orden</span>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setApplianceToDelete(appliance.id)}
                        className="bg-transparent hover:bg-red-50 dark:hover:bg-red-900/10 border-muted-foreground/30 hover:border-red-300 dark:hover:border-red-700 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        <span className="sr-only">Eliminar</span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
                {expandedApplianceId === appliance.id && (
                  <TableRow>
                    <TableCell colSpan={6} className="p-0 border-t-0">
                      <div className="bg-muted/10 p-4 border-t">
                        {loadingDetails ? (
                          <div className="py-4 flex justify-center">
                            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                          </div>
                        ) : applianceDetails ? (
                          <ClientApplianceDetails
                            appliance={applianceDetails.appliance}
                            orders={applianceDetails.orders}
                          />
                        ) : (
                          <div className="py-4 text-center text-muted-foreground">
                            No se pudieron cargar los detalles
                          </div>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </>
            ))}
          </TableBody>
        </Table>
      </div>

      <CreateOrderDialog
        open={createOrderDialogOpen}
        onOpenChange={setCreateOrderDialogOpen}
        onConfirm={handleCreateOrderConfirm}
        isLoading={!!creatingOrder}
      />

      <AlertDialog open={!!applianceToDelete} onOpenChange={(open) => !open && setApplianceToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará el electrodoméstico de este cliente. Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAppliance}
              disabled={isDeleting}
              className="bg-red-500 hover:bg-red-600 focus:ring-red-500"
            >
              {isDeleting ? "Eliminando..." : "Eliminar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
