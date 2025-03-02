import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import LoginForm from '../LoginForm';
import { signInWithEmail } from '@/lib/supabase';
import * as navigation from 'next/navigation';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  useSearchParams: jest.fn(() => ({
    get: jest.fn((param) => param === 'redirect' ? null : null)
  }))
}));

// Mock Supabase
jest.mock('@/lib/supabase', () => ({
  signInWithEmail: jest.fn()
}));

// Mock js-cookie
const mockCookies: Record<string, string> = {};
jest.mock('js-cookie', () => ({
  get: jest.fn((key: string) => mockCookies[key]),
  set: jest.fn((key: string, value: string) => {
    mockCookies[key] = value;
  }),
  remove: jest.fn((key: string) => {
    delete mockCookies[key];
  })
}));

// Mock window.location
const mockLocation = {
  href: 'http://localhost:3000/auth/login'
};
Object.defineProperty(window, 'location', {
  value: mockLocation,
  writable: true
});

describe('LoginForm', () => {
  beforeEach(() => {
    // Reset aller Mocks vor jedem Test
    jest.clearAllMocks();
    Object.keys(mockCookies).forEach(key => delete mockCookies[key]);
    mockLocation.href = 'http://localhost:3000/auth/login';
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('zeigt vorausgefüllte Demo-Credentials', () => {
    render(<LoginForm />);
    
    expect(screen.getByLabelText('E-Mail')).toHaveValue('demo@example.com');
    expect(screen.getByLabelText('Passwort')).toHaveValue('password');
  });

  it('führt erfolgreichen Demo-Login durch und leitet zum Dashboard weiter', async () => {
    const { container } = render(<LoginForm />);
    
    // Formular finden und absenden
    const form = container.querySelector('form');
    expect(form).toBeTruthy();
    
    // Submit-Button finden
    const submitButton = screen.getByRole('button', { name: /anmelden/i });
    expect(submitButton).toBeInTheDocument();
    
    // Formular absenden
    await act(async () => {
      fireEvent.submit(form!);
    });
    
    // Warten und prüfen, ob der Loading-Zustand angezeigt wird
    await waitFor(() => {
      expect(screen.getByText(/anmeldung läuft/i)).toBeInTheDocument();
    });
    
    // Timer voranspringen lassen
    await act(async () => {
      jest.advanceTimersByTime(1100);
    });
    
    // Warten und prüfen, ob Cookies gesetzt wurden
    await waitFor(() => {
      expect(mockCookies['isLoggedIn']).toBe('true');
      expect(mockCookies['userEmail']).toBe('demo@example.com');
      expect(mockLocation.href).toBe('/dashboard');
    });
  });

  it('zeigt Fehlermeldung bei falschen Anmeldedaten', async () => {
    const { container } = render(<LoginForm />);
    
    // Falsche Anmeldedaten eingeben
    const emailInput = screen.getByLabelText('E-Mail');
    const passwordInput = screen.getByLabelText('Passwort');
    
    fireEvent.change(emailInput, { target: { value: 'falsch@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'falschespasswort' } });
    
    // Mock für fehlgeschlagenen Supabase-Login
    (signInWithEmail as jest.Mock).mockResolvedValueOnce({
      error: { message: 'Ungültige Anmeldedaten' },
      data: null
    });
    
    // Formular absenden
    const form = container.querySelector('form');
    await act(async () => {
      fireEvent.submit(form!);
    });
    
    // Prüfen, ob die Fehlermeldung angezeigt wird
    await waitFor(() => {
      expect(screen.getByText('Ungültige Anmeldedaten')).toBeInTheDocument();
    });
    
    // Prüfen, ob keine Weiterleitung erfolgt
    expect(mockLocation.href).toBe('http://localhost:3000/auth/login');
  });

  it('leitet direkt zum Dashboard weiter, wenn bereits eingeloggt', async () => {
    // Mock: Benutzer ist bereits eingeloggt
    mockCookies['isLoggedIn'] = 'true';
    mockCookies['userEmail'] = 'demo@example.com';
    
    render(<LoginForm />);
    
    // Timer voranspringen lassen
    await act(async () => {
      jest.advanceTimersByTime(100);
    });
    
    // Warten und prüfen, ob die Weiterleitung zum Dashboard erfolgt
    await waitFor(() => {
      expect(mockLocation.href).toBe('/dashboard');
    });
  });

  it('führt erfolgreichen Supabase-Login durch', async () => {
    const { container } = render(<LoginForm />);
    
    // Supabase-Anmeldedaten eingeben
    const emailInput = screen.getByLabelText('E-Mail');
    const passwordInput = screen.getByLabelText('Passwort');
    
    fireEvent.change(emailInput, { target: { value: 'user@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    
    // Mock für erfolgreichen Supabase-Login
    (signInWithEmail as jest.Mock).mockResolvedValueOnce({
      data: { user: { email: 'user@example.com' } },
      error: null
    });
    
    // Formular absenden
    const form = container.querySelector('form');
    await act(async () => {
      fireEvent.submit(form!);
    });
    
    // Warten und prüfen, ob Cookies gesetzt wurden
    await waitFor(() => {
      expect(mockCookies['isLoggedIn']).toBe('true');
      expect(mockCookies['userEmail']).toBe('user@example.com');
      expect(mockLocation.href).toBe('/dashboard');
    });
  });
}); 