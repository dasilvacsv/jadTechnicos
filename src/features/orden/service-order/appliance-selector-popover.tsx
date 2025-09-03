import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Check, ChevronsUpDown, Loader2, Plus } from "lucide-react"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import { SearchableCreatablePopover } from "@/components/ui/searchable-creatable-popover" // Importar el componente correcto

interface ApplianceSelectorPopoverProps {
  clientId: string
  currentApplianceId: string
  onApplianceChange: (applianceId: string) => void
  disabled?: boolean
}

interface Option {
  id: string
  name: string
}

interface NewApplianceForm {
  name: string
  brandId: string
  applianceTypeId: string
  model: string
  serialNumber: string
  notes: string
}

export function ApplianceSelectorPopover({
  clientId,
  currentApplianceId,
  onApplianceChange,
  disabled = false
}: ApplianceSelectorPopoverProps) {
  const [open, setOpen] = useState(false)
  const [appliances, setAppliances] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [searchValue, setSearchValue] = useState("")
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [brands, setBrands] = useState<Option[]>([])
  const [applianceTypes, setApplianceTypes] = useState<Option[]>([])
  const [isCreating, setIsCreating] = useState(false)
  const [newApplianceForm, setNewApplianceForm] = useState<NewApplianceForm>({
    name: '',
    brandId: '',
    applianceTypeId: '',
    model: '',
    serialNumber: '',
    notes: ''
  })
  const { toast } = useToast()

  const currentAppliance = appliances.find(app => app.id === currentApplianceId)

  useEffect(() => {
    const fetchData = async () => {
      if (!open && !showCreateDialog) return
      
      setLoading(true)
      try {
        const [appliancesRes, brandsRes, typesRes] = await Promise.all([
            fetch(`/api/clients/${clientId}/appliances`),
            fetch('/api/brands'),
            fetch('/api/appliance-types')
        ]);

        if (appliancesRes.ok) setAppliances((await appliancesRes.json()).appliances || []);
        if (brandsRes.ok) setBrands((await brandsRes.json()).brands || []);
        if (typesRes.ok) setApplianceTypes((await typesRes.json()).types || []);

      } catch (error) {
        console.error("Error fetching data:", error)
        toast({ title: "Error", description: "No se pudieron cargar los datos.", variant: "destructive" })
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [open, showCreateDialog, clientId, toast])

  const filteredAppliances = appliances.filter(appliance =>
    `${appliance.name} ${appliance.brand.name} ${appliance.applianceType.name}`
    .toLowerCase()
    .includes(searchValue.toLowerCase())
  )

  const handleCreateAppliance = async () => {
    if (!newApplianceForm.name || !newApplianceForm.brandId || !newApplianceForm.applianceTypeId) {
      toast({
        title: "Campos Requeridos",
        description: "Por favor complete nombre, marca y tipo.",
        variant: "destructive",
      })
      return
    }

    setIsCreating(true)
    try {
      const response = await fetch(`/api/clients/${clientId}/appliances`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newApplianceForm),
      })
      const result = await response.json()

      if (result.success) {
        toast({ title: "Éxito", description: "Electrodoméstico creado correctamente." })
        setAppliances(prev => [...prev, result.appliance])
        onApplianceChange(result.appliance.id)
        resetCreateForm()
        setShowCreateDialog(false)
        setOpen(false)
      } else {
        throw new Error(result.error || "Error al crear el electrodoméstico.")
      }
    } catch (error) {
      toast({ title: "Error", description: (error as Error).message, variant: "destructive" })
    } finally {
      setIsCreating(false)
    }
  }

  const resetCreateForm = () => {
    setNewApplianceForm({ name: '', brandId: '', applianceTypeId: '', model: '', serialNumber: '', notes: '' })
  }

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" role="combobox" aria-expanded={open} className="w-full justify-between" disabled={disabled}>
            {currentAppliance ? (
              <span className="truncate">
                {currentAppliance.name} - {currentAppliance.brand.name} {currentAppliance.applianceType.name}
              </span>
            ) : "Seleccionar electrodoméstico..."}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[400px] p-0">
          <Command>
            <CommandInput placeholder="Buscar electrodoméstico..." value={searchValue} onValueChange={setSearchValue} />
            <CommandList>
                <div className="px-2 py-1 border-b">
                    <Button variant="ghost" size="sm" onClick={() => setShowCreateDialog(true)} className="w-full justify-start text-sm h-8">
                        <Plus className="mr-2 h-4 w-4" />
                        Crear nuevo electrodoméstico
                    </Button>
                </div>
                <CommandEmpty>
                    {loading ? (
                        <div className="flex items-center justify-center py-6"><Loader2 className="h-6 w-6 animate-spin" /></div>
                    ) : (
                        <div className="py-6 text-center text-sm"><p>No se encontraron electrodomésticos.</p></div>
                    )}
                </CommandEmpty>
                <CommandGroup className="max-h-[200px] overflow-auto">
                {filteredAppliances.map((appliance) => (
                    <CommandItem key={appliance.id} value={`${appliance.name} ${appliance.brand.name} ${appliance.applianceType.name}`} onSelect={() => { onApplianceChange(appliance.id); setOpen(false); }}>
                    <Check className={cn("mr-2 h-4 w-4", currentApplianceId === appliance.id ? "opacity-100" : "opacity-0")} />
                    <div className="flex flex-col">
                        <span className="font-medium">{appliance.name}</span>
                        <span className="text-sm text-muted-foreground">{appliance.brand.name} - {appliance.applianceType.name}</span>
                    </div>
                    </CommandItem>
                ))}
                </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Crear Nuevo Electrodoméstico</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre *</Label>
              <Input id="name" value={newApplianceForm.name} onChange={(e) => setNewApplianceForm({ ...newApplianceForm, name: e.target.value })} placeholder="Ej: Refrigerador de la cocina" />
            </div>
            
            {/* --- COMPONENTE ACTUALIZADO PARA MARCA --- */}
            <div className="space-y-2">
              <Label htmlFor="brand">Marca *</Label>
              <SearchableCreatablePopover
                options={brands}
                value={newApplianceForm.brandId}
                onValueChange={(value) => setNewApplianceForm({ ...newApplianceForm, brandId: value })}
                onCreation={(newBrand) => setBrands(prev => [...prev, newBrand])}
                createApiEndpoint="/api/brands"
                createDialogTitle="Crear Nueva Marca"
                placeholder="Seleccionar marca"
                searchPlaceholder="Buscar o crear marca..."
              />
            </div>
            
            {/* --- COMPONENTE ACTUALIZADO PARA TIPO --- */}
            <div className="space-y-2">
              <Label htmlFor="type">Tipo *</Label>
              <SearchableCreatablePopover
                options={applianceTypes}
                value={newApplianceForm.applianceTypeId}
                onValueChange={(value) => setNewApplianceForm({ ...newApplianceForm, applianceTypeId: value })}
                onCreation={(newType) => setApplianceTypes(prev => [...prev, newType])}
                createApiEndpoint="/api/appliance-types"
                createDialogTitle="Crear Nuevo Tipo"
                placeholder="Seleccionar tipo"
                searchPlaceholder="Buscar o crear tipo..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="model">Modelo</Label>
              <Input id="model" value={newApplianceForm.model} onChange={(e) => setNewApplianceForm({ ...newApplianceForm, model: e.target.value })} placeholder="Ej: RT35K5530S8" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="serialNumber">Número de Serie</Label>
              <Input id="serialNumber" value={newApplianceForm.serialNumber} onChange={(e) => setNewApplianceForm({ ...newApplianceForm, serialNumber: e.target.value })} placeholder="Ej: SN123456789" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Notas</Label>
              <Textarea id="notes" value={newApplianceForm.notes} onChange={(e) => setNewApplianceForm({ ...newApplianceForm, notes: e.target.value })} placeholder="Información adicional..." rows={3} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)} disabled={isCreating}>Cancelar</Button>
            <Button onClick={handleCreateAppliance} disabled={isCreating}>
              {isCreating ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creando...</> : <><Plus className="mr-2 h-4 w-4" /> Crear</>}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
