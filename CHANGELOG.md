# Changelog

All notable changes to MAIN Community will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### God Mode Admin Panel - Phase 1, 2 & 3 (In Progress)

#### Phase 3.2: Interactive Preview with Screen Navigation (Completed - 2026-01-17)

**Live Miniapp Preview in iframe:**
- Added `PhonePreviewIframe` component replacing static mockup:
  - Loads real miniapp via iframe with `?tenant=xxx&preview=true&screen=home`
  - Full screen navigation support via postMessage API
  - Loading indicator while iframe loads
  - "Refresh Preview" button for manual reload
  - "Live Preview" badge indicator

**Preview Mode Toggle:**
- Added **Edit Blocks** / **Live Preview** toggle in right panel:
  - Edit Blocks: Static drag-n-drop PhoneMockup (existing functionality)
  - Live Preview: Real miniapp in iframe with working navigation

**postMessage Navigation:**
- Miniapp listens for navigation commands from admin:
  ```typescript
  window.addEventListener('message', (event) => {
    if (event.data?.type === 'NAVIGATE') {
      setActiveTab(event.data.screen)
    }
  })
  ```
- Admin sends navigation via `iframe.contentWindow.postMessage()`
- Supports all screens: home, events, learn, network, achievements, profile

**Admin Navigation Overlay:**
- Custom navigation bar over iframe for admin control
- Click tabs to switch screens in preview
- Shows active screen indicator (dot + accent color)
- Displays "Click tabs to navigate • X tabs visible"

**Auto-refresh on Publish:**
- Preview automatically reloads after publishing blocks
- Uses `refreshKey` state to trigger iframe reload

**Files Modified:**
- `admin/src/app/(dashboard)/builder/page.tsx` - PhonePreviewIframe component, preview mode toggle
- `miniapp/src/App.tsx` - postMessage listener for NAVIGATE commands
- `admin/.env.local` - Added `NEXT_PUBLIC_MINIAPP_URL`

#### Phase 3.1: Builder Realistic Blocks & Navigation Editor (Completed - 2026-01-17)

**Block Previews with Realistic Data:**
- Replaced placeholder blocks with realistic miniapp-style previews:
  - **Hero**: "Добро пожаловать!", "Ваш центр сообщества", accent "Начать" button
  - **Profile**: "Dmitry", "Лидер" rank, "5,240 XP", progress bar to next rank (26%)
  - **Events**: "React Conf 2025", "23 янв", "Москва", "Join" button
  - **Leaderboard**: Top 3 with medals 🥇🥈🥉 - Alex 5,850 XP, Marina 5,420 XP, Dmitry (you) 5,240 XP
  - **Network**: "Нетворк", "Найди людей для знакомства"
  - **Courses**: "Курсы", "Учись и получай XP"
  - **Achievements**: 4 badge grid with earned/locked states
  - **Stats**: 3-column grid - События (12), Знакомства (45), Бейджи (8)
  - **Announcements**: "Новый митап!", "Регистрация открыта до 25 января"
  - **Custom HTML**: Placeholder for custom content

**Separate Navigation Editor Tab:**
- Added [Blocks] / [Navigation] tabs in left panel
- NavigationEditor component with full configuration:
  - Sortable list with up/down arrows for reordering
  - Edit dialog per tab:
    - Screen selector: home, events, learn, achievements, profile, network, notifications
    - Icon picker: 8 available icons (home, calendar, graduation-cap, trophy, user, flame, bell, users)
    - Label inputs for RU and EN
    - Visibility toggle (Switch)
  - Delete button (min 2 tabs required)
  - Add Tab button (max 5 tabs allowed)
  - Real-time preview in PhoneMockup

**PhoneMockup Improvements:**
- Shows only visible navigation tabs (filtered by `visible: true`)
- Displays tab count indicator ("3 of 5 tabs visible")
- Removed in-phone toggle - all editing via Navigation tab

**Files Modified:**
- `admin/src/app/(dashboard)/builder/page.tsx` - Complete rewrite with NavigationEditor

