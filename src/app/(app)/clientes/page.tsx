import { getClients } from "@/features/clientes/clients"
import { ClientsTable } from "@/features/clientes/clients-table"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { ClientForm } from "@/features/clientes/create-client-form"
import { PlusCircle } from "lucide-react"
import { auth } from "@/features/auth"

export default async function ClientsPage() {
  const session = await auth()
  const userId = session?.user?.id || ""

  const { data: clients = [], error } = (await getClients()) || { data: [] }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Clientes</h1>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-1">
              <PlusCircle className="w-4 h-4" />
              Nuevo Cliente
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl">
            <ClientForm userId={userId} />
          </DialogContent>
        </Dialog>
      </div>

      {error ? (
        <div className="p-4 bg-red-50 text-red-500 rounded">{error}</div>
      ) : (
        <ClientsTable clients={clients} userId={userId} />
      )}
    </div>
  )
}
