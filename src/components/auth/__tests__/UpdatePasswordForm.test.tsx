import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import UpdatePasswordForm from '../UpdatePasswordForm';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
  })),
  useSearchParams: jest.fn(() => ({
    get: jest.fn((param) => param === 'token' ? 'test-token-123' : null)
  }))
}));

// Mock Supabase Client
jest.mock('@supabase/auth-helpers-nextjs', () => ({
  createClientComponentClient: jest.fn()
}));

// Mock fetch
const mockFetch = jest.fn();
global.fetch = mockFetch;

describe('UpdatePasswordForm', () => {
  beforeEach(() => {
    // Reset aller Mocks vor jedem Test
    jest.clearAllMocks();
    jest.useFakeTimers();
    
    // Mock für die Console-Ausgaben
    jest.spyOn(console, 'log').mockImplementation();
    jest.spyOn(console, 'error').mockImplementation();
    
    // Standardmäßig erfolgreiche Antwort für fetch
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ message: 'Passwort erfolgreich aktualisiert' })
    });
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  it('zeigt Formular mit Token aus URL an', async () => {
    render(<UpdatePasswordForm />);
    
    // Warten, bis das Formular geladen ist
    await waitFor(() => {
      expect(screen.getByLabelText('Neues Passwort')).toBeInTheDocument();
      expect(screen.getByLabelText('Passwort bestätigen')).toBeInTheDocument();
    });
    
    // Prüfen, ob der Button aktiviert ist (Token wurde gefunden)
    const submitButton = screen.getByRole('button', { name: /passwort aktualisieren/i });
    expect(submitButton).toBeEnabled();
  });

  it('zeigt Fehlermeldung, wenn kein Token in URL', async () => {
    // Mock überschreiben, damit kein Token zurückgegeben wird
    require('next/navigation').useSearchParams.mockImplementationOnce(() => ({
      get: jest.fn(() => null)
    }));
    
    render(<UpdatePasswordForm />);
    
    await waitFor(() => {
      expect(screen.getByText('Kein gültiger Token gefunden. Bitte fordere einen neuen Link zum Zurücksetzen des Passworts an.')).toBeInTheDocument();
    });
  });

  it('validiert Passworteingaben', async () => {
    render(<UpdatePasswordForm />);
    
    const passwordInput = await screen.findByLabelText('Neues Passwort');
    const confirmPasswordInput = screen.getByLabelText('Passwort bestätigen');
    const submitButton = screen.getByRole('button', { name: /passwort aktualisieren/i });
    
    // Zu kurzes Passwort
    fireEvent.change(passwordInput, { target: { value: '1234' } });
    fireEvent.change(confirmPasswordInput, { target: { value: '1234' } });
    
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('Das Passwort muss mindestens 8 Zeichen lang sein.')).toBeInTheDocument();
    });
    
    // Passwörter stimmen nicht überein
    fireEvent.change(passwordInput, { target: { value: 'neuesPasswort123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'anderePasswort123' } });
    
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('Die Passwörter stimmen nicht überein.')).toBeInTheDocument();
    });
  });

  it('sendet erfolgreiche Passwortaktualisierungsanfrage', async () => {
    render(<UpdatePasswordForm />);
    
    const passwordInput = await screen.findByLabelText('Neues Passwort');
    const confirmPasswordInput = screen.getByLabelText('Passwort bestätigen');
    const submitButton = screen.getByRole('button', { name: /passwort aktualisieren/i });
    
    // Gültiges Passwort eingeben
    fireEvent.change(passwordInput, { target: { value: 'neuesPasswort123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'neuesPasswort123' } });
    
    // Formular absenden
    fireEvent.click(submitButton);
    
    // Prüfen, ob der Loading-Zustand angezeigt wird
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /aktualisiere/i })).toBeInTheDocument();
    });
    
    // Prüfen, ob die Anfrage korrekt gesendet wurde
    expect(mockFetch).toHaveBeenCalledWith('/api/update-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        token: 'test-token-123',
        password: 'neuesPasswort123'
      }),
    });
    
    // Warten, bis die Erfolgsmeldung angezeigt wird
    await waitFor(() => {
      expect(screen.getByText('Dein Passwort wurde erfolgreich aktualisiert!')).toBeInTheDocument();
    });
    
    // Prüfen, ob der Timer zur Weiterleitung gesetzt wurde
    const router = require('next/navigation').useRouter();
    jest.advanceTimersByTime(3000);
    
    await waitFor(() => {
      expect(router.push).toHaveBeenCalledWith('/auth/login');
    });
  });

  it('zeigt Fehlermeldung bei fehlgeschlagener API-Anfrage', async () => {
    // Mock für fehlgeschlagene Anfrage
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'Ungültiger oder abgelaufener Token' })
    });
    
    render(<UpdatePasswordForm />);
    
    const passwordInput = await screen.findByLabelText('Neues Passwort');
    const confirmPasswordInput = screen.getByLabelText('Passwort bestätigen');
    const submitButton = screen.getByRole('button', { name: /passwort aktualisieren/i });
    
    // Gültiges Passwort eingeben
    fireEvent.change(passwordInput, { target: { value: 'neuesPasswort123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'neuesPasswort123' } });
    
    // Formular absenden
    fireEvent.click(submitButton);
    
    // Warten, bis die Fehlermeldung angezeigt wird
    await waitFor(() => {
      expect(screen.getByText('Ungültiger oder abgelaufener Token')).toBeInTheDocument();
    });
  });

  it('fängt netzwerkfehler ab', async () => {
    // Mock für Netzwerkfehler
    mockFetch.mockRejectedValueOnce(new Error('Netzwerkfehler'));
    
    render(<UpdatePasswordForm />);
    
    const passwordInput = await screen.findByLabelText('Neues Passwort');
    const confirmPasswordInput = screen.getByLabelText('Passwort bestätigen');
    const submitButton = screen.getByRole('button', { name: /passwort aktualisieren/i });
    
    // Gültiges Passwort eingeben
    fireEvent.change(passwordInput, { target: { value: 'neuesPasswort123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'neuesPasswort123' } });
    
    // Formular absenden
    fireEvent.click(submitButton);
    
    // Warten, bis die Fehlermeldung angezeigt wird
    await waitFor(() => {
      expect(screen.getByText('Netzwerkfehler')).toBeInTheDocument();
    });
  });
}); 