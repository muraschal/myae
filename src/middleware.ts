import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

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
        set(name: string, value: string, options: any) {
          response.cookies.set({
            name,
            value,
            ...options,
          });
        },
        remove(name: string, options: any) {
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
  
  // Prüfe den Login-Status aus den Cookies
  const isLoggedIn = request.cookies.get('isLoggedIn')?.value === 'true';

  // Wenn der Benutzer nicht angemeldet ist und eine geschützte Route aufruft
  if (!isLoggedIn && !session && url.pathname.startsWith('/dashboard')) {
    const redirectUrl = new URL('/auth/login', request.url);
    redirectUrl.searchParams.set('redirect', url.pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // Wenn der Benutzer angemeldet ist und eine Auth-Seite aufruft
  if ((isLoggedIn || session) && isAuthPage) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return response;
}

// Die Middleware nur für bestimmte Pfade ausführen
export const config = {
  matcher: [
    '/dashboard/:path*',
    '/auth/:path*'
  ],
}; 