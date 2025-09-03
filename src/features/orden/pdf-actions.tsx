"use server";

import { pdf } from '@react-pdf/renderer';
import { SimpleOrdersPDF } from './simple-orders-pdf';
import { WarrantyPDF } from '@/features/tecnicos/warranty-pdf';
import { ServicesPDF } from './services-pdf';
import { ReportesPDF } from '@/features/reportes/reporte-pdf'; // <-- NUEVA IMPORTACIÓN
import { ServiceOrder } from './service-order';
import { 
  prepareGroupedByTechnicianData, 
  prepareServicesByTechnicianData,
  prepareGroupedByStatusAndTechnician // <-- NUEVA IMPORTACIÓN
} from './pdf-generators';

async function generatePdfBlob(document: React.ReactElement): Promise<Buffer> {
  const blob = await pdf(document).toBlob();
  const arrayBuffer = await blob.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

export async function generateSimplePdfAction(orders: ServiceOrder[]) {
  const document = <SimpleOrdersPDF orders={orders} />;
  const buffer = await generatePdfBlob(document);
  return buffer.toString('base64');
}

export async function generateGroupedPdfAction(orders: ServiceOrder[]) {
  const technicianData = prepareGroupedByTechnicianData(orders);

  if (!technicianData || technicianData.length === 0) {
    // Si no hay datos, retornamos un error o un string vacío.
    // El cliente debe manejar esto.
    return "NO_DATA"; 
  }

  const document = <WarrantyPDF technicians={technicianData} />;
  const buffer = await generatePdfBlob(document);
  return buffer.toString('base64');
}

export async function generateServicesByTechnicianPdfAction(orders: ServiceOrder[]) {
  const technicianData = prepareServicesByTechnicianData(orders);

  if (!technicianData || technicianData.length === 0) {
    // Si no hay datos, retornamos un error o un string vacío.
    // El cliente debe manejar esto.
    return "NO_DATA"; 
  }

  const document = <ServicesPDF technicians={technicianData} />;
  const buffer = await generatePdfBlob(document);
  return buffer.toString('base64');
}

// ✅ NUEVA SERVER ACTION PARA EL REPORTE AGRUPADO
export async function generateReportByStatusPdfAction(orders: ServiceOrder[]) {
  const prepared = prepareGroupedByStatusAndTechnician(orders);

  if (!prepared) {
    return "NO_DATA"; 
  }

  const { data, totalServices } = prepared;

  const document = <ReportesPDF data={data} totalServices={totalServices} />;
  const buffer = await generatePdfBlob(document);
  return buffer.toString('base64');
}