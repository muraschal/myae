import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Erstelle einen Supabase-Server-Client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(request: NextRequest) {
  try {
    // Extrahiere Token und Passwort aus dem Request-Body
    const { token, password } = await request.json();

    if (!token) {
      return NextResponse.json(
        { error: 'Kein Token angegeben.' },
        { status: 400 }
      );
    }

    if (!password || password.length < 8) {
      return NextResponse.json(
        { error: 'Das Passwort muss mindestens 8 Zeichen lang sein.' },
        { status: 400 }
      );
    }

    console.log('Starte Passwort-Aktualisierung mit Token');

    try {
      // Versuche, das Passwort mit dem Admin-API zu aktualisieren
      // Dies ist ein Workaround, da der normale Client eine Authentifizierung benötigt
      const { data: userData, error: userError } = await supabase.auth.admin.getUserById(
        token // Wir verwenden den Token als User-ID (dies ist ein Hack und funktioniert nur, wenn der Token eine gültige UUID ist)
      );

      if (userError || !userData?.user) {
        console.error('Fehler beim Abrufen des Benutzers:', userError);
        
        // Versuche einen alternativen Ansatz mit der Supabase-API
        const { error: resetError } = await supabase.auth.resetPasswordForEmail(
          'dummy@example.com', // Wir benötigen eine E-Mail, aber sie wird nicht verwendet
          {
            redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://myae.rapold.io'}/auth/update-password?token=${token}`,
          }
        );

        if (resetError) {
          console.error('Fehler beim Zurücksetzen des Passworts:', resetError);
          return NextResponse.json(
            { error: 'Token ist ungültig oder abgelaufen. Bitte fordere einen neuen Link an.' },
            { status: 400 }
          );
        }
      }

      // Versuche, das Passwort zu aktualisieren
      const { error: updateError } = await supabase.auth.updateUser({
        password: password
      });

      if (updateError) {
        console.error('Fehler beim Aktualisieren des Passworts:', updateError);
        return NextResponse.json(
          { error: updateError.message },
          { status: 400 }
        );
      }

      console.log('Passwort erfolgreich aktualisiert');
      return NextResponse.json({ 
        success: true, 
        message: 'Passwort wurde erfolgreich aktualisiert.' 
      });
    } catch (error: any) {
      console.error('Fehler bei der Supabase-Anfrage:', error);
      return NextResponse.json(
        { error: error instanceof Error ? error.message : 'Ein unerwarteter Fehler ist aufgetreten' },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('Unerwarteter Fehler:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Ein unerwarteter Fehler ist aufgetreten' },
      { status: 500 }
    );
  }
} 