import React, { useState } from "react"
import { Card, CardHeader, CardContent, CardFooter, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Laptop, MonitorSmartphone, Settings, Tag, Edit2, Loader2, Save, X, FileText, AlertTriangle } from "lucide-react"
import { ApplianceSelectorPopover } from "./appliance-selector-popover"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { SearchableCreatablePopover } from "@/components/ui/searchable-creatable-popover" // Importar el nuevo componente

interface ApplianceInfoCardProps {
  appliances: any[]
  onViewDetails?: () => void
  serviceOrderId: string
  userId: string
  clientId: string
}

interface Brand {
  id: string
  name: string
}

interface ApplianceType {
  id: string
  name: string
}

export function ApplianceInfoCard({ appliances, onViewDetails, serviceOrderId, userId, clientId }: ApplianceInfoCardProps) {
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [selectedApplianceIndex, setSelectedApplianceIndex] = useState(0)
  const [isUpdating, setIsUpdating] = useState(false)
  const [editingField, setEditingField] = useState<string | null>(null)
  const [editingAppliance, setEditingAppliance] = useState<number | null>(null)
  const [editValues, setEditValues] = useState<any>({})
  const [isUpdatingField, setIsUpdatingField] = useState(false)
  const [brands, setBrands] = useState<Brand[]>([])
  const [applianceTypes, setApplianceTypes] = useState<ApplianceType[]>([])
  const { toast } = useToast()
  const router = useRouter()

  const handleEditAppliance = (index: number) => {
    setSelectedApplianceIndex(index)
    setShowEditDialog(true)
  }

  const handleApplianceChange = async (newApplianceId: string) => {
    setIsUpdating(true)
    try {
      const response = await fetch(`/api/service-orders/${serviceOrderId}/appliances`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          applianceIndex: selectedApplianceIndex,
          newApplianceId,
          userId
        }),
      })
      const result = await response.json()
      if (result.success) {
        toast({ title: "Éxito", description: "Electrodoméstico actualizado correctamente." })
        setShowEditDialog(false)
        router.refresh()
      } else {
        throw new Error(result.error || "Error al actualizar el electrodoméstico.")
      }
    } catch (error) {
      toast({ title: "Error", description: (error as Error).message, variant: "destructive" })
    } finally {
      setIsUpdating(false)
    }
  }

  const startEditing = async (field: string, applianceIndex: number, currentValue: any) => {
    setEditingField(field)
    setEditingAppliance(applianceIndex)
    setEditValues({ [field]: currentValue || '' })

    if (field === 'brandId' || field === 'applianceTypeId') {
      try {
        if (brands.length === 0) {
            const brandsResponse = await fetch('/api/brands')
            if (brandsResponse.ok) setBrands((await brandsResponse.json()).brands || [])
        }
        if (applianceTypes.length === 0) {
            const typesResponse = await fetch('/api/appliance-types')
            if (typesResponse.ok) setApplianceTypes((await typesResponse.json()).types || [])
        }
      } catch (error) {
        console.error("Error loading brands/types:", error)
        toast({ title: "Error", description: "No se pudieron cargar las marcas o tipos." })
      }
    }
  }

  const cancelEditing = () => {
    setEditingField(null)
    setEditingAppliance(null)
    setEditValues({})
  }

  const saveField = async (field: string, applianceIndex: number) => {
    setIsUpdatingField(true)
    try {
      const currentAppliance = appliances[applianceIndex]
      const response = await fetch(`/api/service-orders/${serviceOrderId}/appliances`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          applianceIndex,
          field,
          value: editValues[field],
          userId,
          serviceOrderApplianceId: currentAppliance.id
        }),
      })
      const result = await response.json()
      if (result.success) {
        toast({ title: "Éxito", description: "Campo actualizado correctamente." })
        cancelEditing()
        router.refresh()
      } else {
        throw new Error(result.error || "Error al actualizar el campo.")
      }
    } catch (error) {
      toast({ title: "Error", description: (error as Error).message, variant: "destructive" })
    } finally {
      setIsUpdatingField(false)
    }
  }

  const renderEditableField = (
    label: string,
    field: string,
    value: any,
    applianceIndex: number,
    isTextarea: boolean = false,
    icon?: React.ReactNode,
    isSelect: boolean = false,
  ) => {
    const isEditing = editingField === field && editingAppliance === applianceIndex

    return (
      <div>
        <h3 className="font-medium text-muted-foreground">{label}</h3>
        {isEditing ? (
          <div className="flex items-center gap-2 mt-1">
            {isSelect ? (
                <SearchableCreatablePopover
                    options={field === 'brandId' ? brands : applianceTypes}
                    value={editValues[field]}
                    onValueChange={(newValue) => setEditValues({ ...editValues, [field]: newValue })}
                    onCreation={(newItem) => {
                        if (field === 'brandId') {
                            setBrands(prev => [...prev, newItem]);
                        } else {
                            setApplianceTypes(prev => [...prev, newItem]);
                        }
                    }}
                    createApiEndpoint={field === 'brandId' ? '/api/brands' : '/api/appliance-types'}
                    createBodyKey="name"
                    placeholder={field === 'brandId' ? 'Seleccionar marca' : 'Seleccionar tipo'}
                    searchPlaceholder={field === 'brandId' ? 'Buscar marca...' : 'Buscar tipo...'}
                    createDialogTitle={field === 'brandId' ? 'Crear Nueva Marca' : 'Crear Nuevo Tipo'}
                />
            ) : isTextarea ? (
              <Textarea
                value={editValues[field]}
                onChange={(e) => setEditValues({ ...editValues, [field]: e.target.value })}
                className="text-sm"
                rows={3}
              />
            ) : (
              <Input
                value={editValues[field]}
                onChange={(e) => setEditValues({ ...editValues, [field]: e.target.value })}
                className="text-sm"
              />
            )}
            <div className="flex gap-1">
              <Button size="sm" variant="ghost" onClick={() => saveField(field, applianceIndex)} disabled={isUpdatingField} className="h-8 w-8 p-0">
                {isUpdatingField ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}
              </Button>
              <Button size="sm" variant="ghost" onClick={cancelEditing} disabled={isUpdatingField} className="h-8 w-8 p-0">
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between group">
            <div className="flex items-center gap-2 flex-1">
              {icon}
              {isTextarea && value ? (
                <p className="whitespace-pre-line bg-muted p-2 rounded text-xs mt-1 flex-1">{value}</p>
              ) : (
                <p className={`${!value ? 'text-muted-foreground italic' : ''} ${field === 'serialNumber' ? 'font-mono text-xs' : ''}`}>
                  {value || 'No especificado'}
                </p>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                const currentAppliance = appliances[applianceIndex];
                const editValue = field === 'brandId' 
                  ? currentAppliance.clientAppliance.brandId 
                  : field === 'applianceTypeId' 
                  ? currentAppliance.clientAppliance.applianceTypeId
                  : field === 'notes'
                  ? currentAppliance.clientAppliance.notes
                  : value;
                startEditing(field, applianceIndex, editValue);
              }}
              className="opacity-0 group-hover:opacity-100 transition-opacity ml-2 p-1 h-6 w-6"
            >
              <Edit2 className="h-3 w-3" />
            </Button>
          </div>
        )}
      </div>
    )
  }

  return (
    <>
      <Card className="overflow-hidden border-l-4 border-l-indigo-500 dark:border-l-indigo-400">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-medium flex items-center gap-2">
            <MonitorSmartphone className="h-5 w-5 text-indigo-500 dark:text-indigo-400" />
            {appliances.length > 1 ? `Electrodomésticos (${appliances.length})` : "Electrodoméstico"}
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-3 text-sm">
          {appliances.map((appliance: any, index: number) => (
            <div key={appliance.id || index} className="space-y-3 border-b last:border-0 pb-3 last:pb-0">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="font-medium text-muted-foreground">Electrodoméstico</h3>
                  <div className="flex items-center justify-between group">
                    <p className="font-medium">{appliance.clientAppliance.name}</p>
                    <Button variant="ghost" size="sm" onClick={() => handleEditAppliance(index)} className="ml-2 p-1 h-8 w-8">
                      <Edit2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {renderEditableField( "Marca", "brandId", appliance.clientAppliance.brand.name, index, false, <Tag className="h-4 w-4 text-indigo-500 dark:text-indigo-400" />, true )}
              {renderEditableField( "Tipo", "applianceTypeId", appliance.clientAppliance.applianceType.name, index, false, <Settings className="h-4 w-4 text-indigo-500 dark:text-indigo-400" />, true )}
              
              {/* Campos no editables y otros campos editables... */}
              {appliance.clientAppliance.model && (
                 <div>
                     <h3 className="font-medium text-muted-foreground">Modelo</h3>
                     <p>{appliance.clientAppliance.model}</p>
                 </div>
              )}
              {appliance.clientAppliance.serialNumber && (
                <div>
                  <h3 className="font-medium text-muted-foreground">Número de Serie</h3>
                  <p className="font-mono text-xs">{appliance.clientAppliance.serialNumber}</p>
                </div>
              )}
              {renderEditableField( "Notas", "notes", appliance.clientAppliance.notes, index, true, <FileText className="h-4 w-4 text-indigo-500 dark:text-indigo-400" />)}
              {renderEditableField( "Falla Reportada", "falla", appliance.falla, index, true, <AlertTriangle className="h-4 w-4 text-red-500 dark:text-red-400" />)}
              {appliance.solucion && (
                <div>
                  <h3 className="font-medium text-muted-foreground">Solución</h3>
                  <p className="whitespace-pre-line bg-muted p-2 rounded text-xs mt-1">{appliance.solucion}</p>
                </div>
              )}
            </div>
          ))}
        </CardContent>

        {appliances.length > 1 && onViewDetails && (
          <CardFooter>
            <Button variant="ghost" size="sm" onClick={onViewDetails} className="w-full justify-start hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-950/30 dark:hover:text-indigo-400">
              <Laptop className="mr-2 h-4 w-4" />
              Ver detalles de fallas
            </Button>
          </CardFooter>
        )}
      </Card>

      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Cambiar Electrodoméstico</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium">Electrodoméstico actual:</label>
              <p className="text-sm text-muted-foreground">
                {appliances[selectedApplianceIndex]?.clientAppliance.name} - {' '}
                {appliances[selectedApplianceIndex]?.clientAppliance.brand.name} {' '}
                {appliances[selectedApplianceIndex]?.clientAppliance.applianceType.name}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium">Seleccionar nuevo electrodoméstico:</label>
              <div className="mt-2">
                <ApplianceSelectorPopover
                  clientId={clientId}
                  currentApplianceId={appliances[selectedApplianceIndex]?.clientAppliance.id}
                  onApplianceChange={handleApplianceChange}
                  disabled={isUpdating}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)} disabled={isUpdating}>
              Cancelar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
