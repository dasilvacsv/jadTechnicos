"use client"

import { useState, useCallback, useEffect } from "react"
import { PopoverSelect } from "@/components/popover-select"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { PlusIcon, RefreshCw, Loader2, UserPlus } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { ClientForm } from "./create-client-form"
import { getClients, createClient } from "./clients"
import { Client } from "@/lib/types"
import { SearchableSelect } from "@/components/searchable-select"

interface ClientSelectProps {
  selectedClientId: string
  onClientSelect: (clientId: string, client: Client) => void
  className?: string
}

// Convert DB client to Client type
const convertToClient = (dbClient: any): Client => {
  return {
    ...dbClient,
    createdAt: dbClient.createdAt ? dbClient.createdAt.toString() : null,
    updatedAt: dbClient.updatedAt ? dbClient.updatedAt.toString() : null,
  }
}

export function ClientSelect({
  selectedClientId,
  onClientSelect,
  className
}: ClientSelectProps) {
  const { toast } = useToast()
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(false)
  const [showAddDialog, setShowAddDialog] = useState(false)

  // Refresh clients
  const refreshClients = useCallback(async () => {
    setLoading(true)
    try {
      const result = await getClients()
      if (result.data) {
        // Convert DB clients to Client type
        const convertedClients = result.data.map(convertToClient)
        setClients(convertedClients)
        
        // If a new client was added, it's likely the last one in the list
        if (convertedClients.length > 0 && convertedClients.length > clients.length) {
          const newClient = convertedClients[convertedClients.length - 1]
          onClientSelect(newClient.id, newClient)
        }
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to fetch clients",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error("Failed to load clients:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load clients"
      })
    } finally {
      setLoading(false)
    }
  }, [clients.length, onClientSelect, toast])

  // Load clients on initial render
  useEffect(() => {
    refreshClients()
  }, [refreshClients])

  // Handle client selection
  const handleClientChange = (value: string) => {
    const selectedClient = clients.find(client => client.id === value)
    if (selectedClient) {
      onClientSelect(value, selectedClient)
    }
  }

  // Handle client creation
  const handleClientSubmit = async (formData: any) => {
    try {
      await createClient(formData)
      await refreshClients()
      setShowAddDialog(false)
      toast({
        title: "Cliente creado",
        description: "El cliente ha sido creado correctamente"
      })
    } catch (error) {
      console.error("Error creating client:", error)
      throw error
    }
  }

  return (
    <>
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <ClientForm 
            closeDialog={() => setShowAddDialog(false)} 
            mode="create"
            onSubmit={handleClientSubmit}
            userId=""
          />
        </DialogContent>
      </Dialog>

      <div className="space-y-2">
        <label className="text-sm font-medium text-muted-foreground">
          Seleccionar Cliente
        </label>
        <div className="flex items-end gap-2">
          <div className="flex-1">
            <SearchableSelect
              options={clients.map(client => ({
                label: `${client.name}${client.phone ? ` - ${client.phone}` : ''}${client.document ? ` (${client.document})` : ''}`,
                value: client.id
              }))}
              value={selectedClientId}
              onValueChange={handleClientChange}
              placeholder={loading ? "Cargando clientes..." : "Seleccionar cliente"}
              disabled={loading}
              emptyMessage="No se encontraron clientes"
              loading={loading}
              onRefresh={refreshClients}
              className={`w-full border rounded-lg ${className}`}
            />
          </div>
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={refreshClients}
            disabled={loading}
            className="h-10 w-10 rounded-lg border-muted-foreground/30 hover:border-muted-foreground/50 transition-all shadow-sm"
            title="Recargar clientes"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => setShowAddDialog(true)}
            className="h-10 w-10 rounded-lg bg-primary/10 hover:bg-primary/20 border-primary/30 hover:border-primary/50 transition-all shadow-sm"
            title="Agregar nuevo cliente"
          >
            <UserPlus className="h-4 w-4 text-primary" />
          </Button>
        </div>
        {loading && (
          <p className="text-xs text-muted-foreground animate-pulse">
            Cargando clientes...
          </p>
        )}
      </div>
    </>
  )
}