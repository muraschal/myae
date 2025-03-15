'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser, signOut } from '@/lib/supabase';
import Cookies from 'js-cookie';
import { deleteCookie } from '@/lib/cookies';
import { toast } from 'react-hot-toast';

interface BusinessGoal {
  type: 'revenue' | 'growth' | 'innovation' | 'efficiency' | 'market' | 'other';
  description: string;
}

const BUSINESS_GOAL_TYPES = {
  revenue: 'Umsatzsteigerung',
  growth: 'Wachstum & Skalierung',
  innovation: 'Innovation & Produktentwicklung',
  efficiency: 'Effizienzsteigerung',
  market: 'Marktpositionierung',
  other: 'Andere Ziele'
};

export default function DashboardPage() {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [businessGoal, setBusinessGoal] = useState<BusinessGoal>({
    type: 'revenue',
    description: ''
  });
  const responseRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const isLoggedIn = Cookies.get('isLoggedIn');
      const email = Cookies.get('userEmail');
      if (!isLoggedIn) {
        router.push('/login');
        return;
      }
      setUserEmail(email || null);

      try {
        const user = await getCurrentUser();
        if (!user) {
          router.push('/login');
        }
      } catch (error) {
        console.error('Fehler beim Abrufen des Benutzers:', error);
        router.push('/login');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  const handleLogout = async () => {
    try {
      await signOut();
      deleteCookie('isLoggedIn');
      deleteCookie('userEmail');
      router.push('/login');
    } catch (error) {
      console.error('Fehler beim Abmelden:', error);
      toast.error('Fehler beim Abmelden. Bitte versuche es erneut.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!prompt.trim()) {
      toast.error('Bitte gib eine Frage oder ein Problem ein.');
      return;
    }
    
    setIsSubmitting(true);
    setResponse('');
    
    try {
      const enhancedPrompt = `Kontext: Mein aktuelles Geschäftsziel ist ${BUSINESS_GOAL_TYPES[businessGoal.type]}${businessGoal.description ? ': ' + businessGoal.description : ''}\n\nMeine Anfrage: ${prompt}`;
      
      const response = await fetch('/api/gpt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: enhancedPrompt,
          temperature: 0.7,
          max_tokens: 1500,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Fehler bei der Anfrage an die KI');
      }
      
      const data = await response.json();
      setResponse(data.result);
      
      // Scroll to response
      if (responseRef.current) {
        responseRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    } catch (error) {
      console.error('Fehler bei der KI-Anfrage:', error);
      toast.error('Fehler bei der Anfrage. Bitte versuche es später erneut.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-blue-900">Strategischer KI-Berater</h1>
        <div className="flex items-center gap-4">
          <span className="text-gray-600">{userEmail}</span>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md text-gray-800 transition"
          >
            Abmelden
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4 text-blue-800">Dein Geschäftsziel</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Art des Ziels</label>
            <select
              value={businessGoal.type}
              onChange={(e) => setBusinessGoal({...businessGoal, type: e.target.value as BusinessGoal['type']})}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              {Object.entries(BUSINESS_GOAL_TYPES).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Beschreibung (optional)</label>
            <input
              type="text"
              value={businessGoal.description}
              onChange={(e) => setBusinessGoal({...businessGoal, description: e.target.value})}
              placeholder="z.B. 'Umsatz um 30% steigern' oder 'Neue Produktlinie entwickeln'"
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4 text-blue-800">Stelle deine Frage</h2>
        <form onSubmit={handleSubmit}>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Beschreibe dein Business-Problem oder deine Frage. Sei so spezifisch wie möglich für die besten Ergebnisse."
            className="w-full p-4 border border-gray-300 rounded-md h-40 focus:ring-blue-500 focus:border-blue-500 mb-4"
            disabled={isSubmitting}
          ></textarea>
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-6 py-3 rounded-md text-white font-medium transition ${
                isSubmitting ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {isSubmitting ? 'Analysiere...' : 'Strategische Analyse starten'}
            </button>
          </div>
        </form>
      </div>

      {response && (
        <div ref={responseRef} className="bg-blue-50 border-l-4 border-blue-500 rounded-lg shadow-md p-6 mb-8 animate-fadeIn">
          <h2 className="text-xl font-semibold mb-4 text-blue-800">Strategische Analyse</h2>
          <div className="prose max-w-none">
            {response.split('\n').map((paragraph, index) => (
              <p key={index} className="mb-4">{paragraph}</p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 