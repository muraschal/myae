import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  try {
    const { token, password } = await request.json();

    if (!token) {
      return NextResponse.json(
        { error: 'Token ist erforderlich.' },
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

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        auth: {
          persistSession: false,
        }
      }
    );

    try {
      // Versuche zuerst den Token zu verifizieren
      const { error: verifyError } = await supabase.auth.verifyOtp({
        token,
        type: 'recovery'
      });

      if (verifyError) {
        console.error('Fehler bei der Token-Verifizierung:', verifyError);
        return NextResponse.json(
          { error: 'Der Link ist ungültig oder abgelaufen. Bitte fordere einen neuen Link an.' },
          { status: 400 }
        );
      }

      // Wenn der Token verifiziert wurde, aktualisiere das Passwort
      const { error: updateError } = await supabase.auth.updateUser({
        password: password
      });

      if (updateError) {
        console.error('Fehler beim Aktualisieren des Passworts:', updateError);
        return NextResponse.json(
          { error: 'Passwort konnte nicht aktualisiert werden. Bitte versuche es später erneut.' },
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
        { error: 'Ein unerwarteter Fehler ist aufgetreten. Bitte versuche es später erneut.' },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('Unerwarteter Fehler:', error);
    return NextResponse.json(
      { error: 'Ein unerwarteter Fehler ist aufgetreten.' },
      { status: 500 }
    );
  }
} 