"use client";

import { useState } from "react";
import { ServiceOrder } from "@/features/orden/service-order";
import { updateTechnicianPassword } from "@/features/auth/technician-auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { User, Phone, KeyRound, CheckCircle, Clock, Package, List, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import {formatDate} from "@/lib/utils";

// Tipos para los datos que recibimos
type TechnicianData = { id: string; name: string; phone: string | null; };
type StatsData = { totalOrders: number; completedOrders: number; pendingOrders: number; recentOrders: any[]; } | null;

interface ProfileClientPageProps {
  technician: TechnicianData;
  stats: StatsData;
}

function ChangePasswordDialog({ technicianId }: { technicianId: string }) {
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
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
        <Button>
          <KeyRound className="mr-2 h-4 w-4" />
          Cambiar Contraseña
        </Button>
      </DialogTrigger>
      <DialogContent>
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
        <DialogFooter>
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

export function ProfileClientPage({ technician, stats }: ProfileClientPageProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-6 w-6" />
            Información de la Cuenta
          </CardTitle>
          <CardDescription>Tus datos registrados en el sistema.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <User className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Nombre Completo</p>
              <p className="font-medium">{technician.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Phone className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Número de Teléfono</p>
              <p className="font-medium">{technician.phone}</p>
            </div>
          </div>
          <div className="mt-6 pt-4 border-t">
            <ChangePasswordDialog technicianId={technician.id} />
          </div>
        </CardContent>
      </Card>
      
      {stats && (
        <>
        <Card>
            <CardHeader>
                <CardTitle>Estadísticas de Trabajo</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-3">
                <div className="flex items-center space-x-4 rounded-md border p-4">
                    <Package className="h-8 w-8 text-primary"/>
                    <div>
                        <p className="text-sm font-medium">Órdenes Totales</p>
                        <p className="text-2xl font-bold">{stats.totalOrders}</p>
                    </div>
                </div>
                <div className="flex items-center space-x-4 rounded-md border p-4">
                    <CheckCircle className="h-8 w-8 text-green-500"/>
                    <div>
                        <p className="text-sm font-medium">Completadas</p>
                        <p className="text-2xl font-bold">{stats.completedOrders}</p>
                    </div>
                </div>
                <div className="flex items-center space-x-4 rounded-md border p-4">
                    <Clock className="h-8 w-8 text-amber-500"/>
                    <div>
                        <p className="text-sm font-medium">Pendientes</p>
                        <p className="text-2xl font-bold">{stats.pendingOrders}</p>
                    </div>
                </div>
            </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle>Órdenes Recientes</CardTitle>
            </CardHeader>
            <CardContent>
                <ul className="space-y-2">
                    {stats.recentOrders.length > 0 ? stats.recentOrders.map(order => (
                        <li key={order.id} className="flex justify-between items-center rounded-md border p-3">
                            <div>
                                <Link href={`/tecnico/ordenes/${order.id}`} className="font-semibold hover:underline">
                                    #{order.orderNumber}
                                </Link>
                                <p className="text-sm text-muted-foreground">{order.client.name}</p>
                            </div>
                            <Badge variant="outline">{formatDate(order.createdAt)}</Badge>
                        </li>
                    )) : <p className="text-sm text-muted-foreground">No hay órdenes recientes.</p>}
                </ul>
            </CardContent>
        </Card>
        </>
      )}
    </div>
  );
}