#### Phase 3: Builder Live Preview & Dynamic Blocks (Completed - 2026-01-17)

**Builder Page with Live iPhone Preview:**
- Redesigned `/builder` page layout to 50/50 split:
  - Left column: Block Library (compact 2-column grid) + Current Layout (drag-n-drop)
  - Right column: Live iPhone Preview with realistic frame
- Added `PhonePreview` component with:
  - Realistic iPhone frame with notch and side buttons
  - iframe embedding miniapp with `?tenant=xxx&preview=true` params
  - Manual "Refresh Preview" button
- Implemented auto-refresh mechanism:
  - `refreshPreview()` called after every block operation (add/delete/reorder/visibility toggle)
  - Preview updates in real-time as admin makes changes

**Miniapp Preview Mode Support:**
- Extended `miniapp/src/lib/tenant.ts`:
  - `isPreviewMode()` - detects `?preview=true` in URL
  - `getTenantIdFromUrl()` - extracts tenant ID from URL params
  - `refetchTenantBlocks()` - reloads blocks from DB
  - `initializePreviewMode()` - initializes tenant from URL param instead of Telegram
- Updated `miniapp/src/hooks/useTenantBlocks.ts`:
  - Auto-refresh every 2 seconds in preview mode
  - `refetch()` function exposed for manual refresh
  - `isPreview` flag in return value

**Dynamic Block Components:**
- Created 10 block components in `miniapp/src/components/blocks/`:
  - `ProfileBlock.tsx` - User profile card
  - `EventsBlock.tsx` - Upcoming events list
  - `LeaderboardBlock.tsx` - Top users ranking
  - `NetworkBlock.tsx` - Match suggestions
  - `AchievementsBlock.tsx` - User badges
  - `StatsBlock.tsx` - Community statistics
  - `CoursesBlock.tsx` - Learning modules
  - `HeroBlock.tsx` - Welcome banner
  - `AnnouncementsBlock.tsx` - Important notices
  - `CustomHtmlBlock.tsx` - Custom content
- Created `DynamicBlock` renderer with `BLOCK_COMPONENTS` registry
- Updated `HomeScreen.tsx` to use `DynamicBlockList` when tenant has configured blocks

**API Layer Extensions:**
- Added to `admin/src/lib/api.ts`:
  - `createBlock()` - Create new block with auto-position
  - `updateBlock()` - Update block properties (visibility, config)
  - `deleteBlock()` - Remove block from tenant
  - `updateTenantTheme()` - Update theme colors
  - `setDefaultTheme()` - Set theme as default
  - `deleteTenantTheme()` - Remove theme

**Files Modified:**
- `admin/src/app/(dashboard)/builder/page.tsx` - Complete rewrite with PhonePreview
- `admin/src/lib/api.ts` - Added block/theme CRUD functions
- `miniapp/src/lib/tenant.ts` - Added preview mode support
- `miniapp/src/hooks/useTenantBlocks.ts` - Added auto-refresh
- `miniapp/src/hooks/index.ts` - Export useTenantBlocks
- `miniapp/src/components/blocks/index.tsx` - Block registry
- `miniapp/src/components/blocks/*.tsx` - 10 new block components
- `miniapp/src/screens/HomeScreen.tsx` - Dynamic blocks support

#### Phase 1: Foundation (Completed)
- Created `shared/` directory with TypeScript types for multi-tenancy:
  - `shared/types/tenant.ts` - Tenant, TenantTheme, TenantFeature interfaces
  - `shared/types/roles.ts` - AdminRole system (god_mode, partner_admin, moderator)
  - `shared/types/blocks.ts` - Block builder types with 10 block types
  - `shared/constants/defaults.ts` - Default theme, features, blocks
- Created centralized configuration system in miniapp:
  - `miniapp/src/lib/config.ts` - App config with feature flags
  - `miniapp/src/lib/theme.ts` - Dynamic theme system with CSS variables
  - `miniapp/src/lib/tenant.ts` - Tenant context and role checking
