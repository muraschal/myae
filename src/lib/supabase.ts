import { createClient } from '@supabase/supabase-js';

// Supabase-Konfigurationsdaten aus den Umgebungsvariablen
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Prüfen, ob die erforderlichen Umgebungsvariablen vorhanden sind
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase URL oder Anon Key fehlt in den Umgebungsvariablen.');
}

// Supabase-Client erstellen
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Hilfsfunktion zum Überprüfen, ob ein Benutzer eingeloggt ist
 * @returns Das Benutzerobjekt oder null, wenn der Benutzer nicht eingeloggt ist
 */
export async function getCurrentUser() {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.user || null;
}

/**
 * Melde einen Benutzer mit E-Mail und Passwort an
 * @param email E-Mail-Adresse des Benutzers
 * @param password Passwort des Benutzers
 */
export async function signInWithEmail(email: string, password: string) {
  return supabase.auth.signInWithPassword({
    email,
    password
  });
}

/**
 * Registriere einen neuen Benutzer mit E-Mail und Passwort
 * @param email E-Mail-Adresse des Benutzers
 * @param password Passwort des Benutzers
 */
export async function signUpWithEmail(email: string, password: string) {
  return supabase.auth.signUp({
    email,
    password
  });
}

/**
 * Melde den aktuellen Benutzer ab
 */
export async function signOut() {
  return supabase.auth.signOut();
}

/**
 * Fordere einen Passwort-Reset für die angegebene E-Mail an
 * @param email E-Mail-Adresse des Benutzers
 */
export async function resetPassword(email: string) {
  return supabase.auth.resetPasswordForEmail(email);
} 