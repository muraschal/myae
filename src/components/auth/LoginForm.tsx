'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { signInWithEmail } from '@/lib/supabase';
import Cookies from 'js-cookie';

function LoginFormContent() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect') || '/dashboard';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Login-Versuch gestartet...');
    setLoading(true);
    setError(null);
    
    try {
      // Demo-Login zuerst prüfen (für Tests)
      if (email === 'demo@example.com' && password === 'password') {
        console.log('Demo-Login erkannt, starte Anmeldeprozess...');
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Setze Cookies statt localStorage
        Cookies.set('isLoggedIn', 'true', { expires: 7 }); // Cookie läuft nach 7 Tagen ab
        Cookies.set('userEmail', email, { expires: 7 });
        console.log('Login-Daten in Cookies gespeichert');
        
        window.location.href = redirectTo;
        return;
      }

      // Wenn keine Demo-Credentials, versuche Supabase-Login
      console.log('Versuche Supabase-Login...');
      const { data, error: signInError } = await signInWithEmail(email, password);
      
      if (signInError) {
        throw new Error(signInError.message);
      }
      
      if (data && data.user) {
        console.log('Supabase-Login erfolgreich');
        Cookies.set('isLoggedIn', 'true', { expires: 7 });
        Cookies.set('userEmail', data.user.email || '', { expires: 7 });
        window.location.href = redirectTo;
        return;
      }
      
      throw new Error('Bei der Anmeldung ist ein Fehler aufgetreten.');
    } catch (err: any) {
      console.error('Login-Fehler:', err);
      setError(err.message || 'Bei der Anmeldung ist ein Fehler aufgetreten.');
    } finally {
      setLoading(false);
    }
  };

  // Prüfe, ob der Benutzer bereits eingeloggt ist
  useEffect(() => {
    // Wenn wir auf der Login-Seite sind und einen redirect Parameter haben,
    // prüfen wir den Login-Status nicht
    if (searchParams.get('redirect')) {
      return;
    }

    const isLoggedIn = Cookies.get('isLoggedIn');
    console.log('Prüfe Login-Status:', isLoggedIn);
    if (isLoggedIn === 'true') {
      console.log('Bereits eingeloggt, leite zum Dashboard weiter');
      window.location.href = '/dashboard';
    }
  }, [searchParams]);

  return (
    <div className="glass-card">
      <div className="login-panel">
        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-md text-red-500">
            {error}
          </div>
        )}
        
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
              suppressHydrationWarning
            />
          </div>
          
          <div className="input-field">
            <label htmlFor="password" className="form-label">
              Passwort
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              suppressHydrationWarning
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="auth-button"
          >
            {loading ? 'Anmeldung läuft...' : 'ANMELDEN'}
          </button>
        </form>

        <div className="forgot-password">
          <Link href="/auth/reset-password" className="text-sm text-blue-400 hover:text-blue-300 transition-colors">
            Passwort vergessen?
          </Link>
        </div>
      </div>
      
      <div className="welcome-panel">
        <h1 className="welcome-title">myÆ</h1>
        <p className="welcome-subtitle">
          Dein persönliches Erinnerungssystem
        </p>
        <Link href="/auth/register">
          <button className="auth-button">
            REGISTRIEREN
          </button>
        </Link>
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

export default function LoginForm() {
  return (
    <Suspense fallback={<LoadingState />}>
      <LoginFormContent />
    </Suspense>
  );
} 