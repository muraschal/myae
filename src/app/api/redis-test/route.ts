import { NextRequest, NextResponse } from 'next/server'
import redis from '@/lib/redis'

export async function GET(request: NextRequest) {
  console.log('Redis-Test-API wurde aufgerufen');
  
  try {
    // Grundlegende Informationen sammeln
    const diagnosticInfo = {
      redisUrl: process.env.UPSTASH_REDIS_REST_URL,
      redisTokenPrefix: process.env.UPSTASH_REDIS_REST_TOKEN ? 
        process.env.UPSTASH_REDIS_REST_TOKEN.substring(0, 10) + '...' : 'nicht gesetzt',
      nodeVersion: process.version,
      timestamp: new Date().toISOString(),
    };
    
    console.log('Diagnostische Informationen:', diagnosticInfo);
    
    // Test 1: Ping
    console.log('Test 1: Redis Ping durchführen...');
    let pingResult;
    try {
      pingResult = await redis.ping();
      console.log('Ping-Ergebnis:', pingResult);
    } catch (pingError) {
      console.error('Ping-Test fehlgeschlagen:', pingError);
      return NextResponse.json({
        success: false,
        error: 'Ping-Test fehlgeschlagen',
        details: pingError instanceof Error ? pingError.message : String(pingError),
        diagnosticInfo
      }, { status: 500 });
    }
    
    // Test 2: Einfaches Set und Get
    console.log('Test 2: Set und Get durchführen...');
    const testKey = 'test:' + Date.now();
    const testValue = { message: 'Test erfolgreich', timestamp: Date.now() };
    
    try {
      // Set
      await redis.set(testKey, JSON.stringify(testValue));
      console.log('Set erfolgreich für Schlüssel:', testKey);
      
      // Get
      const retrievedData = await redis.get(testKey);
      console.log('Get erfolgreich für Schlüssel:', testKey, retrievedData);
      
      if (!retrievedData) {
        return NextResponse.json({
          success: false,
          error: 'Get-Operation lieferte keine Daten zurück',
          diagnosticInfo
        }, { status: 500 });
      }
      
      // Cleanup
      await redis.del(testKey);
      console.log('Testdaten gelöscht');
      
      return NextResponse.json({
        success: true,
        pingResult,
        testKey,
        testValue,
        retrievedData: typeof retrievedData === 'string' ? JSON.parse(retrievedData) : retrievedData,
        diagnosticInfo
      });
    } catch (testError) {
      console.error('Redis Set/Get Test fehlgeschlagen:', testError);
      return NextResponse.json({
        success: false,
        error: 'Redis Set/Get Test fehlgeschlagen',
        details: testError instanceof Error ? testError.message : String(testError),
        diagnosticInfo
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Allgemeiner Fehler im Redis-Test:', error);
    return NextResponse.json({
      success: false,
      error: 'Fehler beim Testen der Redis-Verbindung',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
} 