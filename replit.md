# Workspace

## Overview
This project is a pnpm workspace monorepo using TypeScript, designed to build a comprehensive rewards platform called X247 Rewards. The platform features an ultra-premium dark monochrome aesthetic with advanced UI/UX elements, including WebGL backgrounds and glassmorphism. It offers user accounts, a sophisticated referral program, contest management, and an AI-powered chatbot. The project aims to provide a highly interactive and engaging user experience, leveraging modern web technologies.

## User Preferences
I prefer iterative development and want to be asked before making major architectural changes or introducing new external dependencies. For UI/UX, maintain the ultra-premium dark monochrome aesthetic with pure black backgrounds, Syne and Poppins fonts, white/gray color palette, and glassmorphism cards. Do not introduce color accents. Ensure full mobile-first responsiveness.

## System Architecture
The system is built as a pnpm monorepo with separate packages for the API server and the frontend.

**Frontend (X247 Rewards):**
- **Framework**: React, Vite, Tailwind CSS v4.
- **Design System**: Ultra-premium dark monochrome aesthetic with pure black background, Syne and Poppins fonts, white/gray only (no color accents), and glassmorphism cards.
- **Core UI Components**:
    - **Hero**: Silk WebGL background (React Three Fiber shader) with CSS radial-gradient fallback.
    - **Buttons**: Premium button system with lateral box-shadow glow, inner radial glow on hover, and glassmorphism via `.glass-btn-effect`.
    - **Cards**: Dark metallic glass-cards with animated rotating gray gradient borders.
    - **Interactive Elements**: TiltCard, MagneticWrap, parallax hero.
    - **Animations**: Framer Motion for fadeUp/scaleIn/stagger/slideLeft/slideRight, animated progress bars, floating particles. Performance-optimized with `useMotionValue`/`useSpring`.
- **Pages**: Home, Offers, Partners, Admin Login, Control Panel, Contest Hub, Giveaway Entry Form, Winners Hall of Fame, User Account (Login/Register, Dashboard, Profile Editor, Badges, Membership, Giveaway History), Public User Profile, Community, Referral Partner Program, Referral Dashboard.
- **User Profile System**: UserProfileCard component with avatar/initials, name, verified badge, bio, stats, and share button. Public profiles at `/profile/:slug`. Eight earnable badges.
- **Account Dashboard**: Tab-based layout (Overview, Profile, Subscription, Entries, Settings) with stats cards, sparkline overlays, entry history bar chart, activity map heatmap, quick actions, recent activity, and membership card.
- **Notifications**: Bell icon with unread count, dropdown panel, toast notifications, streak celebration overlay. Persisted in localStorage.
- **Charts**: Custom SVG mini chart components (Sparkline, MiniBarChart, UsageGauge, ActivityHeatmap) for lightweight visualizations.
- **Membership Tiers**: Silver, Gold, Black with varying entry limits and features (e.g., chat, verified badge, concierge support).
- **Theme System**: 7 selectable themes (Metallic Glass, Frosted Aurora, Brushed Steel, Smoky Glass, Noir Minimal, Liquid Dark, Pristine Light) with `ThemeContext` and `localStorage` persistence.
- **CSS**: Pure monochrome utility classes and `@property` declarations for dynamic styling.

**API Server:**
- **Framework**: Express 5.
- **Authentication**: `bcryptjs` for password hashing, random token sessions.
- **Routes**:
    - **Partners**: CRUD operations, click/impression/form-fill tracking.
    - **Admin**: Login, session verification, logout, analytics.
    - **Chat**: AI chatbot (streaming SSE, context-aware).
    - **Giveaway**: Status, entry submission, entry code checking.
    - **Storage**: Presigned upload URLs, public/private object serving.
    - **Contests**: CRUD operations, contest details.
    - **Users**: Registration, login, profile management, entries.
    - **Winners**: Listing.
    - **Activity Feed**: Public feed of recent entries/winners.
    - **Voice**: ElevenLabs TTS integration.
    - **Referral**: Partner application, user stats, click tracking, conversion tracking, admin management.
    - **Notifications**: VAPID key retrieval, user notification listing, read/unread management, push subscription management, preference updates.

**Database Schema (PostgreSQL + Drizzle ORM):**
- **Entities**: `partners`, `clicks`, `impressions`, `form_fills`, `admin_users`, `admin_sessions`, `conversations`, `messages`, `giveaway_entries`, `contests`, `users`, `user_sessions`, `winners`, `referral_partners`, `referral_clicks`, `referral_conversions`, `notifications`, `push_subscriptions`, `notification_preferences`.

## External Dependencies
- **Monorepo Tool**: pnpm workspaces
- **Node.js**: 24
- **TypeScript**: 5.9
- **API Framework**: Express 5
- **Database**: PostgreSQL
- **ORM**: Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API Codegen**: Orval (from OpenAPI spec)
- **Build Tool**: esbuild (CJS bundle)
- **Auth**: bcryptjs
- **UI Framework**: React
- **Styling**: Tailwind CSS v4
- **WebGL**: React Three Fiber, three.js
- **Animations**: Framer Motion
- **AI Chatbot**: OpenRouter (Llama 4 Scout)
- **Text-to-Speech**: ElevenLabs