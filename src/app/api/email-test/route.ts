import { NextRequest, NextResponse } from 'next/server';
import { sendResponseEmail } from '@/lib/email';

export async function GET(request: NextRequest) {
  try {
    const result = await sendResponseEmail(
      'Dies ist eine Test-Anfrage',
      'Dies ist eine Test-Antwort vom KI-Assistenten. Der E-Mail-Versand funktioniert!'
    );

    return NextResponse.json({
      success: true,
      message: 'Test-E-Mail gesendet',
      result,
    });
  } catch (error) {
    console.error('Fehler beim Testen des E-Mail-Versands:', error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Fehler beim Testen des E-Mail-Versands', 
        code: 'email_test_error' 
      },
      { status: 500 }
    );
  }
} 