- Database migrations for multi-tenancy:
  - `20260116_001_add_tenants.sql` - Tenants table with MAIN Community default
  - `20260116_002_add_admin_roles.sql` - Admin users with permissions
  - `20260116_003_add_tenant_themes.sql` - Theme storage with color palettes
  - `20260116_004_add_app_blocks.sql` - Block configuration with drag-drop support
  - `20260116_005_add_tenant_bots.sql` - Bot attachment (own or shared)
  - `20260116_006_add_tenant_features.sql` - Feature flags per tenant
- Updated vite.config.ts and tsconfig.json for @shared alias

#### Phase 2: Admin Panel MVP (Completed)
- Initialized `admin/` project with Next.js 15 + App Router
- Configured shadcn/ui component library (sidebar, card, table, badge, etc.)
- Added Supabase client with SSR support:
  - `admin/src/lib/supabase/client.ts` - Browser client
  - `admin/src/lib/supabase/server.ts` - Server client
  - `admin/src/middleware.ts` - Auth middleware
- Created API functions in `admin/src/lib/api.ts`:
  - CRUD operations for tenants
  - Dashboard stats aggregation
  - Theme and bot management
- Built UI components:
  - `AppSidebar` - Navigation with Main, Builder, System sections
  - Dashboard layout with SidebarProvider
- Created pages:
  - `/dashboard` - Stats cards, quick actions, recent activity
  - `/tenants` - List all tenants with data table
  - `/tenants/[id]` - Tenant details with settings, features, bot config
  - `/tenants/new` - Create new tenant form
  - `/tenants/[id]/edit` - Edit tenant form

#### Git Workflow
- Created branch: `feature/god-mode-admin`
- Created backup tag: `v1.0-stable`

## [1.1.7] - 2026-01-16

