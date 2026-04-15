# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)
- **Auth**: bcryptjs for password hashing, random token sessions

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.

## X247 Rewards (artifacts/x247-rewards)

- **Framework**: React + Vite + Tailwind CSS v4
- **Design**: Ultra-premium dark monochrome aesthetic — pure black background, Syne + Poppins fonts, white/gray only (no color accents), glassmorphism cards
- **Hero**: Silk WebGL background (React Three Fiber shader, with CSS radial-gradient fallback when WebGL unavailable) + gradient overlays
- **Pages**: Home (/), Offers (/offers), Partners (/partners)
- **Admin Pages**: Admin Login (/x247-admin-login), Control Panel (/x247-control-panel)
- **Sections**: Hero, How it Works (8-step timeline), Rewards (6 cards in 3-col grid), Dashboard Preview, Verification Policy, Community/Ecosystem, FAQ, Footer
- **Layout**: Section-divider wrapper (rounded-28px card with lateral white edge glow) wraps content sections; GlowLine separators between each section
- **Buttons**: Premium button system (premium-btn, premium-btn-sm/md/lg/ghost) with lateral box-shadow glow, inner radial glow on hover, arrow icons, glassmorphism via `.glass-btn-effect` (backdrop-filter blur)
- **Cursor**: Default browser cursor (AnimatedCursor component exists but is not rendered)
- **Cards**: Dark metallic glass-card (animated rotating gray gradient border), no hover effects
- **Interactive**: TiltCard (subtle 4deg tilt, 0.025 glare), MagneticWrap (0.06 multiplier, minimal movement), parallax hero (fade+translate on scroll)
- **Animations**: Framer Motion fadeUp/scaleIn/stagger/slideLeft/slideRight variants, animated progress bar with shimmer, scroll progress bar, activity feed stagger, floating particles
- **Performance**: Mouse-driven effects use useMotionValue/useSpring (no React state churn), prefers-reduced-motion disables animations/cursor/shimmer
- **Responsive**: Full mobile-first responsive design (390px+ to 1280px+), stacked buttons on mobile, adapted typography/spacing, cursor hidden on touch devices
- **Navbar**: SiteNav component (shared across all pages), fixed position, 60px height, dropdown expands to 350px. When logged in: shows avatar circle with user initials + dropdown (My Account, Settings, Log Out). When not logged in: shows "Get Started" button. Auth state syncs via storage events + polling. Navigation cards: Pages, Quick Links, Account.
- **Chatbot**: AI-powered ChatBot component (global, appears on every page), OpenRouter integration (Llama 4 Scout), streaming SSE responses, partner card previews in responses, context-aware based on current page, premium glassmorphism design
- **Routes**: `/` (Home), `/offers` (Offers), `/partners` (Partners — loads from API), `/partners/:slug` (Partner Detail), `/giveaway` (Contest Hub — Dream11-style contest cards), `/giveaway/:slug` (Giveaway Entry Form for specific contest), `/winners` (Winners Hall of Fame), `/account` (User account — login/register, giveaway history), `/community` (Community page — social links, stats, guidelines), `/x247-admin-login` (Admin Login), `/x247-control-panel` (Admin Dashboard)
- **CSS Theme**: Pure monochrome (black/white/gray), utility classes (glass-card, card-header-area, card-icon-wrap, premium-btn, glass-btn-effect, icon-circle, stat-card, nav-link, section-divider, section-glow-line, glass-pill-badge, premium-badge, floating-particle, cursor-dot/ring/glass, shimmer-bar, scroll-progress-bar) in index.css
- **@property declarations**: --card-border-angle, --btn-border-angle, --hero-text-angle, --cursor-ring-angle (must be outside @layer)
- **Fonts**: Poppins (body text), Syne (headings/display, font-light weight)
- **WebGL**: React Three Fiber + three.js for Silk shader hero background (replaced OGL); ErrorBoundary + WebGL probe fallback

## API Server (artifacts/api-server)

