// src/features/orden/TechnicianAccordion.tsx

"use client";

import React, { Dispatch, SetStateAction, memo, useMemo } from "react";
import { motion } from "framer-motion";
import { User, ChevronDown, Wrench, Calendar, Hash, DollarSign } from "lucide-react";

// Componentes y utilidades
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { OrderRowActions } from "@/features/orden/order-row-actions";
import { OrderTableCell } from "@/features/orden/order-table-cell";
import { ServiceOrder } from "@/features/orden/service-order";
import { formatDate, cn } from "@/lib/utils";
import { EmptyState } from "../orden/empty-state";

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

const STATUS_ORDER: (ServiceOrder['status'])[] = ["PENDING", "ASSIGNED", "PRESUPUESTADO", "REPARANDO", "PENDIENTE_AVISAR", "FACTURADO", "APROBADO", "COMPLETED", "DELIVERED", "GARANTIA_APLICADA", "NO_APROBADO", "CANCELLED", "PREORDER"];

const getStatusClasses = (status: ServiceOrder['status']): { border: string, bg: string, text: string } => {
  switch (status.toUpperCase()) {
    case 'PENDING': case 'ASSIGNED': return { border: 'border-l-amber-500', bg: 'bg-amber-500', text: 'text-amber-500' };
    case 'PRESUPUESTADO': case 'FACTURADO': return { border: 'border-l-purple-500', bg: 'bg-purple-500', text: 'text-purple-500' };
    case 'REPARANDO': return { border: 'border-l-blue-500', bg: 'bg-blue-500', text: 'text-blue-500' };
    case 'COMPLETED': case 'DELIVERED': case 'APROBADO': return { border: 'border-l-green-500', bg: 'bg-green-500', text: 'text-green-500' };
    case 'CANCELLED': case 'NO_APROBADO': return { border: 'border-l-red-500', bg: 'bg-red-500', text: 'text-red-500' };
    default: return { border: 'border-l-gray-400', bg: 'bg-gray-400', text: 'text-gray-400' };
  }
};

// ====================================================================
// SUB-COMPONENTE: PÍLDORA DE ESTADO
// ====================================================================
const StatusPill = memo(({ status }: { status: ServiceOrder['status'] }) => {
    const { bg } = getStatusClasses(status);
    return (
        <div className="flex items-center gap-2">
            <span className={cn("h-2 w-2 rounded-full", bg)} />
            <span className="font-medium text-sm text-foreground">
                {OrderTableCell.getStatusText(status)}
            </span>
        </div>
    );
});
StatusPill.displayName = 'StatusPill';

