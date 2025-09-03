"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent } from "@/components/ui/dialog"
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
import {
  ArrowLeft,
  Building2,
  Calendar,
  Edit,
  Mail,
  MapPin,
  Phone,
  Trash2,
  User,
  FileText,
  Wallet,
  Laptop,
  AlertCircle,
  PlusCircle,
  Globe,
  Home,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { ClientOrdersTable } from "./client-orders-table"
import { ClientPaymentsTable } from "./client-payments-table"
import { ClientAppliancesTable } from "./client-appliances-table"
import { ClientForm } from "./create-client-form"
import { ClientApplianceForm } from "./client-appliance-form"
import { deleteClient, getClientSummary } from "./clients"
import { getBrands } from "@/features/marcas/actions"
import { getApplianceTypes } from "@/features/appliance-types/actions"
import { formatCurrency } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"

interface Client {
  id: string
  name: string
  document: string | null
  phone: string | null
  phone2: string | null
  whatsapp: string | null
  email: string | null
  status: string
  address: string | null
  zoneId: string | null
  cityId: string | null
  zone: { id: string, name: string } | null
  city: { id: string, name: string } | null
  sucursal: { id: string, name: string } | null
  latitude: number | null
  longitude: number | null
  createdAt: Date | null
}

interface Brand {
  id: string
  name: string
}

interface ApplianceType {
  id: string
  name: string
}

interface ClientDetailProps {
  client: Client
  userId: string
  brands: Brand[]
  applianceTypes: ApplianceType[]
}

export function ClientDetail({ client, userId, brands, applianceTypes }: ClientDetailProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [openEditDialog, setOpenEditDialog] = useState(false)
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false)
  const [openApplianceDialog, setOpenApplianceDialog] = useState(false)
  const [activeTab, setActiveTab] = useState("info")
  const [loadingMetadata, setLoadingMetadata] = useState(false)
  const [summary, setSummary] = useState({
    totalOrders: 0,
    totalAmount: 0,
    totalPaid: 0,
    pendingAmount: 0,
    loading: true,
    error: null as string | null,
  })

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const result = await getClientSummary(client.id)

        if (result.success && result.data) {
          setSummary({
            ...result.data,
            loading: false,
            error: null,
          })
        } else {
          setSummary((prev) => ({
            ...prev,
            loading: false,
            error: result.error || "Error al cargar el resumen",
          }))
        }
      } catch (error) {
        console.error("Error fetching client summary:", error)
        setSummary((prev) => ({
          ...prev,
          loading: false,
          error: "Ocurrió un error inesperado",
        }))
      }
    }

    fetchSummary()
  }, [client.id])

  const fetchMetadata = async () => {
    try {
      setLoadingMetadata(true)
      const [brandsResult, typesResult] = await Promise.all([getBrands(), getApplianceTypes()])

      if (brandsResult.success) {
        // setBrands(brandsResult.data || [])
      }

      if (typesResult.success) {
        // setApplianceTypes(typesResult.data || [])
      }
    } catch (error) {
      console.error("Error fetching metadata:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Error al cargar marcas y tipos de electrodomésticos",
      })
    } finally {
      setLoadingMetadata(false)
    }
  }

  const handleDelete = async () => {
    try {
      const result = await deleteClient(client.id)

      if (result.success) {
        toast({
          title: "Cliente eliminado",
          description: "El cliente ha sido eliminado correctamente",
        })
        router.push("/clientes")
      } else {
        toast({
          title: "Error",
          description: result.error || "Ha ocurrido un error al eliminar el cliente",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error al eliminar cliente:", error)
      toast({
        title: "Error",
        description: "Ha ocurrido un error inesperado",
        variant: "destructive",
      })
    } finally {
      setOpenDeleteDialog(false)
    }
  }

  const handleOpenApplianceDialog = async () => {
    await fetchMetadata()
    setOpenApplianceDialog(true)
  }

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="icon"
            asChild
            className="rounded-full shadow-sm hover:shadow-md transition-all"
          >
            <Link href="/clientes">
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Volver</span>
            </Link>
          </Button>
          <h1 className="text-2xl font-bold tracking-tight">{client.name}</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setOpenEditDialog(true)}
            className="shadow-sm hover:shadow-md transition-all gap-2"
          >
            <Edit className="h-4 w-4" />
            Editar
          </Button>
          <Button
            variant="destructive"
            onClick={() => setOpenDeleteDialog(true)}
            className="shadow-sm hover:shadow-md transition-all gap-2"
          >
            <Trash2 className="h-4 w-4" />
            Eliminar
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-muted/50 p-1 rounded-xl">
          <TabsTrigger value="info" className="flex items-center gap-2 data-[state=active]:bg-background shadow-sm">
            <User className="h-4 w-4" />
            Información
          </TabsTrigger>
          <TabsTrigger value="orders" className="flex items-center gap-2 data-[state=active]:bg-background shadow-sm">
            <FileText className="h-4 w-4" />
            Órdenes
          </TabsTrigger>
          <TabsTrigger value="payments" className="flex items-center gap-2 data-[state=active]:bg-background shadow-sm">
            <Wallet className="h-4 w-4" />
            Pagos
          </TabsTrigger>
          <TabsTrigger
            value="appliances"
            className="flex items-center gap-2 data-[state=active]:bg-background shadow-sm"
            asChild
          >
            <Link href={`/clientes/${client.id}/electrodomesticos`}>
              <Laptop className="h-4 w-4" />
              Electrodomésticos
            </Link>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="info" className="space-y-6 mt-6 animate-in fade-in-50 duration-500">
          <Card className="border-0 shadow-sm hover:shadow-md transition-all duration-300">
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                Información del Cliente
              </CardTitle>
              <CardDescription>Datos personales y de contacto</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InfoItem label="Nombre" value={client.name} icon={<User className="mr-2 h-4 w-4 text-primary" />} />

                {client.document && (
                  <InfoItem
                    label="Documento"
                    value={client.document}
                    icon={<Building2 className="mr-2 h-4 w-4 text-primary" />}
                  />
                )}

                {client.phone && (
                  <InfoItem
                    label="Teléfono"
                    value={client.phone}
                    icon={<Phone className="mr-2 h-4 w-4 text-primary" />}
                  />
                )}

                {client.phone2 && (
                  <InfoItem
                    label="Teléfono Alternativo"
                    value={client.phone2}
                    icon={<Phone className="mr-2 h-4 w-4 text-primary" />}
                  />
                )}

                {client.whatsapp && (
                  <InfoItem
                    label="WhatsApp"
                    value={client.whatsapp}
                    icon={<Phone className="mr-2 h-4 w-4 text-primary" />}
                  />
                )}

                {client.email && (
                  <InfoItem label="Email" value={client.email} icon={<Mail className="mr-2 h-4 w-4 text-primary" />} />
                )}

                <InfoItem
                  label="Estado"
                  value={client.status === "active" ? "Activo" : "Inactivo"}
                  icon={<Calendar className="mr-2 h-4 w-4 text-primary" />}
                  valueClassName={
                    client.status === "active" ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                  }
                />

                {client.zone && (
                  <InfoItem
                    label="Zona"
                    value={client.zone.name}
                    icon={<Globe className="mr-2 h-4 w-4 text-primary" />}
                  />
                )}

                {client.city && (
                  <InfoItem
                    label="Ciudad"
                    value={client.city.name}
                    icon={<Home className="mr-2 h-4 w-4 text-primary" />}
                  />
                )}

                {client.sucursal && (
                  <InfoItem
                    label="Sucursal"
                    value={client.sucursal.name}
                    icon={<Building2 className="mr-2 h-4 w-4 text-primary" />}
                  />
                )}

                {client.address && (
                  <InfoItem
                    label="Dirección"
                    value={client.address}
                    icon={<MapPin className="mr-2 h-4 w-4 text-primary" />}
                    className="md:col-span-2"
                  />
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm hover:shadow-md transition-all duration-300">
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Resumen de Actividad
              </CardTitle>
              <CardDescription>Resumen de la actividad del cliente</CardDescription>
            </CardHeader>
            <CardContent>
              {summary.loading ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Skeleton className="h-32 w-full rounded-xl" />
                  <Skeleton className="h-32 w-full rounded-xl" />
                  <Skeleton className="h-32 w-full rounded-xl" />
                </div>
              ) : summary.error ? (
                <div className="flex items-center justify-center py-6 px-4 border rounded-xl bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-900/50">
                  <div className="flex flex-col items-center">
                    <AlertCircle className="h-8 w-8 text-red-500 dark:text-red-400 mb-2" />
                    <p className="text-red-500 dark:text-red-400 mb-3">{summary.error}</p>
                    <Button variant="outline" size="sm" className="shadow-sm" onClick={() => router.refresh()}>
                      Reintentar
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <ClientSummaryCard
                    title="Órdenes Totales"
                    value={summary.totalOrders.toString()}
                    icon={<FileText className="h-5 w-5" />}
                    clientId={client.id}
                  />
                  <ClientSummaryCard
                    title="Monto Total"
                    value={formatCurrency(summary.totalAmount)}
                    icon={<Wallet className="h-5 w-5" />}
                    clientId={client.id}
                  />
                  <ClientSummaryCard
                    title="Pendiente por Pagar"
                    value={formatCurrency(summary.pendingAmount)}
                    icon={<Wallet className="h-5 w-5" />}
                    clientId={client.id}
                    variant={summary.pendingAmount > 0 ? "warning" : "success"}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="orders" className="mt-6 animate-in fade-in-50 duration-500">
          <ClientOrdersTable clientId={client.id} />
        </TabsContent>

        <TabsContent value="payments" className="mt-6 animate-in fade-in-50 duration-500">
          <ClientPaymentsTable clientId={client.id} />
        </TabsContent>

        <TabsContent value="appliances" className="mt-6 animate-in fade-in-50 duration-500">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Electrodomésticos del Cliente</h2>
            <Button className="flex items-center gap-1" onClick={handleOpenApplianceDialog}>
              <PlusCircle className="w-4 h-4" />
              Agregar Electrodoméstico
            </Button>
          </div>
          <ClientAppliancesTable clientId={client.id} />
        </TabsContent>
      </Tabs>

      {/* Dialog para editar cliente */}
      <Dialog open={openEditDialog} onOpenChange={setOpenEditDialog}>
        <DialogContent className="max-w-4xl">
          <ClientForm
            mode="edit"
            initialData={client}
            userId={userId}
            onSuccess={() => {
              setOpenEditDialog(false)
              router.refresh()
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Dialog para agregar electrodoméstico */}
      <Dialog open={openApplianceDialog} onOpenChange={setOpenApplianceDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Agregar Electrodoméstico</h2>
            {loadingMetadata ? (
              <div className="space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : (
              <ClientApplianceForm
                clientId={client.id}
                userId={userId}
                brands={brands}
                applianceTypes={applianceTypes}
                onSuccess={() => {
                  setOpenApplianceDialog(false)
                  router.refresh()
                }}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Alert Dialog para eliminar cliente */}
      <AlertDialog open={openDeleteDialog} onOpenChange={setOpenDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-red-600 dark:text-red-400 flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Confirmar eliminación
            </AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará permanentemente el cliente "{client.name}". Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="shadow-sm">Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700 shadow-sm">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

// Componente para mostrar información
function InfoItem({
  label,
  value,
  icon,
  className = "",
  valueClassName = "",
}: {
  label: string
  value: string
  icon: React.ReactNode
  className?: string
  valueClassName?: string
}) {
  return (
    <div className={`space-y-1 ${className}`}>
      <div className="text-sm font-medium text-muted-foreground">{label}</div>
      <div className="flex items-center p-2 rounded-lg bg-muted/10 hover:bg-muted/20 transition-colors">
        {icon}
        <span className={valueClassName}>{value}</span>
      </div>
    </div>
  )
}

// Componente para mostrar tarjetas de resumen
function ClientSummaryCard({
  title,
  value,
  icon,
  clientId,
  variant = "default",
}: {
  title: string
  value: string
  icon: React.ReactNode
  clientId: string
  variant?: "default" | "success" | "warning" | "danger"
}) {
  const getVariantClass = () => {
    switch (variant) {
      case "success":
        return "bg-green-50 border-green-100 dark:bg-green-950/30 dark:border-green-900/50 shadow-sm hover:shadow-md hover:border-green-200 dark:hover:border-green-900"
      case "warning":
        return "bg-yellow-50 border-yellow-100 dark:bg-yellow-950/30 dark:border-yellow-900/50 shadow-sm hover:shadow-md hover:border-yellow-200 dark:hover:border-yellow-900"
      case "danger":
        return "bg-red-50 border-red-100 dark:bg-red-950/30 dark:border-red-900/50 shadow-sm hover:shadow-md hover:border-red-200 dark:hover:border-red-900"
      default:
        return "bg-card shadow-sm hover:shadow-md hover:border-muted-foreground/10"
    }
  }

  const getIconClass = () => {
    switch (variant) {
      case "success":
        return "text-green-500 dark:text-green-400 bg-green-100 dark:bg-green-900/30"
      case "warning":
        return "text-yellow-500 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/30"
      case "danger":
        return "text-red-500 dark:text-red-400 bg-red-100 dark:bg-red-900/30"
      default:
        return "text-primary bg-primary/10"
    }
  }

  return (
    <div className={`rounded-xl border p-4 ${getVariantClass()} transition-all duration-300`}>
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <div className={`rounded-full p-2 ${getIconClass()}`}>{icon}</div>
      </div>
      <p className="text-2xl font-bold mt-3">{value}</p>
    </div>
  )
}