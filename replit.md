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

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.

## X247 Rewards (artifacts/x247-rewards)

- **Framework**: React + Vite + Tailwind CSS v4
- **Design**: Portfolite Framer template style — pure black background, Syne + Inter fonts, glassmorphism cards, premium lateral-glow buttons, video + smoke hero, scrolling marquee ticker
- **Hero**: WebGL Silk shader background (pure WebGL simplex noise, no dependencies) + FloatingParticles + gradient overlays
- **Pages**: Home (/) and Offers (/offers)
- **Sections**: Hero, How it Works (8-step timeline), Rewards (6 cards in 3-col grid), Dashboard Preview, Verification Policy, Community/Ecosystem, FAQ, Footer
- **Layout**: Section-divider wrapper (rounded-28px card with lateral white edge glow) wraps content sections; GlowLine separators between each section
- **Buttons**: Premium button system (premium-btn, premium-btn-sm/md/lg/ghost) with lateral box-shadow glow, inner radial glow on hover, arrow icons, glassmorphism via `.glass-btn-effect` (backdrop-filter blur)
- **Cursor**: Default browser cursor (AnimatedCursor component exists but is not rendered)
- **Cards**: Dark metallic glass-card (animated rotating red/navy gradient border), no hover effects
- **Interactive**: TiltCard (subtle 4deg tilt, 0.025 glare), MagneticWrap (0.06 multiplier, minimal movement), parallax hero (fade+translate on scroll)
- **Animations**: Framer Motion fadeUp/scaleIn/stagger/slideLeft/slideRight variants, animated progress bar with shimmer, scroll progress bar, activity feed stagger, floating particles
- **Performance**: Mouse-driven effects use useMotionValue/useSpring (no React state churn), prefers-reduced-motion disables animations/cursor/shimmer
- **Responsive**: Full mobile-first responsive design (390px+ to 1280px+), stacked buttons on mobile, adapted typography/spacing, cursor hidden on touch devices
- **Routes**: `/` (Home), `/offers` (Offers page with 6 active offer cards)
- **CSS Theme**: Pure monochrome (black/white/gray), utility classes (glass-card, card-header-area, card-icon-wrap, premium-btn, glass-btn-effect, icon-circle, stat-card, nav-link, section-divider, section-glow-line, glass-pill-badge, premium-badge, floating-particle, cursor-dot/ring/glass, shimmer-bar, scroll-progress-bar) in index.css
- **@property declarations**: --card-border-angle, --btn-border-angle, --hero-text-angle, --cursor-ring-angle (must be outside @layer)
- **Silk Component**: `src/components/Silk.tsx` — pure WebGL simplex noise shader with compile/link guards and proper GPU resource cleanup. Props: speed, scale, color, noiseIntensity, rotation.
