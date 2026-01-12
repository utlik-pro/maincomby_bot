# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

MAIN Community Mini App is a Telegram Mini App for community networking, events, and gamification. Built with React 18 + TypeScript + Vite, deployed to Vercel.

**Key Features:** Event management with QR check-in, Tinder-style networking/matching, XP/rank gamification system, subscription tiers (Free/Light/Pro), achievement badges.

## Commands

```bash
npm run dev      # Start dev server at http://localhost:5173
npm run build    # TypeScript check + Vite production build
npm run preview  # Preview production build
npm run lint     # ESLint (note: config may need setup)
```

## Environment Setup

Copy `.env.example` to `.env` and configure:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
TELEGRAM_BOT_TOKEN=optional-for-validation
```

## Architecture

### State Management
- **Zustand** (`src/lib/store.ts`) - Global app state with persistence
- **TanStack React Query** - Server state, caching, mutations
- Pattern: Zustand for UI state, React Query for API data

### Data Layer
- **Supabase** - PostgreSQL database + RPC functions
- `src/lib/supabase.ts` - All database operations (~2000 lines)
- Tables: `bot_users`, `bot_profiles`, `events`, `user_swipes`, `user_achievements`, etc.

### Routing & Screens
- React Router DOM with lazy-loaded screens
- Main screens in `src/screens/`: Home, Events, Network, Achievements, Profile
- Tab-based navigation via `src/components/Navigation.tsx`

### Type System
- All interfaces in `src/types/index.ts`
- Key types: `User`, `UserProfile`, `Event`, `Swipe`, `Match`, `Achievement`
- Subscription: `SubscriptionTier` = 'free' | 'light' | 'pro'
- Ranks: 9 levels from 'newcomer' (0 XP) to 'founder' (20000+ XP)

### Telegram Integration
- `src/lib/telegram.ts` - Telegram Web App SDK wrapper
- Uses `window.Telegram.WebApp` for user data, haptics, popups
- `initData` passed for user authentication

### Theme
- Dark theme with Tailwind CSS
- Accent color: `#c8ff00` (neon yellow-green)
- Custom colors in `tailwind.config.js`: `bg-*`, `accent-*`, `success`, `danger`
- Border radius tokens: `rounded-card` (20px), `rounded-button` (14px)

## Key Files

| File | Purpose |
|------|---------|
| `src/App.tsx` | App initialization, routing, deep links |
| `src/lib/supabase.ts` | All database operations |
| `src/lib/store.ts` | Zustand global state |
| `src/types/index.ts` | TypeScript interfaces |

## Adding New Features

**New Screen:**
1. Create `src/screens/YourScreen.tsx`
2. Add lazy import in `App.tsx`
3. Add to `renderScreen()` switch statement

**New Component:**
- UI primitives → `src/components/ui/`
- Feature components → `src/components/`

**New Achievement:**
1. Add to `AchievementId` type in `src/types/index.ts`
2. Add to `ACHIEVEMENTS` array with title, description, xpReward

**Database Changes:**
- Migrations in `supabase/migrations/`
- Edge functions in `supabase/functions/`

## XP & Rank System

```typescript
XP_REWARDS = {
  EVENT_REGISTER: 10,
  EVENT_CHECKIN: 50,
  FEEDBACK_SUBMIT: 20,
  MATCH_RECEIVED: 15,
  PROFILE_COMPLETE: 25,
}
```

Rank thresholds: newcomer(0) → member(100) → activist(300) → enthusiast(600) → contributor(1000) → ambassador(2000) → expert(5000) → leader(10000) → founder(20000)

## Subscription Limits

| Tier | Daily Swipes | Who Liked | Superlikes |
|------|--------------|-----------|------------|
| Free | 5 | No | No |
| Light | 20 | Yes | 1/day |
| Pro | ∞ | Yes | 5/day |

## Path Alias

`@/*` maps to `./src/*` - use `@/components/Button` instead of relative paths.
