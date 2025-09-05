"use client"

import React from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ChevronLeft,
  ChevronRight,
  X,
  User,
  Wrench,
  Calendar,
  Package,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { FilterPanel } from "./filter-panel";
import { EmptyState } from "./empty-state";
import { OrderTableCell } from "./order-table-cell";
import { OrderRowActions } from "./order-row-actions";
import { formatDate } from "@/lib/utils";
import { ServiceOrder, FacetedFilters } from "./service-order";

interface MobileViewProps {
  table: any;
  isFilterPanelOpen: boolean;
  toggleFilterPanel: () => void;
  facetedFilters: FacetedFilters;
  activeFilters: {
    status: string[];
    paymentStatus: string[];
    warranty: string[];
    appliance: string[];
    createdBy: string[];
    technician: string[];
  };
  toggleFilter: (type: keyof typeof activeFilters, value: string) => void;
  dateRange: { from: Date | undefined; to: Date | undefined };
  setDateRange: React.Dispatch<React.SetStateAction<{ from: Date | undefined; to: Date | undefined }>>;
  fechaAgendadoRange: { from: Date | undefined; to: Date | undefined } | undefined;
  setFechaAgendadoRange: React.Dispatch<React.SetStateAction<{ from: Date | undefined; to: Date | undefined } | undefined>>;
  fechaCaptacionRange: { from: Date | undefined; to: Date | undefined } | undefined;
  setFechaCaptacionRange: React.Dispatch<React.SetStateAction<{ from: Date | undefined; to: Date | undefined } | undefined>>;
  hasActiveFilters: boolean;
  resetFilters: () => void;
  initialOrders: ServiceOrder[];
  isReadOnly?: boolean;
}

export default function MobileView({
  table,
  isFilterPanelOpen,
  toggleFilterPanel,
  facetedFilters,
  activeFilters,
  toggleFilter,
  dateRange,
  setDateRange,
  fechaAgendadoRange,
  setFechaAgendadoRange,
  fechaCaptacionRange,
  setFechaCaptacionRange,
  hasActiveFilters,
  resetFilters,
  initialOrders,
  isReadOnly = false,
}: MobileViewProps) {
  const router = useRouter();
  const rows = table.getRowModel().rows;

  const InfoRow = ({ icon, label, children }: { icon: React.ReactNode, label: string, children: React.ReactNode }) => (
    <div className="flex items-start">
      <div className="flex-shrink-0 w-5 mt-0.5 text-muted-foreground">{icon}</div>
      <div className="flex-1">
        <p className="text-xs text-muted-foreground font-medium">{label}</p>
        <div className="font-semibold text-sm">{children}</div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col gap-4">
      {/* Panel de Filtros (sin cambios) */}
      <div
        className={`fixed top-0 left-0 h-full z-40 bg-background w-[85%] max-w-[320px] transform transition-transform duration-300 ease-in-out ${isFilterPanelOpen ? "translate-x-0" : "-translate-x-full"} shadow-xl overflow-y-auto`}
      >
        <div className="p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Filtros</h3>
            <Button variant="ghost" size="icon" onClick={toggleFilterPanel}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <FilterPanel {...{ facetedFilters, activeFilters, toggleFilter, dateRange, setDateRange, fechaAgendadoRange, setFechaAgendadoRange, fechaCaptacionRange, setFechaCaptacionRange, hasActiveFilters, resetFilters }} />
        </div>
      </div>
      {isFilterPanelOpen && <div className="fixed inset-0 bg-black/50 z-30 backdrop-blur-sm" onClick={toggleFilterPanel} />}

      {/* Contenido Principal */}
      <div className="space-y-3">
        {rows?.length ? (
          <AnimatePresence>
            {rows.map((row) => (
              <motion.div
                key={row.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <Card className="overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-0">
                    {/* Encabezado de la Tarjeta */}
                    <div className="flex items-center justify-between bg-muted/30 p-3 border-b">
                      <div className="flex items-center gap-2">
                        {!isReadOnly && (
                          <input
                            type="checkbox"
                            checked={row.getIsSelected()}
                            onChange={(e) => row.toggleSelected(e.target.checked)}
                            onClick={(e) => e.stopPropagation()}
                            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary/20"
                          />
                        )}
                        <div className="font-bold text-base">
                          <OrderTableCell.OrderNumber order={row.original} />
                        </div>
                      </div>
                      <OrderTableCell.Status status={row.original.status} />
                    </div>

                    {/* Contenido Principal de la Tarjeta */}
                    <div
                      className="p-3 space-y-3 cursor-pointer"
                      onClick={() => window.open(`/tecnico/ordenes/${row.original.id}`, '_blank')}
                    >
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <InfoRow icon={<User size={16} />} label="Cliente">
                          {row.original.client.name}
                        </InfoRow>
                         <InfoRow icon={<Package size={16} />} label="Electrodoméstico">
                           <OrderTableCell.Appliances appliances={row.original.appliances} />
                        </InfoRow>
                        <InfoRow icon={<Wrench size={16} />} label="Técnico Asignado">
                           <OrderTableCell.Technicians assignments={row.original.technicianAssignments} />
                        </InfoRow>
                        {row.original.fechaAgendado && (
                           <InfoRow icon={<Calendar size={16} />} label="Fecha Agendada">
                             {formatDate(row.original.fechaAgendado)}
                          </InfoRow>
                        )}
                      </div>
                    </div>

                    {/* Pie de la Tarjeta (Acciones) */}
                    {!isReadOnly && (
                      <div className="border-t p-2 bg-muted/10">
                        <OrderRowActions order={row.original} />
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        ) : (
          <Card>
            <CardContent className="p-0">
              <EmptyState hasActiveFilters={hasActiveFilters} resetFilters={resetFilters} />
            </CardContent>
          </Card>
        )}

        {/* Paginación (sin cambios) */}
        {rows.length > 0 && (
          <div className="flex flex-col items-center gap-4 my-4 pb-4">
            <div className="text-sm text-muted-foreground">
              Mostrando {rows.length} de {table.getPreFilteredRowModel().rows.length} órdenes
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" className="h-8 w-8 p-0" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm">
                Página {table.getState().pagination.pageIndex + 1} de {table.getPageCount()}
              </span>
              <Button variant="outline" className="h-8 w-8 p-0" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}