'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser, signOut } from '@/lib/supabase';
import Cookies from 'js-cookie';

export default function DashboardPage() {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function loadUserData() {
      try {
        // Versuche, den Benutzer über Supabase zu laden
        const user = await getCurrentUser();
        
        if (user) {
          setUserEmail(user.email || null);
          setIsLoading(false);
          return;
        }
        
        // Fallback auf Cookies für Demo-Benutzer
        const isLoggedIn = Cookies.get('isLoggedIn');
        const email = Cookies.get('userEmail');
        
        if (isLoggedIn === 'true' && email) {
          setUserEmail(email);
          setIsLoading(false);
          return;
        }
        
        // Wenn kein Benutzer gefunden wurde, zur Login-Seite weiterleiten
        window.location.href = '/auth/login';
      } catch (error) {
        console.error('Fehler beim Laden der Benutzerdaten:', error);
        window.location.href = '/auth/login';
      }
    }
    
    loadUserData();
  }, []);

  const handleLogout = async () => {
    try {
      // Versuche, den Benutzer über Supabase abzumelden
      await signOut();
      
      // Cookies löschen
      Cookies.remove('isLoggedIn');
      Cookies.remove('userEmail');
      
      window.location.href = '/auth/login';
    } catch (error) {
      console.error('Fehler beim Abmelden:', error);
    }
  };

  if (isLoading) {
    return (
      <main className="main">
        <div className="glass-card" style={{ maxWidth: '600px', textAlign: 'center', padding: '3rem' }}>
          <p>Lade Dashboard...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="main">
      <div className="glass-card" style={{ maxWidth: '800px', padding: '2.5rem' }}>
        <h1 className="auth-title">Dashboard</h1>
        
        <div style={{ 
          background: 'rgba(0, 0, 0, 0.2)', 
          padding: '1.5rem', 
          borderRadius: '10px',
          marginBottom: '2rem' 
        }}>
          <p style={{ margin: 0 }}>Angemeldet als: <strong>{userEmail}</strong></p>
        </div>
        
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <p>Das Dashboard befindet sich noch in der Entwicklung.</p>
          <p>Hier werden bald Ihre KI-Erinnerungen angezeigt.</p>
        </div>
        
        <div style={{ textAlign: 'center' }}>
          <button
            onClick={handleLogout}
            className="auth-button"
            style={{ maxWidth: '200px' }}
          >
            ABMELDEN
          </button>
        </div>
      </div>
    </main>
  );
} 