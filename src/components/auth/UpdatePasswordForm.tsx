'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import Link from 'next/link';

function UpdatePasswordFormContent() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const router = useRouter();
  const supabase = createClientComponentClient();

  useEffect(() => {
    // Token aus der URL holen
    const urlToken = searchParams.get('token');
    if (urlToken) {
      setToken(urlToken);
      console.log('Token aus URL gefunden:', urlToken);
    } else {
      setError('Kein gültiger Token gefunden. Bitte fordere einen neuen Link zum Zurücksetzen des Passworts an.');
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    if (password.length < 8) {
      setError('Das Passwort muss mindestens 8 Zeichen lang sein.');
      setLoading(false);
      return;
    }
    
    if (password !== confirmPassword) {
      setError('Die Passwörter stimmen nicht überein.');
      setLoading(false);
      return;
    }
    
    try {
      console.log('Aktualisiere Passwort mit Token');
      
      const response = await fetch('/api/update-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          token: token,
          password: password
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Fehler beim Aktualisieren des Passworts');
      }
      
      console.log('Passwort erfolgreich aktualisiert');
      setSuccess(true);
      
      // Nach 3 Sekunden zur Login-Seite weiterleiten
      setTimeout(() => {
        router.push('/auth/login');
      }, 3000);
    } catch (err: any) {
      console.error('Fehler beim Aktualisieren des Passworts:', err);
      setError(err.message || 'Beim Aktualisieren des Passworts ist ein Fehler aufgetreten. Bitte versuche es später erneut.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-card">
      <div className="login-panel">
        <h2 className="auth-title">Neues Passwort festlegen</h2>
        
        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-md text-red-500">
            {error}
          </div>
        )}
        
        {success ? (
          <div className="mb-4 p-3 bg-green-500/10 border border-green-500/30 rounded-md text-green-500">
            <p>Dein Passwort wurde erfolgreich aktualisiert!</p>
            <p className="mt-2">
              Du wirst in wenigen Sekunden zur Anmeldeseite weitergeleitet.
            </p>
            <p className="mt-2">
              <Link href="/auth/login" className="text-blue-400 hover:text-blue-300 transition-colors">
                Direkt zur Anmeldung
              </Link>
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="input-field">
              <label htmlFor="password" className="form-label">
                Neues Passwort
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                placeholder="Mindestens 8 Zeichen"
                suppressHydrationWarning
              />
            </div>
            
            <div className="input-field">
              <label htmlFor="confirmPassword" className="form-label">
                Passwort bestätigen
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={8}
                placeholder="Passwort wiederholen"
                suppressHydrationWarning
              />
            </div>
            
            <button
              type="submit"
              disabled={loading || !token}
              className="btn-primary w-full"
            >
              {loading ? 'Aktualisiere...' : 'Passwort aktualisieren'}
            </button>
          </form>
        )}
        
        <div className="mt-6 text-center">
          <Link href="/auth/login" className="text-sm text-blue-400 hover:text-blue-300 transition-colors">
            Zurück zur Anmeldung
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

export default function UpdatePasswordForm() {
  return (
    <Suspense fallback={<LoadingState />}>
      <UpdatePasswordFormContent />
    </Suspense>
  );
} 