import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { applianceTypes } from '@/db/schema'
import { auth } from '@/features/auth' // Asegúrate de que la ruta a tu config de auth sea correcta

export async function GET() {
  try {
    const allTypes = await db.query.applianceTypes.findMany({
      orderBy: [applianceTypes.name]
    })

    return NextResponse.json({ success: true, types: allTypes })
  } catch (error) {
    console.error('Error fetching appliance types:', error)
    return NextResponse.json(
      { success: false, error: 'Error al obtener los tipos de electrodomésticos' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    const userId = session?.user?.id

    if (!userId) {
        return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { name } = body

    if (!name || typeof name !== 'string' || name.trim() === '') {
        return NextResponse.json({ success: false, error: 'El nombre es requerido' }, { status: 400 })
    }

    const [newType] = await db.insert(applianceTypes).values({
        name: name.trim(),
        createdBy: userId,
        updatedBy: userId,
    }).returning()

    return NextResponse.json({ success: true, type: newType }, { status: 201 })
  } catch (error) {
    console.error('Error creating appliance type:', error)
    return NextResponse.json(
        { success: false, error: 'Error al crear el tipo de electrodoméstico' },
        { status: 500 }
    )
  }
}
