import { pdf } from '@react-pdf/renderer';
import { saveAs } from 'file-saver';
import { SimpleOrdersPDF } from './simple-orders-pdf';
import { WarrantyPDF } from '@/features/tecnicos/warranty-pdf';
import { ServiceOrder } from './service-order';
import { OrderTableCell } from './order-table-cell';
import { toast } from '@/hooks/use-toast';

// --- GENERADOR PARA REPORTE SIMPLE ---
export async function generateSimpleOrdersPDF(orders: ServiceOrder[]) {
  const blob = await pdf(<SimpleOrdersPDF orders={orders} />).toBlob();
  saveAs(blob, `reporte_ordenes_${new Date().toISOString().split('T')[0]}.pdf`);
}

// Interfaz para la estructura que espera WarrantyPDF
interface TechnicianData {
  id: string;
  name: string;
  warrantyCount: number;
  priorityStats: { baja: number; media: number; alta: number };
  warrantyOrders: any[];
}

// Interfaz para la estructura que espera ServicesPDF
interface TechnicianServicesData {
  id: string;
  name: string;
  totalServices: number;
  statusStats: {
    pending: number;
    assigned: number;
    inProgress: number;
    completed: number;
    delivered: number;
    cancelled: number;
    preorder: number;
    aprobado: number;
    noAprobado: number;
    pendienteAvisar: number;
    facturado: number;
    entregaGenerada: number;
    garantiaAplicada: number;
    reparando: number;
  };
  services: any[];
}

// ✅ FUNCIÓN CORREGIDA Y MEJORADA
export function prepareGroupedByTechnicianData(orders: ServiceOrder[]): TechnicianData[] | null {
  const warrantyOrders = orders.filter(order => OrderTableCell.isUnderWarranty(order));

  // Si no hay órdenes de garantía en la vista actual, no continuamos.
  if (warrantyOrders.length === 0) {
    toast({
      title: "No hay datos que mostrar",
      description: "No se encontraron órdenes con garantía activa en los filtros seleccionados.",
      variant: "default",
    });
    return null; // Devolvemos null para indicar que no se debe generar el PDF.
  }

  const techniciansMap = new Map<string, TechnicianData>();

  for (const order of warrantyOrders) {
    const activeAssignments = order.technicianAssignments.filter(a => a.isActive);
    if (activeAssignments.length === 0) continue;

    for (const assignment of activeAssignments) {
      const techId = assignment.technician.id;
      const techName = assignment.technician.name;

      if (!techniciansMap.has(techId)) {
        techniciansMap.set(techId, {
          id: techId, name: techName, warrantyCount: 0,
          priorityStats: { baja: 0, media: 0, alta: 0 },
          warrantyOrders: [],
        });
      }

      const techData = techniciansMap.get(techId)!;

      const mappedOrder = {
        id: order.id,
        orderNumber: order.orderNumber,
        razonGarantia: order.razonGarantia || order.appliances[0]?.falla,
        garantiaPrioridad: order.garantiaPrioridad,
        client: {
          name: order.client.name,
          phone: order.client.phone,
        },
        appliances: order.appliances.map(app => ({
          falla: app.falla,
          clientAppliance: {
            name: app.clientAppliance.name,
            brand: { name: app.clientAppliance.brand.name }
          }
        }))
      };

      techData.warrantyOrders.push(mappedOrder);
      techData.warrantyCount++;

      // FIX: Manejar el caso donde la prioridad puede ser null
      switch (order.garantiaPrioridad) {
        case 'BAJA': techData.priorityStats.baja++; break;
        case 'MEDIA': techData.priorityStats.media++; break;
        case 'ALTA': techData.priorityStats.alta++; break;
        default:
          break;
      }
    }
  }

  return Array.from(techniciansMap.values());
}

