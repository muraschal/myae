import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error('NEXT_PUBLIC_SUPABASE_URL ist nicht definiert');
}

if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('SUPABASE_SERVICE_ROLE_KEY ist nicht definiert');
}

const serviceRoleSupabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const anonSupabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '' // Anon key für öffentliche Operationen
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

    // Methode 1: Aktualisierung mit Passwort-Reset-Token
    try {
      console.log('Versuche Passwort-Reset mit Supabase');
      
      // Wir verwenden den ungeschützten Client hier, da wir den Reset-Token haben
      const { data, error } = await anonSupabase.auth.resetPasswordForEmail(
        "reset@example.com", // Dummy-E-Mail, wird nicht verwendet
        {
          redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/update-password?token=${token}`
        }
      );

      if (error) {
        console.log('Fehler beim Reset-Versuch:', error.message);
      } else {
        console.log('Reset-Anfrage gesendet');
      }
    } catch (resetError) {
      console.error('Exception beim Reset-Versuch:', resetError);
      // Wir setzen fort, auch wenn dieser Versuch fehlschlägt
    }

    // Methode 2: Supabase Admin-API
    try {
      console.log('Versuche Admin-API für Passwortaktualisierung');
      
      // Die Supabase Admin-API fragen, um Benutzerinformationen aus dem Token zu bekommen
      const { data: tokenData, error: tokenError } = await serviceRoleSupabase.auth.admin.getUserById(
        token // Wir versuchen, ob der Token direkt als User-ID verwendbar ist
      );
      
      if (!tokenError && tokenData?.user) {
        // Wenn wir einen Benutzer gefunden haben, Passwort aktualisieren
        const { error: updateError } = await serviceRoleSupabase.auth.admin.updateUserById(
          tokenData.user.id,
          { password }
        );
        
        if (!updateError) {
          console.log('Passwort erfolgreich aktualisiert für Benutzer:', tokenData.user.id);
          return NextResponse.json(
            { message: 'Passwort erfolgreich aktualisiert' },
            { status: 200 }
          );
        } else {
          console.error('Fehler bei Admin-Passwortaktualisierung:', updateError.message);
        }
      } else {
        console.log('Token ist keine gültige Benutzer-ID:', tokenError?.message);
      }
    } catch (adminError) {
      console.error('Exception bei Admin-API:', adminError);
      // Wir setzen fort, auch wenn dieser Versuch fehlschlägt
    }

    // Methode 3: Letzte Chance mit direktem updateUser
    try {
      console.log('Letzte Chance: Direktes updateUser');
      const { data, error } = await anonSupabase.auth.updateUser(
        { password }
      );
      
      if (!error && data?.user) {
        console.log('Passwort über updateUser aktualisiert');
        return NextResponse.json(
          { message: 'Passwort erfolgreich aktualisiert' },
          { status: 200 }
        );
      } else {
        console.error('Fehler bei direktem updateUser:', error?.message);
        
        // Wenn wir hier ankommen, haben alle Versuche fehlgeschlagen
        return NextResponse.json(
          { 
            error: 'Fehler beim Aktualisieren des Passworts', 
            details: 'Bitte versuchen Sie, einen neuen Passwort-Reset-Link anzufordern'
          },
          { status: 500 }
        );
      }
    } catch (finalError: any) {
      console.error('Abschließender Fehler:', finalError?.message);
      return NextResponse.json(
        { 
          error: 'Fehler beim Aktualisieren des Passworts', 
          details: finalError?.message || 'Unbekannter Fehler'
        },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('Kritischer Fehler in Update-Password-Route:', error);
    return NextResponse.json(
      { 
        error: 'Interner Serverfehler', 
        details: error?.message || 'Kritischer Fehler im Server'
      },
      { status: 500 }
    );
  }
} 