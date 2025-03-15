'use client';

import { useState } from 'react';
import { resetPassword } from '@/lib/supabase';

export default function ResetPasswordForm() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    if (!email || !email.includes('@')) {
      setError('Bitte gib eine gültige E-Mail-Adresse ein.');
      setLoading(false);
      return;
    }
    
    try {
      console.log('Sende Passwort-Zurücksetzungsanfrage für:', email);
      const { error } = await resetPassword(email);
      
      if (error) {
        console.error('Fehler bei der Passwort-Zurücksetzung:', error);
        throw error;
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
          {error}
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
        </p>
      </div>
    </div>
  );
} 