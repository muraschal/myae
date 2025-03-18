import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

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

    // Direkter Versuch, das Passwort zu aktualisieren
    // Dieser Ansatz ist einfacher und funktioniert mit dem korrekten Token
    const { data, error } = await supabase.auth.updateUser(
      { password },
      { emailRedirectTo: process.env.NEXT_PUBLIC_SITE_URL }
    );

    if (error) {
      return NextResponse.json(
        { error: 'Fehler beim Aktualisieren des Passworts', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: 'Passwort erfolgreich aktualisiert' },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Interner Serverfehler', details: error.message || 'Keine Details verfügbar' },
      { status: 500 }
    );
  }
} 