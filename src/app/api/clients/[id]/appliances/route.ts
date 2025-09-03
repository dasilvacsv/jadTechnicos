import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { clientAppliances, brands, applianceTypes } from '@/db/schema'
import { eq } from 'drizzle-orm'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const appliances = await db.query.clientAppliances.findMany({
      where: eq(clientAppliances.clientId, params.id),
      with: {
        brand: true,
        applianceType: true,
      },
      orderBy: [clientAppliances.createdAt]
    })

    return NextResponse.json({ success: true, appliances })
  } catch (error) {
    console.error('Error fetching client appliances:', error)
    return NextResponse.json(
      { success: false, error: 'Error al obtener los electrodomésticos' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { name, brandId, applianceTypeId, model, serialNumber, notes } = await request.json()

    // Validate required fields
    if (!name || !brandId || !applianceTypeId) {
      return NextResponse.json(
        { success: false, error: 'Nombre, marca y tipo son campos obligatorios' },
        { status: 400 }
      )
    }

    // Create the new appliance
    const [newAppliance] = await db.insert(clientAppliances).values({
      clientId: params.id,
      name,
      brandId,
      applianceTypeId,
      model: model || null,
      serialNumber: serialNumber || null,
      notes: notes || null,
    }).returning()

    // Fetch the complete appliance with relations
    const completeAppliance = await db.query.clientAppliances.findFirst({
      where: eq(clientAppliances.id, newAppliance.id),
      with: {
        brand: true,
        applianceType: true,
      }
    })

    return NextResponse.json({ 
      success: true, 
      appliance: completeAppliance,
      message: 'Electrodoméstico creado correctamente'
    })
  } catch (error) {
    console.error('Error creating client appliance:', error)
    return NextResponse.json(
      { success: false, error: 'Error al crear el electrodoméstico' },
      { status: 500 }
    )
  }
}