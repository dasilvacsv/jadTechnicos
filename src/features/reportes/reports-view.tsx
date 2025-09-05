// src/features/orden/ReportsView.tsx

"use client";

import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import dynamic from 'next/dynamic';

// Hooks y Tipos
import { useServiceOrdersTable } from "@/features/orden/useServiceOrdersTable";
import { ServiceOrder } from "@/features/orden/service-order";

// Componentes de UI
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ActiveFiltersBar } from "@/features/orden/active-filters-bar";
import { StatusAccordion } from "./status-accordion";

// Iconos
import { Search, SlidersHorizontal, Inbox, X, Package, Clock, CheckCircle, XCircle } from "lucide-react";

// Carga diferida del panel de filtros para mejor rendimiento inicial
const FilterPanel = dynamic(() =>
  import('@/features/orden/filter-panel').then(mod => mod.FilterPanel),
  { ssr: false, loading: () => <p className="p-4 text-center">Cargando filtros...</p> }
);

// --- COMPONENTE DE UI PARA LAS MÉTRICAS (MEJORADO PARA MÓVIL) ---
const ReportMetricsCards = ({ totales, pendientes, terminadas, canceladas }: any) => (
  // ✨ UX Móvil: Se usa un contenedor relativo para el efecto de degradado.
  <div className="relative w-full">
    {/* ✨ UX Móvil: scroll-snap-x-mandatory hace que el scroll se "enganche" a cada tarjeta. */}
    {/* scrollbar-hide oculta la barra de scroll para un look más limpio. */}
    <div className="flex gap-3 overflow-x-auto pb-4 -mx-4 px-4 md:mx-0 md:px-0 md:grid md:grid-cols-2 lg:grid-cols-4 scroll-snap-x-mandatory scrollbar-hide">
      {/* ✨ UX Móvil: scroll-snap-align-start asegura que cada tarjeta se alinee al inicio al hacer snap. */}
      <Card className="min-w-[220px] flex-shrink-0 flex-1 scroll-snap-align-start">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Mis Órdenes</CardTitle>
          <Package className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totales}</div>
          <p className="text-xs text-muted-foreground">Total de órdenes filtradas</p>
        </CardContent>
      </Card>
      <Card className="min-w-[220px] flex-shrink-0 flex-1 scroll-snap-align-start">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Pendientes</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{pendientes}</div>
          <p className="text-xs text-muted-foreground">En progreso o por iniciar</p>
        </CardContent>
      </Card>
      <Card className="min-w-[220px] flex-shrink-0 flex-1 scroll-snap-align-start">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Terminadas</CardTitle>
          <CheckCircle className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{terminadas}</div>
          <p className="text-xs text-muted-foreground">Completadas y entregadas</p>
        </CardContent>
      </Card>
      <Card className="min-w-[220px] flex-shrink-0 flex-1 scroll-snap-align-start">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Canceladas</CardTitle>
          <XCircle className="h-4 w-4 text-red-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{canceladas}</div>
          <p className="text-xs text-muted-foreground">No aprobadas o canceladas</p>
        </CardContent>
      </Card>
    </div>
    {/* ✨ UX Móvil: Degradado en el borde derecho para indicar que hay más contenido. Se oculta en pantallas grandes. */}
    <div className="absolute top-0 bottom-4 right-0 w-8 bg-gradient-to-l from-gray-50 dark:from-black to-transparent pointer-events-none md:hidden" />
  </div>
);

// --- INTERFACES ---
interface ReportsViewProps {
  initialOrders: ServiceOrder[];
  currentTechnicianName: string;
}

