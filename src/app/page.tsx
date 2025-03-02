'use client';

import { useState, useEffect } from 'react';

// Define error type
type ApiError = Error | { message: string };

// Memory types
type Memory = {
  id: string;
  userId?: string;
  content: string;
  type: 'interaction' | 'mood' | 'preference' | 'note';
  timestamp: number;
  metadata?: Record<string, any>;
  ttl?: number;
};

type MemoryResponse = {
  count: number;
  results: Memory[];
};

export default function Home() {
  const [prompt, setPrompt] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Memory states
  const [memoryContent, setMemoryContent] = useState('');
  const [memoryType, setMemoryType] = useState<Memory['type']>('interaction');
  const [memorySaving, setMemorySaving] = useState(false);
  const [memoryError, setMemoryError] = useState('');
  const [memories, setMemories] = useState<Memory[]>([]);
  const [loadingMemories, setLoadingMemories] = useState(false);
  const [deletingMemory, setDeletingMemory] = useState<string | null>(null);

  // Lade Erinnerungen beim Start
  useEffect(() => {
    fetchMemories();
  }, []);

  // Erinnerungen abrufen
  const fetchMemories = async () => {
    setLoadingMemories(true);
    setMemoryError('');
    
    try {
      const response = await fetch('/api/memory/retrieve', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ type: memoryType }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Fehler beim Abrufen der Erinnerungen');
      }
      
      setMemories(data.results || []);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error 
        ? err.message 
        : typeof err === 'object' && err !== null && 'message' in err 
          ? String((err as ApiError).message) 
          : 'Ein Fehler ist aufgetreten';
      
      setMemoryError(errorMessage);
    } finally {
      setLoadingMemories(false);
    }
  };
  
  // Erinnerung speichern
  const handleSaveMemory = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!memoryContent.trim()) return;
    
    setMemorySaving(true);
    setMemoryError('');
    
    try {
      const response = await fetch('/api/memory/store', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          content: memoryContent,
          type: memoryType,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Fehler beim Speichern der Erinnerung');
      }
      
      // Formular zurücksetzen und Erinnerungen neu laden
      setMemoryContent('');
      fetchMemories();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error 
        ? err.message 
        : typeof err === 'object' && err !== null && 'message' in err 
          ? String((err as ApiError).message) 
          : 'Ein Fehler ist aufgetreten';
      
      setMemoryError(errorMessage);
    } finally {
      setMemorySaving(false);
    }
  };

  // Erinnerung löschen
  const handleDeleteMemory = async (id: string) => {
    if (!id) return;
    
    setDeletingMemory(id);
    setMemoryError('');
    
    try {
      const response = await fetch('/api/memory/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          id,
          type: memoryType,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Fehler beim Löschen der Erinnerung');
      }
      
      // Erinnerungen neu laden
      fetchMemories();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error 
        ? err.message 
        : typeof err === 'object' && err !== null && 'message' in err 
          ? String((err as ApiError).message) 
          : 'Ein Fehler ist aufgetreten';
      
      setMemoryError(errorMessage);
    } finally {
      setDeletingMemory(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/gpt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Ein Fehler ist aufgetreten');
      }
      
      setResult(data.result);
      
      // Speichere die Interaktion automatisch im Memory
      if (data.result) {
        try {
          await fetch('/api/memory/store', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
              content: `Frage: ${prompt}\nAntwort: ${data.result}`,
              type: 'interaction',
            }),
          });
          
          // Aktualisiere die Erinnerungen, wenn die aktuelle Ansicht auf Interaktionen ist
          if (memoryType === 'interaction') {
            fetchMemories();
          }
        } catch (memErr) {
          console.error('Fehler beim Speichern der Interaktion:', memErr);
        }
      }
    } catch (err: unknown) {
      // Type guard to check if error has a message property
      const errorMessage = err instanceof Error 
        ? err.message 
        : typeof err === 'object' && err !== null && 'message' in err 
          ? String((err as ApiError).message) 
          : 'Ein Fehler ist aufgetreten';
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };
  
  // Formatiert das Datum
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 text-gray-800 dark:text-gray-200">
      <div className="container max-w-4xl mx-auto p-6 md:p-8">
        <header className="mb-10 text-center">
          <h1 className="text-4xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
            myÆ
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">AI Memory System</p>
        </header>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
            </svg>
            GPT API Test
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="prompt" className="block mb-2 font-medium">
                Prompt:
              </label>
              <textarea
                id="prompt"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg min-h-[120px] bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                placeholder="Wie funktioniert Bitcoin?"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 transition-colors duration-200 font-medium flex items-center justify-center"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Wird verarbeitet...
                </>
              ) : (
                'Absenden'
              )}
            </button>
          </form>
        </div>
        
        {error && (
          <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-8 text-red-700 dark:text-red-400 flex items-start">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <p>{error}</p>
          </div>
        )}
        
        {result && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-8 transition-all duration-300 ease-in-out">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Antwort:
            </h2>
            <div className="p-4 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg whitespace-pre-wrap text-gray-700 dark:text-gray-300">
              {result}
            </div>
          </div>
        )}
        
        {/* Memory Section */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-purple-500" viewBox="0 0 20 20" fill="currentColor">
              <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
            Memory System
          </h2>
          
          <div className="mb-6">
            <div className="flex items-center space-x-4 mb-4">
              <button 
                className={`px-3 py-1 rounded-full ${memoryType === 'interaction' ? 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
                onClick={() => { setMemoryType('interaction'); fetchMemories(); }}
              >
                Interaktionen
              </button>
              <button 
                className={`px-3 py-1 rounded-full ${memoryType === 'mood' ? 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
                onClick={() => { setMemoryType('mood'); fetchMemories(); }}
              >
                Stimmungen
              </button>
              <button 
                className={`px-3 py-1 rounded-full ${memoryType === 'note' ? 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
                onClick={() => { setMemoryType('note'); fetchMemories(); }}
              >
                Notizen
              </button>
            </div>
          
            <form onSubmit={handleSaveMemory} className="mb-6">
              <div className="mb-4">
                <label htmlFor="memoryContent" className="block mb-2 font-medium">
                  Neue {memoryType === 'interaction' ? 'Interaktion' : memoryType === 'mood' ? 'Stimmung' : 'Notiz'} speichern:
                </label>
                <textarea
                  id="memoryContent"
                  value={memoryContent}
                  onChange={(e) => setMemoryContent(e.target.value)}
                  className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg min-h-[80px] bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition"
                  placeholder={memoryType === 'interaction' ? 'Meine Interaktion mit der AI...' : memoryType === 'mood' ? 'Meine heutige Stimmung...' : 'Meine Notiz...'}
                  required
                />
              </div>
              <button
                type="submit"
                disabled={memorySaving}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-purple-400 transition-colors duration-200 font-medium flex items-center justify-center"
              >
                {memorySaving ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Speichern...
                  </>
                ) : (
                  'Speichern'
                )}
              </button>
            </form>
          
            {memoryError && (
              <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-3 mb-4 text-red-700 dark:text-red-400 text-sm">
                {memoryError}
              </div>
            )}
            
            <div className="mb-2 flex justify-between items-center">
              <h3 className="font-medium">
                Gespeicherte {memoryType === 'interaction' ? 'Interaktionen' : memoryType === 'mood' ? 'Stimmungen' : memoryType === 'preference' ? 'Präferenzen' : 'Notizen'}
              </h3>
              
              <button 
                onClick={fetchMemories}
                className="text-sm text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 flex items-center"
                disabled={loadingMemories}
              >
                {loadingMemories ? (
                  <svg className="animate-spin h-4 w-4 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <svg className="h-4 w-4 mr-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                  </svg>
                )}
                Aktualisieren
              </button>
            </div>
            
            {loadingMemories ? (
              <div className="flex justify-center py-8">
                <svg className="animate-spin h-8 w-8 text-purple-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
            ) : memories.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400 italic">
                Keine Einträge gefunden.
              </div>
            ) : (
              <div className="space-y-3 mt-3">
                {memories.map((memory) => (
                  <div key={memory.id} className="p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <div className="flex justify-between items-start mb-1">
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {formatDate(memory.timestamp)}
                      </div>
                      <button
                        onClick={() => handleDeleteMemory(memory.id)}
                        disabled={deletingMemory === memory.id}
                        className="text-gray-400 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400 transition-colors"
                        title="Erinnerung löschen"
                      >
                        {deletingMemory === memory.id ? (
                          <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        )}
                      </button>
                    </div>
                    <div className="whitespace-pre-wrap text-sm">
                      {memory.content}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
