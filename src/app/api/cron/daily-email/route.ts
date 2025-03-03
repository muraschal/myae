import { NextResponse } from 'next/server';
import redis from '@/lib/redis';
import { sendDailyEmail } from '@/lib/email';

export const runtime = 'edge';
export const preferredRegion = 'fra1';
export const maxDuration = 300;

interface UserPreferences {
  dailyFocus: string;
  interests: string[];
  updateFrequency: 'daily' | 'weekly' | 'rarely';
}

export async function GET(request: Request) {
  try {
    // Verifiziere den Authorization Header
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return new NextResponse('Nicht autorisiert', { status: 401 });
    }

    // Hole alle User-Keys aus Redis
    const keys = await redis.keys('user:*');
    console.log(`${keys.length} Benutzer gefunden`);

    const results = [];

    // Sende E-Mails an alle Benutzer
    for (const key of keys) {
      try {
        const rawPreferences = await redis.get(key);
        if (!rawPreferences) continue;

        const preferences = typeof rawPreferences === 'string' 
          ? JSON.parse(rawPreferences) 
          : rawPreferences as UserPreferences;

        // Überprüfe die Update-Häufigkeit
        if (preferences.updateFrequency !== 'daily') {
          console.log(`Überspringe Benutzer ${key}: Häufigkeit ist ${preferences.updateFrequency}`);
          continue;
        }

        // Extrahiere E-Mail aus dem Key (Format: user:email@domain.com)
        const userEmail = key.replace('user:', '');
        
        // Sende die E-Mail
        const result = await sendDailyEmail(userEmail, preferences);
        results.push({ email: userEmail, success: result.success });
        
        // Kleine Pause zwischen E-Mails
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(`Fehler beim Verarbeiten von ${key}:`, error);
        results.push({ key, error: 'Verarbeitungsfehler' });
      }
    }

    return NextResponse.json({
      success: true,
      processed: results.length,
      results
    });
  } catch (error) {
    console.error('Fehler beim Ausführen des Cron-Jobs:', error);
    return NextResponse.json(
      { error: 'Interner Serverfehler' },
      { status: 500 }
    );
  }
} 