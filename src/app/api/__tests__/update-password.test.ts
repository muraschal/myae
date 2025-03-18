import { POST } from '../update-password/route';
import { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Mock für Supabase
jest.mock('@supabase/supabase-js', () => {
  const mockUpdateUser = jest.fn();
  return {
    createClient: jest.fn(() => ({
      auth: {
        updateUser: mockUpdateUser
      }
    }))
  };
});

// Umgebungsvariablen setzen, die im Code benötigt werden
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-role-key';
process.env.NEXT_PUBLIC_SITE_URL = 'https://myae.vercel.app';

describe('Update Password API', () => {
  let supabaseClient: any;
  let mockUpdateUser: jest.Mock;
  
  beforeEach(() => {
    // Mocks zurücksetzen
    jest.clearAllMocks();
    
    // Zugriff auf den Mock-Client
    supabaseClient = (createClient as jest.Mock)();
    mockUpdateUser = supabaseClient.auth.updateUser as jest.Mock;
    
    // Standardmäßig erfolgreichen Response zurückgeben
    mockUpdateUser.mockResolvedValue({
      data: { user: { id: 'test-user-id' } },
      error: null
    });
  });
  
  it('sollte ungültige Anfragen ablehnen', async () => {
    // Anfrage ohne Token
    const reqWithoutToken = new NextRequest('http://localhost:3000/api/update-password', {
      method: 'POST',
      body: JSON.stringify({ password: 'newPassword123' }),
    });
    
    const resWithoutToken = await POST(reqWithoutToken);
    const dataWithoutToken = await resWithoutToken.json();
    
    expect(resWithoutToken.status).toBe(400);
    expect(dataWithoutToken.error).toBe('Passwort und Token sind erforderlich');
    
    // Anfrage ohne Passwort
    const reqWithoutPassword = new NextRequest('http://localhost:3000/api/update-password', {
      method: 'POST',
      body: JSON.stringify({ token: 'test-token' }),
    });
    
    const resWithoutPassword = await POST(reqWithoutPassword);
    const dataWithoutPassword = await resWithoutPassword.json();
    
    expect(resWithoutPassword.status).toBe(400);
    expect(dataWithoutPassword.error).toBe('Passwort und Token sind erforderlich');
    
    // Anfrage mit zu kurzem Passwort
    const reqWithShortPassword = new NextRequest('http://localhost:3000/api/update-password', {
      method: 'POST',
      body: JSON.stringify({ token: 'test-token', password: '1234' }),
    });
    
    const resWithShortPassword = await POST(reqWithShortPassword);
    const dataWithShortPassword = await resWithShortPassword.json();
    
    expect(resWithShortPassword.status).toBe(400);
    expect(dataWithShortPassword.error).toBe('Das Passwort muss mindestens 8 Zeichen lang sein');
  });
  
  it('sollte das Passwort erfolgreich aktualisieren', async () => {
    const req = new NextRequest('http://localhost:3000/api/update-password', {
      method: 'POST',
      body: JSON.stringify({ token: 'valid-token', password: 'newPassword123' }),
    });
    
    const res = await POST(req);
    const data = await res.json();
    
    expect(res.status).toBe(200);
    expect(data.message).toBe('Passwort erfolgreich aktualisiert');
    expect(mockUpdateUser).toHaveBeenCalledWith(
      { password: 'newPassword123' },
      { emailRedirectTo: 'https://myae.vercel.app' }
    );
  });
  
  it('sollte Fehler von Supabase zurückgeben', async () => {
    // Fehler bei der Aktualisierung simulieren
    mockUpdateUser.mockResolvedValueOnce({
      data: null,
      error: { message: 'Ungültiger oder abgelaufener Token' }
    });
    
    const req = new NextRequest('http://localhost:3000/api/update-password', {
      method: 'POST',
      body: JSON.stringify({ token: 'invalid-token', password: 'newPassword123' }),
    });
    
    const res = await POST(req);
    const data = await res.json();
    
    expect(res.status).toBe(500);
    expect(data.error).toBe('Fehler beim Aktualisieren des Passworts');
    expect(data.details).toBe('Ungültiger oder abgelaufener Token');
  });
  
  it('sollte unerwartete Fehler abfangen', async () => {
    // Exception simulieren
    mockUpdateUser.mockImplementationOnce(() => {
      throw new Error('Unerwarteter Server-Fehler');
    });
    
    const req = new NextRequest('http://localhost:3000/api/update-password', {
      method: 'POST',
      body: JSON.stringify({ token: 'valid-token', password: 'newPassword123' }),
    });
    
    const res = await POST(req);
    const data = await res.json();
    
    expect(res.status).toBe(500);
    expect(data.error).toBe('Interner Serverfehler');
    expect(data.details).toBe('Unerwarteter Server-Fehler');
  });
}); 