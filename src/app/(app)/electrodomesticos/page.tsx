import { getAppliances } from "@/features/appliances/actions"
import { getBrands } from "@/features/marcas/actions"
import { getApplianceTypes } from "@/features/appliance-types/actions"
import { AppliancesTable } from "@/features/appliances/appliances-table"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { ApplianceDialogForm } from "@/features/appliances/appliance-dialog-form"
import { PlusCircle } from "lucide-react"
import { auth } from "@/features/auth"

export default async function AppliancesPage() {
  const session = await auth()
  const userId = session?.user?.id || ""

  const { data: appliances = [], error } = (await getAppliances()) || { data: [] }
  const { data: brands = [] } = (await getBrands()) || { data: [] }
  const { data: applianceTypes = [] } = (await getApplianceTypes()) || { data: [] }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Electrodomésticos</h1>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-1">
              <PlusCircle className="w-4 h-4" />
              Nuevo Electrodoméstico
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl">
            <ApplianceDialogForm userId={userId} initialBrands={brands} initialApplianceTypes={applianceTypes} />
          </DialogContent>
        </Dialog>
      </div>

      {error ? (
        <div className="p-4 bg-red-50 text-red-500 rounded">{error}</div>
      ) : (
        <AppliancesTable appliances={appliances} userId={userId} brands={brands} applianceTypes={applianceTypes} />
      )}
    </div>
  )
}
