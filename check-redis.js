require('dotenv').config({ path: '.env.local' });
const { Redis } = require('@upstash/redis');

// Initialisiere Redis-Client mit den Umgebungsvariablen
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

async function checkUser() {
  console.log('Überprüfe Redis-Verbindung...');
  console.log('Redis URL:', process.env.UPSTASH_REDIS_REST_URL);
  console.log('Redis Token (erste 10 Zeichen):', process.env.UPSTASH_REDIS_REST_TOKEN.substring(0, 10) + '...');
  
  try {
    // Teste die Verbindung
    const ping = await redis.ping();
    console.log('Redis-Verbindung:', ping === 'PONG' ? 'Erfolgreich' : 'Fehlgeschlagen');
    
    // Hole alle Schlüssel
    const keys = await redis.keys('*');
    console.log(`Gefundene Schlüssel: ${keys.length}`);
    
    // Suche nach Schlüsseln, die mit dem Benutzer zusammenhängen könnten
    const userKeys = keys.filter(key => 
      key.includes('marcel@marcelrapold.com') || 
      key.includes('user:') || 
      key.includes('auth:') ||
      key.includes('memory:')
    );
    
    console.log('Mögliche benutzerbezogene Schlüssel:');
    if (userKeys.length === 0) {
      console.log('Keine benutzerbezogenen Schlüssel gefunden.');
    } else {
      for (const key of userKeys) {
        const value = await redis.get(key);
        console.log(`Schlüssel: ${key}`);
        console.log(`Wert: ${typeof value === 'object' ? JSON.stringify(value, null, 2) : value}`);
        console.log('---');
      }
    }
    
    // Suche speziell nach Gedächtniseinträgen
    const memoryKeys = keys.filter(key => key.startsWith('memory:'));
    console.log(`\nGedächtniseinträge: ${memoryKeys.length}`);
    
    if (memoryKeys.length > 0) {
      console.log('Stichprobe von Gedächtniseinträgen:');
      // Zeige nur die ersten 5 Einträge an
      for (const key of memoryKeys.slice(0, 5)) {
        const value = await redis.get(key);
        console.log(`Schlüssel: ${key}`);
        try {
          const parsedValue = typeof value === 'string' ? JSON.parse(value) : value;
          // Prüfe, ob der Eintrag mit dem Benutzer zusammenhängt
          if (parsedValue && 
              (parsedValue.userId === 'marcel@marcelrapold.com' || 
               parsedValue.email === 'marcel@marcelrapold.com' ||
               JSON.stringify(parsedValue).includes('marcel@marcelrapold.com'))) {
            console.log('Gefundener Eintrag für marcel@marcelrapold.com:');
            console.log(JSON.stringify(parsedValue, null, 2));
          }
        } catch (e) {
          console.log(`Wert (nicht parsebar): ${value}`);
        }
        console.log('---');
      }
    }
    
  } catch (error) {
    console.error('Fehler bei der Redis-Abfrage:', error);
  }
}

checkUser(); 