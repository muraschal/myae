# myAE - AI Memory System

myAE is a personalized AI Memory System for daily insights and automation, built with Next.js and OpenAI GPT.

## 📌 Project Overview

myAE is an AI-powered memory system that uses OpenAI GPT to deliver personalized daily messages and intelligent responses. The architecture is serverless-first, optimized for Vercel, and designed for scalability.

## 🚀 Tech Stack

- **Framework**: Next.js (App Router) with TypeScript
  - API endpoints located in `src/app/api/[route]/route.ts`
  - Direct support for server-side logic and middleware
  - TypeScript for static typing and better code maintainability
- **AI Integration**: 
  - OpenAI GPT-4-Turbo for core functionality
  - API routes in Next.js for OpenAI requests
  - Claude (only used for development support in Cursor, not integrated in myAE)
- **Memory Layers**:
  - **Short-term**: Upstash Redis (serverless key-value storage)
    - Stores temporary contexts like daily mood or recent AI interactions
    - Data is automatically deleted after a defined period
  - **Long-term**: Supabase (PostgreSQL)
    - Stores persistent data like user preferences and long-term memory data
    - Open-source Firebase alternative with API support
  - **Semantic**: Pinecone (Vector DB)
    - Stores previous AI interactions as vectors to preserve context over time
    - Uses semantic search to retrieve previous relevant answers
- **Deployment**: Vercel
  - Automatic scaling, no server management
  - Direct GitHub integration for continuous deployment
  - Native Next.js support (no manual configuration needed)
- **DNS & CDN**: Cloudflare

## 🏗️ Architecture

The system is built with a serverless-first approach:

### API Routes

- **Next.js API routes for OpenAI integration**
  - `/api/gpt` – Communicates with OpenAI GPT
  - Uses `fetch` for OpenAI API calls
  - Returns JSON responses with `NextResponse.json()`

#### Example API Usage

**POST Request to `/api/gpt`:**

```json
{
  "prompt": "How does Bitcoin work?"
}
```

**Response:**

```json
{
  "result": "Bitcoin is a decentralized digital currency system..."
}
```

### Memory System

- **Three-tiered memory system**:
  - Short-term (Redis): For temporary context and recent interactions
  - Long-term (PostgreSQL): For persistent user data and preferences
  - Semantic (Vector DB): For context-aware retrieval of past interactions

### Environment Variables

- **Stored in Vercel → Environment Variables**
  - `OPENAI_API_KEY` → API key for OpenAI
  - `APP_ENV` → "production" or "development"

### Extensibility

- **Email Service**: Resend API / Postmark for daily emails
  - Generates personalized content from OpenAI API
  - Content based on stored preferences from memory layer
- **Telegram Integration** (future): 
  - Possibility to connect a Telegram bot that uses myAE's AI functionality
  - API routes could receive requests via Telegram and generate responses
- **Web Frontend** (optional):
  - Dashboard in Next.js for managing memory data and personalizing AI responses

## 📡 API Documentation

myAE provides several API endpoints for interacting with the AI memory system:

### `/api/gpt` - Main GPT Interaction

**Method:** POST

**Description:** Send prompts to OpenAI GPT and receive AI-generated responses.

**Request Body:**
```json
{
  "prompt": "string",           // Required: The prompt to send to GPT
  "context": "string",          // Optional: Additional context for the prompt
  "temperature": number,        // Optional: Controls randomness (0.0-1.0, default: 0.7)
  "max_tokens": number,         // Optional: Maximum response length (default: 500)
  "stream": boolean             // Optional: Enable streaming response (default: false)
}
```

**Response:**
```json
{
  "result": "string",           // The AI-generated response
  "tokens": {                   // Token usage information
    "prompt": number,
    "completion": number,
    "total": number
  },
  "id": "string"                // Unique identifier for this interaction
}
```

**Error Response:**
```json
{
  "error": "string",            // Error message
  "code": "string"              // Error code
}
```

### `/api/memory/store` - Store Memory

**Method:** POST

**Description:** Store information in the memory system.

**Request Body:**
```json
{
  "content": "string",          // Required: Content to store
  "type": "string",             // Required: Type of memory (e.g., "note", "preference")
  "tags": ["string"],           // Optional: Tags for categorization
  "ttl": number                 // Optional: Time-to-live in seconds (for short-term memory)
}
```

**Response:**
```json
{
  "id": "string",               // Unique identifier for the stored memory
  "success": boolean
}
```

### `/api/memory/retrieve` - Retrieve Memory

**Method:** POST

**Description:** Retrieve information from the memory system.

**Request Body:**
```json
{
  "query": "string",            // Required: Search query
  "type": "string",             // Optional: Filter by memory type
  "tags": ["string"],           // Optional: Filter by tags
  "limit": number               // Optional: Maximum number of results (default: 10)
}
```

**Response:**
```json
{
  "results": [
    {
      "id": "string",
      "content": "string",
      "type": "string",
      "tags": ["string"],
      "created_at": "string",
      "relevance_score": number
    }
  ],
  "count": number
}
```

### `/api/email/subscribe` - Email Subscription

**Method:** POST

**Description:** Subscribe to daily AI-generated emails.

**Request Body:**
```json
{
  "email": "string",            // Required: Email address
  "preferences": {              // Optional: Content preferences
    "topics": ["string"],
    "frequency": "string",      // "daily", "weekly", etc.
    "time": "string"            // Preferred delivery time
  }
}
```

**Response:**
```json
{
  "success": boolean,
  "message": "string"
}
```

### Authentication

All API endpoints (except public ones) require authentication using an API key:

```
Authorization: Bearer YOUR_API_KEY
```

API keys can be generated in the user dashboard or through the `/api/auth/key` endpoint.

## 🛠️ Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy `.env.example` to `.env.local` and fill in your API keys
4. Run the development server:
   ```bash
   npm run dev
   ```
5. Open [http://localhost:3000](http://localhost:3000) in your browser

## 📦 Dependencies

- `@upstash/redis`: For short-term memory storage
- `@supabase/supabase-js`: For long-term memory storage
- `@pinecone-database/pinecone`: For semantic memory storage
- `eventsource-parser`: For streaming OpenAI responses

## 🚢 Deployment & DevOps

### GitHub → Vercel Deployment Pipeline

- Code stored in a private GitHub repository
- Vercel detects commits & automatically builds new versions
- Branch protection for main to prevent unwanted changes

### CI/CD Automation

- GitHub Actions (future possibility) for tests & QA before deployments
- Logging & monitoring via Vercel Logs

## 💡 Use Cases

- **Daily Personalized Messages**: Receive AI-generated insights based on your preferences and past interactions
- **Memory-Enhanced Responses**: AI responses that remember your previous conversations and preferences
- **Multi-Channel Access**: Access your AI memory system via email, Telegram (future), or web interface

## 🔖 Next Steps

- Optimize the API route `/api/gpt` further
- Memory integration with Supabase/Pinecone as the next milestone
- First live tests with API requests and OpenAI response tuning
- Implement email notification system
- Develop Telegram bot integration

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.
