// tecnico/_components/TechnicianNav.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOutTechnician } from "@/features/auth/technician-auth";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Wrench, FileText, BarChart2, LogOut, User, X, ChevronsLeft, ChevronsRight } from "lucide-react";

interface TechnicianNavProps {
  user: {
    name?: string | null;
  } | null;
  closeSidebar: () => void;
  // CAMBIO: Recibimos el estado de colapso y su setter
  isCollapsed: boolean;
  setIsCollapsed: (isCollapsed: boolean) => void;
}

export function TechnicianNav({ user, closeSidebar, isCollapsed, setIsCollapsed }: TechnicianNavProps) {
  const pathname = usePathname();

  const links = [
    { href: "/tecnico/ordenes", label: "Mis Órdenes", icon: FileText },
    { href: "/tecnico/reportes", label: "Reportes", icon: BarChart2 },
    { href: "/tecnico/profile", label: "Mi Perfil", icon: User },
  ];

  return (
    <div className="flex h-full flex-col p-2">
      {/* Encabezado del Sidebar */}
      <div className={cn(
        "mb-4 flex items-center px-2 pt-2 transition-all",
        isCollapsed ? "justify-center" : "justify-between"
      )}>
        <div className="flex items-center gap-2">
          <Wrench className="h-7 w-7 flex-shrink-0 text-sky-400" />
          {/* CAMBIO: Ocultamos el texto si está colapsado */}
          {!isCollapsed && (
            <span className="text-lg font-semibold">Portal Técnico</span>
          )}
        </div>
        <Button variant="ghost" size="icon" className="md:hidden" onClick={closeSidebar}>
          <X className="h-6 w-6" />
        </Button>
      </div>

      {/* Navegación */}
      <nav className="flex flex-col gap-1">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            onClick={closeSidebar} // Esto cierra el menú overlay en móvil
            // CAMBIO: Añadimos un tooltip en escritorio cuando está colapsado
            title={isCollapsed ? link.label : ""}
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-gray-300 transition-colors hover:bg-gray-700 hover:text-white",
              pathname.startsWith(link.href) && "bg-gray-900 text-white",
              // CAMBIO: Centramos el ícono si está colapsado
              isCollapsed && "justify-center"
            )}
          >
            <link.icon className="h-5 w-5 flex-shrink-0" />
            {/* CAMBIO: Ocultamos la etiqueta de texto si está colapsado */}
            {!isCollapsed && (
              <span className="truncate">{link.label}</span>
            )}
          </Link>
        ))}
      </nav>

      {/* Footer del Sidebar */}
      <div className="mt-auto space-y-2 border-t border-gray-700 pt-2">
        {/* CAMBIO: Botón para colapsar/expandir, solo visible en escritorio */}
        <div className="hidden md:block">
            <Button
                onClick={() => setIsCollapsed(!isCollapsed)}
                variant="ghost"
                className="w-full justify-center gap-3 px-3 py-2 text-gray-300 hover:bg-gray-700 hover:text-white"
            >
                {isCollapsed ? <ChevronsRight className="h-5 w-5" /> : <ChevronsLeft className="h-5 w-5" />}
                <span className="sr-only">{isCollapsed ? "Expandir" : "Colapsar"}</span>
            </Button>
        </div>

        {/* Info de Usuario */}
        <div className={cn(
            "flex items-center gap-3 rounded-md px-3 py-2 text-gray-300",
            isCollapsed && "justify-center"
        )}>
          <User className="h-5 w-5 flex-shrink-0" />
          {!isCollapsed && (
            <span className="font-medium truncate">{user?.name || "Técnico"}</span>
          )}
        </div>
        {/* Logout */}
        <form action={signOutTechnician} className="w-full">
          <Button
            variant="ghost"
            className={cn(
                "w-full justify-start gap-3 px-3 py-2 text-gray-300 hover:bg-gray-700 hover:text-white",
                isCollapsed && "justify-center"
            )}
          >
            <LogOut className="h-5 w-5 flex-shrink-0" />
            {!isCollapsed && "Cerrar Sesión"}
          </Button>
        </form>
      </div>
    </div>
  );
}