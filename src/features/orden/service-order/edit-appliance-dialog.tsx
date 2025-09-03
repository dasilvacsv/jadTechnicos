"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { motion } from "framer-motion"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from "@/components/ui/form"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, Settings, Check, X, Search } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { updateServiceOrderAppliance } from "@/features/orden/actions"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command"

const formSchema = z.object({
  clientApplianceId: z.string().min(1, {
    message: "Debe seleccionar un electrodoméstico",
  }),
  falla: z.string().optional(),
  solucion: z.string().optional(),
})

type FormValues = z.infer<typeof formSchema>

interface EditApplianceDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  serviceOrderId: string
  currentAppliance: any
  clientAppliances: any[]
  userId: string
}

export function EditApplianceDialog({
  open,
  onOpenChange,
  serviceOrderId,
  currentAppliance,
  clientAppliances,
  userId,
}: EditApplianceDialogProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [openPopover, setOpenPopover] = useState(false)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      clientApplianceId: currentAppliance?.clientAppliance?.id || "",
      falla: currentAppliance?.falla || "",
      solucion: currentAppliance?.solucion || "",
    },
  })

  useEffect(() => {
    if (open && currentAppliance) {
      form.reset({
        clientApplianceId: currentAppliance.clientAppliance.id,
        falla: currentAppliance.falla || "",
        solucion: currentAppliance.solucion || "",
      })
    }
  }, [open, currentAppliance, form])

  const selectedApplianceId = form.watch("clientApplianceId")
  const selectedAppliance = clientAppliances.find(app => app.id === selectedApplianceId)

  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true)

    try {
      const result = await updateServiceOrderAppliance(
        serviceOrderId,
        currentAppliance.clientAppliance.id,
        values.clientApplianceId,
        values.falla || null,
        values.solucion || null,
        userId
      )

      if (result.success) {
        toast({
          title: "¡Éxito!",
          description: "Electrodoméstico actualizado correctamente",
          variant: "default",
        })
        onOpenChange(false)
        router.refresh()
      } else {
        toast({
          title: "Error",
          description: result.error || "Error al procesar la solicitud",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error actualizando electrodoméstico:", error)
      toast({
        title: "Error",
        description: "Ocurrió un error inesperado",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] w-full max-h-[90vh] overflow-y-auto mx-auto my-4">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-semibold">
            <motion.div
              initial={{ rotate: -10, scale: 0.9 }}
              animate={{ rotate: 0, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <Settings className="h-5 w-5 text-blue-500" />
            </motion.div>
            <span>Editar Electrodoméstico</span>
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="clientApplianceId"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Electrodoméstico *</FormLabel>
                  <Popover open={openPopover} onOpenChange={setOpenPopover}>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          role="combobox"
                          className={`w-full justify-between ${!field.value && "text-muted-foreground"}`}
                        >
                          {field.value
                            ? (() => {
                                const appliance = clientAppliances.find(app => app.id === field.value)
                                return appliance 
                                  ? `${appliance.name} - ${appliance.brand.name} ${appliance.applianceType.name}`
                                  : "Seleccionar electrodoméstico..."
                              })()
                            : "Seleccionar electrodoméstico..."}
                          <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0" align="start">
                      <Command>
                        <CommandInput placeholder="Buscar electrodoméstico..." />
                        <CommandEmpty>No se encontraron electrodomésticos.</CommandEmpty>
                        <CommandGroup>
                          {clientAppliances.map((appliance) => (
                            <CommandItem
                              key={appliance.id}
                              value={`${appliance.name} ${appliance.brand.name} ${appliance.applianceType.name}`}
                              onSelect={() => {
                                field.onChange(appliance.id)
                                setOpenPopover(false)
                              }}
                            >
                              <div className="flex flex-col">
                                <span className="font-medium">{appliance.name}</span>
                                <span className="text-sm text-muted-foreground">
                                  {appliance.brand.name} - {appliance.applianceType.name}
                                </span>
                                {appliance.model && (
                                  <span className="text-xs text-muted-foreground">
                                    Modelo: {appliance.model}
                                  </span>
                                )}
                              </div>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  <FormDescription>
                    Seleccione el electrodoméstico para esta orden
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {selectedAppliance && (
              <div className="bg-muted p-4 rounded-lg space-y-2">
                <h4 className="font-medium">Detalles del electrodoméstico seleccionado:</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="font-medium">Nombre:</span> {selectedAppliance.name}
                  </div>
                  <div>
                    <span className="font-medium">Marca:</span> {selectedAppliance.brand.name}
                  </div>
                  <div>
                    <span className="font-medium">Tipo:</span> {selectedAppliance.applianceType.name}
                  </div>
                  {selectedAppliance.model && (
                    <div>
                      <span className="font-medium">Modelo:</span> {selectedAppliance.model}
                    </div>
                  )}
                  {selectedAppliance.serialNumber && (
                    <div className="col-span-2">
                      <span className="font-medium">Serie:</span> {selectedAppliance.serialNumber}
                    </div>
                  )}
                  {selectedAppliance.notes && (
                    <div className="col-span-2">
                      <span className="font-medium">Notas:</span> {selectedAppliance.notes}
                    </div>
                  )}
                </div>
              </div>
            )}

            <FormField
              control={form.control}
              name="falla"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Falla Reportada</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describa la falla reportada por el cliente"
                      {...field}
                      rows={4}
                      className="resize-none"
                    />
                  </FormControl>
                  <FormDescription>
                    Descripción de la falla o problema reportado
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="solucion"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Solución (Opcional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describa la solución aplicada (si aplica)"
                      {...field}
                      rows={4}
                      className="resize-none"
                    />
                  </FormControl>
                  <FormDescription>
                    Descripción de la solución o reparación realizada
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={isSubmitting}
                className="gap-2"
              >
                <X className="h-4 w-4" />
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || !form.getValues("clientApplianceId")}
                className="gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Actualizando...
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4" />
                    Guardar Cambios
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}