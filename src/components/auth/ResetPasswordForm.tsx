'use client';

import { useState } from 'react';
import { resetPassword } from '@/lib/supabase';

export default function ResetPasswordForm() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [detailedError, setDetailedError] = useState<any>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setDetailedError(null);
    
    if (!email || !email.includes('@')) {
      setError('Bitte gib eine gültige E-Mail-Adresse ein.');
      setLoading(false);
      return;
    }
    
    try {
      console.log('Sende Passwort-Zurücksetzungsanfrage für:', email);
      
      // Direkter API-Aufruf an Supabase
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      const redirectTo = `${window.location.origin}/auth/login?reset=true`;
      
      console.log('Verwende direkte API-Anfrage mit:', {
        supabaseUrl,
        redirectTo
      });
      
      // Direkte Fetch-Anfrage an die Supabase API
      const response = await fetch(`${supabaseUrl}/auth/v1/recover`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseKey!,
          'Authorization': `Bearer ${supabaseKey}`,
        },
        body: JSON.stringify({
          email,
          redirect_to: redirectTo,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Fehler bei der API-Anfrage:', response.status, errorData);
        setDetailedError({
          status: response.status,
          statusText: response.statusText,
          data: errorData
        });
        throw new Error(`API-Fehler: ${response.status} ${response.statusText}`);
      }
      
      console.log('Passwort-Zurücksetzungsanfrage erfolgreich gesendet');
      setSuccess(true);
    } catch (err: any) {
      console.error('Fehler beim Zurücksetzen des Passworts:', err);
      setError(err.message || 'Beim Zurücksetzen des Passworts ist ein Fehler aufgetreten. Bitte versuche es später erneut.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center">Passwort zurücksetzen</h2>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
          <p>{error}</p>
          {detailedError && (
            <details className="mt-2 text-xs">
              <summary>Technische Details</summary>
              <pre className="mt-1 p-2 bg-gray-100 rounded overflow-auto">
                {JSON.stringify(detailedError, null, 2)}
              </pre>
            </details>
          )}
        </div>
      )}
      
      {success ? (
        <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md">
          <p>Eine E-Mail zum Zurücksetzen des Passworts wurde gesendet! Bitte überprüfe deinen Posteingang und auch den Spam-Ordner.</p>
          <p className="mt-2">
            <a href="/auth/login" className="text-blue-600 hover:underline">
              Zurück zur Anmeldung
            </a>
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label htmlFor="email" className="block mb-2 text-sm font-medium">
              E-Mail
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 border rounded-md"
              required
              placeholder="deine@email.com"
            />
            <p className="text-xs text-gray-500 mt-1">
              Gib die E-Mail-Adresse ein, mit der du dich registriert hast.
            </p>
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className={`w-full p-2 text-white bg-blue-600 rounded-md ${
              loading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-blue-700'
            }`}
          >
            {loading ? 'Sende Link...' : 'Passwort zurücksetzen'}
          </button>
        </form>
      )}
      
      <div className="mt-6 text-center">
        <p className="text-sm">
          <a href="/auth/login" className="text-blue-600 hover:underline">
            Zurück zur Anmeldung
          </a>
          {' | '}
          <button 
            onClick={() => window.location.href = '/auth/signup'} 
            className="text-blue-600 hover:underline"
          >
            Neues Konto erstellen
          </button>
        </p>
      </div>
    </div>
  );
} 