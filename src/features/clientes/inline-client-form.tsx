"use client"

import { useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { Textarea } from "@/components/ui/textarea"
import { useEffect, useState, useCallback } from "react"
import { Copy, Loader2, UserPlus } from 'lucide-react'
import { createClient, createInlineClient } from "./clients"
import { useRouter } from "next/navigation"
import { getZones } from "@/features/zones/actions"
import { getCities } from "@/features/cities/actions"
import { ZoneDialog } from "@/features/zones/ZoneDialog"
import { CityDialog } from "@/features/cities/CityDialog"
import { SucursalDialog } from "@/features/sucursales/sucursal-dialog"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { cn } from "@/lib/utils"
import { Check } from "lucide-react"
import { SucursalSelect } from "../sucursales/sucursal-select"

const inlineClientSchema = z.object({
  name: z.string().min(2, {
    message: "El nombre debe tener al menos 2 caracteres.",
  }),
  phone: z.string().optional(),
  phone2: z.string().optional(),
  whatsapp: z.string().optional(),
  email: z.string().email({ message: "Correo electrónico inválido" }).optional().or(z.literal("")),
  zoneId: z.string().optional(),
  cityId: z.string().optional(),
  sucursalId: z.string().optional(),
  address: z.string().optional(),
})

export type InlineClientFormData = z.infer<typeof inlineClientSchema>

interface InlineClientFormProps {
  userId: string
  onSuccess?: (newClientId?: string, newClient?: any) => void
  onCancel?: () => void
}

interface Zone {
  id: string
  name: string
}

interface City {
  id: string
  name: string
}

export function InlineClientForm({ userId, onSuccess, onCancel }: InlineClientFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [syncWhatsapp, setSyncWhatsapp] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [zones, setZones] = useState<Zone[]>([])
  const [cities, setCities] = useState<City[]>([])
  const [loadingZones, setLoadingZones] = useState(false)
  const [loadingCities, setLoadingCities] = useState(false)
  const [zoneDialogOpen, setZoneDialogOpen] = useState(false)
  const [cityDialogOpen, setCityDialogOpen] = useState(false)
  const [sucursalDialogOpen, setSucursalDialogOpen] = useState(false)
  const [zoneSearch, setZoneSearch] = useState("")
  const [citySearch, setCitySearch] = useState("")
  const [sucursalRefreshKey, setSucursalRefreshKey] = useState(0);
 

    const form = useForm<InlineClientFormData>({
    resolver: zodResolver(inlineClientSchema),
    defaultValues: {
      name: "",
      phone: "",
      phone2: "",
      whatsapp: "",
      email: "",
      zoneId: "",
      cityId: "",
      sucursalId: "",
      address: "",
    },
  })

  const phoneValue = useWatch({
    control: form.control,
    name: "phone",
  })

  useEffect(() => {
    fetchZones()
    fetchCities()
  }, [])

  useEffect(() => {
    if (syncWhatsapp && phoneValue) {
      form.setValue("whatsapp", phoneValue)
    }
  }, [phoneValue, syncWhatsapp, form])

  const fetchZones = useCallback(async () => {
    try {
      setLoadingZones(true)
      const result = await getZones()
      if (result.success) setZones(result.data || [])
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Error al cargar las zonas",
      })
    } finally {
      setLoadingZones(false)
    }
  }, [toast])

  const fetchCities = useCallback(async () => {
    try {
      setLoadingCities(true)
      const result = await getCities()
      if (result.success) setCities(result.data || [])
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Error al cargar las ciudades",
      })
    } finally {
      setLoadingCities(false)
    }
  }, [toast])

  const handleZoneCreated = useCallback((newZone: Zone) => {
    fetchZones()
    form.setValue("zoneId", newZone.id)
    setZoneDialogOpen(false)
  }, [fetchZones, form])

  const handleCityCreated = useCallback((newCity: City) => {
    fetchCities()
    form.setValue("cityId", newCity.id)
    setCityDialogOpen(false)
  }, [fetchCities, form])

  const handleSubmit = async (data: InlineClientFormData) => {
  try {
    setIsSubmitting(true);
    
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (value) formData.append(key, value);
    });

    const response = await fetch('/api/clients', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) throw new Error('Error en la creación');

    const result = await response.json();
    
    toast({
      title: "Éxito",
      description: "Cliente creado correctamente",
    });
    
    onSuccess?.(result.data.id, result.data);
    form.reset();
    
  } catch (error) {
    toast({
      variant: "destructive",
      title: "Error",
      description: "Error al crear el cliente",
    });
  } finally {
    setIsSubmitting(false);
  }
};

  const filteredZones = zoneSearch === ""
    ? zones
    : zones.filter((zone) =>
        zone.name.toLowerCase().includes(zoneSearch.toLowerCase())
      )

  const filteredCities = citySearch === ""
    ? cities
    : cities.filter((city) =>
        city.name.toLowerCase().includes(citySearch.toLowerCase())
      )

  return (
    <div className="space-y-4">
      <ZoneDialog
        open={zoneDialogOpen}
        onOpenChange={setZoneDialogOpen}
        userId={userId}
        onSuccess={handleZoneCreated}
      />
      
      <CityDialog
        open={cityDialogOpen}
        onOpenChange={setCityDialogOpen}
        userId={userId}
        onSuccess={handleCityCreated}
      />

          <SucursalDialog
              open={sucursalDialogOpen}
              onOpenChange={setSucursalDialogOpen}
              userId={userId}
              onSuccess={() => {
                  setSucursalDialogOpen(false)
                  setSucursalRefreshKey(prev => prev + 1) // Forzar refresco de sucursales
              }}
          />

      <div className="bg-muted/10 border rounded-lg p-4">
        <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
          <UserPlus className="h-5 w-5 text-primary" />
          Nuevo Cliente
        </h3>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">Nombre *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Juan Pérez"
                      {...field}
                      className="bg-background focus:ring-2 focus:ring-blue-500"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">Teléfono</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="+1234567890"
                        {...field}
                        className="bg-background focus:ring-2 focus:ring-blue-500"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone2"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">Teléfono alternativo</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="+1234567890"
                        {...field}
                        className="bg-background focus:ring-2 focus:ring-blue-500"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="whatsapp"
              render={({ field }) => (
                <FormItem>
                  <div className="flex justify-between items-center">
                    <FormLabel className="text-sm font-medium">WhatsApp</FormLabel>
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => form.setValue("whatsapp", phoneValue || "")}
                        className="h-6 px-2 text-xs hover:bg-blue-50 hover:text-blue-600"
                      >
                        <Copy className="h-3 w-3 mr-1" />
                        Copiar teléfono
                      </Button>
                      <div className="flex items-center space-x-1">
                        <input
                          type="checkbox"
                          id="sync-whatsapp"
                          checked={syncWhatsapp}
                          onChange={(e) => setSyncWhatsapp(e.target.checked)}
                          className="h-3 w-3 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <label htmlFor="sync-whatsapp" className="text-xs text-muted-foreground">
                          Sincronizar
                        </label>
                      </div>
                    </div>
                  </div>
                  <FormControl>
                    <Input
                      placeholder="+1234567890"
                      {...field}
                      className="bg-background focus:ring-2 focus:ring-blue-500"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">Correo electrónico</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="juan@ejemplo.com"
                      {...field}
                      className="bg-background focus:ring-2 focus:ring-blue-500"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="zoneId"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel className="text-sm font-medium">Zona</FormLabel>
                    <div className="flex gap-2">
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              role="combobox"
                              className={cn(
                                "w-full justify-between bg-background",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value
                                ? zones.find((zone) => zone.id === field.value)?.name
                                : "Seleccionar zona"}
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-[300px] p-0">
                          <Command shouldFilter={false}>
                            <CommandInput
                              placeholder="Buscar zona..."
                              value={zoneSearch}
                              onValueChange={setZoneSearch}
                            />
                            <CommandList>
                              <CommandEmpty>No se encontraron zonas</CommandEmpty>
                              <CommandGroup>
                                {filteredZones.map((zone) => (
                                  <CommandItem
                                    value={zone.name}
                                    key={zone.id}
                                    onSelect={() => {
                                      form.setValue("zoneId", zone.id)
                                    }}
                                  >
                                    <Check
                                      className={cn(
                                        "mr-2 h-4 w-4",
                                        zone.id === field.value
                                          ? "opacity-100"
                                          : "opacity-0"
                                      )}
                                    />
                                    {zone.name}
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setZoneDialogOpen(true)}
                        className="px-3"
                      >
                        Nueva
                      </Button>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="cityId"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel className="text-sm font-medium">Ciudad</FormLabel>
                    <div className="flex gap-2">
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              role="combobox"
                              className={cn(
                                "w-full justify-between bg-background",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value
                                ? cities.find((city) => city.id === field.value)?.name
                                : "Seleccionar ciudad"}
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-[300px] p-0">
                          <Command shouldFilter={false}>
                            <CommandInput
                              placeholder="Buscar ciudad..."
                              value={citySearch}
                              onValueChange={setCitySearch}
                            />
                            <CommandList>
                              <CommandEmpty>No se encontraron ciudades</CommandEmpty>
                              <CommandGroup>
                                {filteredCities.map((city) => (
                                  <CommandItem
                                    value={city.name}
                                    key={city.id}
                                    onSelect={() => {
                                      form.setValue("cityId", city.id)
                                    }}
                                  >
                                    <Check
                                      className={cn(
                                        "mr-2 h-4 w-4",
                                        city.id === field.value
                                          ? "opacity-100"
                                          : "opacity-0"
                                      )}
                                    />
                                    {city.name}
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setCityDialogOpen(true)}
                        className="px-3"
                      >
                        Nueva
                      </Button>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

                      <FormField
                          control={form.control}
                          name="sucursalId"
                          render={({ field }) => (
                              <FormItem>
                                  <FormLabel className="text-sm font-medium">Sucursal</FormLabel>
                                  <div className="flex gap-2">
                                      <FormControl className="flex-1">
                                          <SucursalSelect
                                              key={sucursalRefreshKey}
                                              value={field.value || ""}
                                              onValueChange={(value) => form.setValue("sucursalId", value)}
                                          />
                                      </FormControl>
                                      <Button
                                          type="button"
                                          variant="outline"
                                          onClick={() => setSucursalDialogOpen(true)}
                                          className="px-3"
                                      >
                                          Nueva
                                      </Button>
                                  </div>
                                  <FormMessage />
                              </FormItem>
                          )}
                      />

            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">Dirección</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Calle Principal #123, Ciudad"
                      {...field}
                      className="bg-background focus:ring-2 focus:ring-blue-500 resize-none"
                      rows={2}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2 pt-4">
              {onCancel && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={onCancel}
                  className="flex-1"
                >
                  Cancelar
                </Button>
              )}
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creando...
                  </>
                ) : (
                  "Crear Cliente"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  )
}