// --- COMPONENTE PRINCIPAL ---
export function ReportsView({ initialOrders, currentTechnicianName }: ReportsViewProps) {
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);

  const {
    table,
    globalFilter,
    setGlobalFilter,
    facetedFilters,
    activeFilters,
    dateRange,
    setDateRange,
    fechaAgendadoRange,
    setFechaAgendadoRange,
    fechaCaptacionRange,
    setFechaCaptacionRange,
    toggleFilter,
    resetFilters,
    hasActiveFilters,
  } = useServiceOrdersTable(initialOrders);

  const filteredRows = table.getFilteredRowModel().rows;
  const totalResults = filteredRows.length;

  const groupedByStatus = useMemo(() => {
    const statusMap = new Map<string, ServiceOrder[]>();
    filteredRows.forEach(row => {
      const order = row.original;
      const status = order.status;
      if (!statusMap.has(status)) statusMap.set(status, []);
      statusMap.get(status)!.push(order);
    });
    return statusMap;
  }, [filteredRows]);

  const reportMetrics = useMemo(() => {
    const ordersToCount = filteredRows.map(row => row.original);
    const pendientes = ordersToCount.filter(o => ["PREORDER", "PENDING", "ASSIGNED", "PENDIENTE_AVISAR", "REPARANDO", "IN_PROGRESS", "PRESUPUESTADO", "FACTURADO"].includes(o.status)).length;
    const terminadas = ordersToCount.filter(o => ["COMPLETED", "DELIVERED", "APROBADO", "GARANTIA_APLICADA"].includes(o.status)).length;
    const canceladas = ordersToCount.filter(o => ["CANCELLED", "NO_APROBADO"].includes(o.status)).length;
    return {
      totales: ordersToCount.length,
      pendientes,
      terminadas,
      canceladas,
    };
  }, [filteredRows]);

  const ReportsHeader = () => (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Reporte de {currentTechnicianName}</h1>
        <p className="text-sm text-muted-foreground">
          {hasActiveFilters ? "Mostrando" : "Total de"} {totalResults} resultado{totalResults !== 1 ? 's' : ''}.
        </p>
      </div>
      <div className="flex w-full md:w-auto items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por cliente o N° orden..."
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="pl-9 w-full md:w-64"
          />
        </div>
        <Button variant="outline" size="icon" onClick={() => setIsFilterPanelOpen(true)} className="flex-shrink-0">
          <SlidersHorizontal className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );

  const EmptyState = () => (
    <div className="flex flex-col items-center justify-center text-center text-muted-foreground p-8 md:p-12 h-full">
      <Inbox className="h-20 w-20 mb-4 text-gray-300 dark:text-gray-700" />
      <h3 className="text-xl font-semibold mb-1">No se encontraron resultados</h3>
      <p className="text-sm max-w-xs">
        {hasActiveFilters
          ? "Intenta ajustar tus filtros para encontrar lo que buscas."
          : "No tienes órdenes de servicio que coincidan."
        }
      </p>
      {hasActiveFilters && (
        <Button variant="ghost" onClick={resetFilters} className="mt-4">Limpiar filtros</Button>
      )}
    </div>
  );

  return (
    // ✨ UX Móvil: Padding más ajustado en pantallas pequeñas (sm) para dar más espacio al contenido.
    <div className="relative w-full h-full p-4 sm:p-6 bg-gray-50 dark:bg-black">
      <AnimatePresence>
        {isFilterPanelOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsFilterPanelOpen(false)}
              className="fixed inset-0 bg-black/60 z-40"
            />
            {/* ✨ UX Móvil: El panel de filtros ahora es un "Bottom Sheet" en móvil (sube desde abajo)
                y un panel lateral en desktop (md:). Esto es mucho más ergonómico en teléfonos. */}
            <motion.div
              initial={{ y: "100%", x: "-100%" }}
              animate={{ y: 0, x: 0 }}
              exit={{ y: "100%", x: "-100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed bottom-0 left-0 h-full w-full max-w-md bg-card z-50 flex flex-col
                         md:bottom-auto md:top-0 md:h-full md:max-w-sm rounded-t-2xl md:rounded-t-none"
            >
              {/* ✨ UX Móvil: "Grabber" handle para indicar que el panel es deslizable. */}
              <div className="w-full pt-3 md:hidden">
                <div className="mx-auto h-1.5 w-12 rounded-full bg-muted" />
              </div>
              <div className="p-4 border-b flex items-center justify-between">
                <h2 className="text-lg font-semibold">Filtros Avanzados</h2>
                <Button variant="ghost" size="icon" onClick={() => setIsFilterPanelOpen(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex-1 overflow-y-auto p-4">
                <FilterPanel {...{ facetedFilters, activeFilters, toggleFilter, dateRange, setDateRange, fechaAgendadoRange, setFechaAgendadoRange, fechaCaptacionRange, setFechaCaptacionRange, hasActiveFilters, resetFilters }} />
              </div>
              {/* ✨ UX Móvil: Botones de acción fijos en la parte inferior para una mejor usabilidad en móvil. */}
              <div className="p-4 border-t bg-card/95 backdrop-blur-sm flex gap-2 md:hidden">
                <Button variant="outline" className="flex-1" onClick={() => { resetFilters(); setIsFilterPanelOpen(false); }}>
                  Limpiar
                </Button>
                <Button className="flex-1" onClick={() => setIsFilterPanelOpen(false)}>
                  Ver resultados
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <div className="flex-1 flex flex-col h-full space-y-4">
        <ReportsHeader />
        {hasActiveFilters && (
          <ActiveFiltersBar {...{ resetFilters, activeFilters, facetedFilters, toggleFilter, dateRange, setDateRange, fechaAgendadoRange, setFechaAgendadoRange, fechaCaptacionRange, setFechaCaptacionRange, isTechnicianView: true }} />
        )}
        <ReportMetricsCards {...reportMetrics} />

        <Card className="flex-1 flex flex-col overflow-hidden">
          <CardHeader>
            <CardTitle>Desglose por Estado</CardTitle>
            <CardDescription>Tus órdenes de servicio agrupadas por su estado actual.</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 p-0 overflow-y-auto">
            {/* ✨ Se eliminó un div contenedor innecesario para simplificar la estructura. */}
            <div className="p-2 sm:p-4 h-full">
              {filteredRows.length > 0 ? (
                <StatusAccordion groupedData={groupedByStatus} />
              ) : (
                <EmptyState />
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}