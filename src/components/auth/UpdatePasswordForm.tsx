'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export default function UpdatePasswordForm() {
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
      
      // Versuche zuerst, das Passwort mit Supabase zu aktualisieren
      try {
        // Versuche, eine Sitzung mit dem Token zu erstellen
        const { error: signInError } = await supabase.auth.verifyOtp({
          token_hash: token || '',
          type: 'recovery',
        });
        
        if (signInError) {
          console.error('Fehler bei der Token-Verifizierung:', signInError);
          throw new Error('Token konnte nicht verifiziert werden. Bitte fordere einen neuen Link an.');
        }
        
        // Jetzt sollte eine Sitzung vorhanden sein, und wir können das Passwort aktualisieren
        const { error: updateError } = await supabase.auth.updateUser({
          password: password
        });
        
        if (updateError) {
          console.error('Fehler beim Aktualisieren des Passworts:', updateError);
          throw new Error(updateError.message);
        }
      } catch (supabaseError: any) {
        console.error('Supabase-Fehler:', supabaseError);
        
        // Fallback: Sende eine direkte API-Anfrage an unseren eigenen Endpunkt
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
      ) : (
        <form onSubmit={handleSubmit}>
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