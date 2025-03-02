'use client';

import { useState, useEffect } from 'react';
import { getCurrentUser, signOut } from '@/lib/supabase';

type User = {
  id: string;
  email?: string;
  user_metadata?: Record<string, any>;
  created_at?: string;
};

export default function UserInfo() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadUser() {
      try {
        const userData = await getCurrentUser();
        setUser(userData);
      } catch (err: any) {
        setError(err.message || 'Fehler beim Laden der Benutzerdaten');
      } finally {
        setLoading(false);
      }
    }

    loadUser();
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut();
      window.location.href = '/auth/login';
    } catch (err: any) {
      setError(err.message || 'Fehler beim Abmelden');
    }
  };

  if (loading) {
    return <div className="text-center p-4">Laden...</div>;
  }

  if (error) {
    return (
      <div className="p-4 bg-red-100 text-red-700 rounded-md">
        {error}
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-4 bg-gray-100 rounded-md">
        <p>Nicht angemeldet</p>
        <a 
          href="/auth/login"
          className="inline-block mt-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Anmelden
        </a>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">Benutzerprofil</h2>
      
      <div className="mb-4">
        <p className="text-sm text-gray-500">Benutzer-ID</p>
        <p className="font-medium">{user.id}</p>
      </div>
      
      {user.email && (
        <div className="mb-4">
          <p className="text-sm text-gray-500">E-Mail</p>
          <p className="font-medium">{user.email}</p>
        </div>
      )}
      
      {user.created_at && (
        <div className="mb-4">
          <p className="text-sm text-gray-500">Mitglied seit</p>
          <p className="font-medium">{new Date(user.created_at).toLocaleDateString()}</p>
        </div>
      )}
      
      <button
        onClick={handleSignOut}
        className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
      >
        Abmelden
      </button>
    </div>
  );
} 