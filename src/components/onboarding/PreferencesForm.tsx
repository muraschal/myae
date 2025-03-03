'use client';

import { useState, useEffect } from 'react';

interface Preferences {
  dailyFocus: string;
  interests: string[];
  updateFrequency: 'daily' | 'weekly' | 'rarely';
}

const INTERESTS = [
  { id: 'tech', label: 'Technologie' },
  { id: 'finance', label: 'Finanzen' },
  { id: 'productivity', label: 'Produktivität' },
  { id: 'health', label: 'Gesundheit' },
  { id: 'mindfulness', label: 'Achtsamkeit' },
  { id: 'career', label: 'Karriere' }
];

const UPDATE_FREQUENCIES = [
  { value: 'daily', label: 'Täglich' },
  { value: 'weekly', label: 'Wöchentlich' },
  { value: 'rarely', label: 'Selten' }
];

export default function PreferencesForm() {
  const [preferences, setPreferences] = useState<Preferences>({
    dailyFocus: '',
    interests: [],
    updateFrequency: 'daily'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadPreferences = async () => {
      try {
        const response = await fetch('/api/preferences');
        const data = await response.json();
        
        if (response.ok && data.preferences) {
          setPreferences(data.preferences);
        }
      } catch (error) {
        console.error('Fehler beim Laden der Präferenzen:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadPreferences();
  }, []);

  const handleInterestToggle = (interest: string) => {
    setPreferences(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/preferences', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(preferences),
      });

      if (!response.ok) {
        throw new Error('Fehler beim Speichern der Präferenzen');
      }
      
      window.location.reload();
    } catch (error) {
      console.error('Fehler beim Speichern der Präferenzen:', error);
      alert('Es gab einen Fehler beim Speichern deiner Präferenzen. Bitte versuche es erneut.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-400"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="glass-card p-8">
        <h2 className="text-2xl font-bold mb-6 text-center bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
          Deine myÆ Präferenzen
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Täglicher Fokus */}
          <div>
            <label className="block text-lg mb-3 text-white/90">
              Worauf legst du in deinem Alltag besonders Wert?
            </label>
            <textarea
              value={preferences.dailyFocus}
              onChange={(e) => setPreferences(prev => ({ ...prev, dailyFocus: e.target.value }))}
              className="w-full p-4 bg-white/5 border border-white/20 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all text-base font-medium text-white/90 resize-none"
              rows={3}
              placeholder="z.B. Work-Life-Balance, persönliches Wachstum, Familie..."
            />
          </div>

          {/* Interessen */}
          <div>
            <label className="block text-lg mb-3 text-white/90">
              Welche Themen interessieren dich besonders?
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {INTERESTS.map(interest => (
                <button
                  key={interest.id}
                  type="button"
                  onClick={() => handleInterestToggle(interest.id)}
                  className={`p-4 rounded-xl border text-base font-medium transition-all ${
                    preferences.interests.includes(interest.id)
                      ? 'bg-gradient-to-r from-blue-500/30 to-purple-500/30 border-blue-400 text-white shadow-lg shadow-blue-500/20'
                      : 'bg-white/5 border-white/10 hover:bg-white/10 text-white/80 hover:text-white hover:border-white/20'
                  }`}
                >
                  {interest.label}
                </button>
              ))}
            </div>
          </div>

          {/* Update-Häufigkeit */}
          <div>
            <label className="block text-lg mb-3 text-white/90">
              Wie oft möchtest du neue Updates von myÆ?
            </label>
            <div className="relative">
              <select
                value={preferences.updateFrequency}
                onChange={(e) => setPreferences(prev => ({
                  ...prev,
                  updateFrequency: e.target.value as Preferences['updateFrequency']
                }))}
                className="w-full p-4 pr-10 bg-white/5 border border-white/20 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all appearance-none text-base font-medium text-white/90 cursor-pointer hover:bg-white/10"
              >
                {UPDATE_FREQUENCIES.map(frequency => (
                  <option 
                    key={frequency.value} 
                    value={frequency.value}
                    className="bg-gray-900 text-white"
                  >
                    {frequency.label}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none">
                <svg className="w-5 h-5 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="flex-1 py-4 px-6 bg-white/5 rounded-xl font-semibold text-white/90 hover:bg-white/10 hover:text-white transition-all border border-white/10 hover:border-white/20"
            >
              Abbrechen
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-4 px-6 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl font-semibold text-white hover:from-blue-600 hover:to-purple-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/20"
            >
              {isSubmitting ? 'Wird gespeichert...' : 'Präferenzen speichern'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 