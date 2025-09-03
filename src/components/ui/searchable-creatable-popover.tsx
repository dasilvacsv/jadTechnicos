'use client'

import React, { useState } from 'react'
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import { Check, ChevronsUpDown, Loader2, Plus } from "lucide-react"

interface Option {
  id: string
  name: string
}

interface SearchableCreatablePopoverProps {
  options: Option[]
  value: string
  onValueChange: (value: string) => void
  onCreation: (newItem: Option) => void
  createApiEndpoint: string
  createBodyKey?: string
  placeholder?: string
  searchPlaceholder?: string
  notFoundText?: string
  createDialogTitle?: string
}

export function SearchableCreatablePopover({
  options,
  value,
  onValueChange,
  onCreation,
  createApiEndpoint,
  createBodyKey = 'name',
  placeholder = "Seleccionar...",
  searchPlaceholder = "Buscar...",
  notFoundText = "No se encontraron resultados.",
  createDialogTitle = "Crear Nuevo"
}: SearchableCreatablePopoverProps) {
  const [open, setOpen] = useState(false)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [newItemName, setNewItemName] = useState("")
  const [isCreating, setIsCreating] = useState(false)
  const { toast } = useToast()

  const selectedOption = options.find((option) => option.id === value)

  const handleCreate = async () => {
    if (!newItemName.trim()) {
      toast({ title: "Error", description: "El nombre no puede estar vacío.", variant: "destructive" })
      return
    }
    setIsCreating(true)
    try {
      const response = await fetch(createApiEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [createBodyKey]: newItemName }),
      })
      const result = await response.json()

      if (result.success) {
        const createdItem = result.brand || result.type; // Adapt based on your API response
        toast({ title: "Éxito", description: "Elemento creado correctamente." })
        onCreation(createdItem)
        onValueChange(createdItem.id)
        setShowCreateDialog(false)
        setNewItemName("")
        setOpen(false)
      } else {
        throw new Error(result.error || "Error al crear el elemento.")
      }
    } catch (error) {
      toast({ title: "Error", description: (error as Error).message, variant: "destructive" })
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" role="combobox" className="w-full justify-between text-sm">
            {selectedOption ? selectedOption.name : <span className="text-muted-foreground">{placeholder}</span>}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
          <Command>
            <CommandInput placeholder={searchPlaceholder} />
            <CommandList>
              <CommandEmpty onSelect={() => setShowCreateDialog(true)}>
                <Button variant="ghost" size="sm" className="w-full justify-center" onClick={() => setShowCreateDialog(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Crear "{notFoundText}"
                </Button>
              </CommandEmpty>
              <CommandGroup>
                {options.map((option) => (
                  <CommandItem
                    key={option.id}
                    value={option.name}
                    onSelect={() => {
                      onValueChange(option.id)
                      setOpen(false)
                    }}
                  >
                    <Check className={cn("mr-2 h-4 w-4", value === option.id ? "opacity-100" : "opacity-0")} />
                    {option.name}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{createDialogTitle}</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="new-item-name">Nombre</Label>
            <Input
              id="new-item-name"
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              placeholder="Nombre del nuevo elemento"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>Cancelar</Button>
            <Button onClick={handleCreate} disabled={isCreating}>
              {isCreating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Guardar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
