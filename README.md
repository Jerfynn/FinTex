<div align="center">
  <img width="1200" height="475" alt="FinTex Banner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
  
  <h1>🚀 FinTex</h1>
  <p><b>A Full-Stack, Real-Time Messaging & Social Platform</b></p>
</div>

## 📖 Overview

Welcome to **FinTex**, a modern, high-performance real-time messaging and social platform engineered to deliver a seamless and secure communication experience. Built with a robust full-stack architecture, FinTex bridges the gap between instant messaging reliability and elegant user interface design, making it the perfect foundation for next-generation chat applications.

At its core, FinTex provides a highly interactive Single Page Application (SPA) powered by React 19, Vite, and Tailwind CSS v4. The frontend is meticulously crafted to offer an intuitive user experience, enhanced by fluid Framer Motion animations and crisp Lucide icons. Users can effortlessly manage their social graph—seamlessly sending, accepting, or declining friend requests—while navigating through a dedicated friends directory, customizable personal profiles, granular notification settings, and detailed contact information panels.

Under the hood, the application is driven by a powerful Node.js and Express backend. The real-time messaging engine leverages WebSockets via `Socket.io`, enabling full-duplex, bi-directional event routing. This architecture guarantees instant message delivery, live connection tracking, active status updates, and real-time read receipts. Security is a top priority; FinTex implements a frictionless passwordless authentication flow, utilizing a 6-digit email One-Time Password (OTP) system that issues secure, stateless JSON Web Tokens (JWTs).

To ensure reliability and scale, all chat histories, user metadata, and complex friendship relationships are persisted in a relational PostgreSQL database, efficiently queried using the strictly-typed Drizzle ORM. Finally, FinTex is built for the future by integrating Google's Gemini GenAI SDK, paving the way for advanced artificial intelligence features. Whether you are looking to chat with friends or explore modern web development patterns, FinTex stands out as a comprehensive, production-ready messaging hub.

View the AI Studio configuration for this app: AI Studio Project

## ✨ Key Features

- **Real-Time WebSocket Engine**: Instant messaging with active connection tracking, event-driven message routing, and live read receipts using `Socket.io`.
- **Passwordless OTP Authentication**: Secure, 6-digit one-time password (OTP) email verification flow issuing stateless JWTs.
- **Social Graph & Friendships**: Complete friend request lifecycle (Send, Accept, Decline, Block) handling mutual relationships.
- **Persistent Chat History**: Relational PostgreSQL data layer retaining complex message structures (Text, Voice, Media), efficiently queried with Drizzle ORM.
- **Modern React UI**: Fluid interfaces built with Tailwind CSS, Lucide Icons, and Framer Motion.
- **AI Integrated**: Hooked up to Google's Gemini GenAI SDK for advanced intelligence features.

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS v4, Framer Motion
- **Backend**: Node.js, Express, Socket.io, JWT Authentication
- **Database**: PostgreSQL, Drizzle ORM
- **AI & APIs**: `@google/genai` (Gemini)

## 🚀 Getting Started

### Prerequisites
- **Node.js** (v18+ recommended)
- **PostgreSQL** instance running locally or in the cloud.

### Installation & Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Environment Configuration:**
   Create a `.env.local` file in the root directory and configure the necessary connection secrets:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   DATABASE_URL=postgresql://user:password@localhost:5432/fintex
   JWT_SECRET=your_super_secret_jwt_key
   ```

3. **Initialize the Database:**
   Push the Drizzle schema to your PostgreSQL database to construct the relational tables (`users`, `otp_tokens`, `friendships`, `messages`):
   ```bash
   npx drizzle-kit push
   ```

4. **Run the Development Server:**
   This boots up both the Vite frontend middleware and the Express backend concurrently.
   ```bash
   npm run dev
   ```
   The application will be live at `http://localhost:3000`.
