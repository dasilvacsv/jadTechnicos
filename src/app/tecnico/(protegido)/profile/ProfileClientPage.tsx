"use client";

import { useState } from "react";
// Eliminamos importaciones no usadas en este componente
// import { ServiceOrder } from "@/features/orden/service-order"; 
import { updateTechnicianPassword } from "@/features/auth/technician-auth";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { User, Phone, KeyRound, CheckCircle, Clock, Package, ListOrdered, ArrowRight, Loader2, UserCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { formatDate } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";


// --- Tipos (Sin cambios) ---
type TechnicianData = { id: string; name: string; phone: string | null; };
type StatsData = { totalOrders: number; completedOrders: number; pendingOrders: number; recentOrders: any[]; } | null;
interface ProfileClientPageProps {
  technician: TechnicianData;
  stats: StatsData;
}


// --- Componente de Diálogo (Sin cambios funcionales, solo estéticos en el trigger) ---
function ChangePasswordDialog() {
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    // ... (lógica sin cambios)
    setError(null);
    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }
    setIsLoading(true);
    const result = await updateTechnicianPassword(password);
    setIsLoading(false);

    if (result.success) {
      toast.success(result.message);
      setOpen(false);
      setPassword("");
      setConfirmPassword("");
    } else {
      setError(result.error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <KeyRound className="mr-2 h-4 w-4" />
          Cambiar Contraseña
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Establecer Nueva Contraseña</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="new-password">Nueva Contraseña</Label>
            <Input id="new-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm-password">Confirmar Contraseña</Label>
            <Input id="confirm-password" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>
        <DialogFooter className="gap-2 sm:gap-0">
          <DialogClose asChild>
            <Button variant="outline">Cancelar</Button>
          </DialogClose>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Guardar Cambios
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


// --- Componente de Tarjeta de Estadística Mejorada ---
const StatCard = ({ icon: Icon, label, value, iconClassName }: { icon: React.ElementType, label: string, value: number, iconClassName: string }) => (
    <div className="transform-gpu rounded-xl border bg-card text-card-foreground shadow-sm transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-lg">
      <div className="p-6 flex flex-row items-center justify-between space-y-0">
        <h3 className="tracking-tight text-sm font-medium text-muted-foreground">{label}</h3>
        <Icon className={`h-6 w-6 text-muted-foreground ${iconClassName}`} />
      </div>
      <div className="p-6 pt-0">
        <div className="text-3xl font-bold">{value}</div>
      </div>
    </div>
);


// --- Componente Principal de la Página de Perfil ---
export function ProfileClientPage({ technician, stats }: ProfileClientPageProps) {
  const getInitials = (name: string) => {
    const names = name.split(' ');
    if (names.length > 1) {
      return `${names[0][0]}${names[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };
  
  return (
    // Contenedor principal con un fondo sutil para un look más premium
    <div className="min-h-screen w-full bg-muted/20">
      <main className="container mx-auto grid gap-8 px-4 py-8 sm:px-6 md:py-12">
        
        {/* --- 1. Encabezado de Bienvenida --- */}
        <section className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16 border-2 border-primary">
              {/* Si tienes la URL de la imagen, la pones en AvatarImage */}
              <AvatarImage src="" alt={technician.name} />
              <AvatarFallback className="text-xl font-bold">
                {getInitials(technician.name)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
                Hola, {technician.name.split(' ')[0]}!
              </h1>
              <p className="text-muted-foreground">Bienvenido a tu panel de control.</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
             <Button variant="outline" size="sm" asChild>
                <a href={`tel:${technician.phone}`}>
                    <Phone className="mr-2 h-4 w-4" />
                    {technician.phone}
                </a>
            </Button>
            <ChangePasswordDialog />
          </div>
        </section>

        {/* --- 2. Sección de Estadísticas --- */}
        {stats && (
          <section>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <ListOrdered className="h-5 w-5" />
              Resumen de tu Actividad
            </h2>
            {/* Grid responsivo: 2 columnas en móvil, 3 en escritorio */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
              <StatCard icon={Package} label="Órdenes Totales" value={stats.totalOrders} iconClassName="text-primary" />
              <StatCard icon={CheckCircle} label="Completadas" value={stats.completedOrders} iconClassName="text-green-500" />
              {/* El span hace que ocupe todo el ancho si es el último en una fila impar */}
              <div className="col-span-2 md:col-span-1">
                <StatCard icon={Clock} label="Pendientes" value={stats.pendingOrders} iconClassName="text-amber-500" />
              </div>
            </div>
          </section>
        )}
        
        {/* --- 3. Sección de Órdenes Recientes --- */}
        {stats && stats.recentOrders.length > 0 && (
          <section>
             <Card>
               <CardHeader>
                 <CardTitle>Órdenes Recientes</CardTitle>
                 <CardDescription>Las últimas órdenes que te han sido asignadas.</CardDescription>
               </CardHeader>
               <CardContent>
                 <ul className="space-y-4">
                   {stats.recentOrders.map(order => (
                     <li key={order.id}>
                       <Link 
                         href={`/tecnico/ordenes/${order.id}`} 
                         className="block p-4 rounded-lg border bg-background transition-all duration-200 ease-in-out hover:bg-muted/50 hover:border-primary/50"
                       >
                         <div className="flex flex-col sm:flex-row sm:justify-between gap-2">
                           <div>
                             <p className="font-semibold text-primary">#{order.orderNumber}</p>
                             <p className="font-medium text-foreground">{order.client.name}</p>
                           </div>
                           <div className="self-start sm:self-center">
                             <Badge variant="outline">{formatDate(order.createdAt)}</Badge>
                           </div>
                         </div>
                       </Link>
                     </li>
                   ))}
                 </ul>
               </CardContent>
               <CardFooter className="border-t pt-4">
                 <Button asChild variant="ghost" className="w-full sm:w-auto">
                   <Link href="/tecnico/ordenes">
                     Ver todas las órdenes
                     <ArrowRight className="ml-2 h-4 w-4" />
                   </Link>
                 </Button>
               </CardFooter>
             </Card>
          </section>
        )}
      </main>
    </div>
  );
}