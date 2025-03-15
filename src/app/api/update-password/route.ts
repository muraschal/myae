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

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Das Passwort muss mindestens 6 Zeichen lang sein' },
        { status: 400 }
      );
    }

    const { data: userData, error: userError } = await supabase.auth.admin.getUserById(token);

    if (userError || !userData?.user) {
      return NextResponse.json(
        { error: 'Ungültiger oder abgelaufener Token' },
        { status: 401 }
      );
    }

    const { error: updateError } = await supabase.auth.admin.updateUserById(
      userData.user.id,
      { password: password }
    );

    if (updateError) {
      return NextResponse.json(
        { error: 'Fehler beim Aktualisieren des Passworts' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: 'Passwort erfolgreich aktualisiert' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Fehler beim Passwort-Update:', error);
    return NextResponse.json(
      { error: 'Interner Serverfehler' },
      { status: 500 }
    );
  }
} 