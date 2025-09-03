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

// Componentes Personalizados
import { ActiveFiltersBar } from "@/features/orden/active-filters-bar";
import { StatusAccordion } from "./status-accordion"; // ✅ CAMBIO: Usamos el nuevo acordeón por estado

// Iconos
import { Search, SlidersHorizontal, Inbox, X, Package, Clock, CheckCircle, XCircle } from "lucide-react";

// Carga diferida del panel de filtros
const FilterPanel = dynamic(() =>
  import('@/features/orden/filter-panel').then(mod => mod.FilterPanel),
  { ssr: false, loading: () => <p className="p-4">Cargando filtros...</p> }
);

// --- COMPONENTE DE UI PARA LAS MÉTRICAS ---
const ReportMetricsCards = ({ totales, pendientes, terminadas, canceladas }: any) => (
  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        {/* ✅ CAMBIO: Título actualizado */}
        <CardTitle className="text-sm font-medium">Mis Órdenes Totales</CardTitle>
        <Package className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{totales}</div>
        {/* ✅ CAMBIO: Descripción actualizada */}
        <p className="text-xs text-muted-foreground">Total de órdenes filtradas</p>
      </CardContent>
    </Card>
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Pendientes</CardTitle>
        <Clock className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{pendientes}</div>
        <p className="text-xs text-muted-foreground">En progreso o por iniciar</p>
      </CardContent>
    </Card>
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Terminadas</CardTitle>
        <CheckCircle className="h-4 w-4 text-green-500" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{terminadas}</div>
        <p className="text-xs text-muted-foreground">Completadas y entregadas</p>
      </CardContent>
    </Card>
    <Card>
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
);

// --- INTERFACES ---
interface ReportsViewProps {
  initialOrders: ServiceOrder[];
  // ✅ CAMBIO: Pasamos el nombre del técnico para personalizar la vista
  currentTechnicianName: string;
}

// --- COMPONENTE PRINCIPAL ---
export function ReportsView({ initialOrders, currentTechnicianName }: ReportsViewProps) {
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);

  // El hook de la tabla y los filtros se mantiene, es muy útil
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

  // ✅ CAMBIO: La lógica de agrupación ahora es por ESTADO, no por técnico
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

  // ✅ CAMBIO: Las métricas ahora se calculan sobre el total filtrado, más simple
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
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div>
        {/* ✅ CAMBIO: Título dinámico con el nombre del técnico */}
        <h1 className="text-3xl font-bold tracking-tight">Reporte de {currentTechnicianName}</h1>
        <p className="text-muted-foreground">
          {hasActiveFilters ? "Mostrando" : "Total de"} {totalResults} resultado{totalResults !== 1 ? 's' : ''}.
        </p>
      </div>
      <div className="flex w-full sm:w-auto items-center gap-2">
        <div className="relative flex-1 sm:flex-initial">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            // ✅ CAMBIO: Placeholder actualizado
            placeholder="Buscar por cliente o N° de orden..."
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="pl-9 w-full sm:w-64"
          />
        </div>
        {/* ✅ CAMBIO: Botón de filtro simplificado, sin tooltips ni extras */}
        <Button variant="outline" size="icon" onClick={() => setIsFilterPanelOpen(true)} className="h-9 w-9 shrink-0">
          <SlidersHorizontal className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );

  const EmptyState = () => (
    <div className="flex flex-col items-center justify-center text-center text-muted-foreground p-12 h-full">
      <Inbox className="h-20 w-20 mb-4 text-gray-300" />
      <h3 className="text-xl font-semibold mb-1">No se encontraron resultados</h3>
      <p className="text-sm max-w-xs">
        {hasActiveFilters
          ? "Intenta ajustar tus filtros para encontrar lo que buscas."
          // ✅ CAMBIO: Mensaje por defecto actualizado
          : "No tienes órdenes de servicio que coincidan."
        }
      </p>
      {hasActiveFilters && (
        // ✅ CAMBIO: Texto del botón simplificado
        <Button variant="ghost" onClick={resetFilters} className="mt-4">Limpiar filtros</Button>
      )}
    </div>
  );

  return (
    // ✅ CAMBIO: Layout principal simplificado
    <div className="flex h-full w-full gap-6">
      <AnimatePresence>
        {isFilterPanelOpen && (
          <motion.div
            initial={{ x: "-100%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "-100%", opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="w-full max-w-xs bg-card border-r rounded-lg flex flex-col"
          >
            <div className="p-4 border-b flex items-center justify-between">
              <h2 className="text-lg font-semibold">Filtros Avanzados</h2>
              <Button variant="ghost" size="icon" onClick={() => setIsFilterPanelOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <FilterPanel
                facetedFilters={facetedFilters}
                activeFilters={activeFilters}
                toggleFilter={toggleFilter}
                dateRange={dateRange}
                setDateRange={setDateRange}
                fechaAgendadoRange={fechaAgendadoRange}
                setFechaAgendadoRange={setFechaAgendadoRange}
                fechaCaptacionRange={fechaCaptacionRange}
                setFechaCaptacionRange={setFechaCaptacionRange}
                hasActiveFilters={hasActiveFilters}
                resetFilters={resetFilters}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ✅ CAMBIO: Espaciado ajustado */}
      <div className="flex-1 flex flex-col h-full space-y-4">
        <ReportsHeader />
        {hasActiveFilters && (
          <ActiveFiltersBar
            resetFilters={resetFilters}
            activeFilters={activeFilters}
            facetedFilters={facetedFilters}
            toggleFilter={toggleFilter}
            dateRange={dateRange}
            setDateRange={setDateRange}
            fechaAgendadoRange={fechaAgendadoRange}
            setFechaAgendadoRange={setFechaAgendadoRange}
            fechaCaptacionRange={fechaCaptacionRange}
            setFechaCaptacionRange={setFechaCaptacionRange}
            isTechnicianView={true}
          />
        )}
        <ReportMetricsCards {...reportMetrics} />
        <Card className="flex-1 flex flex-col overflow-hidden">
          <CardHeader>
            {/* ✅ CAMBIO: Título y descripción del Card actualizados */}
            <CardTitle>Desglose por Estado</CardTitle>
            <CardDescription>Tus órdenes de servicio agrupadas por su estado actual.</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 p-0 overflow-y-auto">
            <div className="p-2 sm:p-4 h-full">
              {filteredRows.length > 0 ? (
                // ✅ CAMBIO: Usamos el nuevo componente StatusAccordion
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