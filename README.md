# myAE - AI Memory System

myAE is a personalized AI Memory System for daily insights and automation, built with Next.js and OpenAI GPT.

## 📌 Project Overview

myAE is an AI-powered memory system that uses OpenAI GPT to deliver personalized daily messages and intelligent responses. The architecture is serverless-first, optimized for Vercel, and designed for scalability.

## 🚀 Tech Stack

- **Framework**: Next.js (App Router) with TypeScript
- **AI Integration**: OpenAI GPT-4-Turbo
- **Memory Layers**:
  - **Short-term**: Upstash Redis
  - **Long-term**: Supabase (PostgreSQL)
  - **Semantic**: Pinecone (Vector DB)
- **Deployment**: Vercel
- **DNS & CDN**: Cloudflare

## 🏗️ Architecture

The system is built with a serverless-first approach:

- **API Routes**: Next.js API routes for OpenAI integration
- **Memory System**: Three-tiered memory system (short-term, long-term, semantic)
- **Extensibility**: Support for email notifications, Telegram integration, and web dashboard

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

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.
