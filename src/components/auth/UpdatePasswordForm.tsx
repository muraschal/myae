'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export default function UpdatePasswordForm() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [step, setStep] = useState<'email' | 'password'>('email');
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

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setError('Bitte gib eine gültige E-Mail-Adresse ein.');
      return;
    }
    setError(null);
    setStep('password');
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
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
      
      // Sende eine direkte API-Anfrage an unseren eigenen Endpunkt
      const response = await fetch('/api/update-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          token: token,
          password: password,
          email: email
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
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center">Neues Passwort festlegen</h2>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
          <p>{error}</p>
        </div>
      )}
      
      {success ? (
        <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md">
          <p>Dein Passwort wurde erfolgreich aktualisiert!</p>
          <p className="mt-2">
            Du wirst in wenigen Sekunden zur Anmeldeseite weitergeleitet.
          </p>
          <p className="mt-2">
            <a href="/auth/login" className="text-blue-600 hover:underline">
              Direkt zur Anmeldung
            </a>
          </p>
        </div>
      ) : step === 'email' ? (
        <form onSubmit={handleEmailSubmit}>
          <div className="mb-6">
            <label htmlFor="email" className="block mb-2 text-sm font-medium">
              E-Mail-Adresse
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 border rounded-md"
              required
              placeholder="Deine E-Mail-Adresse"
            />
            <p className="text-xs text-gray-500 mt-1">
              Bitte gib die E-Mail-Adresse ein, mit der du dich registriert hast.
            </p>
          </div>
          
          <button
            type="submit"
            disabled={!token}
            className={`w-full p-2 text-white bg-blue-600 rounded-md ${
              !token ? 'opacity-70 cursor-not-allowed' : 'hover:bg-blue-700'
            }`}
          >
            Weiter
          </button>
        </form>
      ) : (
        <form onSubmit={handlePasswordSubmit}>
          <div className="mb-4">
            <label htmlFor="password" className="block mb-2 text-sm font-medium">
              Neues Passwort
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 border rounded-md"
              required
              minLength={8}
              placeholder="Mindestens 8 Zeichen"
            />
          </div>
          
          <div className="mb-6">
            <label htmlFor="confirmPassword" className="block mb-2 text-sm font-medium">
              Passwort bestätigen
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full p-2 border rounded-md"
              required
              minLength={8}
              placeholder="Passwort wiederholen"
            />
          </div>
          
          <button
            type="submit"
            disabled={loading || !token}
            className={`w-full p-2 text-white bg-blue-600 rounded-md ${
              loading || !token ? 'opacity-70 cursor-not-allowed' : 'hover:bg-blue-700'
            }`}
          >
            {loading ? 'Aktualisiere...' : 'Passwort aktualisieren'}
          </button>
        </form>
      )}
      
      <div className="mt-6 text-center">
        <p className="text-sm">
          <a href="/auth/login" className="text-blue-600 hover:underline">
            Zurück zur Anmeldung
          </a>
        </p>
      </div>
    </div>
  );
} 