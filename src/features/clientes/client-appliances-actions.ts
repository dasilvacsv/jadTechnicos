"use server"

import { db } from "@/db"
import { clientAppliances, serviceOrders, brands, applianceTypes, serviceOrderAppliances, serviceOrderStatusHistory } from "@/db/schema"
import { revalidatePath } from "next/cache"
import { and, eq, desc, like } from "drizzle-orm"
import { generateOrderCode as generateOrderNumber } from "@/lib/utils"

interface AddClientApplianceInput {
  clientId: string
  brandId: string
  applianceTypeId: string
  notes?: string
  userId: string
}

export async function addClientAppliance(input: AddClientApplianceInput) {
  try {
    // Get brand and appliance type names to generate a name
    const brand = await db.query.brands.findFirst({
      where: eq(brands.id, input.brandId),
    })

    const applianceType = await db.query.applianceTypes.findFirst({
      where: eq(applianceTypes.id, input.applianceTypeId),
    })

    // Generate a name from brand and type
    const generatedName = `${brand?.name || "Unknown"} ${applianceType?.name || "Device"}`

    // Create the client appliance
    const [clientAppliance] = await db
      .insert(clientAppliances)
      .values({
        clientId: input.clientId,
        name: generatedName,
        notes: input.notes || null,
        brandId: input.brandId,
        applianceTypeId: input.applianceTypeId,
        createdBy: input.userId,
        updatedBy: input.userId,
      })
      .returning()

    revalidatePath(`/clientes/${input.clientId}`)
    revalidatePath(`/clientes/${input.clientId}/electrodomesticos`)
    revalidatePath("/clientes")

    // Fetch the brand and appliance type to return with the result
    const brandData = brand || { id: input.brandId, name: "Unknown" }
    const applianceTypeData = applianceType || { id: input.applianceTypeId, name: "Unknown" }

    return {
      success: true,
      data: {
        ...clientAppliance,
        brand: brandData,
        applianceType: applianceTypeData,
      },
    }
  } catch (error) {
    console.error("Error adding appliance to client:", error)
    return { success: false, error: "Error al agregar el electrodoméstico al cliente" }
  }
}

export async function getClientAppliances(clientId: string) {
  try {
    // First, get all client appliances for this client
    const clientAppliancesList = await db.query.clientAppliances.findMany({
      where: eq(clientAppliances.clientId, clientId),
      orderBy: desc(clientAppliances.createdAt),
    })

    // For each client appliance, fetch the brand and appliance type
    const appliancesWithDetails = await Promise.all(
      clientAppliancesList.map(async (item) => {
        const brand = await db.query.brands.findFirst({
          where: eq(brands.id, item.brandId),
        })

        const applianceType = await db.query.applianceTypes.findFirst({
          where: eq(applianceTypes.id, item.applianceTypeId),
        })

        return {
          ...item,
          brand: brand || { id: item.brandId, name: "Unknown" },
          applianceType: applianceType || { id: item.applianceTypeId, name: "Unknown" },
        }
      }),
    )

    return { success: true, data: appliancesWithDetails }
  } catch (error) {
    console.error("Error fetching client appliances:", error)
    return { success: false, error: "Error al obtener los electrodomésticos del cliente" }
  }
}

export async function removeClientAppliance(clientId: string, applianceId: string) {
  try {
    await db
      .delete(clientAppliances)
      .where(and(eq(clientAppliances.clientId, clientId), eq(clientAppliances.id, applianceId)))

    revalidatePath(`/clientes/${clientId}`)
    revalidatePath(`/clientes/${clientId}/electrodomesticos`)
    return { success: true }
  } catch (error) {
    console.error("Error removing appliance from client:", error)
    return { success: false, error: "Error al eliminar el electrodoméstico del cliente" }
  }
}

export async function getClientApplianceById(id: string) {
  try {
    const clientAppliance = await db.query.clientAppliances.findFirst({
      where: eq(clientAppliances.id, id),
    })

    if (!clientAppliance) {
      return { success: false, error: "Electrodoméstico no encontrado" }
    }

    // Fetch brand and appliance type
    const brand = await db.query.brands.findFirst({
      where: eq(brands.id, clientAppliance.brandId),
    })

    const applianceType = await db.query.applianceTypes.findFirst({
      where: eq(applianceTypes.id, clientAppliance.applianceTypeId),
    })

    // Transform to match expected format
    const transformedAppliance = {
      ...clientAppliance,
      brand: brand || { id: clientAppliance.brandId, name: "Unknown" },
      applianceType: applianceType || { id: clientAppliance.applianceTypeId, name: "Unknown" },
    }

    return { success: true, data: transformedAppliance }
  } catch (error) {
    console.error("Error fetching client appliance:", error)
    return { success: false, error: "Error al obtener el electrodoméstico" }
  }
}

