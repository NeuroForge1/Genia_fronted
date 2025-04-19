import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Rutas que requieren autenticación
const protectedRoutes = [
  '/dashboard',
  '/profile',
  '/subscription',
  '/clones',
  '/integrations',
];

// Rutas públicas (no requieren autenticación)
const publicRoutes = [
  '/',
  '/login',
  '/register',
  '/forgot-password',
];

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });
  
  // Verificar si el usuario está autenticado
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const url = req.nextUrl.pathname;
  
  // Verificar si la ruta actual es protegida
  const isProtectedRoute = protectedRoutes.some(route => 
    url === route || url.startsWith(`${route}/`)
  );
  
  // Verificar si la ruta actual es pública
  const isPublicRoute = publicRoutes.some(route => 
    url === route || url.startsWith(`${route}/`)
  );

  // Si es una ruta protegida y el usuario no está autenticado, redirigir a login
  if (isProtectedRoute && !session) {
    const redirectUrl = new URL('/login', req.url);
    return NextResponse.redirect(redirectUrl);
  }

  // Si es una ruta pública (login, register) y el usuario ya está autenticado, redirigir a dashboard
  if (isPublicRoute && session) {
    const redirectUrl = new URL('/dashboard', req.url);
    return NextResponse.redirect(redirectUrl);
  }

  return res;
}

// Configurar las rutas en las que se ejecutará el middleware
export const config = {
  matcher: [
    /*
     * Coincide con todas las rutas excepto:
     * - Archivos estáticos (_next/static, favicon.ico, etc.)
     * - Rutas de API
     */
    '/((?!_next/static|_next/image|favicon.ico|api).*)',
  ],
};
