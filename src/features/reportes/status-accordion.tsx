"use client";

import React from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ChevronDown } from "lucide-react";

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

// Colores para cada estado
const getStatusColor = (status: ServiceOrder['status']): string => {
  switch (status.toUpperCase()) {
    case 'PENDING':
    case 'ASSIGNED':
      return 'border-l-yellow-500';
    case 'PRESUPUESTADO':
    case 'FACTURADO':
      return 'border-l-purple-500';
    case 'REPARANDO':
      return 'border-l-blue-500';
    case 'COMPLETED':
    case 'DELIVERED':
    case 'APROBADO':
      return 'border-l-green-500';
    case 'CANCELLED':
    case 'NO_APROBADO':
      return 'border-l-red-500';
    default:
      return 'border-l-gray-400';
  }
};

export function StatusAccordion({ groupedData }: StatusAccordionProps) {
  // Ordenamos los estados según la lista predefinida
  const sortedStatusMap = new Map([...groupedData.entries()].sort(
    (a, b) => STATUS_ORDER.indexOf(a[0].toUpperCase() as any) - STATUS_ORDER.indexOf(b[0].toUpperCase() as any)
  ));

  return (
    <Accordion type="multiple" className="w-full space-y-2">
      {Array.from(sortedStatusMap.entries()).map(([status, orders]) => (
        <AccordionItem value={status} key={status} className={cn("border rounded-md overflow-hidden", getStatusColor(status))}>
          <AccordionTrigger className="group bg-muted/50 px-4 py-3 hover:no-underline data-[state=open]:bg-muted">
            <div className="flex w-full items-center justify-between">
              <span className="font-semibold text-foreground">
                {OrderTableCell.getStatusText(status as ServiceOrder['status'])}
              </span>
              <div className="flex items-center gap-4">
                <span className="rounded-full bg-background px-2.5 py-0.5 text-xs font-semibold text-muted-foreground">
                  {orders.length}
                </span>
                <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200 group-data-[state=open]:rotate-180" />
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="p-2 bg-card">
            <div className="max-h-[400px] overflow-auto rounded-md border">
              <Table>
                <TableHeader className="sticky top-0 bg-card">
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
                        // Evita que el click en el menú de acciones abra la página
                        if (!(e.target as HTMLElement).closest('[data-radix-dropdown-menu-trigger]')) {
                          window.open(`/tecnico/ordenes/${order.id}`, '_blank');
                        }
                      }}
                    >
                      <TableCell className="font-mono text-xs">
                        <OrderTableCell.OrderNumber order={order} />
                      </TableCell>
                      <TableCell className="font-medium">{order.client.name}</TableCell>
                      <TableCell>{order.fechaCaptacion ? formatDate(order.fechaCaptacion) : '-'}</TableCell>
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
      ))}
    </Accordion>
  );
}