# myAE – Techstack & Architektur

## 📌 Projektziel

myAE ist ein AI-gestütztes Memory-System, das OpenAI GPT nutzt, um personalisierte tägliche Nachrichten und intelligente Antworten zu liefern. Die Architektur ist serverless-first, optimiert für Vercel und auf Skalierbarkeit ausgelegt.

## 1️⃣ Infrastruktur & Hosting

**Backend: Vercel**

Vercel wird als serverless Deployment-Umgebung genutzt, um das Projekt einfach und performant zu hosten.

### Vorteile:

- Automatisches Scaling, keine Serververwaltung
- Direkte GitHub-Integration für Continuous Deployment
- Unterstützt Next.js nativ (keine manuelle Konfiguration nötig)

## 2️⃣ Tech-Stack & Hauptkomponenten

### 🔹 Programmiersprache & Framework

- **Next.js (App Router, TypeScript)**
  - API-Endpoints liegen in `src/app/api/[route]/route.ts`
  - Unterstützt serverseitige Logik und Middleware direkt
- **TypeScript**
  - Statische Typisierung für sauberen Code und bessere Skalierbarkeit

### 🔹 KI-Integration

- **Haupt-KI: OpenAI GPT (über API)**
  - Modell: GPT-4-Turbo
  - API-Routen in Next.js für Anfragen an OpenAI
- **Claude (nur für Coding in Cursor)**
  - Nicht in myAE integriert, sondern nur für Entwicklungs-Support in Cursor

## 3️⃣ Datenhaltung & Memory Layer

### 🔹 Environment Variables (Secrets)

- Gespeichert in Vercel → Environment Variables
  - `OPENAI_API_KEY` → API-Key für OpenAI
  - `APP_ENV` → "production" oder "development"

### 🔹 Kurzzeit-Speicher

- **Upstash Redis** (serverless key-value storage)
  - Speichert temporäre Kontexte, z. B. Tagesstimmung oder letzte AI-Interaktionen
  - Daten werden nach einer definierten Zeit automatisch gelöscht

### 🔹 Langzeit-Speicher

- **Supabase (PostgreSQL)**
  - Speichert persistente Daten, z. B. User-Präferenzen und langfristige Memory-Daten
  - Open-Source Firebase-Alternative mit API-Support

### 🔹 Semantischer Speicher

- **Pinecone (Vector DB)**
  - Speichert frühere AI-Interaktionen als Vektoren, um den Kontext über Zeit zu bewahren
  - Nutzt semantische Suche, um frühere relevante Antworten abzurufen

## 4️⃣ API-Architektur

### 🔹 API-Endpoints (Serverless)

#### 📍 /api/gpt – Kommuniziert mit OpenAI GPT

**POST-Anfrage:**

```json
{
  "prompt": "Wie funktioniert Bitcoin?"
}
```

**Antwort:**

```json
{
  "result": "Bitcoin ist ein dezentrales digitales Währungssystem..."
}
```

- Implementierung in `src/app/api/gpt/route.ts`
- Nutzt `fetch` für OpenAI API-Aufrufe
- Gibt JSON-Response mit `NextResponse.json()` zurück

## 5️⃣ User-Interfaces & Erweiterungen

### 🔹 E-Mail-Service

- **Resend API / Postmark** für tägliche Mails
  - Generiert personalisierte Inhalte aus OpenAI API
  - Inhalte basieren auf gespeicherten Präferenzen aus Memory-Layer

### 🔹 Telegram-Integration (Zukunft)

- Möglichkeit zur Anbindung eines Telegram-Bots, der myAEs AI-Funktionalität nutzt
- API-Routen könnten Anfragen über Telegram empfangen und Antworten generieren

### 🔹 Web-Frontend (optional)

- Falls nötig, könnte ein Dashboard in Next.js entwickelt werden
- UI zur Verwaltung von Memory-Daten und Personalisierung von AI-Antworten

## 6️⃣ Deployment & DevOps

### 🔹 GitHub → Vercel Deployment-Pipeline

- Code ist in einem privaten GitHub-Repository gespeichert
- Vercel erkennt Commits & baut automatisch neue Versionen
- Branch Protection für main, um ungewollte Änderungen zu verhindern

### 🔹 CI/CD Automatisierung

- GitHub Actions (später möglich) für Tests & QA vor Deployments
- Logging & Monitoring über Vercel Logs

## 📌 Fazit – Zusammenfassung

- Serverless-Backend auf Vercel, optimiert für Skalierung
- Next.js API-Routen mit OpenAI GPT-Integration
- Redis für Kurzzeit-Speicher, PostgreSQL für Langzeit-Daten, Vector DB für semantisches Memory
- Erweiterbar für Telegram-Bots, E-Mail-Automation und Web-Dashboards

Das System kombiniert AI, Memory-Persistenz & Serverless-Optimierung, um ein skalierbares, intelligentes AI-Backend zu bieten.

## 🔖 Nächste Schritte

- Claude kann helfen, die API-Route `/api/gpt` weiter zu optimieren.
- Memory-Integration mit Supabase/Pinecone als nächster Meilenstein.
- Erste Live-Tests mit API-Requests und OpenAI-Response-Tuning.

Falls du Anpassungen brauchst oder weitere technische Details möchtest, lass es mich wissen! 🚀
