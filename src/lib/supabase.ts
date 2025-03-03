import { createBrowserClient } from '@supabase/ssr';

// Supabase-Konfigurationsdaten aus den Umgebungsvariablen
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://myae.rapold.io';

// Prüfen, ob die erforderlichen Umgebungsvariablen vorhanden sind
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase URL oder Anon Key fehlt in den Umgebungsvariablen.');
}

// Erstellt einen Supabase-Client für die Verwendung im Browser
export const createClient = () => {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        flowType: 'pkce',
        autoRefreshToken: true,
        detectSessionInUrl: true,
        persistSession: true
      },
      global: {
        headers: {
          'x-my-custom-header': siteUrl
        }
      }
    }
  );
};

/**
 * Hilfsfunktion zum Überprüfen, ob ein Benutzer eingeloggt ist
 * @returns Das Benutzerobjekt oder null, wenn der Benutzer nicht eingeloggt ist
 */
export async function getCurrentUser() {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  return session?.user || null;
}

/**
 * Melde einen Benutzer mit E-Mail und Passwort an
 * @param email E-Mail-Adresse des Benutzers
 * @param password Passwort des Benutzers
 */
export async function signInWithEmail(email: string, password: string) {
  const supabase = createClient();
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
  const supabase = createClient();
  return supabase.auth.signUp({
    email,
    password
  });
}

/**
 * Melde den aktuellen Benutzer ab
 */
export async function signOut() {
  const supabase = createClient();
  return supabase.auth.signOut();
}

/**
 * Fordere einen Passwort-Reset für die angegebene E-Mail an
 * @param email E-Mail-Adresse des Benutzers
 */
export async function resetPassword(email: string) {
  const supabase = createClient();
  return supabase.auth.resetPasswordForEmail(email);
} 