[0;34mGenerating changelog from v1.1.6 to HEAD[0m
### Added
- Add Prompt Engineering course module
- add trusted by partners marquee section
- add click tracking for broadcast analytics
- add A-100 Gas Stations case study
- add second Dana Holdings case study (Meeting Transcription)
- add Cases page with Dana Holdings case study
- simplify course access - remove login widget, add public Prompt Engineering course

### Fixed
- show events for entire day instead of filtering by time
- dark background for broadcast input fields
- correct import path for getDictionary in cases page
- resolve TypeScript errors in broadcast API

### Changed
- trigger redeploy for cases page
## [1.1.6] - 2026-01-15

[0;34mGenerating changelog from v1.1.5 to HEAD[0m
### Added
- implement Telegram Login and Fix Deep Links
- add learning module with prompting basics course
- add broadcast module for event notifications

### Fixed
- refactor telegram widget callback to flat global function
- resolve TypeScript errors in learning system

### Changed
- add verbose debugging for login flow
## [1.1.5] - 2026-01-13

[0;34mGenerating changelog from v1.1.4 to HEAD[0m
### Added
- add event funnel stats for team + leads/checkins modals
- add speaker ratings and analytics
- add event funnel analytics (registered, today, checked-in, cancelled)
- superadmin events analytics with dropdown selector
- UI improvements - matches profile view & streak dots
- replace M badge with subscription status crown icon
- add QR code sharing for events and profiles with analytics
- add expandable Speakers & Program sections
- add Cal.com integration, Testimonials & SEO

### Fixed
- store funnel visibility setting in database for all users
- hide leads/checkins tabs when toggle is off, add analytics tab
- reset daily swipes counter on new day
- English labels (Free/Light/Pro)
- smaller crown + text labels (фри/лайт/про)
## [1.1.4] - 2026-01-12

[0;34mGenerating changelog from v1.1.3 to HEAD[0m
### Added
- add session tracking and analytics for super admin
- add streak progress UI card on HomeScreen
- add streak rewards + profile completion XP

### Fixed
- daily streak shows on day 1 + disable XP notification spam
## [1.1.3] - 2026-01-11

[0;34mGenerating changelog from v1.1.2 to HEAD[0m
### Fixed
- improve LATEST_RELEASE update reliability
## [1.1.2] - 2026-01-11

[0;34mGenerating changelog from v1.1.1 to HEAD[0m
### Added
- auto-update LATEST_RELEASE in version.ts on release

### Fixed
- update LATEST_RELEASE to 1.1.1 with proper date and content
- add RLS migration for xp_transactions insert
## [1.1.1] - 2026-01-11

[1;33mNo previous tag found, including all commits[0m
### Added
- add release automation with Claude Code skills
- add reset easter eggs button for testing XP
- replace phone shake with 3 new easter eggs + XP history
- boost secret code reward and add team role bonus
- enable phone shake detector for +150 XP bonus
- fix invite decrement and add referral analytics
- redesign profile page with Tinder-style card preview
- increase header spacer and add expandable team roles
- add analytics panel for superadmins
- add native Telegram share for event links
- add event links generator to admin panel
- add event deep links to admin commands
- add share button for events with correct deep link format
- add deep link support for opening specific events
- premium glass modal + fix changelog dot alignment
- redesign UpdateBanner to modal + pulsing dot in changelog
- add bottom sheet modals for reviews and subscriptions
- redesign ticket cards with ticket-style UI
- add event reviews system
- major UI/UX improvements and animations

### Fixed
- prevent crash on rapid profile tab taps
- add fallback to direct update when RPC fails
- fix XP not being awarded - use getState() for fresh user
- award XP for event check-in via volunteer scan
- fix type imports in ProfilePreviewCard
- increase header spacer to h-28 for better visibility
- add top spacer for Telegram header
- add error handling and fix z-index
- increment CURRENT_APP_VERSION to trigger What's New modal
- auto-sync releases.json to landing on release
- sync landing releases.json with v1.1.0
- grant execute permissions on XP RPC functions
- complete XP reward system implementation
- move releases.json to landing and fix imports for Vercel
- persist lastSeenAppVersion to localStorage
- hide events list on 'My tickets' tab
- add top padding to WhatsNewModal for Telegram header
- show active tickets first, then past attended
- show What's New modal directly instead of banner
- show past attended events in 'My tickets' for reviews

### Changed
- simplify to daily auto-release at 23:59
- sync landing version to 1.1.0
- release v1.1.0 with event reviews and bottom sheets
- simplify UpdateBanner to match app style
- remove hardcoded back buttons, use Telegram BackButton
- add Node.js version specification for Vercel
- use ChangelogSheet instead of WhatsNewModal for unified design
- add Vercel deployment configuration
- use Telegram BackButton instead of custom back buttons
- use networking-friendly messaging for connections
## [1.1.0] - 2026-01-10

### Added

#### Mini App
- Event feedback system (1-5 stars + text review)
- Automatic review prompt after attending events
- "What's New" changelog modal on app updates
- XP rewards for matches (+15 to both users)
- XP reward for first swipe (+5)
- XP reward for profile completion (+25)
- Daily swipes counter with limit screen
- Subscription required to message matches

#### Telegram Bot
- Push notifications for event reviews at 22:30 after event
- Improved notification system

### Fixed
- Friend invite XP reward corrected to 50 points
- Profile photos handling for undefined cases
- Subscribe link for swipes exhausted screen

### Technical
- Added debug logging for XP system
- Fixed RPC function permissions for XP transactions
- SECURITY DEFINER on increment_user_points function

## [1.0.0] - 2026-01-10

### Added

#### Mini App
- Profile management with photo gallery
- Swipe-based matching system (Tinder-like networking)
- Daily swipes limit with subscription tiers
- Event registration with calendar integration
- Achievement and XP system with ranks
- Push notifications support
- Subscription payments via Telegram Stars

#### Telegram Bot
- Event management commands
- Matching commands (/tinder, /my_matches)
- Admin panel with registration statistics
- Broadcast messaging to users
- News moderation workflow

#### Landing Page
- Multi-language support (EN/RU)
- Feature showcase
- FAQ section

### Technical
- SQLite + Supabase dual database sync
- aiogram 3.13.1 bot framework
- React 18 + TypeScript frontend
- Next.js 16 landing page
