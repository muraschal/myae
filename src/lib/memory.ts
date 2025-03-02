import redis from './redis'

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

// Präfixe für verschiedene Speichertypen
const KEY_PREFIXES = {
  interaction: 'memory:interaction',
  mood: 'memory:mood',
  preference: 'memory:preference',
  note: 'memory:note',
}

/**
 * Memory-Manager für kurzfristige Speicherung mit Redis
 */
export class MemoryManager {
  /**
   * Speichert eine neue Erinnerung in Redis
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
      
      const key = `${KEY_PREFIXES[memory.type]}:${id}`
      console.log(`Speichere Erinnerung mit Schlüssel: ${key}`, JSON.stringify(newMemory, null, 2))
      
      // In Redis speichern
      await redis.set(key, JSON.stringify(newMemory))
      
      // TTL setzen, falls angegeben
      if (memory.ttl && memory.ttl > 0) {
        await redis.expire(key, memory.ttl)
      }
      
      console.log(`Erinnerung erfolgreich gespeichert: ${key}`)
      return newMemory
    } catch (error) {
      console.error('Fehler beim Speichern der Erinnerung:', error)
      throw new Error(`Fehler beim Speichern der Erinnerung: ${error instanceof Error ? error.message : String(error)}`)
    }
  }
  
  /**
   * Ruft eine Erinnerung anhand ihrer ID ab
   */
  static async getMemory(type: Memory['type'], id: string): Promise<Memory | null> {
    try {
      const key = `${KEY_PREFIXES[type]}:${id}`
      console.log(`Rufe Erinnerung ab mit Schlüssel: ${key}`)
      
      const data = await redis.get(key)
      
      if (!data) {
        console.log(`Keine Daten gefunden für Schlüssel: ${key}`)
        return null
      }
      
      console.log(`Daten erfolgreich abgerufen für Schlüssel: ${key}`)
      return JSON.parse(data as string) as Memory
    } catch (error) {
      console.error(`Fehler beim Abrufen der Erinnerung (Typ: ${type}, ID: ${id}):`, error)
      throw new Error(`Fehler beim Abrufen der Erinnerung: ${error instanceof Error ? error.message : String(error)}`)
    }
  }
  
  /**
   * Ruft die neuesten Erinnerungen eines bestimmten Typs ab
   * @param limit Maximale Anzahl der abzurufenden Erinnerungen
   */
  static async getRecentMemories(type: Memory['type'], limit = 10): Promise<Memory[]> {
    try {
      const pattern = `${KEY_PREFIXES[type]}:*`
      console.log(`Suche Erinnerungen mit Pattern: ${pattern}`)
      
      const keys = await redis.keys(pattern)
      console.log(`${keys.length} Schlüssel gefunden für Pattern: ${pattern}`)
      
      if (keys.length === 0) return []
      
      // Die neuesten Keys abholen (basierend auf Zeitstempel im Key-Namen)
      const sortedKeys = keys
        .sort()
        .reverse()
        .slice(0, limit)
      
      console.log(`${sortedKeys.length} Schlüssel ausgewählt für Abruf:`, sortedKeys)
      
      // Daten für alle Keys abrufen
      if (sortedKeys.length === 0) return []
      
      // Multi-Get verwenden statt Pipeline
      try {
        const memories: Memory[] = []
        
        // Einzeln abrufen statt Pipeline verwenden
        for (const key of sortedKeys) {
          try {
            const data = await redis.get(key)
            if (data) {
              const memory = JSON.parse(data as string) as Memory
              memories.push(memory)
            }
          } catch (getError) {
            console.error(`Fehler beim Abrufen des Schlüssels ${key}:`, getError)
            // Einzelne Fehler überspringen, aber weitermachen
          }
        }
        
        console.log(`${memories.length} Erinnerungen erfolgreich abgerufen`)
        return memories
      } catch (multiError) {
        console.error('Fehler beim Multi-Get der Erinnerungen:', multiError)
        throw multiError
      }
    } catch (error) {
      console.error(`Fehler beim Abrufen der neuesten Erinnerungen (Typ: ${type}):`, error)
      throw new Error(`Fehler beim Abrufen der neuesten Erinnerungen: ${error instanceof Error ? error.message : String(error)}`)
    }
  }
  
  /**
   * Löscht eine Erinnerung anhand ihrer ID
   */
  static async deleteMemory(type: Memory['type'], id: string): Promise<boolean> {
    try {
      const key = `${KEY_PREFIXES[type]}:${id}`
      console.log(`Lösche Erinnerung mit Schlüssel: ${key}`)
      
      const result = await redis.del(key)
      console.log(`Löschergebnis für Schlüssel ${key}:`, result)
      
      return result === 1
    } catch (error) {
      console.error(`Fehler beim Löschen der Erinnerung (Typ: ${type}, ID: ${id}):`, error)
      throw new Error(`Fehler beim Löschen der Erinnerung: ${error instanceof Error ? error.message : String(error)}`)
    }
  }
  
  /**
   * Speichert die letzte Interaktion mit der AI
   */
  static async storeInteraction(content: string, userId?: string, ttl = 86400): Promise<Memory> {
    return this.storeMemory({
      type: 'interaction',
      content,
      userId,
      ttl, // Standardmäßig 24 Stunden TTL
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