// ====================================================================
// ✨ NUEVO SUB-COMPONENTE MEJORADO: Tarjeta de Orden para Móviles
// ====================================================================
const OrderMobileCard = memo(({ order }: { order: ServiceOrder }) => {
  const applianceText = useMemo(() => {
    if (!order.appliances || order.appliances.length === 0) return 'No especificado';
    const firstApplianceName = order.appliances[0].clientAppliance.name;
    const remainingCount = order.appliances.length - 1;
    return `${firstApplianceName}${remainingCount > 0 ? ` (+${remainingCount})` : ''}`;
  }, [order.appliances]);

  const { border } = getStatusClasses(order.status);

  return (
    <div
      className={cn(
        "bg-card rounded-lg border border-l-4 p-4 shadow-sm cursor-pointer hover:border-primary/50 hover:bg-muted/50 transition-all",
        border
      )}
      onClick={() => window.open(`/ordenes/${order.id}`, '_blank')}
    >
      <div className="flex justify-between items-start gap-3">
        {/* Información Principal */}
        <div className="flex-1 space-y-1.5">
          <p className="font-bold text-base leading-tight text-card-foreground">{order.client.name}</p>
          <div className="flex items-center gap-2 font-mono text-xs text-muted-foreground">
            <Hash size={12} /> {order.orderNumber}
          </div>
        </div>
        {/* Acciones */}
        <div className="ml-2 -mr-2" onClick={(e) => e.stopPropagation()}>
          <OrderRowActions order={order} />
        </div>
      </div>

      {/* Separador y detalles secundarios */}
      <div className="mt-3 pt-3 border-t border-border/50">
        {/* ✨ UX Móvil: Estado explícito en la tarjeta para mayor claridad. */}
        <div className="mb-3">
            <StatusPill status={order.status} />
        </div>
        
        {/* ✨ UX Móvil: Layout con flex-wrap para mejor adaptabilidad del contenido. */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Wrench size={14} className="text-primary/80" />
              <span className="truncate">{applianceText}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Calendar size={14} className="text-primary/80" />
              <span>{order.fechaAgendado ? formatDate(order.fechaAgendado, "short") : 'Sin fecha'}</span>
            </div>
            {/* ✨ UX Móvil: Monto total destacado para rápida visualización. */}
            <div className="flex items-center gap-1.5 font-semibold text-foreground">
              <DollarSign size={14} className="text-primary/80" />
              <span>{new Intl.NumberFormat("es-VE", { style: "currency", currency: "USD" }).format(Number(order.totalAmount || 0))}</span>
            </div>
        </div>
      </div>
    </div>
  );
});
OrderMobileCard.displayName = 'OrderMobileCard';


// ====================================================================
// SUB-COMPONENTE: Tabla de Órdenes para PC (sin cambios)
// ====================================================================
const OrderTable = memo(({ orders }: { orders: ServiceOrder[] }) => {
  return (
    <div className="relative max-h-[400px] overflow-auto rounded-md border bg-background hidden md:block">
      <Table>
        <TableHeader className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm">
          <TableRow>
            <TableHead className="w-[120px]">Número</TableHead>
            <TableHead>Cliente</TableHead>
            <TableHead className="w-[140px]">F. Captación</TableHead>
            <TableHead className="w-[80px] text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map(order => (
             <TableRow 
                key={order.id} 
                className="cursor-pointer"
                onClick={(e) => {
                  if (!(e.target as HTMLElement).closest('[data-radix-dropdown-menu-trigger]')) {
                    window.open(`/ordenes/${order.id}`, '_blank');
                  }
                }}
             >
              <TableCell className="font-mono text-xs"><OrderTableCell.OrderNumber order={order} /></TableCell>
              <TableCell className="font-medium truncate">{order.client.name}</TableCell>
              <TableCell className="text-xs text-muted-foreground">{order.fechaCaptacion ? formatDate(order.fechaCaptacion) : '-'}</TableCell>
              <TableCell className="text-right" onClick={(e) => e.stopPropagation()}><OrderRowActions order={order} /></TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
});
OrderTable.displayName = 'OrderTable';

// ====================================================================
// SUB-COMPONENTE: ACORDEÓN DE ESTADOS (Actualizado con animaciones)
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

    // ✨ UX Móvil: Variantes de animación para la entrada escalonada de las tarjetas.
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.07 }
        }
    };
    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1 }
    };

    return (
        <Accordion type="multiple" className="w-full space-y-2" value={openItems.statuses[technicianName] || []}
            onValueChange={(newOpenStatuses) => {
                setOpenItems(prev => ({
                    ...prev, statuses: { ...prev.statuses, [technicianName]: newOpenStatuses }
                }));
            }} >
            {Array.from(sortedStatusMap.entries()).map(([status, orders]) => (
                <AccordionItem value={status} key={status} className="border-b-0 rounded-md bg-muted/30">
                    <AccordionTrigger className="group rounded-md border px-4 py-2 hover:bg-muted/80 hover:no-underline data-[state=open]:rounded-b-none data-[state=open]:border-b-0">
                        <div className="flex w-full items-center justify-between">
                            <StatusPill status={status as ServiceOrder['status']} />
                            <div className="flex items-center">
                                <span className="mr-4 rounded-full bg-background px-2 py-0.5 text-xs font-semibold text-muted-foreground">{orders.length}</span>
                                <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-180" />
                            </div>
                        </div>
                    </AccordionTrigger>
                    <AccordionContent className="rounded-b-md border border-t-0 bg-card p-2">
                        {/* ✨ UX Móvil: Contenedor animado con motion.div */}
                        <motion.div 
                            className="space-y-3 md:hidden"
                            variants={containerVariants}
                            initial="hidden"
                            animate="visible"
                        >
                            {orders.map(order => (
                                <motion.div key={order.id} variants={itemVariants}>
                                    <OrderMobileCard order={order} />
                                </motion.div>
                            ))}
                        </motion.div>
                        {/* Vista de PC con la tabla se mantiene */}
                        <OrderTable orders={orders} />
                    </AccordionContent>
                </AccordionItem>
            ))}
        </Accordion>
    );
});
StatusAccordion.displayName = 'StatusAccordion';


// ====================================================================
// COMPONENTE PRINCIPAL (sin cambios grandes)
// ====================================================================
export function TechnicianAccordion({ groupedData, openItems, setOpenItems }: TechnicianAccordionProps) {
  if (groupedData.size === 0) {
    return <EmptyState hasActiveFilters={true} resetFilters={() => {}} />;
  }
 
  return (
    <Accordion type="multiple" className="w-full space-y-4" value={openItems.technicians}
      onValueChange={(newOpenTechnicians) => {
          setOpenItems(prev => ({ ...prev, technicians: newOpenTechnicians }));
      }} >
      {Array.from(groupedData.entries()).map(([technicianName, statusMap]) => {
        const totalOrders = Array.from(statusMap.values()).reduce((acc, orders) => acc + orders.length, 0);

        return (
          <AccordionItem value={technicianName} key={technicianName} className="overflow-hidden rounded-xl border bg-card shadow-sm data-[state=open]:border-primary/20">
            <AccordionTrigger className="group px-4 py-3 md:px-6 md:py-4 hover:bg-muted/50 hover:no-underline text-left">
              <div className="flex w-full items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="hidden md:flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <User className="h-6 w-6" />
                    </div>
                    <span className="text-lg md:text-xl font-bold tracking-tight text-primary">{technicianName}</span>
                  </div>
                  <div className="flex items-center gap-2 md:gap-4">
                    <span className="flex-shrink-0 rounded-full bg-primary px-2.5 py-1 text-xs md:text-sm font-bold text-primary-foreground">{totalOrders} servicio{totalOrders !== 1 ? 's' : ''}</span>
                    <ChevronDown className="h-5 w-5 shrink-0 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-180" />
                  </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="bg-muted/20 px-2 md:px-4 pb-4">
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