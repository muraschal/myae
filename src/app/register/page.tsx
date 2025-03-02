'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!name || !email || !password || !confirmPassword) {
      setError('Bitte fülle alle Felder aus.');
      return;
    }
    
    if (password !== confirmPassword) {
      setError('Passwörter stimmen nicht überein.');
      return;
    }
    
    if (password.length < 6) {
      setError('Passwort muss mindestens 6 Zeichen lang sein.');
      return;
    }
    
    try {
      setIsLoading(true);
      // Simulieren einer Registrierung - in einem echten Projekt würden wir hier
      // einen Authentifizierungsdienst wie Supabase, Auth0 oder NextAuth verwenden
      
      // Demo-Simulation
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Speichere Benutzerinformationen im localStorage
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('userEmail', email);
      localStorage.setItem('userName', name);
      
      // Nach erfolgreicher Registrierung zur Dashboard-Seite weiterleiten
      router.push('/dashboard');
    } catch (err) {
      setError('Registrierung fehlgeschlagen. Bitte versuche es erneut.');
      console.error('Registration error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="main">
      <div className="header">
        <div className="headerContainer">
          <Link href="/" className="brand">myÆ</Link>
          <div className="nav-links">
            <Link href="/login" className="auth-link">Anmelden</Link>
            <Link href="/register" className="auth-link" style={{ marginLeft: '1rem' }}>Registrieren</Link>
          </div>
        </div>
      </div>
      
      <div className="glass-card">
        <div className="welcome-panel">
          <h2 className="welcome-title">Welcome Back</h2>
          <p className="welcome-text">
            To keep connected with us please login with your personal info
          </p>
          <Link href="/login">
            <button 
              className="auth-button"
            >
              SIGN IN
            </button>
          </Link>
        </div>
        
        <div className="login-panel">
          <h1 className="auth-title">Create Account</h1>
          
          <div className="social-buttons">
            <button className="social-button">G</button>
            <button className="social-button">X</button>
            <button className="social-button">in</button>
          </div>
          
          {error && <div className="error-message" style={{ color: '#f87171', marginBottom: '1rem', textAlign: 'center' }}>{error}</div>}
          
          <form onSubmit={handleSubmit}>
            <div className="input-field">
              <label htmlFor="name" className="form-label">Name</label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ihr vollständiger Name"
                required
              />
            </div>
            
            <div className="input-field">
              <label htmlFor="email" className="form-label">Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Ihre E-Mail-Adresse"
                required
              />
            </div>
            
            <div className="input-field">
              <label htmlFor="password" className="form-label">Password</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Passwort (mind. 6 Zeichen)"
                required
              />
            </div>
            
            <div className="input-field">
              <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Passwort bestätigen"
                required
              />
            </div>
            
            <button 
              type="submit" 
              className="auth-button"
              disabled={isLoading}
            >
              {isLoading ? 'REGISTRIERUNG...' : 'SIGN UP'}
            </button>
          </form>
        </div>
      </div>
      
      <footer className="footer">
        <p>&copy; {new Date().getFullYear()} myÆ. Alle Rechte vorbehalten.</p>
      </footer>
    </main>
  );
} 