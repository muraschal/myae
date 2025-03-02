import { MemoryManager, Memory } from './memory';
import { MemoryManagerLocal } from './memory-local';

// Umgebungsvariable prüfen
const useRedis = process.env.USE_REDIS === 'true';

/**
 * Factory zum Auswählen des richtigen Memory-Managers
 */
export class MemoryFactory {
  static getManager() {
    // Im Entwicklungsmodus den lokalen Manager verwenden, wenn USE_REDIS nicht gesetzt ist
    if (!useRedis && process.env.APP_ENV === 'development') {
      console.log('Verwende lokalen Memory-Manager für die Entwicklung');
      return MemoryManagerLocal;
    }
    
    // Ansonsten den Redis-Manager verwenden
    console.log('Verwende Redis-Memory-Manager');
    return MemoryManager;
  }
  
  /**
   * Speichert eine neue Erinnerung
   */
  static async storeMemory(memory: Omit<Memory, 'id' | 'timestamp'>): Promise<Memory> {
    const manager = this.getManager();
    return manager.storeMemory(memory);
  }
  
  /**
   * Ruft eine Erinnerung anhand ihrer ID ab
   */
  static async getMemory(type: Memory['type'], id: string): Promise<Memory | null> {
    const manager = this.getManager();
    return manager.getMemory(type, id);
  }
  
  /**
   * Ruft die neuesten Erinnerungen eines bestimmten Typs ab
   */
  static async getRecentMemories(type: Memory['type'], limit = 10): Promise<Memory[]> {
    const manager = this.getManager();
    return manager.getRecentMemories(type, limit);
  }
  
  /**
   * Löscht eine Erinnerung anhand ihrer ID
   */
  static async deleteMemory(type: Memory['type'], id: string): Promise<boolean> {
    const manager = this.getManager();
    return manager.deleteMemory(type, id);
  }
  
  /**
   * Speichert die letzte Interaktion mit der AI
   */
  static async storeInteraction(content: string, userId?: string, ttl = 86400): Promise<Memory> {
    const manager = this.getManager();
    return manager.storeInteraction(content, userId, ttl);
  }
  
  /**
   * Ruft die letzten Interaktionen ab
   */
  static async getRecentInteractions(limit = 5): Promise<Memory[]> {
    const manager = this.getManager();
    return manager.getRecentInteractions(limit);
  }
  
  /**
   * Speichert eine Tagesstimmung
   */
  static async storeMood(content: string, userId?: string): Promise<Memory> {
    const manager = this.getManager();
    return manager.storeMood(content, userId);
  }
  
  /**
   * Ruft die letzten Stimmungen ab
   */
  static async getRecentMoods(limit = 7): Promise<Memory[]> {
    const manager = this.getManager();
    return manager.getRecentMoods(limit);
  }
} 