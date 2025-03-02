import { Redis } from '@upstash/redis'

// Prüfen, ob die Umgebungsvariablen gesetzt sind
if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
  throw new Error('UPSTASH_REDIS_REST_URL und UPSTASH_REDIS_REST_TOKEN müssen in den Umgebungsvariablen gesetzt sein')
}

console.log('Redis Konfiguration:')
console.log('URL:', process.env.UPSTASH_REDIS_REST_URL)
console.log('Token (erste 10 Zeichen):', process.env.UPSTASH_REDIS_REST_TOKEN.substring(0, 10) + '...')

// Redis-Client erstellen
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
})

// Verbindung überprüfen (optional)
async function checkConnection() {
  try {
    await redis.ping();
    console.log('✅ Redis-Verbindung erfolgreich hergestellt')
    return true;
  } catch (error) {
    console.error('❌ Redis-Verbindungsfehler:', error)
    return false;
  }
}

// Diese Funktion ausführen, wenn wir im Server-Kontext sind
if (typeof window === 'undefined') {
  checkConnection().catch(console.error)
}

export default redis 