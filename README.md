# myÆ - AI Memory System

myÆ ist ein personalisiertes KI-Gedächtnissystem für tägliche Erkenntnisse und Automatisierung, entwickelt mit Next.js und OpenAI GPT.

## 📌 Projektübersicht

myÆ ist ein KI-gesteuertes Gedächtnissystem, das OpenAI GPT verwendet, um personalisierte tägliche Nachrichten und intelligente Antworten zu liefern. Die Architektur ist serverless-first, für Vercel optimiert und für Skalierbarkeit konzipiert.

## 📑 Inhaltsverzeichnis

- [Technologie-Stack](#-technologie-stack)
  - [Core Framework](#core-framework)
  - [Authentifizierung](#authentifizierung)
  - [KI-Integration](#ki-integration)
  - [Gedächtnisschichten](#gedächtnisschichten)
  - [E-Mail-Service](#e-mail-service)
  - [Frontend](#frontend)
  - [Deployment](#deployment)
- [Architektur](#-architektur)
  - [Verzeichnisstruktur](#verzeichnisstruktur)
  - [API-Routen](#api-routen)
  - [Gedächtnissystem](#gedächtnissystem)
  - [Authentifizierungssystem](#authentifizierungssystem)
  - [E-Mail-System](#e-mail-system)
  - [Umgebungsvariablen](#umgebungsvariablen)
- [Datenfluss](#-datenfluss)
  - [KI-Anfrage-Workflow](#ki-anfrage-workflow)
  - [Authentifizierungs-Workflow](#authentifizierungs-workflow)
- [Testen](#-testen)
- [Deployment](#-deployment)
- [API-Dokumentation](#-api-dokumentation)
- [Sicherheitsüberlegungen](#-sicherheitsüberlegungen)
- [Mitwirken](#-mitwirken)
- [Lizenz](#-lizenz)
- [Kontakt](#-kontakt)

## 🚀 Technologie-Stack

### Core Framework

- **Next.js 15.2.0 (App Router)** mit TypeScript
  - Verwendet den modernen App Router für verbesserte Routing-Funktionen
  - API-Endpunkte in `src/app/api/[route]/route.ts` nach Next.js 13+ Konvention
  - Server-Komponenten für verbesserte Performance und SEO
  - Client-Komponenten mit 'use client' Direktive für interaktive UI-Elemente
  - TypeScript für statische Typisierung und bessere Code-Wartbarkeit

### Authentifizierung

- **Supabase Auth**
  - Implementiert in `src/lib/supabase.ts`
  - Verwendet `@supabase/supabase-js` und `@supabase/ssr` für serverseitige Rendering-Unterstützung
  - Authentifizierungsfluss:
    1. Benutzer-Login über `signInWithEmail` Funktion
    2. Session-Management mit Cookies durch Supabase SSR
    3. Middleware-basierte Routenschutz in `src/middleware.ts`
    4. Echtzeit-Authentifizierungsstatus mit `onAuthStateChange` Event-Listener
  - Unterstützt Email/Passwort-Authentifizierung und Passwort-Reset

### KI-Integration

- **OpenAI GPT-4o**
  - Implementiert in `src/app/api/gpt/route.ts`
  - Verwendet die offizielle OpenAI Node.js SDK (v4.86.1)
  - Konfigurierbare Parameter:
    - `temperature`: Steuert die Zufälligkeit der Antworten (0.0-1.0)
    - `max_tokens`: Maximale Antwortlänge
    - `context`: Optionaler Systemkontext für die Anfrage
  - Fehlerbehandlung mit detaillierten Fehlercodes und Nachrichten
  - Token-Nutzungsverfolgung für Verbrauchsüberwachung

### Gedächtnisschichten

#### Kurzzeit-Gedächtnis

- **Upstash Redis** (Serverless Key-Value Storage)
  - Implementiert in `src/lib/redis.ts` und `src/lib/memory.ts`
  - Verwendet `@upstash/redis` SDK für REST-API-Zugriff
  - Speichert temporäre Kontexte wie:
    - Tagesstimmung (`memory:mood:*`)
    - Kürzliche KI-Interaktionen (`memory:interaction:*`)
    - Notizen (`memory:note:*`)
    - Benutzereinstellungen (`memory:preference:*`)
  - Time-to-Live (TTL) Mechanismus:
    - Interaktionen: 24 Stunden (86400 Sekunden)
    - Stimmungen: 7 Tage (604800 Sekunden)
    - Anpassbare TTL für andere Gedächtnistypen
  - Schlüsselstruktur: `memory:[type]:[timestamp]-[random]`

#### Langzeit-Gedächtnis

- **Supabase PostgreSQL**
  - Implementiert in `src/lib/supabase.ts`
  - Verwendet für:
    - Benutzerprofile und -einstellungen
    - Persistente Gedächtnisdaten
    - Authentifizierungsdaten
  - Tabellenschema:
    - `users`: Erweiterte Benutzerprofile
    - `memories`: Langzeit-Gedächtnisdaten mit Benutzer-Referenz
    - `preferences`: Benutzerspezifische Einstellungen

### E-Mail-Service

- **Resend**
  - Implementiert in `src/lib/email.ts`
  - Verwendet die offizielle Resend SDK (v4.1.2)
  - Funktionen:
    - `sendResponseEmail`: Sendet KI-Antworten per E-Mail
    - HTML-Formatierung mit responsivem Design
    - Fehlerbehandlung und Logging
  - Standardempfänger konfigurierbar
  - Absender: `MyAE <noreply@myae.rapold.io>`

### Frontend

- **React 19.0.0**
  - Client-Komponenten in `src/components/`
  - Authentifizierungskomponenten:
    - `LoginForm.tsx`: Benutzeranmeldung mit Statusanzeige
    - `Header.tsx`: Dynamische Navigation basierend auf Authentifizierungsstatus
  - Verwendet Next.js App Router für Routing
  - Echtzeit-Authentifizierungsstatus-Updates mit Supabase Auth Listener

- **TailwindCSS 4**
  - Utility-First CSS-Framework
  - Responsive Design für alle Komponenten
  - Dark Mode Unterstützung mit `dark:` Präfix-Klassen

### Deployment

- **Vercel**
  - Automatische Skalierung, kein Server-Management
  - Direkte GitHub-Integration für kontinuierliche Bereitstellung
  - Native Next.js-Unterstützung (keine manuelle Konfiguration erforderlich)
  - Umgebungsvariablen in Vercel Dashboard konfiguriert

- **DNS & CDN**: Cloudflare
  - Domain: myae.rapold.io
  - SSL/TLS-Verschlüsselung
  - Edge-Caching für verbesserte Performance

## 🏗️ Architektur

Das System ist mit einem Serverless-First-Ansatz aufgebaut:

### Verzeichnisstruktur

```
myae/
├── public/                  # Statische Assets
├── src/
│   ├── app/                 # Next.js App Router
│   │   ├── api/             # API-Routen
│   │   │   ├── gpt/         # OpenAI GPT-Integration
│   │   │   ├── memory/      # Gedächtnis-API
│   │   │   ├── email-test/  # E-Mail-Test-Endpunkt
│   │   │   └── redis-test/  # Redis-Test-Endpunkt
│   │   ├── auth/            # Authentifizierungsseiten
│   │   └── page.tsx         # Startseite
│   ├── components/          # React-Komponenten
│   │   ├── auth/            # Authentifizierungskomponenten
│   │   └── navigation/      # Navigationskomponenten
│   ├── lib/                 # Bibliotheken und Dienstleistungen
│   │   ├── supabase.ts      # Supabase-Client und Authentifizierung
│   │   ├── redis.ts         # Redis-Client
│   │   ├── email.ts         # E-Mail-Service
│   │   ├── memory.ts        # Gedächtnis-Manager
│   │   └── memory-factory.ts # Gedächtnis-Factory
│   └── middleware.ts        # Next.js Middleware für Authentifizierung
├── .env.local               # Lokale Umgebungsvariablen
├── next.config.js           # Next.js-Konfiguration
├── package.json             # Projektabhängigkeiten
└── tsconfig.json            # TypeScript-Konfiguration
```

### API-Routen

#### OpenAI GPT-Integration

- **`/api/gpt`** – Kommuniziert mit OpenAI GPT und sendet Antworten per E-Mail
  - **Implementierung**: `src/app/api/gpt/route.ts`
  - **Methode**: POST
  - **Request-Body**:
    ```typescript
    {
      prompt: string;           // Erforderlich: Die Anfrage an GPT
      context?: string;         // Optional: Zusätzlicher Kontext für die Anfrage
      temperature?: number;     // Optional: Steuert die Zufälligkeit (0.0-1.0, Standard: 0.7)
      max_tokens?: number;      // Optional: Maximale Antwortlänge (Standard: 500)
    }
    ```
  - **Response**:
    ```typescript
    {
      result: string;           // Die KI-generierte Antwort
      tokens: {                 // Token-Nutzungsinformationen
        prompt: number;
        completion: number;
        total: number;
      };
      id: string;               // Eindeutige Kennung für diese Interaktion
    }
    ```
  - **Fehlerbehandlung**:
    - Detaillierte Fehlertypisierung für OpenAI-Fehler
    - HTTP-Statuscodes entsprechend dem Fehlertyp
    - Strukturierte Fehlerantworten mit Code und Nachricht

#### Gedächtnis-System

- **`/api/memory/store`** – Speichert Informationen im Gedächtnissystem
  - **Implementierung**: `src/app/api/memory/store/route.ts`
  - **Methode**: POST
  - **Request-Body**:
    ```typescript
    {
      content: string;          // Erforderlich: Zu speichernder Inhalt
      type: 'interaction' | 'mood' | 'preference' | 'note'; // Erforderlich: Gedächtnistyp
      userId?: string;          // Optional: Benutzer-ID
      metadata?: Record<string, any>; // Optional: Zusätzliche Metadaten
      ttl?: number;             // Optional: Time-to-Live in Sekunden
    }
    ```
  - **Response**:
    ```typescript
    {
      id: string;               // Eindeutige Kennung für das gespeicherte Gedächtnis
      success: boolean;
      memory: Memory;           // Das vollständige Gedächtnisobjekt
    }
    ```

- **`/api/memory/retrieve`** – Ruft Informationen aus dem Gedächtnissystem ab
  - **Implementierung**: `src/app/api/memory/retrieve/route.ts`
  - **Methode**: POST
  - **Request-Body**:
    ```typescript
    {
      type: 'interaction' | 'mood' | 'preference' | 'note'; // Erforderlich: Gedächtnistyp
      limit?: number;           // Optional: Maximale Anzahl der Ergebnisse (Standard: 10)
    }
    ```
  - **Response**:
    ```typescript
    {
      memories: Memory[];       // Array von Gedächtnisobjekten
      count: number;            // Anzahl der zurückgegebenen Gedächtnisse
    }
    ```

### Gedächtnissystem

Das Gedächtnissystem verwendet einen mehrschichtigen Ansatz:

#### MemoryManager (src/lib/memory.ts)

- **Hauptklasse**: `MemoryManager`
  - **Methoden**:
    - `storeMemory`: Speichert ein neues Gedächtnis in Redis
    - `getMemory`: Ruft ein Gedächtnis anhand seiner ID ab
    - `getRecentMemories`: Ruft die neuesten Gedächtnisse eines bestimmten Typs ab
    - `deleteMemory`: Löscht ein Gedächtnis anhand seiner ID
    - `storeInteraction`: Speichert eine Interaktion mit der KI
    - `getRecentInteractions`: Ruft die letzten Interaktionen ab
    - `storeMood`: Speichert eine Tagesstimmung
    - `getRecentMoods`: Ruft die letzten Stimmungen ab

- **Gedächtnistypen**:
  - `interaction`: KI-Interaktionen (TTL: 24 Stunden)
  - `mood`: Tagesstimmungen (TTL: 7 Tage)
  - `preference`: Benutzereinstellungen (kein Standard-TTL)
  - `note`: Benutzernotizen (kein Standard-TTL)

#### MemoryFactory (src/lib/memory-factory.ts)

- **Zweck**: Abstraktionsschicht für verschiedene Speicherimplementierungen
- **Methoden**:
  - `storeMemory`: Speichert ein Gedächtnis im entsprechenden Speicher
  - `getMemory`: Ruft ein Gedächtnis aus dem entsprechenden Speicher ab
  - `getRecentMemories`: Ruft die neuesten Gedächtnisse ab
  - `deleteMemory`: Löscht ein Gedächtnis

### Authentifizierungssystem

#### Supabase Auth (src/lib/supabase.ts)

- **Hauptfunktionen**:
  - `getCurrentUser`: Prüft, ob ein Benutzer eingeloggt ist
  - `signInWithEmail`: Meldet einen Benutzer mit E-Mail und Passwort an
  - `signUpWithEmail`: Registriert einen neuen Benutzer
  - `signOut`: Meldet den aktuellen Benutzer ab
  - `resetPassword`: Fordert einen Passwort-Reset an

#### Middleware (src/middleware.ts)

- **Zweck**: Routenschutz und Authentifizierungsprüfung
- **Funktionalität**:
  - Prüft den Authentifizierungsstatus für jede Anfrage
  - Leitet nicht authentifizierte Benutzer zur Login-Seite um
  - Leitet authentifizierte Benutzer von Auth-Seiten weg
  - Speichert die ursprüngliche URL für Weiterleitung nach der Anmeldung
  - Fehlerbehandlung mit Auth-Fehler-Cookies

### E-Mail-System

#### Resend Integration (src/lib/email.ts)

- **Hauptfunktion**: `sendResponseEmail`
  - **Parameter**:
    - `prompt`: Die Anfrage des Benutzers
    - `result`: Die Antwort des KI-Assistenten
    - `recipient`: (optional) E-Mail-Empfänger
  - **Rückgabe**:
    ```typescript
    {
      success: boolean;
      data?: any;               // Antwortdaten bei Erfolg
      error?: string;           // Fehlermeldung bei Misserfolg
    }
    ```
  - **E-Mail-Format**:
    - Betreff: "KI-Antwort: [gekürzte Anfrage]"
    - HTML-Formatierung mit separaten Abschnitten für Anfrage und Antwort
    - Responsives Design für verschiedene E-Mail-Clients

### Umgebungsvariablen

Die Anwendung verwendet folgende Umgebungsvariablen:

```
# OpenAI API
OPENAI_API_KEY=sk_...

# Umgebung
APP_ENV=development|production

# Upstash Redis (Kurzzeit-Gedächtnis)
UPSTASH_REDIS_REST_URL=https://...
UPSTASH_REDIS_REST_TOKEN=AZ...

# Resend (E-Mail-Service)
RESEND_API_KEY=re_...

# Supabase (Auth & Datenbank)
NEXT_PUBLIC_SUPABASE_URL=https://...
NEXT_PUBLIC_SUPABASE_ANON_TOKEN=eyJ...
```

## 🔄 Datenfluss

### KI-Anfrage-Workflow

1. **Benutzer sendet eine Anfrage**
   - Frontend sendet POST-Anfrage an `/api/gpt`
   - Request enthält `prompt` und optionale Parameter

2. **API-Route verarbeitet die Anfrage**
   - Validiert die Eingabeparameter
   - Bereitet die Nachrichten für OpenAI vor
   - Fügt Systemkontext hinzu (Standard oder benutzerdefiniert)

3. **OpenAI API-Aufruf**
   - Sendet die Anfrage an OpenAI GPT-4o
   - Wartet auf die Antwort
   - Erfasst Token-Nutzungsdaten

4. **Speichern der Interaktion**
   - Speichert die Anfrage und Antwort im Kurzzeit-Gedächtnis
   - Verwendet Redis mit 24-Stunden-TTL

5. **E-Mail-Versand**
   - Formatiert die Antwort als HTML-E-Mail
   - Sendet die E-Mail über Resend API
   - Protokolliert den Versandstatus

6. **Antwort an den Benutzer**
   - Sendet die KI-Antwort, Token-Nutzung und Interaktions-ID zurück
   - Bei Fehlern: Sendet strukturierte Fehlerinformationen

### Authentifizierungs-Workflow

1. **Benutzer öffnet die Anwendung**
   - Middleware prüft den Authentifizierungsstatus
   - Leitet bei Bedarf zur Login-Seite um

2. **Benutzer meldet sich an**
   - Sendet E-Mail und Passwort an Supabase Auth
   - Bei Erfolg: Setzt Cookies für die Sitzung
   - Bei Fehler: Zeigt Fehlermeldung an

3. **Nach der Anmeldung**
   - Header-Komponente aktualisiert die Navigation
   - Middleware leitet zur ursprünglichen URL oder Startseite um

4. **Sitzungsverwaltung**
   - Supabase Auth verwaltet die Sitzung über Cookies
   - Header-Komponente überwacht Authentifizierungsänderungen in Echtzeit

## 🧪 Testen

### API-Endpunkte testen

#### GPT-Endpunkt testen

```bash
curl -X POST http://localhost:3000/api/gpt \
  -H "Content-Type: application/json" \
  -d '{"prompt":"Wie funktioniert Bitcoin?"}'
```

#### Gedächtnis-Speicher testen

```bash
curl -X POST http://localhost:3000/api/memory/store \
  -H "Content-Type: application/json" \
  -d '{"content":"Dies ist ein Test","type":"note"}'
```

#### E-Mail-Test

```bash
curl -X GET http://localhost:3000/api/email-test
```

## 🚀 Deployment

### Vercel Deployment

1. **GitHub-Repository verbinden**
   - Verbinde dein GitHub-Repository mit Vercel
   - Wähle das Next.js-Framework

2. **Umgebungsvariablen konfigurieren**
   - Füge alle erforderlichen Umgebungsvariablen hinzu
   - Markiere sensible Variablen als verschlüsselt

3. **Deployment starten**
   - Vercel baut und deployt die Anwendung automatisch
   - Jeder Push auf den Hauptzweig löst ein neues Deployment aus

### Lokale Entwicklung

1. **Repository klonen**
   ```bash
   git clone https://github.com/yourusername/myae.git
   cd myae
   ```

2. **Abhängigkeiten installieren**
   ```bash
   npm install
   ```

3. **Umgebungsvariablen konfigurieren**
   - Erstelle eine `.env.local`-Datei mit allen erforderlichen Variablen

4. **Entwicklungsserver starten**
   ```bash
   npm run dev
   ```

5. **Anwendung öffnen**
   - Öffne [http://localhost:3000](http://localhost:3000) im Browser

## 📚 API-Dokumentation

Siehe [API-Dokumentation](#-api-documentation) im Hauptteil der README für detaillierte API-Endpunktbeschreibungen.

## 🔒 Sicherheitsüberlegungen

### Authentifizierung

- Verwendet Supabase Auth für sichere Benutzerauthentifizierung
- Passwörter werden niemals im Klartext gespeichert
- Sitzungen werden über sichere Cookies verwaltet

### API-Schlüssel

- Alle API-Schlüssel werden als Umgebungsvariablen gespeichert
- OpenAI und andere sensible Schlüssel sind nur serverseitig verfügbar
- Supabase anon-Schlüssel ist der einzige clientseitig verfügbare Schlüssel

### Datenschutz

- Benutzerinformationen werden sicher in Supabase gespeichert
- Kurzzeit-Gedächtnis in Redis hat automatische Ablaufzeiten
- E-Mails werden nur an verifizierte Empfänger gesendet

## 🤝 Mitwirken

Beiträge sind willkommen! Bitte folge diesen Schritten:

1. Forke das Repository
2. Erstelle einen Feature-Branch (`git checkout -b feature/amazing-feature`)
3. Committe deine Änderungen (`git commit -m 'Add amazing feature'`)
4. Pushe zum Branch (`git push origin feature/amazing-feature`)
5. Öffne einen Pull Request

## 📄 Lizenz

Dieses Projekt ist unter der MIT-Lizenz lizenziert - siehe die [LICENSE](LICENSE) Datei für Details.

## 📞 Kontakt

Marcel Rapold - [@marcelrapold](https://twitter.com/marcelrapold) - marcel@marcelrapold.com

Projekt-Link: [https://github.com/muraschal/myae](https://github.com/muraschal/myae)