// Update the getApplianceDetails function to use the junction table
export async function getApplianceDetails(clientId: string, applianceId: string) {
  try {
    // Get the appliance details with its relationships
    const clientAppliance = await db.query.clientAppliances.findFirst({
      where: and(eq(clientAppliances.clientId, clientId), eq(clientAppliances.id, applianceId)),
      with: {
        brand: true,
        applianceType: true,
      },
    })

    if (!clientAppliance) {
      return { success: false, error: "Electrodoméstico no encontrado" }
    }

    // Get orders related to this specific appliance through the junction table
    const serviceOrdersWithAppliance = await db.query.serviceOrderAppliances.findMany({
      where: eq(serviceOrderAppliances.clientApplianceId, applianceId),
      with: {
        serviceOrder: {
          columns: {
            id: true,
            orderNumber: true,
            status: true,
            paymentStatus: true,
            description: true,
            receivedDate: true,
            completedDate: true,
            deliveredDate: true,
            createdAt: true,
          },
        },
      },
      orderBy: desc(serviceOrderAppliances.createdAt),
    })

    // Transform the data to match the expected format
    const orders = serviceOrdersWithAppliance.map(soa => ({
      ...soa.serviceOrder,
      falla: soa.falla,
      solucion: soa.solucion,
    }))

    return {
      success: true,
      data: {
        appliance: clientAppliance,
        orders: orders,
      },
    }
  } catch (error) {
    console.error("Error fetching appliance details:", error)
    return { success: false, error: "Error al obtener los detalles del electrodoméstico" }
  }
}

interface CreateOrderParams {
  status: "PENDING" | "PREORDER";
  falla: string;
}

// Update the createOrderFromAppliance function to work with the new junction table
export async function createOrderFromAppliance(
  clientId: string,
  clientApplianceId: string,
  params: CreateOrderParams
) {
  try {
    // Get the appliance details
    const clientAppliance = await db.query.clientAppliances.findFirst({
      where: and(eq(clientAppliances.clientId, clientId), eq(clientAppliances.id, clientApplianceId)),
      with: {
        brand: true,
        applianceType: true,
      },
    })

    if (!clientAppliance) {
      return { success: false, error: "Electrodoméstico no encontrado" }
    }

    // Generate order number
    const orderNumber = await generateOrderNumber()

    // Create a descriptive name for the appliance
    const applianceName = `${clientAppliance.brand?.name || "Unknown"} ${clientAppliance.applianceType?.name || "Device"} ${clientAppliance.notes || ""}`

    // 1. Create the service order first
    const [order] = await db
      .insert(serviceOrders)
      .values({
        orderNumber,
        clientId,
        status: params.status,
        paymentStatus: "PENDING",
        receivedDate: new Date(),
        description: `${params.status === "PREORDER" ? "Pre-orden" : "Orden"} para ${applianceName}`,
        createdBy: clientAppliance.createdBy,
        updatedBy: clientAppliance.createdBy,
      })
      .returning()
      
    // 2. Create status history entry
    await db.insert(serviceOrderStatusHistory).values({
      serviceOrderId: order.id,
      status: params.status,
      notes: `${params.status === "PREORDER" ? "Pre-orden" : "Orden"} creada desde electrodoméstico: ${applianceName}`,
      createdBy: clientAppliance.createdBy,
    });

    // 3. Create the entry in the junction table
    await db
      .insert(serviceOrderAppliances)
      .values({
        serviceOrderId: order.id,
        clientApplianceId: clientApplianceId,
        falla: params.falla,
        solucion: null,
        createdBy: clientAppliance.createdBy,
        updatedBy: clientAppliance.createdBy,
      })

    revalidatePath(`/clientes/${clientId}`)
    revalidatePath(`/clientes/${clientId}/electrodomesticos`)
    revalidatePath("/ordenes")

    return { success: true, data: order }
  } catch (error) {
    console.error("Error creating order from appliance:", error)
    return { success: false, error: "Error al crear la orden desde el electrodoméstico" }
  }
}
