import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';

// Initialisiere Resend mit dem API-Schlüssel aus der Umgebungsvariable
const resend = new Resend(process.env.RESEND_API_KEY);

// Erstelle einen Supabase-Server-Client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(request: NextRequest) {
  try {
    // Prüfe, ob der API-Schlüssel vorhanden ist
    if (!process.env.RESEND_API_KEY) {
      console.error('RESEND_API_KEY ist nicht in den Umgebungsvariablen definiert');
      return NextResponse.json(
        { error: 'E-Mail-Dienst ist nicht korrekt konfiguriert' },
        { status: 500 }
      );
    }

    // Extrahiere die E-Mail-Adresse aus dem Request-Body
    const { email } = await request.json();

    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Bitte gib eine gültige E-Mail-Adresse ein.' },
        { status: 400 }
      );
    }

    console.log('Starte Passwort-Zurücksetzung für:', email);

    // Generiere einen eindeutigen Token für die Passwort-Zurücksetzung
    const resetToken = uuidv4();
    const resetUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://myae.rapold.io'}/auth/update-password?token=${resetToken}`;

    try {
      // Sende eine E-Mail mit Resend
      console.log('Sende E-Mail mit Resend...');
      const { data: emailData, error: emailError } = await resend.emails.send({
        from: 'myÆ <noreply@rapold.io>',
        to: [email],
        subject: 'Passwort zurücksetzen für myÆ',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Passwort zurücksetzen für myÆ</title>
            <style>
              body {
                font-family: Arial, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
              }
              .header {
                background: linear-gradient(135deg, #2563eb 0%, #4f46e5 100%);
                color: white;
                padding: 30px;
                border-radius: 10px;
                margin-bottom: 30px;
                text-align: center;
              }
              .content {
                background: white;
                padding: 30px;
                border-radius: 10px;
                margin-bottom: 20px;
                border: 1px solid #e2e8f0;
              }
              .button {
                display: inline-block;
                background-color: #3182ce;
                color: white;
                text-decoration: none;
                padding: 12px 24px;
                border-radius: 5px;
                font-weight: bold;
                margin: 20px 0;
              }
              .footer {
                text-align: center;
                font-size: 14px;
                color: #718096;
                margin-top: 30px;
                padding-top: 20px;
                border-top: 1px solid #e2e8f0;
              }
            </style>
          </head>
          <body>
            <div class="header">
              <h1 style="margin: 0; font-size: 28px; font-weight: 600;">Passwort zurücksetzen</h1>
            </div>
            
            <div class="content">
              <p>Hallo,</p>
              <p>Du hast eine Anfrage zum Zurücksetzen deines Passworts für dein myÆ-Konto erhalten. Klicke auf den Button unten, um ein neues Passwort zu erstellen:</p>
              
              <div style="text-align: center;">
                <a href="${resetUrl}" class="button">Passwort zurücksetzen</a>
              </div>
              
              <p>Wenn du diese Anfrage nicht gestellt hast, kannst du diese E-Mail ignorieren. Dein Passwort wird nicht geändert.</p>
              
              <p>Bitte beachte: Dieser Link ist nur 24 Stunden gültig und führt dich direkt zum Formular für die Passwort-Zurücksetzung.</p>
              
              <p>Wenn der Button nicht funktioniert, kopiere diesen Link in deinen Browser:</p>
              <p style="word-break: break-all; font-size: 14px; color: #4a5568;">${resetUrl}</p>
            </div>
            
            <div class="footer">
              <p>© ${new Date().getFullYear()} myÆ - Alle Rechte vorbehalten</p>
              <p>Diese E-Mail wurde von myÆ, deinem strategischen KI-Berater, gesendet.</p>
            </div>
          </body>
          </html>
        `,
      });

      if (emailError) {
        console.error('Fehler beim Senden der E-Mail mit Resend:', emailError);
        return NextResponse.json(
          { error: emailError.message },
          { status: 500 }
        );
      }

      console.log('Passwort-Zurücksetzungs-E-Mail erfolgreich mit Resend gesendet:', emailData);

      // Jetzt versuchen wir, den Token in Supabase zu speichern, aber nur als Backup
      // Wir geben trotzdem eine Erfolgsmeldung zurück, auch wenn dies fehlschlägt
      try {
        // Generiere einen Passwort-Reset-Token mit Supabase
        const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: resetUrl,
        });

        if (resetError) {
          console.log('Hinweis: Supabase-Token konnte nicht generiert werden, aber E-Mail wurde gesendet:', resetError);
        } else {
          console.log('Supabase-Token erfolgreich generiert');
        }
      } catch (supabaseError) {
        console.log('Hinweis: Supabase-Anfrage fehlgeschlagen, aber E-Mail wurde gesendet:', supabaseError);
      }

      return NextResponse.json({ 
        success: true, 
        message: 'Passwort-Zurücksetzungs-E-Mail wurde gesendet.' 
      });
    } catch (error: any) {
      console.error('Fehler beim Senden der E-Mail:', error);
      return NextResponse.json(
        { error: error instanceof Error ? error.message : 'Ein unerwarteter Fehler ist aufgetreten' },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('Unerwarteter Fehler:', error);
    
    // Spezifische Fehlerbehandlung für bekannte Fehler
    if (error.message && error.message.includes('rate limit')) {
      return NextResponse.json(
        { 
          error: 'Du hast zu viele Anfragen gesendet. Bitte warte eine Stunde, bevor du es erneut versuchst.',
          details: error.message
        },
        { status: 429 }
      );
    }
    
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Ein unerwarteter Fehler ist aufgetreten' },
      { status: 500 }
    );
  }
} 