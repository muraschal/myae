import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';

// Diese Middleware prüft, ob der Benutzer angemeldet ist
export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  // Erstelle einen Supabase-Client für die Serverseite
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          response.cookies.set({
            name,
            value,
            ...options,
          });
        },
        remove(name: string, options: CookieOptions) {
          response.cookies.set({
            name,
            value: '',
            ...options,
          });
        },
      },
    }
  );

  // Hole die aktuelle Sitzung
  const { data: { session } } = await supabase.auth.getSession();

  // URL des aktuellen Requests
  const url = new URL(request.url);
  const isAuthPage = url.pathname.startsWith('/auth');
  const isApiRoute = url.pathname.startsWith('/api');
  
  // Öffentliche Routen, die ohne Anmeldung zugänglich sind
  const isPublicPage = url.pathname === '/' || url.pathname === '/about';

  // Wenn der Benutzer nicht angemeldet ist und eine geschützte Route aufruft
  if (!session && !isAuthPage && !isPublicPage && !isApiRoute) {
    const redirectUrl = new URL('/auth/login', request.url);
    redirectUrl.searchParams.set('redirect', url.pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // Wenn der Benutzer angemeldet ist und eine Auth-Seite aufruft (z.B. login)
  if (session && isAuthPage) {
    // Umleitung zur Startseite
    return NextResponse.redirect(new URL('/', request.url));
  }

  return response;
}

// Die Middleware nur für bestimmte Pfade ausführen
export const config = {
  matcher: [
    // Alle Routen außer assets und API-Routes
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}; 