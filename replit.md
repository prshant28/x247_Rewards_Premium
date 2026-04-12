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
- **Hero**: Video background (halloween smoke) + SmokeCanvas procedural overlay + FloatingParticles + gradient overlays
- **Sections**: Hero, How it Works, Rewards Showcase, Dashboard Preview, Verification Policy, Community/Ecosystem, FAQ, Footer
- **Layout**: Section-divider wrapper (rounded-28px card with lateral white edge glow) wraps content sections; GlowLine separators between each section
- **Buttons**: Premium button system (premium-btn, premium-btn-sm/md/lg/ghost) with lateral box-shadow glow, inner radial glow on hover, arrow icons
- **Animations**: Framer Motion fadeUp/scaleIn/stagger variants, animated progress bar, activity feed stagger, floating particles
- **Responsive**: Full mobile-first responsive design (390px+ to 1280px+), stacked buttons on mobile, adapted typography/spacing
- **Route**: Serves at root path `/`
- **CSS Theme**: Pure monochrome (black/white/gray), utility classes (glass-card, premium-btn, icon-circle, stat-card, nav-link, section-divider, section-glow-line, glass-pill-badge, premium-badge, floating-particle) in index.css
- **Video Asset**: imported from @assets/ alias (attached_assets/)
