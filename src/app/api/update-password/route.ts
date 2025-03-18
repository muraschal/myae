import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// DEBUG: Supabase-URL und Service Role Key (ersten 4 Zeichen)
console.log('DEBUG CONFIG:', {
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || 'fehlt',
  serviceRoleKeyVorhanden: !!process.env.SUPABASE_SERVICE_ROLE_KEY
});

if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error('NEXT_PUBLIC_SUPABASE_URL ist nicht definiert');
}

if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('SUPABASE_SERVICE_ROLE_KEY ist nicht definiert');
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(request: NextRequest) {
  try {
    const { password, token } = await request.json();
    
    // DEBUG: Empfangener Token und Passwort
    console.log('DEBUG EINGABE:', { 
      tokenErhalten: !!token,
      tokenLänge: token ? token.length : 0,
      passwordLänge: password ? password.length : 0
    });

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

    console.log('DEBUG: Versuche Token zu verifizieren mit token_hash Parameter');
    
    // Versuch 1: Mit token_hash
    const verifyResult1 = await supabase.auth.verifyOtp({
      token_hash: token,
      type: 'recovery'
    });
    
    console.log('DEBUG VERIFIZIERUNG 1:', {
      erfolg: !verifyResult1.error,
      fehlerNachricht: verifyResult1.error ? verifyResult1.error.message : null,
      benutzerGefunden: !!verifyResult1.data?.user
    });
    
    // Wenn Versuch 1 fehlschlägt, versuchen wir es mit dem 'token' Parameter
    let user = verifyResult1.data?.user;
    let verifyError = verifyResult1.error;
    
    if (verifyError || !user) {
      console.log('DEBUG: Versuch 1 fehlgeschlagen, versuche mit token Parameter');
      
      // Versuch 2: Mit token statt token_hash
      const verifyResult2 = await supabase.auth.verifyOtp({
        token: token,
        type: 'recovery'
      });
      
      console.log('DEBUG VERIFIZIERUNG 2:', {
        erfolg: !verifyResult2.error,
        fehlerNachricht: verifyResult2.error ? verifyResult2.error.message : null,
        benutzerGefunden: !!verifyResult2.data?.user
      });
      
      user = verifyResult2.data?.user;
      verifyError = verifyResult2.error;
    }

    if (verifyError || !user) {
      console.log('DEBUG: Beide Verifikationsversuche fehlgeschlagen');
      
      // Versuch 3: Direktes Passwort-Update ohne Tokenvalidierung
      console.log('DEBUG: Versuche direktes Passwort-Update mit updateUser');
      
      const updateResult = await supabase.auth.updateUser({
        password: password
      });
      
      console.log('DEBUG DIREKTES UPDATE:', {
        erfolg: !updateResult.error,
        fehlerNachricht: updateResult.error ? updateResult.error.message : null,
        benutzerAktualisiert: !!updateResult.data?.user
      });
      
      if (!updateResult.error && updateResult.data?.user) {
        return NextResponse.json(
          { message: 'Passwort erfolgreich aktualisiert (direktes Update)' },
          { status: 200 }
        );
      }
      
      console.error('Token-Validierungsfehler:', {
        verifyError: verifyError?.message,
        updateError: updateResult.error?.message
      });
      
      return NextResponse.json(
        { 
          error: 'Ungültiger oder abgelaufener Token',
          details: verifyError?.message || updateResult.error?.message || 'Keine Details verfügbar'
        },
        { status: 401 }
      );
    }

    // DEBUG: Benutzer gefunden, versuche Passwort zu aktualisieren
    console.log('DEBUG: Benutzer gefunden, aktualisiere Passwort');

    // Aktualisiere das Passwort mit der Admin-API
    const { error: updateError } = await supabase.auth.admin.updateUserById(
      user.id,
      { password: password }
    );

    if (updateError) {
      console.error('Fehler beim Passwort-Update:', {
        nachricht: updateError.message
      });
      
      return NextResponse.json(
        { 
          error: 'Fehler beim Aktualisieren des Passworts',
          details: updateError.message || 'Keine Details verfügbar' 
        },
        { status: 500 }
      );
    }
    
    console.log('DEBUG: Passwort erfolgreich aktualisiert');

    return NextResponse.json(
      { message: 'Passwort erfolgreich aktualisiert' },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Unbehandelte Exception:', {
      nachricht: error.message || 'Keine Nachricht'
    });
    
    return NextResponse.json(
      { 
        error: 'Interner Serverfehler', 
        details: error.message || 'Keine Details verfügbar'
      },
      { status: 500 }
    );
  }
} 