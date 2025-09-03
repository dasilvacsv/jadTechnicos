"use client"

import React, { Dispatch, SetStateAction, memo, useMemo, useRef } from "react"
import { User, ChevronDown, Clock, Wrench, CheckCircle, XCircle } from "lucide-react"

// Componentes de shadcn/ui
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

// Componentes de la aplicación y utilidades
import { OrderRowActions } from "@/features/orden/order-row-actions"
import { OrderTableCell } from "@/features/orden/order-table-cell"
import { ServiceOrder } from "@/features/orden/service-order"
import { formatDate, cn } from "@/lib/utils"
import { EmptyState } from "../orden/empty-state"

// Importación para virtualización
import { useVirtualizer } from '@tanstack/react-virtual'

// Interfaz para el estado de los acordeones
interface OpenItemsState {
  technicians: string[];
  statuses: Record<string, string[]>;
}

interface TechnicianAccordionProps {
  groupedData: Map<string, Map<string, ServiceOrder[]>>;
  openItems: OpenItemsState;
  setOpenItems: Dispatch<SetStateAction<OpenItemsState>>;
}

// Orden para los estados
const STATUS_ORDER: (ServiceOrder['status'])[] = [
  "PENDING", "ASSIGNED", "PRESUPUESTADO", "REPARANDO", "PENDIENTE_AVISAR", "FACTURADO", "APROBADO",
  "COMPLETED", "DELIVERED", "GARANTIA_APLICADA", "NO_APROBADO", "CANCELLED", "PREORDER"
];

// Utilidad para obtener colores de estado consistentes
const getStatusColor = (status: ServiceOrder['status']): string => {
  switch (status.toUpperCase()) {
    case 'PENDING':
    case 'ASSIGNED':
      return 'bg-yellow-500';

    case 'PRESUPUESTADO':
      return 'bg-purple-500';

    case 'REPARANDO':
      return 'bg-blue-500';
    
    case 'COMPLETED':
    case 'DELIVERED':
      return 'bg-green-500';
    
    case 'CANCELLED':
    case 'NO_APROBADO':
      return 'bg-red-500';

    case 'FACTURADO':
        return 'bg-purple-500';

    default:
      return 'bg-gray-400';
  }
};

// ====================================================================
// SUB-COMPONENTE: Píldora de Estado (StatusPill)
// ====================================================================
const StatusPill = memo(({ status }: { status: ServiceOrder['status'] }) => (
    <div className="flex items-center gap-2">
        <span className={cn("h-2 w-2 rounded-full", getStatusColor(status))} />
        <span className="font-medium text-sm text-foreground">
            {OrderTableCell.getStatusText(status)}
        </span>
    </div>
));
StatusPill.displayName = 'StatusPill';

// ====================================================================
// SUB-COMPONENTE: Barra de Resumen de Estados
// ====================================================================
const StatusSummaryBar = memo(({ statusMap }: { statusMap: Map<string, ServiceOrder[]> }) => {
  const summary = useMemo(() => {
    const entries = Array.from(statusMap.entries());
    const total = entries.reduce((acc, [, orders]) => acc + orders.length, 0);
    if (total === 0) return [];
    
    return entries
      .map(([status, orders]) => ({
        status: status as ServiceOrder['status'],
        count: orders.length,
        percentage: (orders.length / total) * 100,
      }))
      .sort((a, b) => STATUS_ORDER.indexOf(a.status.toUpperCase() as any) - STATUS_ORDER.indexOf(b.status.toUpperCase() as any));
  }, [statusMap]);

  return (
    <TooltipProvider delayDuration={150}>
      <div className="flex h-2 w-full overflow-hidden rounded-full bg-muted mt-2">
        {summary.map(({ status, percentage, count }) => (
          <Tooltip key={status}>
            <TooltipTrigger asChild>
              <div
                className={cn("h-full transition-all duration-300", getStatusColor(status))}
                style={{ width: `${percentage}%` }}
              />
            </TooltipTrigger>
            <TooltipContent>
              <p>{OrderTableCell.getStatusText(status)}: {count} orden(es)</p>
            </TooltipContent>
          </Tooltip>
        ))}
      </div>
    </TooltipProvider>
  );
});
StatusSummaryBar.displayName = 'StatusSummaryBar';


