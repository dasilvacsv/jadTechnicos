"use client"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuCheckboxItem } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Eye, MoreHorizontal, Pencil, Trash2, UserPlus, Mail, Phone, User, AlertCircle, Globe, ArrowUpDown, Search, X, Users, Landmark, Trophy } from "lucide-react"
import { formatDate } from "@/lib/utils"
import { ClientForm } from "./create-client-form"
import { useToast } from "@/hooks/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { deleteClient } from "./clients"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Pagination, PaginationContent, PaginationItem, PaginationPrevious, PaginationNext, PaginationLink } from "@/components/ui/pagination"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface Client {
  id: string
  name: string
  document: string | null
  phone: string | null
  phone2: string | null
  whatsapp: string | null
  email: string | null
  zone: { id: string, name: string } | null
  city: { id: string, name: string } | null
  sucursal: { id: string, name: string } | null
  address: string | null
  latitude: string | null
  longitude: string | null
  createdAt: Date | null
}

interface ClientsTableProps {
  clients: Client[]
  userId: string
}

export function ClientsTable({ clients, userId }: ClientsTableProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false)
  const [clientToDelete, setClientToDelete] = useState<Client | null>(null)
  const [openClientDialog, setOpenClientDialog] = useState(false)
  const [editingClient, setEditingClient] = useState<Client | null>(null)
  
  // Estados para filtros y paginación
  const [searchQuery, setSearchQuery] = useState("")
  const [filters, setFilters] = useState<{
    zone: string[]
    city: string[]
  }>({ zone: [], city: [] })
  const [sortConfig, setSortConfig] = useState<{ key: keyof Client; direction: 'asc' | 'desc' } | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  // Procesamiento de datos
  const filteredClients = useMemo(() => {
    let result = [...clients]
    
    // Filtrado por búsqueda
    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase()
      result = result.filter(client =>
        client.name?.toLowerCase().includes(lowerQuery) ||
        client.email?.toLowerCase().includes(lowerQuery) ||
        client.phone?.toLowerCase().includes(lowerQuery) ||
        client.document?.toLowerCase().includes(lowerQuery)
      )
    }

    // Filtros facetados
    result = result.filter(client => (
      (filters.zone.length === 0 || (client.zone && filters.zone.includes(client.zone.id))) &&
      (filters.city.length === 0 || (client.city && filters.city.includes(client.city.id)))
    ))

    // Ordenamiento
    if (sortConfig) {
      result.sort((a, b) => {
        const aValue = a[sortConfig.key]
        const bValue = b[sortConfig.key]
        
        if (typeof aValue === 'string' && typeof bValue === 'string') {
          return sortConfig.direction === 'asc' 
            ? aValue.localeCompare(bValue) 
            : bValue.localeCompare(aValue)
        }
        return 0
      })
    }

    return result
  }, [clients, searchQuery, filters, sortConfig])

  // Métricas calculadas
  const stats = useMemo(() => {
    const totalClients = filteredClients.length
    const zonesCount = new Set(filteredClients.map(c => c.zone?.id).filter(Boolean)).size
    const citiesCount = new Set(filteredClients.map(c => c.city?.id).filter(Boolean)).size
    
    const recentClients = filteredClients.filter(c => {
      if (!c.createdAt) return false
      const diffTime = Date.now() - new Date(c.createdAt).getTime()
      return Math.floor(diffTime / (1000 * 60 * 60 * 24)) <= 30
    }).length
    
    const zoneCounts = filteredClients.reduce((acc, client) => {
      const zoneId = client.zone?.id || 'unknown'
      acc[zoneId] = (acc[zoneId] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    
    const topZone = Object.entries(zoneCounts).sort((a, b) => b[1] - a[1])[0]
    const topZoneName = topZone 
      ? filteredClients.find(c => c.zone?.id === topZone[0])?.zone?.name 
      : 'N/A'

    return {
      totalClients,
      zonesCount,
      citiesCount,
      recentClients,
      topZone: {
        name: topZoneName,
        count: topZone?.[1] || 0
      }
    }
  }, [filteredClients])

  // Paginación
  const totalPages = Math.ceil(filteredClients.length / itemsPerPage)
  const paginatedClients = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return filteredClients.slice(startIndex, startIndex + itemsPerPage)
  }, [filteredClients, currentPage, itemsPerPage])

  // Manejo de filtros
  const handleFilterChange = (type: keyof typeof filters, value: string) => {
    setFilters(prev => ({
      ...prev,
      [type]: prev[type].includes(value)
        ? prev[type].filter(v => v !== value)
        : [...prev[type], value]
    }))
    setCurrentPage(1)
  }

  // Ordenamiento
  const requestSort = (key: keyof Client) => {
    setSortConfig(prev => 
      prev?.key === key && prev.direction === 'asc' 
        ? { key, direction: 'desc' }
        : { key, direction: 'asc' }
    )
  }

  // Opciones únicas para filtros
  const uniqueZones = useMemo(() => {
    const zones = new Set(clients.map(c => c.zone?.id).filter(Boolean))
    return Array.from(zones).map(id => ({
      id: id as string,
      name: clients.find(c => c.zone?.id === id)?.zone?.name || ''
    }))
  }, [clients])

  const uniqueCities = useMemo(() => {
    const cities = new Set(clients.map(c => c.city?.id).filter(Boolean))
    return Array.from(cities).map(id => ({
      id: id as string,
      name: clients.find(c => c.city?.id === id)?.city?.name || ''
    }))
  }, [clients])

  // Manejo de eliminación
  const handleDeleteClick = (client: Client) => {
    setClientToDelete(client)
    setOpenDeleteDialog(true)
  }

  const confirmDelete = async () => {
    if (!clientToDelete) return

    try {
      const result = await deleteClient(clientToDelete.id)
      if (result.success) {
        toast({ title: "Éxito", description: "Cliente eliminado correctamente" })
        router.refresh()
      } else {
        toast({
          title: "Error",
          description: result.error || "Error al eliminar el cliente",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Ocurrió un error inesperado",
        variant: "destructive",
      })
    } finally {
      setOpenDeleteDialog(false)
      setClientToDelete(null)
    }
  }

  const handleEditClick = (client: Client) => {
    setEditingClient(client)
    setOpenClientDialog(true)
  }

  // Estado vacío
  if (clients.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 border rounded-xl bg-muted/30">
        <div className="rounded-full bg-muted p-4 mb-4">
          <User className="h-10 w-10 text-muted-foreground" />
        </div>
        <p className="text-xl font-medium mb-2">No hay clientes registrados</p>
        <p className="text-muted-foreground mb-6 text-center max-w-md">
          Comienza agregando tu primer cliente para gestionar órdenes de servicio
        </p>
        <Button 
          onClick={() => setOpenClientDialog(true)}
          className="bg-primary hover:bg-primary/90 transition-colors shadow-sm gap-2"
        >
          <UserPlus className="h-4 w-4" />
          Agregar primer cliente
        </Button>

        <Dialog open={openClientDialog} onOpenChange={setOpenClientDialog}>
          <DialogContent className="max-w-4xl">
            <ClientForm 
              userId={userId} 
              onSuccess={() => {
                setOpenClientDialog(false)
                router.refresh()
              }}
            />
          </DialogContent>
        </Dialog>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-6">
        {/* Sección de Métricas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-background hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Clientes Totales</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalClients}</div>
              <div className="text-xs text-muted-foreground mt-1">
                +{stats.recentClients} nuevos últimos 30 días
              </div>
            </CardContent>
          </Card>

          <Card className="bg-background hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Zona Principal</CardTitle>
              <Trophy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.topZone.name}</div>
              <div className="text-xs text-muted-foreground mt-1">
                {stats.topZone.count} clientes · {stats.zonesCount} zonas
              </div>
            </CardContent>
          </Card>

          <Card className="bg-background hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Distribución Geográfica</CardTitle>
              <Landmark className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.citiesCount}</div>
              <div className="text-xs text-muted-foreground mt-1">
                Ciudades con clientes activos
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Controles de Filtrado y Búsqueda */}
        <div className="flex flex-col md:flex-row gap-4 items-stretch">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar clientes..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setCurrentPage(1)
              }}
              className="pl-9"
            />
            {searchQuery && (
              <X
                className="absolute right-3 top-3 h-4 w-4 text-muted-foreground cursor-pointer"
                onClick={() => setSearchQuery("")}
              />
            )}
          </div>

          <div className="flex gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <Badge variant="secondary" className="rounded-full h-5 w-5 p-0">
                    {filters.zone.length}
                  </Badge>
                  Zona
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {uniqueZones.map(zone => (
                  <DropdownMenuCheckboxItem
                    key={zone.id}
                    checked={filters.zone.includes(zone.id)}
                    onCheckedChange={() => handleFilterChange('zone', zone.id)}
                  >
                    {zone.name}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <Badge variant="secondary" className="rounded-full h-5 w-5 p-0">
                    {filters.city.length}
                  </Badge>
                  Ciudad
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {uniqueCities.map(city => (
                  <DropdownMenuCheckboxItem
                    key={city.id}
                    checked={filters.city.includes(city.id)}
                    onCheckedChange={() => handleFilterChange('city', city.id)}
                  >
                    {city.name}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Tabla de Clientes */}
        <div className="rounded-xl border shadow-sm overflow-hidden">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow>
                <TableHead>
                  <Button
                    variant="ghost"
                    onClick={() => requestSort('name')}
                    className="px-0 font-medium"
                  >
                    Nombre
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>Documento</TableHead>
                <TableHead>Teléfono</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Zona</TableHead>
                <TableHead>Ciudad</TableHead>
                <TableHead>Sucursal</TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    onClick={() => requestSort('createdAt')}
                    className="px-0 font-medium"
                  >
                    Creado
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead className="w-[80px]">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedClients.map((client, index) => (
                <TableRow 
                  key={client.id}
                  className={index % 2 === 0 ? "bg-transparent hover:bg-muted/5" : "bg-muted/5 hover:bg-muted/10"}
                >
                  <TableCell className="font-medium">
                    <button 
                      onClick={() => router.push(`/clientes/${client.id}`)} 
                      className="hover:underline text-left text-primary flex items-center gap-2"
                    >
                      <User className="h-4 w-4" />
                      {client.name}
                    </button>
                  </TableCell>
                  <TableCell>
                    {client.document || <span className="text-muted-foreground text-sm italic">N/A</span>}
                  </TableCell>
                  <TableCell>
                    {client.phone ? (
                      <div className="flex items-center gap-2">
                        <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                        {client.phone}
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-sm italic">N/A</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {client.email ? (
                      <div className="flex items-center gap-2">
                        <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                        {client.email}
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-sm italic">N/A</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {client.zone ? (
                      <div className="flex items-center gap-2">
                        <Globe className="h-3.5 w-3.5 text-muted-foreground" />
                        {client.zone.name}
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-sm italic">N/A</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {client.city ? (
                      <div className="flex items-center gap-2">
                        <Globe className="h-3.5 w-3.5 text-muted-foreground" />
                        {client.city.name}
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-sm italic">N/A</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {client.sucursal ? (
                      <div className="flex items-center gap-2">
                        <Globe className="h-3.5 w-3.5 text-muted-foreground" />
                        {client.sucursal.name}
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-sm italic">N/A</span>
                    )}
                  </TableCell>
                  <TableCell>{formatDate(client.createdAt)}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          className="h-8 w-8 rounded-full hover:bg-muted/20"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Menú</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-[160px]">
                        <DropdownMenuItem onClick={() => router.push(`/clientes/${client.id}`)}>
                          <Eye className="mr-2 h-4 w-4" />
                          Ver detalles
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEditClick(client)}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="text-red-600 focus:text-red-600 dark:text-red-400" 
                          onClick={() => handleDeleteClick(client)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Eliminar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Paginación */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 px-4">
          <div className="text-sm text-muted-foreground">
            Mostrando {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, filteredClients.length)} de {filteredClients.length} resultados
          </div>
          
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  className={currentPage === 1 ? "opacity-50 cursor-not-allowed" : ""}
                />
              </PaginationItem>
              
              {Array.from({ length: totalPages }, (_, i) => (
                <PaginationItem key={i + 1}>
                  <PaginationLink
                    isActive={currentPage === i + 1}
                    onClick={() => setCurrentPage(i + 1)}
                  >
                    {i + 1}
                  </PaginationLink>
                </PaginationItem>
              ))}
              
              <PaginationItem>
                <PaginationNext
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  className={currentPage === totalPages ? "opacity-50 cursor-not-allowed" : ""}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </div>

      {/* Diálogos */}
      <Dialog open={openClientDialog} onOpenChange={setOpenClientDialog}>
        <DialogContent className="max-w-4xl">
          <ClientForm 
            userId={userId}
            mode={editingClient ? "edit" : "create"}
            initialData={editingClient}
            onSuccess={() => {
              setOpenClientDialog(false)
              setEditingClient(null)
              router.refresh()
            }}
          />
        </DialogContent>
      </Dialog>

      <AlertDialog open={openDeleteDialog} onOpenChange={setOpenDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-red-600 dark:text-red-400 flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Confirmar eliminación
            </AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará permanentemente el cliente
              {clientToDelete?.name ? ` "${clientToDelete.name}"` : ""}.
              Esta operación no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="shadow-sm">Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete} 
              className="bg-red-600 hover:bg-red-700 shadow-sm"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}