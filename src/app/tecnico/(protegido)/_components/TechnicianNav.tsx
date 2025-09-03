"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOutTechnician } from "@/features/auth/technician-auth";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Wrench, FileText, BarChart2, LogOut, User } from "lucide-react";

// CAMBIO: El componente ahora espera recibir los datos del usuario
interface TechnicianNavProps {
  user: {
    name?: string | null;
  };
}

export function TechnicianNav({ user }: TechnicianNavProps) {
  const pathname = usePathname();

  const links = [
    { href: "/tecnico/ordenes", label: "Mis Órdenes", icon: FileText },
    { href: "/tecnico/reportes", label: "Reportes", icon: BarChart2 },
    // NUEVO: Añadimos el enlace al perfil
    { href: "/tecnico/profile", label: "Mi Perfil", icon: User },
  ];

  return (
    <div className="flex h-full flex-col p-2">
      {/* Encabezado del Sidebar */}
      <div className="mb-4 flex items-center gap-2 px-2 pt-2">
        <Wrench className="h-7 w-7 text-sky-400" />
        <span className="text-lg font-semibold">Portal Técnico</span>
      </div>

      {/* Navegación */}
      <nav className="flex flex-col gap-1">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-gray-300 transition-colors hover:bg-gray-700 hover:text-white",
              pathname.startsWith(link.href) && "bg-gray-900 text-white"
            )}
          >
            <link.icon className="h-5 w-5" />
            {link.label}
          </Link>
        ))}
      </nav>

      {/* Botón de Logout e Info de Usuario (al final) */}
      <div className="mt-auto space-y-2">
        <div className="border-t border-gray-700 pt-2">
            <div
              className="flex items-center gap-3 rounded-md px-3 py-2 text-gray-300"
            >
              <User className="h-5 w-5" />
              {/* Aquí mostramos el nombre del técnico */}
              <span className="font-medium">{user?.name || "Técnico"}</span>
            </div>
        </div>
        <form action={signOutTechnician} className="w-full">
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 px-3 py-2 text-gray-300 hover:bg-gray-700 hover:text-white"
          >
            <LogOut className="h-5 w-5" />
            Cerrar Sesión
          </Button>
        </form>
      </div>
    </div>
  );
}