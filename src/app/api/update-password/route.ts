import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error('NEXT_PUBLIC_SUPABASE_URL ist nicht definiert');
}

if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('SUPABASE_SERVICE_ROLE_KEY ist nicht definiert');
}

// Supabase Client mit Service Role Key für Admin-Operationen
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(request: NextRequest) {
  try {
    // Körper der Anfrage extrahieren
    const { password, token } = await request.json();

    console.log('Passwort-Update-Anfrage erhalten', { 
      tokenVorhanden: !!token,
      passwordLänge: password?.length
    });

    // Validierung: Passwort und Token sind erforderlich
    if (!password || !token) {
      console.log('Validierungsfehler: Passwort oder Token fehlt');
      return NextResponse.json(
        { error: 'Passwort und Token sind erforderlich' },
        { status: 400 }
      );
    }

    // Validierung: Passwortlänge
    if (password.length < 8) {
      console.log('Validierungsfehler: Passwort zu kurz');
      return NextResponse.json(
        { error: 'Das Passwort muss mindestens 8 Zeichen lang sein' },
        { status: 400 }
      );
    }

    // Supabase-Client mit Reset-Token anstatt Session Cookie
    const supabaseWithToken = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
      {
        auth: {
          // 'pkce' ist der Standard-Flow-Typ für Supabase
          autoRefreshToken: false,
        }
      }
    );

    // Versuch 1: Direktes Passwort-Update mit aktuellem Token
    console.log('Versuche direktes Passwort-Update');
    const { data, error } = await supabase.auth.updateUser(
      { password },
      { emailRedirectTo: process.env.NEXT_PUBLIC_SITE_URL }
    );

    if (error) {
      console.error('Fehler bei direktem Passwort-Update:', error.message);
      
      // Versuch 2: Recovery mit Token
      try {
        console.log('Versuche Recovery mit Token');
        
        // Versuchen, den Token direkt zu nutzen
        const { error: recoveryError } = await supabase.auth.refreshSession({
          refresh_token: token
        });
        
        if (!recoveryError) {
          // Wenn der Token funktioniert, erneut Passwort aktualisieren
          const { error: updateError } = await supabase.auth.updateUser({ password });
          
          if (!updateError) {
            console.log('Passwort nach Token-Refresh erfolgreich aktualisiert');
            return NextResponse.json(
              { message: 'Passwort erfolgreich aktualisiert' },
              { status: 200 }
            );
          } else {
            console.error('Fehler nach Token-Refresh:', updateError.message);
          }
        } else {
          console.error('Token-Refresh fehlgeschlagen:', recoveryError.message);
        }
      } catch (recoveryError: any) {
        console.error('Exception bei Token-Recovery:', recoveryError?.message);
      }
      
      return NextResponse.json(
        { error: 'Fehler beim Aktualisieren des Passworts', details: error.message },
        { status: 500 }
      );
    }

    console.log('Passwort erfolgreich aktualisiert');
    return NextResponse.json(
      { message: 'Passwort erfolgreich aktualisiert' },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Unbehandelte Exception:', error);
    return NextResponse.json(
      { error: 'Interner Serverfehler', details: error.message || 'Keine Details verfügbar' },
      { status: 500 }
    );
  }
} 