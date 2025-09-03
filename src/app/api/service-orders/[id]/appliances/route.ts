import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { serviceOrderAppliances, clientAppliances } from '@/db/schema'
import { eq, and } from 'drizzle-orm'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { applianceIndex, newApplianceId, userId } = await request.json()

    // Get the service order appliances
    const serviceOrderAppliancesList = await db.query.serviceOrderAppliances.findMany({
      where: eq(serviceOrderAppliances.serviceOrderId, params.id),
      orderBy: [serviceOrderAppliances.createdAt]
    })

    if (applianceIndex >= serviceOrderAppliancesList.length) {
      return NextResponse.json(
        { success: false, error: 'Índice de electrodoméstico inválido' },
        { status: 400 }
      )
    }

    const targetAppliance = serviceOrderAppliancesList[applianceIndex]

    // Update the appliance reference
    await db.update(serviceOrderAppliances)
      .set({
        clientApplianceId: newApplianceId,
        updatedAt: new Date(),
        updatedBy: userId
      })
      .where(eq(serviceOrderAppliances.id, targetAppliance.id))

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in appliance update API:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { applianceIndex, field, value, userId, serviceOrderApplianceId } = await request.json()

    // Fields that belong to the serviceOrderAppliances table
    if (field === 'falla' || field === 'solucion') {
      await db.update(serviceOrderAppliances)
        .set({
          [field]: value,
          updatedAt: new Date(),
          updatedBy: userId
        })
        .where(eq(serviceOrderAppliances.id, serviceOrderApplianceId))
    } else {
      // Fields that belong to the clientAppliances table
      const serviceOrderAppliance = await db.query.serviceOrderAppliances.findFirst({
        where: eq(serviceOrderAppliances.id, serviceOrderApplianceId)
      })

      if (!serviceOrderAppliance) {
        return NextResponse.json(
          { success: false, error: 'Electrodoméstico no encontrado en la orden de servicio' },
          { status: 404 }
        )
      }

      await db.update(clientAppliances)
        .set({
          [field]: value,
          updatedAt: new Date(),
          updatedBy: userId
        })
        .where(eq(clientAppliances.id, serviceOrderAppliance.clientApplianceId))
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating appliance field:', error)
    return NextResponse.json(
      { success: false, error: 'Error al actualizar el campo' },
      { status: 500 }
    )
  }
}