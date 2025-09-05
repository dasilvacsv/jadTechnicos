"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOutTechnician } from "@/features/auth/technician-auth";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { Wrench, FileText, BarChart2, LogOut, User, X, ChevronsLeft, ChevronsRight } from "lucide-react";
import type { LucideIcon } from "lucide-react";

// --- Tipos y Datos de Navegación ---
interface NavLink {
  href: string;
  label: string;
  icon: LucideIcon;
}

interface TechnicianNavProps {
  user: { name?: string | null } | null;
  closeSidebar: () => void;
  isCollapsed: boolean;
  setIsCollapsed: (isCollapsed: boolean) => void;
}

const links: NavLink[] = [
  { href: "/tecnico/ordenes", label: "Mis Órdenes", icon: FileText },
  { href: "/tecnico/reportes", label: "Reportes", icon: BarChart2 },
  { href: "/tecnico/profile", label: "Mi Perfil", icon: User },
];

// --- Sub-componente para cada elemento de navegación ---
// Limpia el código principal y maneja la lógica del tooltip de forma aislada.
function NavItem({ link, pathname, isCollapsed, closeSidebar }: { link: NavLink, pathname: string, isCollapsed: boolean, closeSidebar: () => void }) {
  const isActive = pathname.startsWith(link.href);

  const linkContent = (
    <Link
      href={link.href}
      onClick={closeSidebar}
      className={cn(
        "flex items-center gap-4 rounded-lg px-4 py-3 text-gray-300 transition-all duration-200 ease-in-out",
        "hover:bg-sky-700/60 hover:text-white", // Hover más visible
        isActive && "bg-sky-800 text-white shadow-sm", // Fondo azul más oscuro para activo
        isCollapsed && "justify-center"
      )}
    >
      <link.icon className="h-5 w-5 flex-shrink-0" />
      {!isCollapsed && <span className="truncate text-base">{link.label}</span>}
    </Link>
  );

  if (isCollapsed) {
    return (
      <Tooltip delayDuration={0}>
        <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
        <TooltipContent side="right" className="bg-gray-800 text-white border-gray-700">
          <p>{link.label}</p>
        </TooltipContent>
      </Tooltip>
    );
  }

  return linkContent;
}

// --- Componente Principal de Navegación ---
export function TechnicianNav({ user, closeSidebar, isCollapsed, setIsCollapsed }: TechnicianNavProps) {
  const pathname = usePathname();
  
  const getInitials = (name?: string | null) => {
    if (!name) return "?";
    const names = name.split(' ');
    if (names.length > 1) return `${names[0][0]}${names[1][0]}`.toUpperCase();
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <TooltipProvider>
      {/* Contenedor principal: Fondo oscuro, bordes sutiles */}
      <div className="flex h-full flex-col border-r border-gray-800 bg-gray-950 text-gray-200 shadow-xl">
        
        {/* 1. Encabezado de la barra lateral */}
        <header className={cn(
            "flex h-16 items-center border-b border-gray-800 px-4 transition-all duration-300 ease-in-out",
            isCollapsed ? "justify-center" : "justify-between"
        )}>
          <div className="flex items-center gap-2">
            <Wrench className="h-7 w-7 text-sky-400" />
            {!isCollapsed && <span className="text-xl font-bold tracking-tight">Portal Técnico</span>}
          </div>
          <Button variant="ghost" size="icon" className="md:hidden text-gray-400 hover:text-white" onClick={closeSidebar}>
            <X className="h-6 w-6" />
            <span className="sr-only">Cerrar menú</span>
          </Button>
        </header>

        {/* 2. Área de Navegación Principal (con scroll si hay muchos ítems) */}
        <ScrollArea className="flex-1 px-2 py-4">
          <nav className="space-y-1">
            {links.map((link) => (
              <NavItem key={link.href} link={link} pathname={pathname} isCollapsed={isCollapsed} closeSidebar={closeSidebar} />
            ))}
          </nav>
        </ScrollArea>

        {/* 3. Footer con info de usuario y acciones */}
        <footer className="mt-auto space-y-3 border-t border-gray-800 p-4">
          {/* Botón para colapsar (solo visible en desktop) */}
          <div className="hidden md:block">
             <Button
                onClick={() => setIsCollapsed(!isCollapsed)}
                variant="ghost"
                size="icon"
                className="w-full text-gray-400 hover:bg-gray-800 hover:text-white"
              >
                {isCollapsed ? <ChevronsRight className="h-5 w-5" /> : <ChevronsLeft className="h-5 w-5" />}
                <span className="sr-only">{isCollapsed ? "Expandir" : "Colapsar"}</span>
              </Button>
          </div>
          
          {/* Info de Usuario con Tooltip para el nombre */}
          <TooltipProvider delayDuration={100}>
              <Tooltip>
                  <TooltipTrigger asChild>
                      <div className={cn(
                          "flex cursor-default items-center gap-3 rounded-lg p-2 text-gray-300",
                          isCollapsed && "justify-center"
                      )}>
                          <Avatar className="h-9 w-9 border border-gray-700">
                              <AvatarFallback className="bg-sky-800 text-white">{getInitials(user?.name)}</AvatarFallback>
                          </Avatar>
                          {!isCollapsed && (
                              <div className="flex-1 truncate"> {/* Se mantiene truncate para la estética */}
                                  <p className="font-semibold text-white">{user?.name || "Técnico"}</p>
                              </div>
                          )}
                      </div>
                  </TooltipTrigger>
                  {/* El Tooltip solo se mostrará si la barra no está colapsada */}
                  {!isCollapsed && (
                      <TooltipContent side="top" align="start" className="bg-gray-800 text-white border-gray-700">
                          <p>{user?.name || "Técnico"}</p>
                      </TooltipContent>
                  )}
              </Tooltip>
          </TooltipProvider>

          {/* Botón de Cerrar Sesión */}
          <form action={signOutTechnician}>
            <Button variant="ghost" className={cn(
              "w-full justify-start gap-4 px-4 py-3 text-red-400 hover:bg-red-900/40 hover:text-red-300",
              isCollapsed && "justify-center"
            )}>
              <LogOut className="h-5 w-5" />
              {!isCollapsed && "Cerrar Sesión"}
            </Button>
          </form>
        </footer>
      </div>
    </TooltipProvider>
  );
}