// ✅ NUEVA FUNCIÓN PARA PREPARAR DATOS DE SERVICIOS POR TÉCNICO
export function prepareServicesByTechnicianData(orders: ServiceOrder[]): TechnicianServicesData[] | null {
  if (orders.length === 0) {
    toast({
      title: "No hay datos que mostrar",
      description: "No se encontraron órdenes de servicio en los filtros seleccionados.",
      variant: "default",
    });
    return null;
  }

  const techniciansMap = new Map<string, TechnicianServicesData>();
  const unassignedServices: any[] = [];

  for (const order of orders) {
    const activeAssignments = order.technicianAssignments.filter(a => a.isActive);

    // If no active assignments, add to unassigned services
    if (activeAssignments.length === 0) {
      unassignedServices.push({
        id: order.id,
        orderNumber: order.orderNumber,
        status: order.status,
        receivedDate: order.receivedDate,
        presupuestoAmount: order.presupuestoAmount,
        paymentStatus: order.paymentStatus,
        client: {
          name: order.client.name,
          phone: order.client.phone,
        },
        appliances: order.appliances.map(app => ({
          falla: app.falla,
          solucion: app.solucion,
          clientAppliance: {
            name: app.clientAppliance.name,
            brand: { name: app.clientAppliance.brand.name }
          }
        }))
      });
      continue;
    }

    for (const assignment of activeAssignments) {
      const techId = assignment.technician.id;
      const techName = assignment.technician.name;

      if (!techniciansMap.has(techId)) {
        techniciansMap.set(techId, {
          id: techId,
          name: techName,
          totalServices: 0,
          statusStats: {
            pending: 0,
            assigned: 0,
            inProgress: 0,
            completed: 0,
            delivered: 0,
            cancelled: 0,
            preorder: 0,
            aprobado: 0,
            noAprobado: 0,
            pendienteAvisar: 0,
            facturado: 0,
            entregaGenerada: 0,
            garantiaAplicada: 0,
            reparando: 0
          },
          services: [],
        });
      }

      const techData = techniciansMap.get(techId)!;

      const mappedService = {
        id: order.id,
        orderNumber: order.orderNumber,
        status: order.status,
        receivedDate: order.receivedDate,
        presupuestoAmount: order.presupuestoAmount,
        paymentStatus: order.paymentStatus,
        client: {
          name: order.client.name,
          phone: order.client.phone,
        },
        appliances: order.appliances.map(app => ({
          falla: app.falla,
          solucion: app.solucion,
          clientAppliance: {
            name: app.clientAppliance.name,
            brand: { name: app.clientAppliance.brand.name }
          }
        }))
      };

      techData.services.push(mappedService);
      techData.totalServices++;

      // Contar por status
      switch (order.status) {
        case 'PENDING': techData.statusStats.pending++; break;
        case 'ASSIGNED': techData.statusStats.assigned++; break;
        case 'IN_PROGRESS': techData.statusStats.inProgress++; break;
        case 'COMPLETED': techData.statusStats.completed++; break;
        case 'DELIVERED': techData.statusStats.delivered++; break;
        case 'CANCELLED': techData.statusStats.cancelled++; break;
        case 'PREORDER': techData.statusStats.preorder++; break;
        case 'APROBADO': techData.statusStats.aprobado++; break;
        case 'NO_APROBADO': techData.statusStats.noAprobado++; break;
        case 'PENDIENTE_AVISAR': techData.statusStats.pendienteAvisar++; break;
        case 'FACTURADO': techData.statusStats.facturado++; break;
        case 'ENTREGA_GENERADA': techData.statusStats.entregaGenerada++; break;
        case 'GARANTIA_APLICADA': techData.statusStats.garantiaAplicada++; break;
        case 'REPARANDO': techData.statusStats.reparando++; break;
        default: break;
      }
    }
  }

  // Add unassigned services to a special "Sin Asignar" technician
  if (unassignedServices.length > 0) {
    const unassignedTechData: TechnicianServicesData = {
      id: 'unassigned',
      name: 'Sin Asignar',
      totalServices: unassignedServices.length,
      statusStats: {
        pending: 0,
        assigned: 0,
        inProgress: 0,
        completed: 0,
        delivered: 0,
        cancelled: 0,
        preorder: 0,
        aprobado: 0,
        noAprobado: 0,
        pendienteAvisar: 0,
        facturado: 0,
        entregaGenerada: 0,
        garantiaAplicada: 0,
        reparando: 0
      },
      services: unassignedServices,
    };

    // Count status for unassigned services
    for (const service of unassignedServices) {
      switch (service.status) {
        case 'PENDING': unassignedTechData.statusStats.pending++; break;
        case 'ASSIGNED': unassignedTechData.statusStats.assigned++; break;
        case 'IN_PROGRESS': unassignedTechData.statusStats.inProgress++; break;
        case 'COMPLETED': unassignedTechData.statusStats.completed++; break;
        case 'DELIVERED': unassignedTechData.statusStats.delivered++; break;
        case 'CANCELLED': unassignedTechData.statusStats.cancelled++; break;
        case 'PREORDER': unassignedTechData.statusStats.preorder++; break;
        case 'APROBADO': unassignedTechData.statusStats.aprobado++; break;
        case 'NO_APROBADO': unassignedTechData.statusStats.noAprobado++; break;
        case 'PENDIENTE_AVISAR': unassignedTechData.statusStats.pendienteAvisar++; break;
        case 'FACTURADO': unassignedTechData.statusStats.facturado++; break;
        case 'ENTREGA_GENERADA': unassignedTechData.statusStats.entregaGenerada++; break;
        case 'GARANTIA_APLICADA': unassignedTechData.statusStats.garantiaAplicada++; break;
        case 'REPARANDO': unassignedTechData.statusStats.reparando++; break;
        default: break;
      }
    }
    techniciansMap.set('unassigned', unassignedTechData);
  }
  return Array.from(techniciansMap.values());
}


