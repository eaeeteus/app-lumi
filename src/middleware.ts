import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Rotas públicas que não precisam de autenticação
  const publicRoutes = ['/login'];
  const isPublicRoute = publicRoutes.some(route => req.nextUrl.pathname.startsWith(route));

  // Se está em rota pública e está autenticado, redireciona para dashboard
  if (isPublicRoute && session) {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  // Se não está em rota pública e não está autenticado, redireciona para login
  if (!isPublicRoute && !session && req.nextUrl.pathname !== '/') {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  return res;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
