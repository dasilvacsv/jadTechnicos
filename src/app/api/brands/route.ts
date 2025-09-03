import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { brands } from '@/db/schema'
import { auth } from '@/features/auth' // Asegúrate de que la ruta a tu config de auth sea correcta

export async function GET() {
  try {
    const allBrands = await db.query.brands.findMany({
      orderBy: [brands.name]
    })

    return NextResponse.json({ success: true, brands: allBrands })
  } catch (error) {
    console.error('Error fetching brands:', error)
    return NextResponse.json(
      { success: false, error: 'Error al obtener las marcas' },
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

    const [newBrand] = await db.insert(brands).values({
      name: name.trim(),
      createdBy: userId,
      updatedBy: userId,
    }).returning()

    return NextResponse.json({ success: true, brand: newBrand }, { status: 201 })
  } catch (error) {
    console.error('Error creating brand:', error)
    return NextResponse.json(
      { success: false, error: 'Error al crear la marca' },
      { status: 500 }
    )
  }
}
