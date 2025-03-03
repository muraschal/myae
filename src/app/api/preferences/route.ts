import { NextResponse } from 'next/server';
import redis from '@/lib/redis';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    const preferences = await request.json();
    const cookieStore = await cookies();
    const userEmail = cookieStore.get('userEmail')?.value;

    if (!userEmail) {
      return NextResponse.json(
        { error: 'Nicht authentifiziert' },
        { status: 401 }
      );
    }

    // Speichere die Präferenzen in Redis mit dem userEmail als Schlüssel
    const key = `user:${userEmail}`;
    // Speichere direkt das Objekt, Redis serialisiert es automatisch
    await redis.set(key, preferences);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Fehler beim Speichern der Präferenzen:', error);
    return NextResponse.json(
      { error: 'Interner Serverfehler' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const cookieStore = await cookies();
    const userEmail = cookieStore.get('userEmail')?.value;

    if (!userEmail) {
      return NextResponse.json(
        { error: 'Nicht authentifiziert' },
        { status: 401 }
      );
    }

    // Hole die Präferenzen aus Redis
    const key = `user:${userEmail}`;
    const preferences = await redis.get(key);
    
    if (!preferences) {
      return NextResponse.json({ preferences: null });
    }

    // Redis gibt das Objekt bereits deserialisiert zurück
    return NextResponse.json({ preferences });
  } catch (error) {
    console.error('Fehler beim Laden der Präferenzen:', error);
    return NextResponse.json(
      { error: 'Interner Serverfehler' },
      { status: 500 }
    );
  }
} 