import { NextRequest, NextResponse } from 'next/server'
import { MemoryFactory } from '@/lib/memory-factory'
import { Memory } from '@/lib/memory'

// Validiert die Anfrage
const validateRequest = (body: any): string | null => {
  console.log('Validiere Request-Body:', JSON.stringify(body, null, 2));
  
  if (!body || typeof body !== 'object') {
    return 'Invalid request body, must be a JSON object';
  }
  
  if (!body.type || !['interaction', 'mood', 'preference', 'note'].includes(body.type)) {
    return 'Valid type is required (interaction, mood, preference, note)';
  }
  
  return null;
}

export async function POST(request: NextRequest) {
  console.log('Memory retrieve API wurde aufgerufen', request.url);
  
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
    const validationError = validateRequest(body);
    if (validationError) {
      console.error('Validierungsfehler:', validationError);
      return NextResponse.json(
        { error: validationError, code: 'validation_error' },
        { status: 400 }
      );
    }
    
    const { type, id, limit = 10 } = body;
    console.log(`Hole Erinnerungen vom Typ: ${type}, ID: ${id || 'keine'}, Limit: ${limit}`);
    
    // Falls eine ID angegeben ist, rufe eine einzelne Erinnerung ab
    if (id) {
      console.log(`Rufe eine einzelne Erinnerung ab mit ID: ${id}`);
      try {
        const memory = await MemoryFactory.getMemory(type as Memory['type'], id);
        
        if (!memory) {
          console.log(`Keine Erinnerung mit ID ${id} gefunden`);
          return NextResponse.json(
            { error: 'Memory not found', code: 'not_found' },
            { status: 404 }
          );
        }
        
        console.log(`Erinnerung gefunden:`, JSON.stringify(memory, null, 2));
        return NextResponse.json({ memory });
      } catch (memoryError) {
        console.error(`Fehler beim Abrufen der Erinnerung mit ID ${id}:`, memoryError);
        throw memoryError;
      }
    }
    
    // Ansonsten rufe die neuesten Erinnerungen ab
    console.log(`Rufe die neuesten ${limit} Erinnerungen vom Typ ${type} ab`);
    try {
      const memories = await MemoryFactory.getRecentMemories(type as Memory['type'], limit);
      
      console.log(`${memories.length} Erinnerungen gefunden`);
      
      // Rückgabe der Erinnerungen
      return NextResponse.json({
        count: memories.length,
        results: memories
      });
    } catch (memoriesError) {
      console.error(`Fehler beim Abrufen der neuesten Erinnerungen vom Typ ${type}:`, memoriesError);
      throw memoriesError;
    }
  } catch (error: unknown) {
    console.error('Fehler beim Abrufen der Erinnerungen:', error);
    
    // Detaillierte Fehlerinformationen für Debugging
    if (error instanceof Error) {
      console.error('Fehlermeldung:', error.message);
      console.error('Fehler-Stack:', error.stack);
    }
    
    // Fehlerbehandlung
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json(
      { error: errorMessage, code: 'internal_error' },
      { status: 500 }
    );
  }
} 