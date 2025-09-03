import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { auth } from '@/features/auth'; // Importa tu configuración de NextAuth

export async function middleware(request: NextRequest) {
  const session = await auth();
  const pathname = request.nextUrl.pathname;

  const isTechnicianLoggedIn = !!session?.user && session.user.role === 'TECHNICIAN';
  
  // Rutas de autenticación que un usuario no logueado SÍ puede visitar
  const authRoutes = ['/tecnico/sign-in', '/tecnico/set-password'];
  
  // 1. Si la ruta NO comienza con /tecnico, redirige siempre al login de técnico
  if (!pathname.startsWith('/tecnico')) {
    return NextResponse.redirect(new URL('/tecnico/sign-in', request.url));
  }

  // 2. Si el usuario está en una ruta de autenticación
  if (authRoutes.includes(pathname)) {
    // Y ya está logueado, lo enviamos a su panel principal
    if (isTechnicianLoggedIn) {
      return NextResponse.redirect(new URL('/tecnico/ordenes', request.url));
    }
    // Si no está logueado, le permitimos continuar a la página de login/set-password
    return NextResponse.next();
  }

  // 3. Si el usuario está en cualquier otra página de /tecnico (protegida)
  // y NO está logueado, lo enviamos al login
  if (!isTechnicianLoggedIn) {
    return NextResponse.redirect(new URL('/tecnico/sign-in', request.url));
  }

  // Si pasa todas las verificaciones, le permitimos continuar
  return NextResponse.next();
}

// Configuración para que el middleware se aplique a todas las rutas,
// excepto a las de Next.js, archivos estáticos, etc.
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};