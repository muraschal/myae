'use client';

import { useState } from 'react';
import Link from 'next/link';
import { signUpWithEmail } from '@/lib/supabase';

export default function RegisterForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    if (password !== confirmPassword) {
      setError('Die Passwörter stimmen nicht überein.');
      setLoading(false);
      return;
    }
    
    try {
      // Supabase-Registrierung verwenden
      const { data, error: signUpError } = await signUpWithEmail(email, password);
      
      if (signUpError) {
        throw new Error(signUpError.message);
      }
      
      // Erfolgreiche Registrierung
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Bei der Registrierung ist ein Fehler aufgetreten.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-card">
      <div className="welcome-panel">
        <h2 className="welcome-title">Willkommen</h2>
        <p className="welcome-text">
          Du hast bereits ein Konto? Melde dich an, um fortzufahren
        </p>
        <Link href="/auth/login">
          <button className="auth-button">
            ANMELDEN
          </button>
        </Link>
      </div>
      
      <div className="login-panel">
        <h2 className="auth-title">Konto erstellen</h2>
        
        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-md text-red-500">
            {error}
          </div>
        )}
        
        {success ? (
          <div className="mb-4 p-3 bg-green-500/10 border border-green-500/30 rounded-md text-green-500">
            <p className="mb-2">Registrierung erfolgreich! Bitte überprüfe deine E-Mail, um dein Konto zu bestätigen.</p>
            <Link href="/auth/login" className="auth-link">
              Zurück zur Anmeldung
            </Link>
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
              <p className="mt-1 text-xs opacity-70">
                Das Passwort muss mindestens 8 Zeichen lang sein.
              </p>
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
                suppressHydrationWarning
              />
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="auth-button"
            >
              {loading ? 'REGISTRIERUNG...' : 'REGISTRIEREN'}
            </button>
          </form>
        )}
        
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-400">
            Nach der Registrierung erhältst du eine E-Mail zur Bestätigung deines Kontos.
          </p>
        </div>
      </div>
    </div>
  );
} 