'use client';

import { useState } from 'react';

export default function Home() {
  const [prompt, setPrompt] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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
    } catch (err: any) {
      setError(err.message || 'Ein Fehler ist aufgetreten');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">myAE - AI Memory System</h1>
      
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">GPT API Test</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="prompt" className="block mb-2">
              Prompt:
            </label>
            <textarea
              id="prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded min-h-[100px]"
              placeholder="Wie funktioniert Bitcoin?"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-blue-400"
          >
            {loading ? 'Wird verarbeitet...' : 'Absenden'}
          </button>
        </form>
      </div>
      
      {error && (
        <div className="p-4 bg-red-100 border border-red-400 rounded mb-8">
          <p className="text-red-700">{error}</p>
        </div>
      )}
      
      {result && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Antwort:</h2>
          <div className="p-4 bg-gray-100 border border-gray-300 rounded whitespace-pre-wrap">
            {result}
          </div>
        </div>
      )}
    </div>
  );
}
