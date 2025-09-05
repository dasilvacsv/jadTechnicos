// tecnico/_components/TechnicianLayoutClient.tsx
"use client";

import { useState } from "react";
import { TechnicianNav } from "./TechnicianNav";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface TechnicianLayoutClientProps {
  user: {
    name?: string | null;
  } | null;
  children: React.ReactNode;
}

export function TechnicianLayoutClient({ user, children }: TechnicianLayoutClientProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    // El contenedor principal sigue siendo flex
    <div className="flex h-screen bg-muted/40">
      {/* Overlay para móvil (sin cambios) */}
      {isSidebarOpen && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 z-30 bg-black/60 md:hidden"
          aria-hidden="true"
        />
      )}

      {/* Sidebar (sin cambios) */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex h-full flex-shrink-0 flex-col bg-gray-800 text-white transition-all duration-300 ease-in-out",
          "md:relative",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
          isSidebarCollapsed ? "md:w-20" : "md:w-60"
        )}
      >
        <TechnicianNav
          user={user}
          closeSidebar={() => setIsSidebarOpen(false)}
          isCollapsed={isSidebarCollapsed}
          setIsCollapsed={setIsSidebarCollapsed}
        />
      </aside>

      {/* ===== INICIO DEL CAMBIO ===== */}
      {/* CAMBIO: Eliminamos el margen dinámico de este div. */}
      {/* La clase 'flex-1' es suficiente para que ocupe el espacio restante. */}
      {/* Añadimos 'min-w-0' para prevenir desbordamientos si el contenido interno es muy ancho. */}
      <div className="flex flex-1 flex-col min-w-0">
      {/* ===== FIN DEL CAMBIO ===== */}

        {/* Header para móvil (sin cambios) */}
        <header className="flex h-14 items-center gap-4 border-b bg-background px-4 md:hidden">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setIsSidebarOpen(true)}
            className="shrink-0"
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle navigation menu</span>
          </Button>
          <div className="text-lg font-semibold">Portal Técnico</div>
        </header>

        {/* Contenido principal */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-4 sm:p-6">{children}</div>
        </main>
      </div>
    </div>
  );
}