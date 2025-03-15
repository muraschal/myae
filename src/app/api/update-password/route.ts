import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    // Extrahiere Token und Passwort aus dem Request-Body
    const { token, password, email } = await request.json();

    if (!password || password.length < 8) {
      return NextResponse.json(
        { error: 'Das Passwort muss mindestens 8 Zeichen lang sein.' },
        { status: 400 }
      );
    }

    console.log('Starte Passwort-Aktualisierung mit direktem Ansatz');

    // Erstelle einen neuen Supabase-Client für diese Anfrage
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        auth: {
          persistSession: false,
        }
      }
    );

    // Versuche, eine neue Sitzung zu erstellen und das Passwort zu aktualisieren
    try {
      // Wenn eine E-Mail angegeben wurde, versuche, eine Anmeldung mit Magic Link zu simulieren
      if (email) {
        console.log('Versuche Passwort-Aktualisierung mit E-Mail:', email);
        
        // Erstelle einen neuen Magic Link für die E-Mail
        const { error: signInError } = await supabase.auth.signInWithOtp({
          email,
          options: {
            shouldCreateUser: false,
          }
        });

        if (signInError) {
          console.error('Fehler beim Erstellen des Magic Links:', signInError);
          return NextResponse.json(
            { error: 'Benutzer konnte nicht gefunden werden.' },
            { status: 400 }
          );
        }

        // Warte kurz, um sicherzustellen, dass der Magic Link erstellt wurde
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      // Versuche, das Passwort direkt zurückzusetzen
      console.log('Versuche direktes Passwort-Reset mit Supabase API');
      
      // Erstelle eine neue Sitzung mit dem Token
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('Fehler beim Abrufen der Sitzung:', sessionError);
      } else if (sessionData?.session) {
        console.log('Sitzung gefunden, versuche Passwort zu aktualisieren');
        
        // Aktualisiere das Passwort mit der vorhandenen Sitzung
        const { error: updateError } = await supabase.auth.updateUser({
          password: password
        });
        
        if (updateError) {
          console.error('Fehler beim Aktualisieren des Passworts mit Sitzung:', updateError);
        } else {
          console.log('Passwort erfolgreich aktualisiert mit Sitzung');
          return NextResponse.json({ 
            success: true, 
            message: 'Passwort wurde erfolgreich aktualisiert.' 
          });
        }
      }
      
      // Wenn die obigen Methoden fehlschlagen, versuche einen letzten Ansatz mit dem Token
      console.log('Versuche Passwort-Reset mit Token als Hash');
      
      // Verwende den Token als Hash für die Verifizierung
      const { error: verifyError } = await supabase.auth.verifyOtp({
        type: 'recovery',
        token_hash: token,
      });
      
      if (verifyError) {
        console.error('Fehler bei der Token-Verifizierung:', verifyError);
        
        // Wenn alle Methoden fehlschlagen, gib einen Fehler zurück
        return NextResponse.json(
          { 
            error: 'Passwort konnte nicht aktualisiert werden. Bitte fordere einen neuen Link an.',
            details: 'Alle Methoden zur Passwort-Aktualisierung sind fehlgeschlagen.'
          },
          { status: 400 }
        );
      }
      
      // Wenn die Verifizierung erfolgreich war, aktualisiere das Passwort
      const { error: finalUpdateError } = await supabase.auth.updateUser({
        password: password
      });
      
      if (finalUpdateError) {
        console.error('Fehler beim finalen Aktualisieren des Passworts:', finalUpdateError);
        return NextResponse.json(
          { error: finalUpdateError.message },
          { status: 400 }
        );
      }
      
      console.log('Passwort erfolgreich aktualisiert mit Token als Hash');
      return NextResponse.json({ 
        success: true, 
        message: 'Passwort wurde erfolgreich aktualisiert.' 
      });
    } catch (error: any) {
      console.error('Fehler bei der Supabase-Anfrage:', error);
      
      // Wenn alle Methoden fehlschlagen, erstelle einen neuen Benutzer mit dem angegebenen Passwort
      // Dies ist ein letzter Ausweg und sollte nur in Ausnahmefällen verwendet werden
      if (email) {
        try {
          console.log('Versuche, einen neuen Benutzer zu erstellen als letzten Ausweg');
          
          // Erstelle einen neuen Benutzer mit der angegebenen E-Mail und dem Passwort
          const { error: signUpError } = await supabase.auth.signUp({
            email,
            password,
            options: {
              emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://myae.rapold.io'}/auth/login`
            }
          });
          
          if (signUpError) {
            console.error('Fehler beim Erstellen eines neuen Benutzers:', signUpError);
          } else {
            console.log('Neuer Benutzer erfolgreich erstellt');
            return NextResponse.json({ 
              success: true, 
              message: 'Ein neues Konto wurde erstellt. Bitte bestätige deine E-Mail-Adresse.' 
            });
          }
        } catch (signUpError) {
          console.error('Fehler beim Erstellen eines neuen Benutzers:', signUpError);
        }
      }
      
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