// --- NUEVA SECCIÓN PARA REPORTE AGRUPADO ---

// Definir un orden canónico para los estados, igual que en el acordeón
const STATUS_ORDER: (ServiceOrder['status'])[] = [
  "PENDING", "ASSIGNED", "REPARANDO", "PENDIENTE_AVISAR", "FACTURADO", "APROBADO",
  "COMPLETED", "DELIVERED", "GARANTIA_APLICADA", "NO_APROBADO", "CANCELLED", "PREORDER"
];

// Tipos para la data que se pasará al PDF
interface TechnicianGroup {
  name: string;
  services: ServiceOrder[];
}

interface StatusGroup {
  status: string;
  technicians: TechnicianGroup[];
}

// ✅ NUEVA FUNCIÓN PARA PREPARAR DATOS DEL REPORTE AGRUPADO
export function prepareGroupedByStatusAndTechnician(orders: ServiceOrder[]): { data: StatusGroup[], totalServices: number } | null {
  if (orders.length === 0) {
    return null;
  }

  const statusMap = new Map<string, Map<string, ServiceOrder[]>>();

  orders.forEach(order => {
    const status = order.status;

    if (!statusMap.has(status)) {
      statusMap.set(status, new Map<string, ServiceOrder[]>());
    }
    const technicianMap = statusMap.get(status)!;

    const activeAssignments = order.technicianAssignments.filter(a => a.isActive);

    if (activeAssignments.length > 0) {
      activeAssignments.forEach(assignment => {
        const techName = assignment.technician.name;
        if (!technicianMap.has(techName)) {
          technicianMap.set(techName, []);
        }
        technicianMap.get(techName)!.push(order);
      });
    } else {
      const unassignedKey = "Sin Asignar";
      if (!technicianMap.has(unassignedKey)) {
        technicianMap.set(unassignedKey, []);
      }
      technicianMap.get(unassignedKey)!.push(order);
    }
  });

  const result: StatusGroup[] = [];

  // Ordenar por el orden canónico
  STATUS_ORDER.forEach(status => {
    if (statusMap.has(status)) {
      const technicianMap = statusMap.get(status)!;
      const technicians: TechnicianGroup[] = [];

      Array.from(technicianMap.entries())
        .sort((a, b) => a[0].localeCompare(b[0])) // Ordenar técnicos alfabéticamente
        .forEach(([name, services]) => {
          technicians.push({ name, services });
        });

      result.push({ status, technicians });
    }
  });

  return { data: result, totalServices: orders.length };
}
