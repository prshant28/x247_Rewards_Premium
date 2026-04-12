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
- **Buttons**: Premium button system (premium-btn, premium-btn-sm/md/lg/ghost) with lateral box-shadow glow, inner radial glow on hover, arrow icons, glassmorphism via `.glass-btn-effect` (backdrop-filter blur)
- **Cursor**: Custom AnimatedCursor with white dot (mix-blend-mode: difference), gradient ring, and glass zoom lens (backdrop-filter brightness/blur)
- **Cards**: Redesigned with card-header-area (large icon hub), card-icon-wrap with per-card colored glow, 3D icon rotation on hover (Y-axis spin), step badges
- **Interactive**: TiltCard (3D perspective tilt on mouse move via useMotionValue/useSpring), MagneticWrap (magnetic pull on buttons), parallax hero (fade+translate on scroll)
- **Animations**: Framer Motion fadeUp/scaleIn/stagger/slideLeft/slideRight variants, animated progress bar with shimmer, scroll progress bar, activity feed stagger, floating particles
- **Performance**: Mouse-driven effects use useMotionValue/useSpring (no React state churn), prefers-reduced-motion disables animations/cursor/shimmer
- **Responsive**: Full mobile-first responsive design (390px+ to 1280px+), stacked buttons on mobile, adapted typography/spacing, cursor hidden on touch devices
- **Route**: Serves at root path `/`
- **CSS Theme**: Pure monochrome (black/white/gray), utility classes (glass-card, card-header-area, card-icon-wrap, premium-btn, glass-btn-effect, icon-circle, stat-card, nav-link, section-divider, section-glow-line, glass-pill-badge, premium-badge, floating-particle, cursor-dot/ring/glass, shimmer-bar, scroll-progress-bar) in index.css
- **@property declarations**: --card-border-angle, --btn-border-angle, --hero-text-angle, --cursor-ring-angle (must be outside @layer)
- **Video Asset**: imported from @assets/ alias (attached_assets/)
