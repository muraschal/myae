import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error('NEXT_PUBLIC_SUPABASE_URL ist nicht definiert');
}

if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  throw new Error('NEXT_PUBLIC_SUPABASE_ANON_KEY ist nicht definiert');
}

// Wir verwenden den anonymen Client, da wir mit einem Token arbeiten
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export async function POST(request: NextRequest) {
  try {
    const { password, token } = await request.json();

    console.log('Passwort-Update-Anfrage erhalten:', { 
      tokenVorhanden: !!token,
      tokenLänge: token?.length,
      passwordLänge: password?.length
    });

    // Validierung
    if (!password || !token) {
      return NextResponse.json(
        { error: 'Passwort und Token sind erforderlich' },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Das Passwort muss mindestens 8 Zeichen lang sein' },
        { status: 400 }
      );
    }

    // Erstelle eine Client-Seitige Session mit dem Token
    // Dies ist die empfohlene Methode laut Supabase für Recovery-Tokens
    try {
      // In Supabase ist der recovery_token (aus der URL) ein Typ von Refresh-Token
      console.log('Initialisiere Supabase-Sitzung mit Token');
      const { data: sessionData, error: sessionError } = await supabase.auth.refreshSession({
        refresh_token: token
      });

      if (sessionError) {
        console.error('Fehler beim Initialisieren der Sitzung:', sessionError.message);
        return NextResponse.json(
          { 
            error: 'Ungültiger oder abgelaufener Token', 
            details: sessionError.message 
          },
          { status: 401 }
        );
      }

      // Wenn wir hier ankommen, haben wir eine gültige Sitzung
      console.log('Sitzung initialisiert, aktualisiere jetzt Passwort');
      
      const { error: updateError } = await supabase.auth.updateUser({
        password: password
      });

      if (updateError) {
        console.error('Fehler beim Aktualisieren des Passworts:', updateError.message);
        return NextResponse.json(
          { 
            error: 'Fehler beim Aktualisieren des Passworts', 
            details: updateError.message 
          },
          { status: 500 }
        );
      }

      console.log('Passwort erfolgreich aktualisiert');
      return NextResponse.json(
        { message: 'Passwort erfolgreich aktualisiert' },
        { status: 200 }
      );
    } catch (error: any) {
      console.error('Unerwarteter Fehler:', error);
      return NextResponse.json(
        { 
          error: 'Fehler beim Aktualisieren des Passworts', 
          details: error?.message || 'Unbekannter Fehler' 
        },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('Kritischer Fehler:', error);
    return NextResponse.json(
      { 
        error: 'Interner Serverfehler', 
        details: error?.message || 'Kritischer Fehler im Server' 
      },
      { status: 500 }
    );
  }
} 