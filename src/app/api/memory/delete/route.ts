import { NextRequest, NextResponse } from 'next/server'
import { MemoryFactory } from '@/lib/memory-factory'
import { Memory } from '@/lib/memory'

// Validiert die Anfrage
const validateRequest = (body: any): string | null => {
  console.log('Validiere Delete-Request-Body:', JSON.stringify(body, null, 2));
  
  if (!body || typeof body !== 'object') {
    return 'Invalid request body, must be a JSON object';
  }
  
  if (!body.id) {
    return 'Memory ID is required'
  }
  
  if (!body.type || !['interaction', 'mood', 'preference', 'note'].includes(body.type)) {
    return 'Valid type is required (interaction, mood, preference, note)'
  }
  
  return null
}

export async function DELETE(request: NextRequest) {
  console.log('Memory Delete API wurde aufgerufen', request.url);
  
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
    
    const { id, type } = body
    
    // Überprüfe, ob die Erinnerung existiert
    const memory = await MemoryFactory.getMemory(type as Memory['type'], id)
    
    if (!memory) {
      return NextResponse.json(
        { error: 'Memory not found', code: 'not_found' },
        { status: 404 }
      )
    }
    
    // Lösche die Erinnerung
    const success = await MemoryFactory.deleteMemory(type as Memory['type'], id)
    
    if (!success) {
      return NextResponse.json(
        { error: 'Failed to delete memory', code: 'delete_failed' },
        { status: 500 }
      )
    }
    
    // Rückgabe des Erfolgs
    return NextResponse.json({
      success: true,
      message: 'Memory deleted successfully',
      id
    })
  } catch (error: unknown) {
    console.error('Error deleting memory:', error)
    
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