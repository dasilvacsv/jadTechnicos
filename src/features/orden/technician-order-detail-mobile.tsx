// src/features/orden/technician-order-detail-mobile.tsx

"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  User,
  MapPin,
  Phone,
  Wrench,
  Calendar,
  AlertTriangle,
  ClipboardList,
  MessageSquare,
} from "lucide-react";

// Helper para obtener el color del badge según el estado
const getStatusVariant = (status: string) => {
  switch (status) {
    case "PENDING":
    case "ASSIGNED":
      return "secondary";
    case "IN_PROGRESS":
    case "REPARANDO":
      return "default";
    case "COMPLETED":
    case "DELIVERED":
      return "success";
    case "CANCELLED":
    case "NO_APROBADO":
      return "destructive";
    case "APROBADO":
      return "success";
    default:
      return "outline";
  }
};

// Helper para formatear fechas de forma legible
const formatReadableDate = (dateString: string | null) => {
  if (!dateString) return "No especificada";
  return new Date(dateString).toLocaleDateString("es-VE", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export function TechnicianOrderDetailMobile({ order }: { order: any }) {
  if (!order) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100 dark:bg-gray-900">
        <p>No se encontró la orden.</p>
      </div>
    );
  }
  
  // Extraemos la información para fácil acceso
  const { client, appliances, status, orderNumber, fechaAgendado, description, diagnostics } = order;

  return (
    <div className="bg-gray-50 dark:bg-black min-h-screen p-2 md:p-4 font-sans">
      <div className="max-w-md mx-auto space-y-4">
        
        {/* --- CABECERA DE LA ORDEN --- */}
        <Card className="shadow-md bg-white dark:bg-gray-900">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-xl font-bold text-gray-800 dark:text-gray-100">
                Orden #{orderNumber}
              </CardTitle>
              <Badge variant={getStatusVariant(status)} className="text-sm">
                {status}
              </Badge>
            </div>
          </CardHeader>
        </Card>
        
        {/* --- FECHA AGENDADA --- */}
        {fechaAgendado && (
          <Card className="shadow-md bg-white dark:bg-gray-900 border-l-4 border-blue-500">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-lg">
                <Calendar className="h-6 w-6 text-blue-500" />
                <span>Cita Agendada</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-base font-semibold text-gray-700 dark:text-gray-200">
                {formatReadableDate(fechaAgendado)}
              </p>
            </CardContent>
          </Card>
        )}

        {/* --- INFORMACIÓN DEL CLIENTE --- */}
        <Card className="shadow-md bg-white dark:bg-gray-900">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-lg">
              <User className="h-6 w-6 text-gray-600 dark:text-gray-300" />
              <span>Información del Cliente</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="font-semibold text-gray-800 dark:text-gray-100 text-lg">
              {client.name}
            </p>
            {client.address && (
              <div className="flex items-start gap-3 text-gray-600 dark:text-gray-400">
                <MapPin className="h-5 w-5 mt-1 flex-shrink-0" />
                <p>{client.address}</p>
              </div>
            )}
            <Separator />
            <div className="flex flex-col sm:flex-row gap-2">
              <Button asChild variant="outline" className="w-full">
                <a href={`tel:${client.phone}`} className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  Llamar
                </a>
              </Button>
              {client.address && (
                 <Button asChild variant="outline" className="w-full">
                   <a
                     href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(client.address)}`}
                     target="_blank"
                     rel="noopener noreferrer"
                     className="flex items-center gap-2"
                   >
                     <MapPin className="h-4 w-4" />
                     Ver en Mapa
                   </a>
                 </Button>
              )}
            </div>
          </CardContent>
        </Card>
        
        {/* --- ELECTRODOMÉSTICOS Y FALLAS --- */}
        {appliances.map((app: any, index: number) => (
          <Card key={index} className="shadow-md bg-white dark:bg-gray-900">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-lg">
                <Wrench className="h-6 w-6 text-gray-600 dark:text-gray-300" />
                <span>Equipo a Revisar</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="font-bold text-base text-gray-800 dark:text-gray-100">
                {app.clientAppliance.name} ({app.clientAppliance.brand.name})
              </div>
              <Separator />
              {app.falla && (
                <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 rounded-r-md">
                  <h4 className="font-semibold flex items-center gap-2 text-yellow-800 dark:text-yellow-300">
                    <AlertTriangle className="h-5 w-5" />
                    Falla Reportada
                  </h4>
                  <p className="mt-1 text-yellow-700 dark:text-yellow-200 italic">"{app.falla}"</p>
                </div>
              )}
               {app.solucion && (
                <div className="p-3 bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500 rounded-r-md">
                  <h4 className="font-semibold flex items-center gap-2 text-green-800 dark:text-green-300">
                    <Wrench className="h-5 w-5" />
                    Solución Aplicada
                  </h4>
                  <p className="mt-1 text-green-700 dark:text-green-200">{app.solucion}</p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}

        {/* --- DETALLES DE LA ORDEN --- */}
        {(description || diagnostics) && (
            <Card className="shadow-md bg-white dark:bg-gray-900">
                <CardHeader>
                    <CardTitle className="flex items-center gap-3 text-lg">
                        <ClipboardList className="h-6 w-6 text-gray-600 dark:text-gray-300" />
                        <span>Notas de la Orden</span>
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {description && (
                        <div>
                            <h4 className="font-semibold text-gray-700 dark:text-gray-300">Descripción inicial:</h4>
                            <p className="text-gray-600 dark:text-gray-400 mt-1">{description}</p>
                        </div>
                    )}
                    {diagnostics && (
                         <div>
                            <h4 className="font-semibold text-gray-700 dark:text-gray-300">Diagnóstico previo:</h4>
                            <p className="text-gray-600 dark:text-gray-400 mt-1">{diagnostics}</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        )}
        
      </div>
    </div>
  );
}