- **Port**: 8080 (frontend Vite proxy: `/api → localhost:8080`)
- **Routes**:
  - `GET /api/partners` — public partner list with stats
  - `POST /api/partners` — create partner (admin-protected)
  - `PUT /api/partners/:id` — update partner (admin-protected)
  - `DELETE /api/partners/:id` — delete partner (admin-protected)
  - `POST /api/partners/:id/click` — track click
  - `POST /api/partners/:id/impression` — track impression
  - `POST /api/partners/:id/form-fill` — track form fill
  - `POST /api/admin/login` — admin login (bcrypt password verification)
  - `POST /api/admin/verify` — verify session token
  - `POST /api/admin/logout` — logout (delete session)
  - `GET /api/admin/analytics` — analytics dashboard data (admin-protected)
  - `POST /api/chat` — AI chatbot (streaming SSE, OpenRouter Llama 4 Scout, context-aware with partner data)
  - `GET /api/giveaway/status` — giveaway spots remaining, max spots, isFull
  - `POST /api/giveaway/enter` — submit giveaway entry (validates partners, age, screenshot, terms); returns entryCode
  - `GET /api/giveaway/check/:code` — check entry code status
  - `POST /api/storage/uploads/request-url` — request presigned upload URL (images only, max 10MB)
  - `GET /api/storage/public-objects/*` — serve public objects
  - `GET /api/storage/objects/*` — serve private objects
  - `GET /api/contests` — list all contests with entry stats
  - `GET /api/contests/:slug` — get contest detail by slug
  - `POST /api/contests` — create contest (admin-protected)
  - `PUT /api/contests/:id` — update contest (admin-protected)
  - `DELETE /api/contests/:id` — delete contest (admin-protected)
  - `POST /api/users/register` — user registration (returns token)
  - `POST /api/users/login` — user login (returns token)
  - `GET /api/users/me` — get current user profile (auth required)
  - `GET /api/users/me/entries` — get user's giveaway entries (auth required)
  - `POST /api/users/logout` — user logout
  - `GET /api/winners` — list all winners with contest names
  - `GET /api/activity/feed` — public activity feed (recent entries + winners, anonymized names)
  - `POST /api/voice/synthesize` — ElevenLabs TTS (membership gated)

## Interactive Components

- **LiveActivityFeed**: Rotating ticker showing recent entries/winners from `/api/activity/feed`
- **SocialProofToast**: Floating toast notifications ("Someone just entered...")
- **AnimatedCounter**: Count-up animation on scroll (used in stats cards)
- **CountdownTimer**: Live contest countdown (compact mode for cards, full mode standalone)
- **ConfettiEffect**: Monochrome particle burst on valid entry code check
- **FAQ Accordion**: Interactive expand/collapse FAQ on Community page
- **Streak Tracker**: Daily visit streak counter in Account dashboard (localStorage-based)

## Database Schema (lib/db)

- **partners**: id, slug, name, tagline, description, category, registrationUrl, accent, badge, badgeSecondary, isActive, isRequired, sortOrder, timestamps
- **clicks**: id, partnerId, ipHash, userAgent, referrer, createdAt
- **impressions**: id, partnerId, ipHash, createdAt
- **form_fills**: id, partnerId, ipHash, createdAt
- **admin_users**: id, username, passwordHash (bcrypt), createdAt
- **admin_sessions**: id, token, adminId, expiresAt, createdAt
- **conversations**: id, title, createdAt, updatedAt
- **messages**: id, conversationId, role, content, createdAt
- **giveaway_entries**: id, contestId, userId, fullName, email, phone, age, city, completedPartners (JSON array of partner IDs), screenshotConfirmed, screenshotUrl, agreedToTerms, ipHash, entryCount, entryCode (X247-XXXX-XXXX format), isAnonymous, createdAt
- **contests**: id, name, description, prize, prizeValue, maxSpots, status (active/upcoming/completed), imageUrl, slug (unique), partnerIds (JSON array of linked partner IDs), createdAt, endsAt
- **users**: id, fullName, email (unique), phone, passwordHash, city, createdAt
- **user_sessions**: id, token (unique), userId, expiresAt, createdAt
- **winners**: id, contestId, entryId, winnerName, winnerCity, prize, entryCode, announcedAt

## Admin Credentials

- Username: `ceo@prshant.dev`
- Password: `Admin@0007`
- Login URL: `/x247-admin-login`
- Dashboard: `/x247-control-panel`

## DotGrid Settings

- dotSize=2, gap=28, baseColor=#1a1a1a, activeColor=#666666
