import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Check, ChevronsUpDown, PlusCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const GenericSelector = ({
  fetchUrl,
  createUrl,
  value,
  onChange,
  placeholder,
  notFoundMessage,
  createLabel,
  userId
}) => {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      setLoading(true);
      fetch(fetchUrl)
        .then(res => res.json())
        .then(data => setItems(data.items || []))
        .catch(() => toast({ title: "Error", description: `No se pudieron cargar ${placeholder}`, variant: "destructive" }))
        .finally(() => setLoading(false));
    }
  }, [open, fetchUrl, placeholder, toast]);

  const handleCreate = async () => {
    if (!search.trim()) return;
    setIsCreating(true);
    try {
      const response = await fetch(createUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: search, userId }),
      });
      const result = await response.json();
      if (result.success) {
        const newItem = result.item;
        setItems(prev => [...prev, newItem]);
        onChange(newItem.id);
        setOpen(false);
        toast({ title: "Éxito", description: `${createLabel} creado.` });
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      toast({ title: "Error", description: error.message || `No se pudo crear ${createLabel}`, variant: "destructive" });
    } finally {
      setIsCreating(false);
    }
  };

  const selectedItem = items.find(item => item.id === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" role="combobox" className="w-full justify-between">
          {selectedItem ? selectedItem.name : `Seleccionar ${placeholder}...`}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0">
        <Command>
          <CommandInput placeholder={`Buscar ${placeholder}...`} value={search} onValueChange={setSearch} />
          <CommandList>
            <CommandEmpty>
              <div className="p-2 text-center text-sm">
                {loading ? <Loader2 className="h-4 w-4 animate-spin mx-auto" /> :
                  (
                    <>
                      <p className="mb-2">{notFoundMessage}</p>
                      <Button size="sm" onClick={handleCreate} disabled={isCreating}>
                        {isCreating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <PlusCircle className="h-4 w-4 mr-2" />}
                        Crear "{search}"
                      </Button>
                    </>
                  )}
              </div>
            </CommandEmpty>
            <CommandGroup>
              {items.map(item => (
                <CommandItem
                  key={item.id}
                  value={item.id}
                  onSelect={() => {
                    onChange(item.id);
                    setOpen(false);
                  }}
                >
                  <Check className={cn("mr-2 h-4 w-4", value === item.id ? "opacity-100" : "opacity-0")} />
                  {item.name}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};