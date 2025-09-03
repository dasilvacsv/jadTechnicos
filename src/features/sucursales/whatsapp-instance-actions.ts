"use server"

import { db } from "@/db"
import { sucursales, instances, userInstances, users } from "@/db/schema"
import { eq, and } from "drizzle-orm"
import { revalidatePath } from "next/cache"

const API_URL = process.env.EVOLUTION_API_URL
const API_KEY = process.env.EVOLUTION_API_KEY

// Create WhatsApp instance for sucursal
export async function createSucursalWhatsAppInstance(sucursalId: string, userId: string) {
  try {
    // Get sucursal details
    const [sucursal] = await db.select().from(sucursales).where(eq(sucursales.id, sucursalId)).limit(1)
    
    if (!sucursal) {
      throw new Error("Sucursal no encontrada")
    }

    // Create a safe instance name based on sucursal name
    const instanceName = sucursal.name
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "")
      .substring(0, 20) + `-${Date.now().toString().substring(9, 13)}`

    // Create instance in Evolution API
    const response = await fetch(`${API_URL}/instance/create`, {
      method: "POST",
      headers: {
        apikey: API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        instanceName: instanceName,
        qrcode: true,
        integration: "WHATSAPP-BAILEYS",
        webhook: null,
        websocket: {
          enabled: true,
          events: [
            "APPLICATION_STARTUP",
            "CALL",
            "CHATS_DELETE",
            "CHATS_SET",
            "CHATS_UPDATE",
            "CHATS_UPSERT",
            "CONNECTION_UPDATE",
            "CONTACTS_SET",
            "CONTACTS_UPDATE",
            "CONTACTS_UPSERT",
            "GROUP_PARTICIPANTS_UPDATE",
            "GROUP_UPDATE",
            "GROUPS_UPSERT",
            "MESSAGES_DELETE",
            "MESSAGES_SET",
            "MESSAGES_UPDATE",
            "MESSAGES_UPSERT",
            "PRESENCE_UPDATE",
            "QRCODE_UPDATED",
          ],
        },
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => null)
      throw new Error(errorData?.error?.message || "Error al crear la instancia")
    }

    const data = await response.json()

    // Create instance in database
    const [newInstance] = await db
      .insert(instances)
      .values({
        name: `${sucursal.name} - WhatsApp`,
        instanceId: data.instance.instanceName,
        jwt: data.hash,
        role: "administracion",
        status: "active",
        wsUrl: API_URL,
        botEnabled: false,
      })
      .returning()

    // Update sucursal with instance information
    await db
      .update(sucursales)
      .set({
        whatsappInstanceId: newInstance.id,
        whatsappInstanceName: instanceName,
        whatsappInstanceStatus: "connecting",
        whatsappLastConnection: new Date(),
        updatedAt: new Date(),
        updatedBy: userId,
      })
      .where(eq(sucursales.id, sucursalId))

    // Create user-instance relationship
    await db.insert(userInstances).values({
      userId: userId,
      instanceId: newInstance.id,
      canManage: true,
    })

    revalidatePath("/sucursales")
    return {
      success: true,
      message: `Instancia WhatsApp creada para ${sucursal.name}`,
      instance: newInstance,
      instanceName: instanceName,
    }
  } catch (error) {
    console.error("Error creating WhatsApp instance:", error)
    return {
      success: false,
      message: error instanceof Error ? error.message : "Error desconocido al crear la instancia",
    }
  }
}

