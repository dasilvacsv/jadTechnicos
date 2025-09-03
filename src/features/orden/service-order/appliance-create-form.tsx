import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Loader2, Plus, X } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { SearchableSelectPopover } from '@/components/ui/searchable-select-popover'

interface ApplianceCreateFormProps {
  clientId: string
  userId: string
  onSave: (data: any) => void
  onCancel: () => void
  isLoading: boolean
}

export function ApplianceCreateForm({
  clientId,
  userId,
  onSave,
  onCancel,
  isLoading,
}: ApplianceCreateFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    brandId: '',
    applianceTypeId: '',
    model: '',
    serialNumber: '',
    notes: '',
  })
  const [brands, setBrands] = useState<any[]>([])
  const [applianceTypes, setApplianceTypes] = useState<any[]>([])
  const [loadingData, setLoadingData] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [brandsRes, typesRes] = await Promise.all([
          fetch('/api/brands'),
          fetch('/api/appliance-types'),
        ])

        if (brandsRes.ok && typesRes.ok) {
          const brandsData = await brandsRes.json()
          const typesData = await typesRes.json()
          setBrands(brandsData.brands || [])
          setApplianceTypes(typesData.types || [])
        } else {
            throw new Error('Failed to fetch brands or types');
        }
      } catch (error) {
        console.error('Error fetching data:', error)
        toast({
          title: 'Error',
          description: 'Error al cargar los datos del formulario',
          variant: 'destructive',
        })
      } finally {
        setLoadingData(false)
      }
    }

    fetchData()
  }, [toast])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name.trim()) {
      toast({
        title: 'Campo requerido',
        description: 'El nombre del electrodoméstico es requerido.',
        variant: 'destructive',
      })
      return
    }

    if (!formData.brandId) {
      toast({
        title: 'Campo requerido',
        description: 'La marca es requerida.',
        variant: 'destructive',
      })
      return
    }

    if (!formData.applianceTypeId) {
      toast({
        title: 'Campo requerido',
        description: 'El tipo de electrodoméstico es requerido.',
        variant: 'destructive',
      })
      return
    }

    onSave(formData)
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  if (loadingData) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
        <span className="ml-2 text-sm text-gray-600">Cargando formulario...</span>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div className="flex items-center gap-2">
          <Plus className="h-5 w-5 text-blue-600" />
          <p className="text-sm text-blue-800 font-medium">
            Crear un nuevo electrodoméstico para este cliente
          </p>
        </div>
      </div>

      <div className="grid gap-4">
        <div className="space-y-2">
          <Label htmlFor="name" className="text-sm font-medium text-gray-700">
            Nombre del Electrodoméstico *
          </Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            placeholder="Ej: Refrigerador de la cocina"
            className="w-full"
            required
          />
          <p className="text-xs text-gray-500">
            Dale un nombre descriptivo para identificar fácilmente este electrodoméstico.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="brand" className="text-sm font-medium text-gray-700">
              Marca *
            </Label>
            <SearchableSelectPopover
              options={brands}
              value={formData.brandId}
              onValueChange={(value) => handleInputChange('brandId', value)}
              placeholder="Seleccionar marca"
              searchPlaceholder="Buscar marca..."
              notFoundText="No se encontró la marca."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="type" className="text-sm font-medium text-gray-700">
              Tipo de Electrodoméstico *
            </Label>
            <SearchableSelectPopover
              options={applianceTypes}
              value={formData.applianceTypeId}
              onValueChange={(value) => handleInputChange('applianceTypeId', value)}
              placeholder="Seleccionar tipo"
              searchPlaceholder="Buscar tipo..."
              notFoundText="No se encontró el tipo."
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="model" className="text-sm font-medium text-gray-700">
              Modelo
            </Label>
            <Input
              id="model"
              value={formData.model}
              onChange={(e) => handleInputChange('model', e.target.value)}
              placeholder="Ej: RB33J3000SA"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="serialNumber" className="text-sm font-medium text-gray-700">
              Número de Serie
            </Label>
            <Input
              id="serialNumber"
              value={formData.serialNumber}
              onChange={(e) => handleInputChange('serialNumber', e.target.value)}
              placeholder="Ej: SN123456789"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="notes" className="text-sm font-medium text-gray-700">
            Notas Adicionales
          </Label>
          <Textarea
            id="notes"
            value={formData.notes}
            onChange={(e) => handleInputChange('notes', e.target.value)}
            placeholder="Información adicional sobre el electrodoméstico (ubicación, características especiales, etc.)"
            rows={3}
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
          className="gap-2"
        >
          <X className="h-4 w-4" />
          Cancelar
        </Button>
        <Button
          type="submit"
          disabled={isLoading}
          className="gap-2 bg-blue-600 hover:bg-blue-700"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Plus className="h-4 w-4" />
          )}
          {isLoading ? 'Creando...' : 'Crear Electrodoméstico'}
        </Button>
      </div>
    </form>
  )
}
