'use client';

import { useState } from 'react';

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
      
      // Verwende unsere neue API-Route
      const response = await fetch('/api/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });
      
      const data = await response.json();
      console.log('API-Antwort:', response.status, data);
      
      if (!response.ok) {
        setDetailedError({
          status: response.status,
          statusText: response.statusText,
          data: data
        });
        throw new Error(data.error || `API-Fehler: ${response.status}`);
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
            <details className="mt-2 text-xs" open>
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