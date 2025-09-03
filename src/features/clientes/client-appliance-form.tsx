"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { PlusCircle, Plus, Check } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { useToast } from "@/hooks/use-toast"
import { addClientAppliance } from "./client-appliances-actions"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { CreateBrandForm } from "../brands/create-brand-form"
import { CreateApplianceTypeForm } from "../appliance-types/create-appliance-type-form"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Textarea } from "@/components/ui/textarea"

const formSchema = z.object({
  brandId: z.string({
    required_error: "Por favor seleccione una marca",
  }),
  applianceTypeId: z.string({
    required_error: "Por favor seleccione un tipo",
  }),
  notes: z.string().optional(),
})

type FormValues = z.infer<typeof formSchema>

interface Brand {
  id: string
  name: string
}

interface ApplianceType {
  id: string
  name: string
}

interface ClientApplianceFormProps {
  clientId: string
  userId: string
  brands: Brand[]
  applianceTypes: ApplianceType[]
  onSuccess?: () => void
  onBrandCreated?: (brand: Brand) => void
  onApplianceTypeCreated?: (type: ApplianceType) => void
  onApplianceAdded?: (appliance: any) => void
}

export function ClientApplianceForm({
  clientId,
  userId,
  brands,
  applianceTypes,
  onSuccess,
  onBrandCreated,
  onApplianceTypeCreated,
  onApplianceAdded,
}: ClientApplianceFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [createBrandOpen, setCreateBrandOpen] = useState(false)
  const [createTypeOpen, setCreateTypeOpen] = useState(false)
  const [brandPopoverOpen, setBrandPopoverOpen] = useState(false)
  const [typePopoverOpen, setTypePopoverOpen] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      notes: "",
    },
  })

  const selectedBrandId = form.watch("brandId")
  const selectedApplianceTypeId = form.watch("applianceTypeId")
  
  const selectedBrand = brands.find((brand) => brand.id === selectedBrandId)
  const selectedApplianceType = applianceTypes.find((type) => type.id === selectedApplianceTypeId)

  async function onSubmit(values: FormValues) {
    setIsSubmitting(true)
    try {
      const result = await addClientAppliance({
        ...values,
        clientId,
        userId,
      })

      if (result.success) {
        toast({
          title: "Electrodoméstico agregado",
          description: "El electrodoméstico ha sido agregado exitosamente",
        })
        form.reset()

        if (onApplianceAdded && result.data) {
          onApplianceAdded(result.data)
        }

        router.refresh()
        if (onSuccess) onSuccess()
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: result.error || "Ocurrió un error al agregar el electrodoméstico",
        })
      }
    } catch (error) {
      console.error("Error adding appliance:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Ocurrió un error inesperado",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleBrandCreated = (newBrand: Brand) => {
    setCreateBrandOpen(false)
    form.setValue("brandId", newBrand.id)
    if (onBrandCreated) onBrandCreated(newBrand)
    toast({
      title: "Marca creada",
      description: `La marca "${newBrand.name}" ha sido creada exitosamente`,
    })
  }

  const handleApplianceTypeCreated = (newType: ApplianceType) => {
    setCreateTypeOpen(false)
    form.setValue("applianceTypeId", newType.id)
    if (onApplianceTypeCreated) onApplianceTypeCreated(newType)
    toast({
      title: "Tipo creado",
      description: `El tipo "${newType.name}" ha sido creado exitosamente`,
    })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="brandId"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Marca</FormLabel>
                <Popover open={brandPopoverOpen} onOpenChange={setBrandPopoverOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      className="w-full justify-between"
                    >
                      {selectedBrand ? selectedBrand.name : "Seleccionar marca..."}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0">
                    <Command>
                      <CommandInput placeholder="Buscar marca..." />
                      <CommandEmpty>
                        <Button
                          variant="ghost"
                          className="w-full"
                          onClick={() => {
                            setBrandPopoverOpen(false)
                            setCreateBrandOpen(true)
                          }}
                        >
                          <Plus className="mr-2 h-4 w-4" />
                          Crear nueva marca
                        </Button>
                      </CommandEmpty>
                      <CommandGroup>
                        {brands.map((brand) => (
                          <CommandItem
                            key={brand.id}
                            value={brand.name}
                            onSelect={() => {
                              form.setValue("brandId", brand.id)
                              setBrandPopoverOpen(false)
                            }}
                          >
                            {brand.name}
                            <Check
                              className={`ml-auto h-4 w-4 ${
                                selectedBrandId === brand.id
                                  ? "opacity-100"
                                  : "opacity-0"
                              }`}
                            />
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </Command>
                  </PopoverContent>
                </Popover>
                <Dialog open={createBrandOpen} onOpenChange={setCreateBrandOpen}>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Crear Nueva Marca</DialogTitle>
                    </DialogHeader>
                    <CreateBrandForm userId={userId} onSuccess={handleBrandCreated} />
                  </DialogContent>
                </Dialog>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="applianceTypeId"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Tipo de electrodoméstico</FormLabel>
                <Popover open={typePopoverOpen} onOpenChange={setTypePopoverOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      className="w-full justify-between"
                    >
                      {selectedApplianceType ? selectedApplianceType.name : "Seleccionar tipo..."}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0">
                    <Command>
                      <CommandInput placeholder="Buscar tipo..." />
                      <CommandEmpty>
                        <Button
                          variant="ghost"
                          className="w-full"
                          onClick={() => {
                            setTypePopoverOpen(false)
                            setCreateTypeOpen(true)
                          }}
                        >
                          <Plus className="mr-2 h-4 w-4" />
                          Crear nuevo tipo
                        </Button>
                      </CommandEmpty>
                      <CommandGroup>
                        {applianceTypes.map((type) => (
                          <CommandItem
                            key={type.id}
                            value={type.name}
                            onSelect={() => {
                              form.setValue("applianceTypeId", type.id)
                              setTypePopoverOpen(false)
                            }}
                          >
                            {type.name}
                            <Check
                              className={`ml-auto h-4 w-4 ${
                                selectedApplianceTypeId === type.id
                                  ? "opacity-100"
                                  : "opacity-0"
                              }`}
                            />
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </Command>
                  </PopoverContent>
                </Popover>
                <Dialog open={createTypeOpen} onOpenChange={setCreateTypeOpen}>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Crear Nuevo Tipo</DialogTitle>
                    </DialogHeader>
                    <CreateApplianceTypeForm userId={userId} onSuccess={handleApplianceTypeCreated} />
                  </DialogContent>
                </Dialog>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notas (Opcional)</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Ingrese notas o especificaciones sobre este electrodoméstico" 
                  {...field} 
                  className="resize-none"
                  rows={3}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isSubmitting} className="w-full">
          <PlusCircle className="mr-2 h-4 w-4" />
          {isSubmitting ? "Agregando..." : "Agregar Electrodoméstico"}
        </Button>
      </form>
    </Form>
  )
}