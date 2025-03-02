// Typen für Memories
export type Memory = {
  id: string
  userId?: string
  content: string
  type: 'interaction' | 'mood' | 'preference' | 'note'
  timestamp: number
  metadata?: Record<string, any>
  ttl?: number // Time-to-live in Sekunden
}

// In-Memory-Speicher für Entwicklungszwecke
const localMemoryStore: Record<string, Record<string, string>> = {
  'memory:interaction': {},
  'memory:mood': {},
  'memory:preference': {},
  'memory:note': {},
};

// Präfixe für verschiedene Speichertypen
const KEY_PREFIXES = {
  interaction: 'memory:interaction',
  mood: 'memory:mood',
  preference: 'memory:preference',
  note: 'memory:note',
}

/**
 * Lokaler Memory-Manager für Entwicklung ohne Redis
 */
export class MemoryManagerLocal {
  /**
   * Speichert eine neue Erinnerung im lokalen Speicher
   */
  static async storeMemory(memory: Omit<Memory, 'id' | 'timestamp'>): Promise<Memory> {
    try {
      const id = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`
      const timestamp = Date.now()
      
      const newMemory: Memory = {
        id,
        timestamp,
        ...memory,
      }
      
      const prefix = KEY_PREFIXES[memory.type];
      const key = `${id}`
      console.log(`[LOCAL] Speichere Erinnerung mit Schlüssel: ${prefix}:${key}`, JSON.stringify(newMemory, null, 2))
      
      // In lokalen Speicher schreiben
      localMemoryStore[prefix][key] = JSON.stringify(newMemory);
      
      // Ggf. TTL simulieren (in echter Implementierung würde hier ein Timeout gesetzt)
      
      console.log(`[LOCAL] Erinnerung erfolgreich gespeichert: ${prefix}:${key}`)
      return newMemory
    } catch (error) {
      console.error('[LOCAL] Fehler beim Speichern der Erinnerung:', error)
      throw new Error(`[LOCAL] Fehler beim Speichern der Erinnerung: ${error instanceof Error ? error.message : String(error)}`)
    }
  }
  
  /**
   * Ruft eine Erinnerung anhand ihrer ID ab
   */
  static async getMemory(type: Memory['type'], id: string): Promise<Memory | null> {
    try {
      const prefix = KEY_PREFIXES[type];
      const key = id;
      console.log(`[LOCAL] Rufe Erinnerung ab mit Schlüssel: ${prefix}:${key}`)
      
      const data = localMemoryStore[prefix][key];
      
      if (!data) {
        console.log(`[LOCAL] Keine Daten gefunden für Schlüssel: ${prefix}:${key}`)
        return null
      }
      
      console.log(`[LOCAL] Daten erfolgreich abgerufen für Schlüssel: ${prefix}:${key}`)
      return JSON.parse(data) as Memory
    } catch (error) {
      console.error(`[LOCAL] Fehler beim Abrufen der Erinnerung (Typ: ${type}, ID: ${id}):`, error)
      throw new Error(`[LOCAL] Fehler beim Abrufen der Erinnerung: ${error instanceof Error ? error.message : String(error)}`)
    }
  }
  
  /**
   * Ruft die neuesten Erinnerungen eines bestimmten Typs ab
   * @param limit Maximale Anzahl der abzurufenden Erinnerungen
   */
  static async getRecentMemories(type: Memory['type'], limit = 10): Promise<Memory[]> {
    try {
      const prefix = KEY_PREFIXES[type];
      console.log(`[LOCAL] Suche Erinnerungen mit Präfix: ${prefix}`)
      
      const keys = Object.keys(localMemoryStore[prefix]);
      console.log(`[LOCAL] ${keys.length} Schlüssel gefunden für Präfix: ${prefix}`)
      
      if (keys.length === 0) return []
      
      // Die neuesten Keys abholen (basierend auf Zeitstempel im Key-Namen)
      const sortedKeys = keys
        .sort((a, b) => {
          // Sortieren nach Zeitstempel (absteigend)
          const aTime = Number(a.split('-')[0] || 0);
          const bTime = Number(b.split('-')[0] || 0);
          return bTime - aTime;
        })
        .slice(0, limit);
      
      console.log(`[LOCAL] ${sortedKeys.length} Schlüssel ausgewählt für Abruf:`, sortedKeys)
      
      if (sortedKeys.length === 0) return []
      
      const memories: Memory[] = [];
      
      // Daten für alle Keys abrufen
      for (const key of sortedKeys) {
        const data = localMemoryStore[prefix][key];
        if (data) {
          try {
            const memory = JSON.parse(data) as Memory;
            memories.push(memory);
          } catch (parseError) {
            console.error(`[LOCAL] Fehler beim Parsen der Daten für Schlüssel ${key}:`, parseError);
          }
        }
      }
      
      console.log(`[LOCAL] ${memories.length} Erinnerungen erfolgreich abgerufen`);
      return memories;
    } catch (error) {
      console.error(`[LOCAL] Fehler beim Abrufen der neuesten Erinnerungen (Typ: ${type}):`, error)
      throw new Error(`[LOCAL] Fehler beim Abrufen der neuesten Erinnerungen: ${error instanceof Error ? error.message : String(error)}`)
    }
  }
  
  /**
   * Löscht eine Erinnerung anhand ihrer ID
   */
  static async deleteMemory(type: Memory['type'], id: string): Promise<boolean> {
    try {
      const prefix = KEY_PREFIXES[type];
      const key = id;
      console.log(`[LOCAL] Lösche Erinnerung mit Schlüssel: ${prefix}:${key}`)
      
      const exists = !!localMemoryStore[prefix][key];
      
      if (exists) {
        delete localMemoryStore[prefix][key];
        console.log(`[LOCAL] Erinnerung erfolgreich gelöscht: ${prefix}:${key}`);
        return true;
      } else {
        console.log(`[LOCAL] Erinnerung nicht gefunden: ${prefix}:${key}`);
        return false;
      }
    } catch (error) {
      console.error(`[LOCAL] Fehler beim Löschen der Erinnerung (Typ: ${type}, ID: ${id}):`, error)
      throw new Error(`[LOCAL] Fehler beim Löschen der Erinnerung: ${error instanceof Error ? error.message : String(error)}`)
    }
  }
  
  /**
   * Speichert die letzte Interaktion mit der AI
   */
  static async storeInteraction(content: string, userId?: string): Promise<Memory> {
    return this.storeMemory({
      type: 'interaction',
      content,
      userId,
      ttl: 86400, // Standardmäßig 24 Stunden TTL
    })
  }
  
  /**
   * Ruft die letzten Interaktionen ab
   */
  static async getRecentInteractions(limit = 5): Promise<Memory[]> {
    return this.getRecentMemories('interaction', limit)
  }
  
  /**
   * Speichert eine Tagesstimmung
   */
  static async storeMood(content: string, userId?: string): Promise<Memory> {
    return this.storeMemory({
      type: 'mood',
      content,
      userId,
      ttl: 86400 * 7, // 7 Tage TTL
    })
  }
  
  /**
   * Ruft die letzten Stimmungen ab
   */
  static async getRecentMoods(limit = 7): Promise<Memory[]> {
    return this.getRecentMemories('mood', limit)
  }
} 