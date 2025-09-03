import { getServiceOrders } from "@/features/orden/actions"
import { getTechnicians } from "@/features/tecnicos/technicians"
import { getClients } from "@/features/clientes/clients"
import { getAppliances } from "@/features/appliances/actions"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import {
  BarChart3,
  ClipboardList,
  Clock,
  DollarSign,
  Laptop,
  PlusCircle,
  Settings,
  User,
  Users,
  Wrench,
} from "lucide-react"
import { formatCurrency } from "@/lib/utils"

export default async function DashboardPage() {
  // Fetch data for dashboard
  const { data: orders = [] } = (await getServiceOrders()) || { data: [] }
  const { data: technicians = [] } = (await getTechnicians()) || { data: [] }
  const { data: clients = [] } = (await getClients()) || { data: [] }
  const { data: appliances = [] } = (await getAppliances()) || { data: [] }

  // Calculate statistics
  const pendingOrders = orders.filter((order) => order.status === "PENDING").length
  const inProgressOrders = orders.filter((order) => ["ASSIGNED", "IN_PROGRESS"].includes(order.status)).length
  const completedOrders = orders.filter((order) => order.status === "COMPLETED").length
  const deliveredOrders = orders.filter((order) => order.status === "DELIVERED").length

  const totalRevenue = orders.reduce((sum, order) => sum + Number(order.totalAmount || 0), 0)
  const pendingPayments = orders.reduce(
    (sum, order) =>
      order.paymentStatus !== "PAID" ? sum + (Number(order.totalAmount || 0) - Number(order.paidAmount || 0)) : sum,
    0,
  )

  const activeTechnicians = technicians.filter((tech) => tech.is_active).length

  // Get recent orders
  const recentOrders = [...orders]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5)

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <Button asChild className="bg-primary hover:bg-primary/90 transition-colors shadow-sm">
          <Link href="/orden" className="flex items-center gap-2">
            <PlusCircle className="w-4 h-4" />
            Nueva Orden
          </Link>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="overflow-hidden border-0 shadow-md bg-gradient-to-br from-card to-card/80 transition-all duration-200 hover:shadow-lg">
          <CardHeader className="pb-2 space-y-0">
            <CardDescription className="text-muted-foreground">Órdenes Pendientes</CardDescription>
            <CardTitle className="text-3xl flex justify-between items-center">
              {pendingOrders}
              <div className="h-10 w-10 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
                <Clock className="h-5 w-5 text-yellow-500 dark:text-yellow-400" />
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {pendingOrders === 1 ? "Orden pendiente" : "Órdenes pendientes"} de asignación
            </p>
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-0 shadow-md bg-gradient-to-br from-card to-card/80 transition-all duration-200 hover:shadow-lg">
          <CardHeader className="pb-2 space-y-0">
            <CardDescription className="text-muted-foreground">En Progreso</CardDescription>
            <CardTitle className="text-3xl flex justify-between items-center">
              {inProgressOrders}
              <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <Wrench className="h-5 w-5 text-blue-500 dark:text-blue-400" />
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {inProgressOrders === 1 ? "Orden en proceso" : "Órdenes en proceso"} de reparación
            </p>
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-0 shadow-md bg-gradient-to-br from-card to-card/80 transition-all duration-200 hover:shadow-lg">
          <CardHeader className="pb-2 space-y-0">
            <CardDescription className="text-muted-foreground">Ingresos Totales</CardDescription>
            <CardTitle className="text-3xl flex justify-between items-center">
              {formatCurrency(totalRevenue)}
              <div className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-green-500 dark:text-green-400" />
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Pagos pendientes: {formatCurrency(pendingPayments)}</p>
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-0 shadow-md bg-gradient-to-br from-card to-card/80 transition-all duration-200 hover:shadow-lg">
          <CardHeader className="pb-2 space-y-0">
            <CardDescription className="text-muted-foreground">Técnicos Activos</CardDescription>
            <CardTitle className="text-3xl flex justify-between items-center">
              {activeTechnicians}
              <div className="h-10 w-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                <Users className="h-5 w-5 text-purple-500 dark:text-purple-400" />
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">De un total de {technicians.length} técnicos registrados</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for different views */}
      <Tabs defaultValue="recent" className="space-y-6">
        <TabsList className="bg-muted/50 p-1">
          <TabsTrigger value="recent" className="flex items-center gap-2 data-[state=active]:bg-background">
            <ClipboardList className="h-4 w-4" />
            Órdenes Recientes
          </TabsTrigger>
          <TabsTrigger value="stats" className="flex items-center gap-2 data-[state=active]:bg-background">
            <BarChart3 className="h-4 w-4" />
            Estadísticas
          </TabsTrigger>
        </TabsList>

        <TabsContent value="recent" className="space-y-4">
          <div className="rounded-xl border shadow-sm overflow-hidden">
            <div className="p-4 bg-muted/30">
              <h2 className="text-xl font-semibold tracking-tight">Órdenes Recientes</h2>
            </div>
            <div className="divide-y">
              {recentOrders.length > 0 ? (
                recentOrders.map((order) => (
                  <div 
                    key={order.id} 
                    className="p-4 flex flex-col md:flex-row md:items-center md:justify-between transition-colors hover:bg-muted/10"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Link href={`/ordenes/${order.id}`} className="font-medium hover:underline text-primary">
                          {order.orderNumber}
                        </Link>
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            order.status === "PENDING"
                              ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300"
                              : order.status === "ASSIGNED" || order.status === "IN_PROGRESS"
                                ? "bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300"
                                : order.status === "COMPLETED"
                                  ? "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300"
                                  : order.status === "DELIVERED"
                                    ? "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
                                    : "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300"
                          }`}
                        >
                          {order.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <User className="h-3 w-3" />
                        <span>{order.client.name}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Laptop className="h-3 w-3" />
                        <span>
                          {order.appliance.name} ({order.appliance.brand.name})
                        </span>
                      </div>
                    </div>
                    <div className="mt-2 md:mt-0 flex flex-col items-end">
                      <div className="text-sm font-medium">{formatCurrency(Number(order.totalAmount) || 0)}</div>
                      <div
                        className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                          order.paymentStatus === "PAID"
                            ? "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300"
                            : order.paymentStatus === "PARTIAL"
                              ? "bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300"
                              : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300"
                        }`}
                      >
                        {order.paymentStatus}
                      </div>
                      <Button variant="ghost" size="sm" asChild className="mt-1 hover:bg-muted/20">
                        <Link href={`/ordenes/${order.id}`}>Ver detalles</Link>
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center">
                  <p className="text-muted-foreground mb-4">No hay órdenes recientes</p>
                  <Button asChild className="bg-primary hover:bg-primary/90 transition-colors">
                    <Link href="/orden">Crear primera orden</Link>
                  </Button>
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="stats" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-0 shadow-sm hover:shadow-md transition-shadow duration-200">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Settings className="h-5 w-5 text-primary" />
                  Resumen de Órdenes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-2 rounded-lg hover:bg-muted/20 transition-colors">
                    <span className="text-muted-foreground">Total de órdenes:</span>
                    <span className="font-medium">{orders.length}</span>
                  </div>
                  <div className="flex justify-between items-center p-2 rounded-lg hover:bg-muted/20 transition-colors">
                    <span className="text-muted-foreground">Pendientes:</span>
                    <span className="font-medium">{pendingOrders}</span>
                  </div>
                  <div className="flex justify-between items-center p-2 rounded-lg hover:bg-muted/20 transition-colors">
                    <span className="text-muted-foreground">En progreso:</span>
                    <span className="font-medium">{inProgressOrders}</span>
                  </div>
                  <div className="flex justify-between items-center p-2 rounded-lg hover:bg-muted/20 transition-colors">
                    <span className="text-muted-foreground">Completadas:</span>
                    <span className="font-medium">{completedOrders}</span>
                  </div>
                  <div className="flex justify-between items-center p-2 rounded-lg hover:bg-muted/20 transition-colors">
                    <span className="text-muted-foreground">Entregadas:</span>
                    <span className="font-medium">{deliveredOrders}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm hover:shadow-md transition-shadow duration-200">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <DollarSign className="h-5 w-5 text-primary" />
                  Resumen Financiero
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-2 rounded-lg hover:bg-muted/20 transition-colors">
                    <span className="text-muted-foreground">Ingresos totales:</span>
                    <span className="font-medium">{formatCurrency(totalRevenue)}</span>
                  </div>
                  <div className="flex justify-between items-center p-2 rounded-lg hover:bg-muted/20 transition-colors">
                    <span className="text-muted-foreground">Pagos pendientes:</span>
                    <span className="font-medium">{formatCurrency(pendingPayments)}</span>
                  </div>
                  <div className="flex justify-between items-center p-2 rounded-lg hover:bg-muted/20 transition-colors">
                    <span className="text-muted-foreground">Órdenes pagadas:</span>
                    <span className="font-medium">
                      {orders.filter((order) => order.paymentStatus === "PAID").length}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-2 rounded-lg hover:bg-muted/20 transition-colors">
                    <span className="text-muted-foreground">Órdenes con pago parcial:</span>
                    <span className="font-medium">
                      {orders.filter((order) => order.paymentStatus === "PARTIAL").length}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="border-0 shadow-sm hover:shadow-md transition-shadow duration-200">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-xl">
                <Laptop className="h-5 w-5 text-primary" />
                Resumen General
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-3">
                  <h3 className="font-medium text-primary">Clientes</h3>
                  <div className="p-2 rounded-lg hover:bg-muted/20 transition-colors">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Total de clientes:</span>
                      <span className="font-medium">{clients.length}</span>
                    </div>
                  </div>
                  <div className="p-2 rounded-lg hover:bg-muted/20 transition-colors">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Clientes activos:</span>
                      <span className="font-medium">{clients.filter((client) => client.status === "active").length}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="font-medium text-primary">Técnicos</h3>
                  <div className="p-2 rounded-lg hover:bg-muted/20 transition-colors">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Total de técnicos:</span>
                      <span className="font-medium">{technicians.length}</span>
                    </div>
                  </div>
                  <div className="p-2 rounded-lg hover:bg-muted/20 transition-colors">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Técnicos activos:</span>
                      <span className="font-medium">{activeTechnicians}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="font-medium text-primary">Electrodomésticos</h3>
                  <div className="p-2 rounded-lg hover:bg-muted/20 transition-colors">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Total registrados:</span>
                      <span className="font-medium">{appliances.length}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}