// ====================================================================
// COMPONENTE: Tabla de Órdenes Virtualizada
// ====================================================================
const StatusTable = memo(({ orders }: { orders: ServiceOrder[] }) => {
  const parentRef = useRef<HTMLDivElement>(null);

  const rowVirtualizer = useVirtualizer({
    count: orders.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 45,
    overscan: 5,
  });

  return (
    <div ref={parentRef} className="relative max-h-[350px] overflow-auto rounded-md border bg-background">
      <Table>
        <TableHeader className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm">
          <TableRow className="flex w-full">
            <TableHead className="w-[120px] shrink-0">Número</TableHead>
            <TableHead className="flex-1">Cliente</TableHead>
            <TableHead className="w-[140px] shrink-0">F. Captación</TableHead>
            <TableHead className="w-[80px] shrink-0 text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody style={{ height: `${rowVirtualizer.getTotalSize()}px`, position: 'relative' }}>
          {rowVirtualizer.getVirtualItems().map(virtualItem => {
            const order = orders[virtualItem.index];
            return (
              <TableRow
                key={order.id}
                ref={rowVirtualizer.measureElement}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: `${virtualItem.size}px`,
                  transform: `translateY(${virtualItem.start}px)`,
                }}
                className="flex w-full cursor-pointer items-center transition-colors hover:bg-muted/50"
                onClick={(e) => {
                  if (!(e.target as HTMLElement).closest('[data-radix-dropdown-menu-trigger]')) {
                    window.open(`/ordenes/${order.id}`, '_blank');
                  }
                }}
              >
                <TableCell className="w-[120px] shrink-0 font-mono text-xs">
                  <OrderTableCell.OrderNumber order={order} />
                </TableCell>
                <TableCell className="flex-1 truncate font-medium text-sm">
                  {order.client.name}
                </TableCell>
                <TableCell className="w-[140px] shrink-0 text-xs text-muted-foreground">
                  {order.fechaCaptacion ? formatDate(order.fechaCaptacion) : '-'}
                </TableCell>
                <TableCell className="w-[80px] shrink-0 text-right" onClick={(e) => e.stopPropagation()}>
                  <OrderRowActions order={order} />
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
});
StatusTable.displayName = 'StatusTable';


// ====================================================================
// SUB-COMPONENTE: Acordeón de Estados
// ====================================================================
const StatusAccordion = memo(({ technicianName, statusMap, openItems, setOpenItems }: {
    technicianName: string;
    statusMap: Map<string, ServiceOrder[]>;
    openItems: OpenItemsState;
    setOpenItems: Dispatch<SetStateAction<OpenItemsState>>;
}) => {
    const sortedStatusMap = useMemo(() => new Map([...statusMap.entries()].sort(
        (a, b) => STATUS_ORDER.indexOf(a[0].toUpperCase() as any) - STATUS_ORDER.indexOf(b[0].toUpperCase() as any)
    )), [statusMap]);

    return (
        <Accordion
            type="multiple"
            className="w-full space-y-2"
            value={openItems.statuses[technicianName] || []}
            onValueChange={(newOpenStatuses) => {
                setOpenItems(prev => ({
                    ...prev,
                    statuses: { ...prev.statuses, [technicianName]: newOpenStatuses }
                }));
            }}
        >
            {Array.from(sortedStatusMap.entries()).map(([status, orders]) => (
                <AccordionItem value={status} key={status} className="border-b-0">
                    <AccordionTrigger className="group rounded-md border bg-muted/50 px-4 py-2 hover:bg-muted/80 hover:no-underline data-[state=open]:rounded-b-none">
                        <div className="flex w-full items-center justify-between">
                            <StatusPill status={status as ServiceOrder['status']} />
                            <div className="flex items-center">
                                <span className="mr-4 rounded-full bg-background px-2 py-0.5 text-xs font-semibold text-muted-foreground">{orders.length}</span>
                                <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-180" />
                            </div>
                        </div>
                    </AccordionTrigger>
                    <AccordionContent className="rounded-b-md border border-t-0 bg-card p-2">
                        <StatusTable orders={orders} />
                    </AccordionContent>
                </AccordionItem>
            ))}
        </Accordion>
    );
});
StatusAccordion.displayName = 'StatusAccordion';

// Componente para mostrar el resumen de contadores por estado
const TechnicianStatusCounts = memo(({ statusMap }: { statusMap: Map<string, ServiceOrder[]> }) => {
  const counts = useMemo(() => {
    const getCount = (status: string) => Array.from(statusMap.entries())
      .find(([key]) => key.toUpperCase() === status.toUpperCase())?.[1].length || 0;

    const pending = getCount('PENDING') + getCount('ASSIGNED') + getCount('PENDIENTE_AVISAR'); // Suma "PENDIENTE_AVISAR"
    const repairing = getCount('REPARANDO');
    const quoted = getCount('PRESUPUESTADO'); // Nuevo contador
    const invoiced = getCount('FACTURADO'); // Nuevo contador
    const completed = getCount('COMPLETED') + getCount('DELIVERED') + getCount('APROBADO') + getCount('GARANTIA_APLICADA'); // Suma "DELIVERED", "APROBADO", "GARANTIA_APLICADA"
    const cancelled = getCount('CANCELLED') + getCount('NO_APROBADO');

    return [
      { count: pending, label: "Pendientes", icon: Clock, color: "text-yellow-600" },
      { count: repairing, label: "Reparando", icon: Wrench, color: "text-blue-600" },
      { count: quoted, label: "Presupuestos", icon: '💲', color: "text-purple-600" }, // Icono emoji para "Presupuestos"
      { count: invoiced, label: "Presupuestados", icon: '🧾', color: "text-purple-600" }, // Icono emoji para "Facturados"
      { count: completed, label: "Completados", icon: CheckCircle, color: "text-green-600" },
      { count: cancelled, label: "Cancelados", icon: XCircle, color: "text-red-600" },
    ].filter(item => item.count > 0);

  }, [statusMap]);

  if (counts.length === 0) return null;

  return (
    <div className="flex items-center gap-4 mt-3">
      {counts.map(({ count, label, icon: Icon, color }) => (
        <div key={label} className={cn("flex items-center gap-1.5 text-xs font-medium", color)}>
          {typeof Icon === 'string' ? (
            <span className="text-sm">{Icon}</span>
          ) : (
            <Icon className="h-3.5 w-3.5" />
          )}
          <span>{count} {label}</span>
        </div>
      ))}
    </div>
  );
});
TechnicianStatusCounts.displayName = 'TechnicianStatusCounts';


// ====================================================================
// COMPONENTE PRINCIPAL: TechnicianAccordion
// ====================================================================
export function TechnicianAccordion({ groupedData, openItems, setOpenItems }: TechnicianAccordionProps) {
  if (groupedData.size === 0) {
    return <EmptyState hasActiveFilters={true} resetFilters={() => {}} />;
  }

  const handleTechnicianToggle = (newOpenTechnicians: string[]) => {
    const newStatuses = { ...openItems.statuses };
    const closedTechnicians = openItems.technicians.filter(t => !newOpenTechnicians.includes(t));
    closedTechnicians.forEach(t => delete newStatuses[t]);
    setOpenItems({ technicians: newOpenTechnicians, statuses: newStatuses });
  };
  
  return (
    <Accordion
      type="multiple"
      className="w-full space-y-4"
      value={openItems.technicians}
      onValueChange={handleTechnicianToggle}
    >
      {Array.from(groupedData.entries())
        .sort(([, statusMapA], [, statusMapB]) => {
          const totalOrdersA = Array.from(statusMapA.values()).reduce((sum, orders) => sum + orders.length, 0);
          const totalOrdersB = Array.from(statusMapB.values()).reduce((sum, orders) => sum + orders.length, 0);
          return totalOrdersB - totalOrdersA;
        })
        .map(([technicianName, statusMap]) => {
        const totalOrders = Array.from(statusMap.values()).reduce((acc, orders) => acc + orders.length, 0);

        return (
          <AccordionItem value={technicianName} key={technicianName} className="overflow-hidden rounded-xl border-2 border-transparent bg-card shadow-md transition-all duration-300 data-[state=open]:border-primary/20">
            <AccordionTrigger className="group px-6 py-4 hover:bg-muted/50 hover:no-underline">
              <div className="flex w-full flex-col items-start">
                <div className="flex w-full items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="rounded-full bg-primary/10 p-2 text-primary">
                            <User className="h-6 w-6" />
                        </div>
                        <span className="text-xl font-bold tracking-tight text-primary">{technicianName}</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="rounded-full bg-primary px-3 py-1 text-sm font-bold text-primary-foreground">{totalOrders} servicio(s)</span>
                        <ChevronDown className="h-5 w-5 shrink-0 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-180" />
                    </div>
                </div>
                {/* Se añaden los contadores y la barra de resumen */}
                <div className="w-full">
                    <TechnicianStatusCounts statusMap={statusMap} />
                    <StatusSummaryBar statusMap={statusMap} />
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4">
              <StatusAccordion
                technicianName={technicianName}
                statusMap={statusMap}
                openItems={openItems}
                setOpenItems={setOpenItems}
              />
            </AccordionContent>
          </AccordionItem>
        )
      })}
    </Accordion>
  )
}