"use server";

import { db } from "@/db";
import { technicians, serviceOrders, technicianAssignments } from "@/db/schema";
import { eq, inArray, and, count, desc, sql } from "drizzle-orm";

export async function getTechnicianProfileStats(technicianId: string) {
  try {
    // Esta parte para encontrar los IDs del técnico es correcta y se mantiene
    const currentTech = await db.query.technicians.findFirst({
      where: eq(technicians.id, technicianId),
      columns: { phone: true }
    });
    if (!currentTech?.phone) return null;

    const allTechsWithSamePhone = await db.query.technicians.findMany({
      where: eq(technicians.phone, currentTech.phone),
      columns: { id: true }
    });
    const allTechnicianIds = allTechsWithSamePhone.map(t => t.id);

    const assignments = await db.query.technicianAssignments.findMany({
      where: inArray(technicianAssignments.technicianId, allTechnicianIds),
    });
    const orderIds = assignments.map(a => a.serviceOrderId);

    if (orderIds.length === 0) {
      return {
        totalOrders: 0,
        completedOrders: 0,
        pendingOrders: 0,
        recentOrders: [],
      };
    }

    // --- INICIO DE CAMBIOS ---
    // Corregimos la sintaxis para el conteo condicional
    const stats = await db
      .select({
        totalOrders: count(serviceOrders.id),
        completedOrders: sql<number>`count(case when ${serviceOrders.status} in ('COMPLETED', 'DELIVERED') then 1 end)`.mapWith(Number),
        pendingOrders: sql<number>`count(case when ${serviceOrders.status} in ('PENDING', 'ASSIGNED', 'IN_PROGRESS', 'REPARANDO') then 1 end)`.mapWith(Number),
      })
      .from(serviceOrders)
      .where(inArray(serviceOrders.id, orderIds));
    // --- FIN DE CAMBIOS ---

    const recentOrders = await db.query.serviceOrders.findMany({
      where: inArray(serviceOrders.id, orderIds),
      orderBy: [desc(serviceOrders.createdAt)],
      limit: 5,
      with: {
        client: { columns: { name: true } }
      }
    });

    return { ...stats[0], recentOrders };
  } catch (error) {
    console.error("Error fetching technician stats:", error);
    return null;
  }
}