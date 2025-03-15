'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';

function ResetPasswordFormContent() {
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
    <div className="glass-card">
      <div className="login-panel">
        <h2 className="auth-title">Passwort zurücksetzen</h2>
        
        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-md text-red-500">
            <p>{error}</p>
            {detailedError && (
              <details className="mt-2 text-xs" open>
                <summary>Technische Details</summary>
                <pre className="mt-1 p-2 bg-gray-800/50 rounded overflow-auto">
                  {JSON.stringify(detailedError, null, 2)}
                </pre>
              </details>
            )}
          </div>
        )}
        
        {success ? (
          <div className="mb-4 p-3 bg-green-500/10 border border-green-500/30 rounded-md text-green-500">
            <p>Eine E-Mail zum Zurücksetzen des Passworts wurde gesendet! Bitte überprüfe deinen Posteingang und auch den Spam-Ordner.</p>
            <p className="mt-2">
              <Link href="/auth/login" className="text-blue-400 hover:text-blue-300 transition-colors">
                Zurück zur Anmeldung
              </Link>
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="input-field">
              <label htmlFor="email" className="form-label">
                E-Mail
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="deine@email.com"
                suppressHydrationWarning
              />
              <p className="text-xs text-gray-400 mt-1">
                Gib die E-Mail-Adresse ein, mit der du dich registriert hast.
              </p>
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="auth-button"
            >
              {loading ? 'Sende Link...' : 'Passwort zurücksetzen'}
            </button>
          </form>
        )}
        
        <div className="mt-6 text-center">
          <Link href="/auth/login" className="text-sm text-blue-400 hover:text-blue-300 transition-colors">
            Zurück zur Anmeldung
          </Link>
          {' | '}
          <Link href="/auth/register" className="text-sm text-blue-400 hover:text-blue-300 transition-colors">
            Neues Konto erstellen
          </Link>
        </div>
      </div>
      
      <div className="welcome-panel">
        <h1 className="welcome-title">myÆ</h1>
        <p className="welcome-subtitle">
          Dein persönliches Erinnerungssystem
        </p>
      </div>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="glass-card">
      <div className="login-panel flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-400 mb-4"></div>
          <p className="text-gray-400">Lade...</p>
        </div>
      </div>
      <div className="welcome-panel opacity-50">
        <h1 className="welcome-title">myÆ</h1>
        <p className="welcome-subtitle">
          Dein persönliches Erinnerungssystem
        </p>
      </div>
    </div>
  );
}

export default function ResetPasswordForm() {
  return (
    <Suspense fallback={<LoadingState />}>
      <ResetPasswordFormContent />
    </Suspense>
  );
} 