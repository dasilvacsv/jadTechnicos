import { NextResponse } from 'next/server';
import { createInlineClient } from '@/features/clientes/clients';
import { auth } from '@/features/auth';

export async function POST(request: Request) {
  const data = await request.formData();
  const session = await auth()
  
  const clientData = {
    name: data.get('name') as string,
    phone: data.get('phone') as string || undefined,
    phone2: data.get('phone2') as string || undefined,
    whatsapp: data.get('whatsapp') as string || undefined,
    email: data.get('email') as string || undefined,
    zoneId: data.get('zoneId') as string || undefined,
    cityId: data.get('cityId') as string || undefined,
    sucursalId: data.get('sucursalId') as string || undefined,
    address: data.get('address') as string || undefined,
  };

  const userId = session?.user?.id || "";
  const result = await createInlineClient(clientData, userId);
  
  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json(result);
}