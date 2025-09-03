"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { ClientAppliancesTable } from "./client-appliances-table"
import { ClientApplianceForm } from "./client-appliance-form"
import { ArrowLeft, PlusCircle, Laptop, ArrowRight } from "lucide-react"
import { getBrands } from "@/features/brands/actions"
import { getApplianceTypes } from "@/features/appliance-types/actions"

interface Client {
  id: string
  name: string
  document: string | null
  phone: string | null
  email: string | null
  status: string
  address: string | null
}

interface Brand {
  id: string
  name: string
}

interface ApplianceType {
  id: string
  name: string
}

interface ClientAppliancesManagerProps {
  client: Client
  userId: string
  brands: Brand[]
  applianceTypes: ApplianceType[]
}

export function ClientAppliancesManager({
  client,
  userId,
  brands: initialBrands,
  applianceTypes: initialTypes,
}: ClientAppliancesManagerProps) {
  const router = useRouter()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [brands, setBrands] = useState<Brand[]>(initialBrands)
  const [applianceTypes, setApplianceTypes] = useState<ApplianceType[]>(initialTypes)
  const [appliances, setAppliances] = useState<any[]>([])
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  const handleApplianceAdded = (newAppliance: any) => {
    // Add the new appliance to the state
    setAppliances((prev) => [newAppliance, ...prev])
    // Close the dialog
    setIsDialogOpen(false)
    // Trigger a refresh
    setRefreshTrigger((prev) => prev + 1)
  }

  const handleCreateOrder = () => {
    router.push("/orden")
  }

  const handleBrandCreated = (newBrand: Brand) => {
    setBrands((prev) => [...prev, newBrand])
  }

  const handleApplianceTypeCreated = (newType: ApplianceType) => {
    setApplianceTypes((prev) => [...prev, newType])
  }

  // Refresh brands and appliance types when dialog opens
  const handleDialogOpenChange = async (open: boolean) => {
    if (open) {
      try {
        const [brandsResult, typesResult] = await Promise.all([getBrands(), getApplianceTypes()])

        if (brandsResult.success) {
          setBrands(brandsResult.data)
        }

        if (typesResult.success) {
          setApplianceTypes(typesResult.data)
        }
      } catch (error) {
        console.error("Error fetching data:", error)
      }
    }

    setIsDialogOpen(open)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="icon"
            asChild
            className="rounded-full shadow-sm hover:shadow-md transition-all"
          >
            <Link href={`/clientes/${client.id}`}>
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Volver</span>
            </Link>
          </Button>
          <h1 className="text-2xl font-bold tracking-tight">Electrodomésticos de {client.name}</h1>
        </div>
        <div className="flex items-center gap-2">
          <Dialog open={isDialogOpen} onOpenChange={handleDialogOpenChange}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-1">
                <PlusCircle className="w-4 h-4" />
                Agregar Electrodoméstico
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <div className="space-y-4">
                <h2 className="text-xl font-semibold">Agregar Electrodoméstico</h2>
                <ClientApplianceForm
                  clientId={client.id}
                  userId={userId}
                  brands={brands}
                  applianceTypes={applianceTypes}
                  onSuccess={() => setIsDialogOpen(false)}
                  onBrandCreated={handleBrandCreated}
                  onApplianceTypeCreated={handleApplianceTypeCreated}
                  onApplianceAdded={handleApplianceAdded}
                />
              </div>
            </DialogContent>
          </Dialog>

          <Button variant="outline" className="flex items-center gap-1" onClick={handleCreateOrder}>
            <ArrowRight className="w-4 h-4" />
            Crear Orden
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Laptop className="h-5 w-5 text-primary" />
            Electrodomésticos Registrados
          </CardTitle>
          <CardDescription>Administre los electrodomésticos asociados a este cliente</CardDescription>
        </CardHeader>
        <CardContent>
          <ClientAppliancesTable
            clientId={client.id}
            refreshTrigger={refreshTrigger}
            initialAppliances={appliances.length > 0 ? appliances : undefined}
          />
        </CardContent>
      </Card>
    </div>
  )
}
