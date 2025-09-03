"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOutTechnician } from "@/features/auth/technician-auth";

// Componentes que SÍ tienes de shadcn-ui y Next.js
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Tus componentes de layout personalizados
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";

// Iconos
import { LogOut, Wrench, FileText, BarChart2 } from "lucide-react";

// Componente para el botón de logout (se mantiene igual)
function LogoutButton() {
  return (
    <form action={signOutTechnician} className="w-full">
      <Button variant="ghost" className="w-full justify-start gap-2">
        <LogOut className="h-4 w-4" />
        Cerrar Sesión
      </Button>
    </form>
  );
}

// Sidebar principal del técnico (versión corregida para shadcn-ui)
export function TechnicianSidebar() {
  // Usamos 'usePathname' para saber qué enlace está activo
  const pathname = usePathname();

  return (
    <Sidebar>
      <SidebarHeader>
        <Link href="/tecnico/ordenes" className="flex items-center gap-2">
          <Wrench className="h-6 w-6 text-primary" />
          <h1 className="text-lg font-semibold">Portal Técnico</h1>
        </Link>
      </SidebarHeader>

      <SidebarContent>
        {/* Usamos una etiqueta <nav> simple en lugar de <SidebarNav> */}
        <nav className="flex flex-col gap-1 px-2">
          {/* Cada enlace es un componente <Link> de Next.js */}
          <Link href="/tecnico/ordenes">
            {/* Usamos el componente <Button> con un estilo condicional */}
            <Button
              variant={pathname.startsWith("/tecnico/ordenes") ? "secondary" : "ghost"}
              className="w-full justify-start gap-2"
            >
              <FileText className="h-4 w-4" />
              Mis Órdenes
            </Button>
          </Link>
          <Link href="/tecnico/reportes">
            <Button
              variant={pathname.startsWith("/tecnico/reportes") ? "secondary" : "ghost"}
              className="w-full justify-start gap-2"
            >
              <BarChart2 className="h-4 w-4" />
              Reportes
            </Button>
          </Link>
        </nav>
      </SidebarContent>

      <SidebarFooter className="p-2">
        <LogoutButton />
      </SidebarFooter>
    </Sidebar>
  );
}