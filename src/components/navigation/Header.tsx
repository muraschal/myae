'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getCurrentUser, signOut } from '@/lib/supabase';

export default function Header() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    async function fetchUser() {
      try {
        const userData = await getCurrentUser();
        setUser(userData);
      } catch (error) {
        console.error('Fehler beim Laden des Benutzers:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchUser();
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut();
      setUser(null);
      window.location.href = '/';
    } catch (error) {
      console.error('Fehler beim Abmelden:', error);
    }
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="bg-white shadow-sm">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        {/* Logo und Name */}
        <Link href="/">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-2xl">myÆ</span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          <Link href="/" className="text-gray-700 hover:text-blue-600">
            Home
          </Link>
          
          {!loading && (
            <>
              {user ? (
                <>
                  <Link href="/profile" className="text-gray-700 hover:text-blue-600">
                    Mein Profil
                  </Link>
                  <button 
                    onClick={handleSignOut}
                    className="text-red-600 hover:text-red-800"
                  >
                    Abmelden
                  </button>
                </>
              ) : (
                <>
                  <Link 
                    href="/auth/login" 
                    className="text-gray-700 hover:text-blue-600"
                  >
                    Anmelden
                  </Link>
                  <Link 
                    href="/auth/register" 
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Registrieren
                  </Link>
                </>
              )}
            </>
          )}
        </nav>

        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <button 
            onClick={toggleMenu}
            className="p-2 focus:outline-none"
          >
            <svg 
              className="w-6 h-6" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} 
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white py-2 px-4 shadow-inner">
          <nav className="flex flex-col space-y-3">
            <Link 
              href="/"
              className="text-gray-700 hover:text-blue-600 py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>
            
            {!loading && (
              <>
                {user ? (
                  <>
                    <Link 
                      href="/profile" 
                      className="text-gray-700 hover:text-blue-600 py-2"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Mein Profil
                    </Link>
                    <button 
                      onClick={handleSignOut}
                      className="text-red-600 hover:text-red-800 py-2 text-left"
                    >
                      Abmelden
                    </button>
                  </>
                ) : (
                  <>
                    <Link 
                      href="/auth/login" 
                      className="text-gray-700 hover:text-blue-600 py-2"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Anmelden
                    </Link>
                    <Link 
                      href="/auth/register" 
                      className="text-gray-700 hover:text-blue-600 py-2"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Registrieren
                    </Link>
                  </>
                )}
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
} 