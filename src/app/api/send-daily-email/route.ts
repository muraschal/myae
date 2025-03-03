import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import redis from '@/lib/redis';
import { sendDailyEmail } from '@/lib/email';

interface UserPreferences {
  dailyFocus: string;
  interests: string[];
  updateFrequency: 'daily' | 'weekly' | 'rarely';
}

export async function POST() {
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
    const rawPreferences = await redis.get(key);

    if (!rawPreferences) {
      return NextResponse.json(
        { error: 'Keine Präferenzen gefunden' },
        { status: 404 }
      );
    }

    // Stelle sicher, dass die Präferenzen das richtige Format haben
    const preferences = typeof rawPreferences === 'string' 
      ? JSON.parse(rawPreferences) 
      : rawPreferences as UserPreferences;

    // Validiere die Präferenzen
    if (!preferences.dailyFocus || !preferences.interests || !preferences.updateFrequency) {
      console.error('Ungültige Präferenzen:', preferences);
      return NextResponse.json(
        { error: 'Ungültiges Präferenzformat' },
        { status: 400 }
      );
    }

    // Sende die E-Mail
    const result = await sendDailyEmail(userEmail, preferences);

    if (!result.success) {
      console.error('E-Mail-Versand fehlgeschlagen:', result.error);
      return NextResponse.json(
        { error: 'Fehler beim Senden der E-Mail' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Fehler beim Verarbeiten der Anfrage:', error);
    return NextResponse.json(
      { error: 'Interner Serverfehler' },
      { status: 500 }
    );
  }
} 