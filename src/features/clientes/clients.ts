"use server"

import { db } from "@/db"
import { clients, clientAppliances } from "@/db/schema"
import { eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import type { ClientFormData } from "./create-client-form"
import { InlineClientFormData } from "./inline-client-form"

interface ClientApplianceData {
  brandId: string
  applianceTypeId: string
  name: string
  model?: string
  serialNumber?: string
}

export async function getClients() {
  try {
    const clientsList = await db.query.clients.findMany({
      with: {
        zone: true, 
        city: true,
        sucursal: true
      },
      orderBy: (clients, { asc }) => [asc(clients.name)],
    })

    return { success: true, data: clientsList }
  } catch (error) {
    console.error("Error fetching clients:", error)
    return { success: false, error: "Error al obtener los clientes" }
  }
}

export async function getClientById(id: string) {
  try {
    const client = await db.query.clients.findFirst({
      where: (clients, { eq }) => eq(clients.id, id),
      with: {
        zone: true,
        city: true,
        sucursal: true
      }
    })

    if (!client) {
      return { success: false, error: "Cliente no encontrado" }
    }

    return { success: true, data: client }
  } catch (error) {
    console.error("Error fetching client:", error)
    return { success: false, error: "Error al obtener el cliente" }
  }
}

export async function createClientAppliance(clientId: string, data: ClientApplianceData, userId: string) {
  try {
    const [appliance] = await db
      .insert(clientAppliances)
      .values({
        clientId,
        brandId: data.brandId,
        applianceTypeId: data.applianceTypeId,
        name: data.name,
        model: data.model || null,
        serialNumber: data.serialNumber || null,
        createdBy: userId,
        updatedBy: userId,
      })
      .returning()

    revalidatePath(`/clientes/${clientId}`)
    return { success: true, data: appliance }
  } catch (error) {
    console.error("Error creating client appliance:", error)
    return { success: false, error: "Error al crear el electrodoméstico" }
  }
}

export async function deleteClientAppliance(id: string, clientId: string) {
  try {
    await db.delete(clientAppliances).where(eq(clientAppliances.id, id))
    
    revalidatePath(`/clientes/${clientId}`)
    return { success: true }
  } catch (error) {
    console.error("Error deleting client appliance:", error)
    return { success: false, error: "Error al eliminar el electrodoméstico" }
  }
}

export async function getClientOrders(clientId: string) {
  try {
    const orders = await db.query.serviceOrders.findMany({
      where: (serviceOrders, { eq }) => eq(serviceOrders.clientId, clientId),
      with: {
        appliance: {
          with: {
            brand: true,
            applianceType: true,
          },
        },
        technicianAssignments: {
          with: {
            technician: true,
          },
        },
      },
      orderBy: (serviceOrders, { desc }) => [desc(serviceOrders.receivedDate)],
    })

    return { success: true, data: orders }
  } catch (error) {
    console.error("Error fetching client orders:", error)
    return { success: false, error: "Error al obtener las órdenes del cliente" }
  }
}

export async function getClientPayments(clientId: string) {
  try {
    // Primero obtenemos todas las órdenes del cliente
    const orders = await db.query.serviceOrders.findMany({
      where: (serviceOrders, { eq }) => eq(serviceOrders.clientId, clientId),
      columns: {
        id: true,
      },
    })

    const orderIds = orders.map((order) => order.id)

    if (orderIds.length === 0) {
      return { success: true, data: [] }
    }

    // Luego obtenemos todos los pagos asociados a esas órdenes
    const payments = await db.query.payments.findMany({
      where: (payments, { inArray }) => inArray(payments.serviceOrderId, orderIds),
      with: {
        serviceOrder: {
          columns: {
            id: true,
            orderNumber: true,
          },
        },
      },
      orderBy: (payments, { desc }) => [desc(payments.paymentDate)],
    })

    return { success: true, data: payments }
  } catch (error) {
    console.error("Error fetching client payments:", error)
    return { success: false, error: "Error al obtener los pagos del cliente" }
  }
}

export async function getClientAppliances(clientId: string) {
  try {
    // Primero obtenemos todas las órdenes del cliente
    const orders = await db.query.serviceOrders.findMany({
      where: (serviceOrders, { eq }) => eq(serviceOrders.clientId, clientId),
      columns: {
        id: true,
        applianceId: true,
        orderNumber: true,
        receivedDate: true,
      },
    })

    // Extraemos los IDs de electrodomésticos únicos
    const applianceIds = [...new Set(orders.map((order) => order.applianceId))]

    if (applianceIds.length === 0) {
      return { success: true, data: [] }
    }

    // Obtenemos los detalles de los electrodomésticos
    const appliancesData = await db.query.appliances.findMany({
      where: (appliances, { inArray }) => inArray(appliances.id, applianceIds),
      with: {
        brand: true,
        applianceType: true,
      },
    })

    // Asociamos las órdenes con cada electrodoméstico
    const appliancesWithOrders = appliancesData.map((appliance) => {
      const applianceOrders = orders
        .filter((order) => order.applianceId === appliance.id)
        .sort((a, b) => new Date(b.receivedDate).getTime() - new Date(a.receivedDate).getTime())
        .map((order) => ({
          id: order.id,
          orderNumber: order.orderNumber,
          receivedDate: order.receivedDate,
        }))

      return {
        ...appliance,
        serviceOrders: applianceOrders,
      }
    })

    return { success: true, data: appliancesWithOrders }
  } catch (error) {
    console.error("Error fetching client appliances:", error)
    return { success: false, error: "Error al obtener los electrodomésticos del cliente" }
  }
}

export async function getClientSummary(clientId: string) {
  try {
    // Obtenemos todas las órdenes del cliente
    const orders = await db.query.serviceOrders.findMany({
      where: (serviceOrders, { eq }) => eq(serviceOrders.clientId, clientId),
      columns: {
        id: true,
        totalAmount: true,
        paidAmount: true,
        paymentStatus: true,
      },
    })

    // Calculamos las estadísticas
    const totalOrders = orders.length
    const totalAmount = orders.reduce((sum, order) => sum + Number(order.totalAmount || 0), 0)
    const totalPaid = orders.reduce((sum, order) => sum + Number(order.paidAmount || 0), 0)
    const pendingAmount = totalAmount - totalPaid

    return {
      success: true,
      data: {
        totalOrders,
        totalAmount,
        totalPaid,
        pendingAmount,
      },
    }
  } catch (error) {
    console.error("Error fetching client summary:", error)
    return { success: false, error: "Error al obtener el resumen del cliente" }
  }
}

export async function createClient(data: ClientFormData, userId: string) {
  try {
    const [client] = await db
      .insert(clients)
      .values({
        name: data.name,
        document: data.document || null,
        phone: data.phone || null,
        phone2: data.phone2 || null,
        whatsapp: data.whatsapp || null,
        email: data.email || null,
        status: data.status,
        zoneId: data.zoneId || null,
        cityId: data.cityId || null,
        sucursalId: data.sucursalId || null, // Campo agregado
        address: data.address || null,
        latitude: data.latitude ? Number.parseFloat(data.latitude) : null,
        longitude: data.longitude ? Number.parseFloat(data.longitude) : null,
        createdBy: userId,
        updatedBy: userId,
      })
      .returning()

    revalidatePath("/clientes")
    return { success: true, data: client }
  } catch (error) {
    console.error("Error creating client:", error)
    return { success: false, error: "Error al crear el cliente" }
  }
}

export async function createInlineClient(data: InlineClientFormData, userId: string) {
  try {
    const [client] = await db
      .insert(clients)
      .values({
        name: data.name,
        phone: data.phone || null,
        phone2: data.phone2 || null,
        whatsapp: data.whatsapp || null,
        email: data.email || null,
        status: "active",
        zoneId: data.zoneId || null,
        cityId: data.cityId || null,
        sucursalId: data.sucursalId || null,
        address: data.address || null,
        createdBy: userId,
        updatedBy: userId,
      })
      .returning();

    // Revalidar todas las rutas relevantes
    revalidatePath('/clientes');
    revalidatePath('/ordenes');
    revalidatePath('/api/clients');
    
    return { success: true, data: client }
  } catch (error) {
    console.error("Error creating client:", error)
    return { success: false, error: "Error al crear el cliente" }
  }
}

export async function updateClient(id: string, data: ClientFormData, userId: string) {
  try {
    const [updated] = await db
      .update(clients)
      .set({
        name: data.name,
        document: data.document || null,
        phone: data.phone || null,
        phone2: data.phone2 || null,
        whatsapp: data.whatsapp || null,
        email: data.email || null,
        status: data.status,
        zoneId: data.zoneId || null,
        cityId: data.cityId || null,
        sucursalId: data.sucursalId || null, // Campo agregado
        address: data.address || null,
        latitude: data.latitude ? Number.parseFloat(data.latitude) : null,
        longitude: data.longitude ? Number.parseFloat(data.longitude) : null,
        updatedBy: userId,
        updatedAt: new Date(),
      })
      .where(eq(clients.id, id))
      .returning()

    revalidatePath("/clientes")
    revalidatePath(`/clientes/${id}`)
    return { success: true, data: updated }
  } catch (error) {
    console.error("Error updating client:", error)
    return { success: false, error: "Error al actualizar el cliente" }
  }
}

export async function deleteClient(id: string) {
  try {
    await db.delete(clients).where(eq(clients.id, id))

    revalidatePath("/clientes")
    return { success: true }
  } catch (error) {
    console.error("Error deleting client:", error)
    return { success: false, error: "Error al eliminar el cliente" }
  }
}