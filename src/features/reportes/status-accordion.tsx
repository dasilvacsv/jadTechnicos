"use client";

import React, { memo, useMemo } from "react";
import { motion } from "framer-motion";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ChevronDown, User, Calendar, Hash } from "lucide-react";

import { ServiceOrder } from "@/features/orden/service-order";
import { OrderTableCell } from "@/features/orden/order-table-cell";
import { OrderRowActions } from "@/features/orden/order-row-actions";
import { formatDate, cn } from "@/lib/utils";

interface StatusAccordionProps {
  groupedData: Map<string, ServiceOrder[]>;
}

// Orden de visualización para los estados
const STATUS_ORDER: (ServiceOrder['status'])[] = [
  "PENDING", "ASSIGNED", "PRESUPUESTADO", "REPARANDO", "PENDIENTE_AVISAR", "FACTURADO", "APROBADO",
  "COMPLETED", "DELIVERED", "GARANTIA_APLICADA", "NO_APROBADO", "CANCELLED", "PREORDER"
];

// ✨ Helper mejorado para obtener clases de color (más versátil)
const getStatusClasses = (status: ServiceOrder['status']): { border: string, bg: string, text: string } => {
  switch (status.toUpperCase()) {
    case 'PENDING': case 'ASSIGNED': return { border: 'border-l-yellow-500', bg: 'bg-yellow-500', text: 'text-yellow-500' };
    case 'PRESUPUESTADO': case 'FACTURADO': return { border: 'border-l-purple-500', bg: 'bg-purple-500', text: 'text-purple-500' };
    case 'REPARANDO': return { border: 'border-l-blue-500', bg: 'bg-blue-500', text: 'text-blue-500' };
    case 'COMPLETED': case 'DELIVERED': case 'APROBADO': return { border: 'border-l-green-500', bg: 'bg-green-500', text: 'text-green-500' };
    case 'CANCELLED': case 'NO_APROBADO': return { border: 'border-l-red-500', bg: 'bg-red-500', text: 'text-red-500' };
    default: return { border: 'border-l-gray-400', bg: 'bg-gray-400', text: 'text-gray-400' };
  }
};


// ====================================================================
// ✨ NUEVOS SUB-COMPONENTES PARA UNA MEJOR UI
// ====================================================================

const StatusPill = memo(({ status }: { status: ServiceOrder['status'] }) => {
    const { bg } = getStatusClasses(status);
    return (
        <div className="flex items-center gap-3">
            <span className={cn("h-2.5 w-2.5 rounded-full", bg)} />
            <span className="font-semibold text-foreground">
                {OrderTableCell.getStatusText(status)}
            </span>
        </div>
    );
});
StatusPill.displayName = 'StatusPill';

const OrderMobileCard = memo(({ order }: { order: ServiceOrder }) => (
  <div
    className="bg-card rounded-lg border p-3 shadow-sm cursor-pointer hover:border-primary/50 hover:bg-muted/50 transition-colors"
    onClick={(e) => {
      if (!(e.target as HTMLElement).closest('[data-radix-dropdown-menu-trigger]')) {
        window.open(`/tecnico/ordenes/${order.id}`, '_blank');
      }
    }}
  >
    <div className="flex justify-between items-start gap-3">
      <div className="flex-1 space-y-2">
        <p className="font-bold text-card-foreground leading-tight">{order.client.name}</p>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5 font-mono">
                <Hash size={12} /> {order.orderNumber}
            </div>
            <div className="flex items-center gap-1.5">
                <Calendar size={12} /> {order.fechaCaptacion ? formatDate(order.fechaCaptacion, "short") : '-'}
            </div>
        </div>
      </div>
      <div className="ml-2 -mr-2" onClick={(e) => e.stopPropagation()}>
        <OrderRowActions order={order} isReadOnly />
      </div>
    </div>
  </div>
));
OrderMobileCard.displayName = 'OrderMobileCard';


// ====================================================================
// ✨ COMPONENTE PRINCIPAL ACTUALIZADO
// ====================================================================

export function StatusAccordion({ groupedData }: StatusAccordionProps) {
  const sortedStatusMap = useMemo(() => new Map([...groupedData.entries()].sort(
    (a, b) => STATUS_ORDER.indexOf(a[0].toUpperCase() as any) - STATUS_ORDER.indexOf(b[0].toUpperCase() as any)
  )), [groupedData]);

  // ✨ Variantes de animación para la entrada escalonada de las tarjetas.
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.07 } }
  };
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <Accordion type="multiple" className="w-full space-y-3">
      {Array.from(sortedStatusMap.entries()).map(([status, orders]) => {
        const { border } = getStatusClasses(status as ServiceOrder['status']);
        return (
          <AccordionItem value={status} key={status} className={cn("border-l-4 rounded-lg overflow-hidden bg-card shadow-sm", border)}>
            <AccordionTrigger className="group px-4 py-3 hover:no-underline hover:bg-muted/50 data-[state=open]:bg-muted/50">
              <div className="flex w-full items-center justify-between">
                <StatusPill status={status as ServiceOrder['status']} />
                <div className="flex items-center gap-4">
                  <span className="rounded-full bg-background border px-2.5 py-0.5 text-xs font-semibold text-muted-foreground">
                    {orders.length}
                  </span>
                  <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200 group-data-[state=open]:rotate-180" />
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="p-2 border-t">
             
              {/* ✨ UX Móvil: Vista de tarjetas con animación */}
              <motion.div
                className="space-y-2 md:hidden"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                {orders.map((order) => (
                  <motion.div key={order.id} variants={itemVariants}>
                    <OrderMobileCard order={order} />
                  </motion.div>
                ))}
              </motion.div>
             
              {/* ✨ UX Escritorio: Vista de tabla tradicional (oculta en móvil) */}
              <div className="hidden md:block max-h-[400px] overflow-auto rounded-md border">
                <Table>
                  <TableHeader className="sticky top-0 bg-card/95 backdrop-blur-sm">
                    <TableRow>
                      <TableHead className="w-[120px]">Número</TableHead>
                      <TableHead>Cliente</TableHead>
                      <TableHead className="w-[140px]">F. Captación</TableHead>
                      <TableHead className="w-[80px] text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.map((order) => (
                      <TableRow 
                        key={order.id} 
                        className="cursor-pointer"
                        onClick={(e) => {
                          if (!(e.target as HTMLElement).closest('[data-radix-dropdown-menu-trigger]')) {
                            window.open(`/tecnico/ordenes/${order.id}`, '_blank');
                          }
                        }}
                      >
                        <TableCell className="font-mono text-xs">
                          <OrderTableCell.OrderNumber order={order} />
                        </TableCell>
                        <TableCell className="font-medium">{order.client.name}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">{order.fechaCaptacion ? formatDate(order.fechaCaptacion) : '-'}</TableCell>
                        <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                          <OrderRowActions order={order} isReadOnly />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </AccordionContent>
          </AccordionItem>
        );
      })}
    </Accordion>
  );
}