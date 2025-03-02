import { NextRequest, NextResponse } from 'next/server'
import { MemoryFactory } from '@/lib/memory-factory'
import { Memory } from '@/lib/memory'

// Validiert die Anfrage
const validateRequest = (body: any): string | null => {
  if (!body.content) {
    return 'Content is required'
  }
  
  if (!body.type || !['interaction', 'mood', 'preference', 'note'].includes(body.type)) {
    return 'Valid type is required (interaction, mood, preference, note)'
  }
  
  return null
}

export async function POST(request: NextRequest) {
  console.log('Memory Store API wurde aufgerufen', request.url);
  
  try {
    // Parse the request body
    let body;
    try {
      body = await request.json();
      console.log('Request-Body erfolgreich geparsed:', JSON.stringify(body, null, 2));
    } catch (parseError) {
      console.error('Fehler beim Parsen des Request-Body:', parseError);
      return NextResponse.json(
        { error: 'Invalid JSON in request body', code: 'parse_error' },
        { status: 400 }
      );
    }
    
    // Validiere die Anfrage
    const validationError = validateRequest(body)
    if (validationError) {
      console.error('Validierungsfehler:', validationError);
      return NextResponse.json(
        { error: validationError, code: 'validation_error' },
        { status: 400 }
      )
    }
    
    const { content, type, userId, metadata, ttl } = body
    
    // Speichere die Erinnerung
    const memory = await MemoryFactory.storeMemory({
      content,
      type: type as Memory['type'],
      userId,
      metadata,
      ttl: typeof ttl === 'number' ? ttl : undefined,
    })
    
    // Rückgabe der gespeicherten Erinnerung
    return NextResponse.json({
      id: memory.id,
      success: true,
      memory
    })
  } catch (error: unknown) {
    console.error('Error storing memory:', error)
    
    // Detaillierte Fehlerinformationen für Debugging
    if (error instanceof Error) {
      console.error('Fehlermeldung:', error.message);
      console.error('Fehler-Stack:', error.stack);
    }
    
    // Fehlerbehandlung
    const errorMessage = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json(
      { error: errorMessage, code: 'internal_error' },
      { status: 500 }
    )
  }
} 