// Connect WhatsApp instance for sucursal and return QR code
export async function connectSucursalWhatsAppInstance(sucursalId: string) {
  try {
    const [sucursal] = await db.select().from(sucursales).where(eq(sucursales.id, sucursalId)).limit(1)
    
    if (!sucursal || !sucursal.whatsappInstanceName) {
      throw new Error("No hay instancia de WhatsApp para esta sucursal")
    }

    const response = await fetch(`${API_URL}/instance/connect/${sucursal.whatsappInstanceName}`, {
      method: "GET",
      headers: {
        apikey: API_KEY,
      },
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => null)
      throw new Error(errorData?.error?.message || "Error al conectar con Evolution API")
    }

    const data = await response.json()

    if (!data.qrcode?.code && !data.code) {
      throw new Error("No se pudo generar el código QR. Intente reiniciar la instancia.")
    }

    // Update sucursal status
    await db
      .update(sucursales)
      .set({
        whatsappInstanceStatus: "connecting",
        whatsappLastConnection: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(sucursales.id, sucursalId))

    revalidatePath("/sucursales")
    return {
      success: true,
      qrcode: data.qrcode?.code || data.code,
      message: "Código QR generado correctamente",
      instanceName: sucursal.whatsappInstanceName,
    }
  } catch (error) {
    console.error("Error connecting WhatsApp instance:", error)
    return {
      success: false,
      message: error instanceof Error ? error.message : "Error desconocido al conectar",
      qrcode: null,
    }
  }
}

// Check connection status of sucursal WhatsApp instance
export async function checkSucursalWhatsAppConnection(sucursalId: string) {
  try {
    const [sucursal] = await db.select().from(sucursales).where(eq(sucursales.id, sucursalId)).limit(1)
    
    if (!sucursal || !sucursal.whatsappInstanceName) {
      return {
        success: true,
        status: "disconnected",
        message: "No hay instancia configurada"
      }
    }

    const response = await fetch(`${API_URL}/instance/connectionState/${sucursal.whatsappInstanceName}`, {
      method: "GET",
      headers: {
        apikey: API_KEY,
      },
    })

    if (!response.ok) {
      // If API call fails, don't throw error, just return disconnected
      await db
        .update(sucursales)
        .set({
          whatsappInstanceStatus: "disconnected",
          updatedAt: new Date(),
        })
        .where(eq(sucursales.id, sucursalId))

      return {
        success: true,
        status: "disconnected",
        message: "No se pudo verificar el estado"
      }
    }

    const data = await response.json()
    const status = data.instance?.state === "open" ? "connected" : "disconnected"

    // Update sucursal status
    await db
      .update(sucursales)
      .set({
        whatsappInstanceStatus: status,
        whatsappLastConnection: status === "connected" ? new Date() : sucursal.whatsappLastConnection,
        updatedAt: new Date(),
      })
      .where(eq(sucursales.id, sucursalId))

    return {
      success: true,
      status: status,
      message: status === "connected" ? "Conectado" : "Desconectado"
    }
  } catch (error) {
    console.error("Error checking connection status:", error)
    return {
      success: true,
      status: "disconnected",
      message: "Error al verificar estado"
    }
  }
}

// Get sucursal WhatsApp instance info
export async function getSucursalWhatsAppInstance(sucursalId: string) {
  try {
    const [sucursal] = await db.select().from(sucursales).where(eq(sucursales.id, sucursalId)).limit(1)
    
    if (!sucursal) {
      return {
        success: false,
        message: "Sucursal no encontrada"
      }
    }

    return {
      success: true,
      data: {
        hasInstance: !!sucursal.whatsappInstanceName,
        instanceName: sucursal.whatsappInstanceName,
        status: sucursal.whatsappInstanceStatus || "disconnected",
        lastConnection: sucursal.whatsappLastConnection,
      }
    }
  } catch (error) {
    console.error("Error getting WhatsApp instance info:", error)
    return {
      success: false,
      message: "Error al obtener información de la instancia"
    }
  }
}

// Delete sucursal WhatsApp instance
export async function deleteSucursalWhatsAppInstance(sucursalId: string, userId: string) {
  try {
    const [sucursal] = await db.select().from(sucursales).where(eq(sucursales.id, sucursalId)).limit(1)
    
    if (!sucursal || !sucursal.whatsappInstanceName) {
      throw new Error("No hay instancia de WhatsApp para eliminar")
    }

    // Delete from Evolution API
    const response = await fetch(`${API_URL}/instance/delete/${sucursal.whatsappInstanceName}`, {
      method: "DELETE",
      headers: {
        apikey: API_KEY,
      },
    })

    // Continue even if API deletion fails
    if (!response.ok) {
      console.warn("Failed to delete instance from Evolution API, but continuing with database cleanup")
    }

    // Delete instance from database
    if (sucursal.whatsappInstanceId) {
      // First delete user-instance relationships
      await db.delete(userInstances).where(eq(userInstances.instanceId, sucursal.whatsappInstanceId))
      
      // Then delete the instance
      await db.delete(instances).where(eq(instances.id, sucursal.whatsappInstanceId))
    }

    // Clean up sucursal WhatsApp fields
    await db
      .update(sucursales)
      .set({
        whatsappInstanceId: null,
        whatsappInstanceName: null,
        whatsappInstanceStatus: "disconnected",
        whatsappLastConnection: null,
        updatedAt: new Date(),
        updatedBy: userId,
      })
      .where(eq(sucursales.id, sucursalId))

    revalidatePath("/sucursales")
    return {
      success: true,
      message: "Instancia WhatsApp eliminada correctamente"
    }
  } catch (error) {
    console.error("Error deleting WhatsApp instance:", error)
    return {
      success: false,
      message: error instanceof Error ? error.message : "Error desconocido al eliminar la instancia"
    }
  }
}

// Get instance name for a sucursal (used for sending messages)
export async function getSucursalInstanceName(sucursalId: string) {
  try {
    const [sucursal] = await db.select().from(sucursales).where(eq(sucursales.id, sucursalId)).limit(1)
    
    if (!sucursal || !sucursal.whatsappInstanceName || sucursal.whatsappInstanceStatus !== "connected") {
      return null
    }

    return sucursal.whatsappInstanceName
  } catch (error) {
    console.error("Error getting sucursal instance name:", error)
    return null
  }
}