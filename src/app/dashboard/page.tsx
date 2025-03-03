'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser, signOut } from '@/lib/supabase';
import Cookies from 'js-cookie';
import PreferencesForm from '@/components/onboarding/PreferencesForm';
import { deleteCookie } from '@/lib/cookies';
import { toast } from 'react-hot-toast';

interface Preferences {
  dailyFocus: string;
  interests: string[];
  updateFrequency: 'daily' | 'weekly' | 'rarely';
}

const UPDATE_FREQUENCIES = {
  daily: 'Täglich',
  weekly: 'Wöchentlich',
  rarely: 'Selten'
};

const INTERESTS_MAP = {
  tech: 'Technologie',
  finance: 'Finanzen',
  productivity: 'Produktivität',
  health: 'Gesundheit',
  mindfulness: 'Achtsamkeit',
  career: 'Karriere'
};

export default function DashboardPage() {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [preferences, setPreferences] = useState<Preferences | null>(null);
  const [showPreferencesForm, setShowPreferencesForm] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const isLoggedIn = Cookies.get('isLoggedIn');
      const email = Cookies.get('userEmail');
      if (!isLoggedIn) {
        router.push('/auth/login');
        return;
      }
      setUserEmail(email || null);

      try {
        const response = await fetch('/api/preferences');
        const data = await response.json();
        
        if (response.ok && data.preferences) {
          setPreferences(data.preferences);
        }
      } catch (error) {
        console.error('Fehler beim Laden der Präferenzen:', error);
      }

      setIsLoading(false);
    };

    checkAuth();
  }, [router]);

  const handleLogout = async () => {
    try {
      await signOut();
      Cookies.remove('isLoggedIn');
      Cookies.remove('userEmail');
      window.location.href = '/auth/login';
    } catch (error) {
      console.error('Fehler beim Abmelden:', error);
    }
  };

  const handleSendTestEmail = async () => {
    setIsSendingEmail(true);
    try {
      const response = await fetch('/api/send-daily-email', {
        method: 'POST',
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Fehler beim Senden der E-Mail');
      }
      
      toast.success('Test-E-Mail wurde erfolgreich versendet! 📧', {
        duration: 4000,
        position: 'top-center',
        style: {
          background: 'rgba(34, 197, 94, 0.9)',
          color: '#fff',
          backdropFilter: 'blur(8px)',
          borderRadius: '10px',
          padding: '16px 24px',
          fontSize: '16px',
          fontWeight: '500',
        },
      });
    } catch (error) {
      console.error('Fehler:', error);
      toast.error('Fehler beim Senden der E-Mail. Bitte versuche es später erneut.', {
        duration: 4000,
        position: 'top-center',
        style: {
          background: 'rgba(239, 68, 68, 0.9)',
          color: '#fff',
          backdropFilter: 'blur(8px)',
          borderRadius: '10px',
          padding: '16px 24px',
          fontSize: '16px',
          fontWeight: '500',
        },
      });
    } finally {
      setIsSendingEmail(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-400"></div>
      </div>
    );
  }

  if (showPreferencesForm) {
    return <PreferencesForm />;
  }

  return (
    <main className="main">
      <div className="glass-card" style={{ maxWidth: '1200px', padding: '3rem', margin: '2rem auto' }}>
        <div className="flex justify-between items-center mb-8">
          <h1 className="auth-title mb-0">Dashboard</h1>
          <div className="flex items-center gap-4">
            <p className="text-white/80">
              <span className="mr-2">👤</span>
              {userEmail}
            </p>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg transition-colors text-red-200"
            >
              Abmelden
            </button>
          </div>
        </div>

        {preferences && (
          <div className="preferences-section bg-white/5 rounded-2xl overflow-hidden">
            <div className="flex justify-between items-center p-6 bg-white/5">
              <h2 className="text-2xl font-semibold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Deine Präferenzen
              </h2>
              <div className="flex gap-4">
                <button
                  onClick={handleSendTestEmail}
                  disabled={isSendingEmail}
                  className={`px-6 py-3 bg-green-500 hover:bg-green-600 rounded-xl transition-all hover:shadow-lg hover:scale-105 font-medium disabled:opacity-50 disabled:cursor-not-allowed ${
                    isSendingEmail ? 'animate-pulse' : ''
                  }`}
                >
                  {isSendingEmail ? 'Sende E-Mail...' : 'Test-E-Mail senden'}
                </button>
                <button
                  onClick={() => setShowPreferencesForm(true)}
                  className="px-6 py-3 bg-blue-500 hover:bg-blue-600 rounded-xl transition-all hover:shadow-lg hover:scale-105 font-medium"
                >
                  Präferenzen bearbeiten
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 p-8">
              <div className="preference-card bg-white/5 rounded-xl p-6 hover:bg-white/10 transition-colors">
                <h3 className="text-xl font-medium mb-4 text-blue-300">Täglicher Fokus</h3>
                <p className="text-white/90 text-lg">{preferences.dailyFocus}</p>
              </div>
              
              <div className="preference-card bg-white/5 rounded-xl p-6 hover:bg-white/10 transition-colors">
                <h3 className="text-xl font-medium mb-4 text-blue-300">Update-Häufigkeit</h3>
                <p className="text-white/90 text-lg">{UPDATE_FREQUENCIES[preferences.updateFrequency]}</p>
              </div>
              
              <div className="preference-card bg-white/5 rounded-xl p-6 hover:bg-white/10 transition-colors">
                <h3 className="text-xl font-medium mb-4 text-blue-300">Interessengebiete</h3>
                <div className="flex flex-wrap gap-2">
                  {preferences.interests.map((interest) => (
                    <span
                      key={interest}
                      className="px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 rounded-lg text-blue-200 transition-colors"
                    >
                      {INTERESTS_MAP[interest as keyof typeof INTERESTS_MAP] || interest}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
} 