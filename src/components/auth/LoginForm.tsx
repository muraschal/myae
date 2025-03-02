'use client';

import { useState } from 'react';
import { signInWithEmail } from '@/lib/supabase';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await signInWithEmail(email, password);
      
      if (error) {
        throw error;
      }
      
      setSuccess(true);
      // Nach erfolgreicher Anmeldung zur Startseite weiterleiten
      window.location.href = '/';
    } catch (err: any) {
      setError(err.message || 'Bei der Anmeldung ist ein Fehler aufgetreten.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center">Anmelden</h2>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}
      
      {success && (
        <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md">
          Anmeldung erfolgreich! Du wirst weitergeleitet...
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
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
          />
        </div>
        
        <div className="mb-6">
          <label htmlFor="password" className="block mb-2 text-sm font-medium">
            Passwort
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 border rounded-md"
            required
          />
        </div>
        
        <button
          type="submit"
          disabled={loading}
          className={`w-full p-2 text-white bg-blue-600 rounded-md ${
            loading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-blue-700'
          }`}
        >
          {loading ? 'Anmeldung läuft...' : 'Anmelden'}
        </button>
      </form>
      
      <div className="mt-4 text-center">
        <a href="/auth/reset-password" className="text-sm text-blue-600 hover:underline">
          Passwort vergessen?
        </a>
      </div>
      
      <div className="mt-6 text-center">
        <p className="text-sm">
          Noch kein Konto?{' '}
          <a href="/auth/register" className="text-blue-600 hover:underline">
            Registrieren
          </a>
        </p>
      </div>
    </div>
  );
} 