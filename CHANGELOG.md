# Changelog

All notable changes to MAIN Community will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.1.13] - 2026-01-23

[0;34mGenerating changelog from v1.1.12 to HEAD[0m
### Added
- disable vertical swipes globally at app init
- enable fullscreen mode for legal screens
- add mandatory policy consent screen per Belarus Law №99-З
- add legal pages (Privacy Policy, Terms) per Belarus law + fix version
- add bot_started tracking and notification enablement prompts
- add ticket reminder notifications at 18:30 on event day

### Fixed
- make check-in more robust by removing .select().single()
- add JS-based pull-to-refresh prevention for iOS WebView
- aggressive overscroll prevention on all elements
- global overscroll prevention across all screens
- keep fullscreen mode on exit and increase offset to 86px
- restore proper top offset for legal screen header (56px)
- proper legal screen layout with swipe prevention
- use standard padding for legal screen header (pt-16)
- increase top padding for Telegram back button
- add safe-area padding for iPhone status bar on legal pages
- remove arrow icon from legal pages header
- proper full-screen layout for legal pages
- scrolling and Telegram back button on legal pages

### Changed
- update contacts to email only
## [1.1.12] - 2026-01-22

[0;34mGenerating changelog from v1.1.11 to HEAD[0m
### Added
- add ticket deep link support for direct QR code access
- add prompts promo sheet and fix detail modal layout
- improve prompt submission with file upload and push notifications
- improve prompts gallery UX and moderation workflow
- add community AI prompts gallery with moderation system

### Fixed
- move ticket deep link handler after registrations query
- event reminders timezone + escapeMarkdown for notifications
- improve prompts gallery layout and submit button visibility
- show full author name with username in prompts
- enable scrolling in prompt submit screen

### Changed
- position Share button on image bottom-right corner
- move Share button under image in PromptDetailModal
## [1.1.11] - 2026-01-21

[0;34mGenerating changelog from v1.1.10 to HEAD[0m
### Added
- add engagement notification analytics dashboard
- add engagement notification system for user retention
- add glowing animation to Network and Learning icons
- add duration selector for PRO gifts (3/7/30 days)
- add networking engagement system with push notifications and promo sheet
- style Networking card like Learning card with heart icon
- move Learning to HomeScreen card, remove from nav
- redesign networking UI with Tinder-style navigation button
- add networking banner and enable network tab with red styling
- add city filter bypass + swipe diagnostics
- grid layout for contacts + likes diagnostics
- add admin action history with status tracking
- beautiful PRO gift in-app modal with thank you button
- personalized PRO gift notifications
- PRO gifting feature - admin can gift PRO subscriptions
- sticky menu with Лайки text, recycled profiles when empty, bigger icons
- show ALL historical likes in Who Liked Me section

### Fixed
- remove duplicate networking banner with English text
- change Networking card icon from heart to flame
- filter out matched users from Likes tab
- remove profile_photos join from getIncomingLikes (no FK relationship)
- show actual error message in likes error state
- set swipe tab padding to 90px
- improve likes loading with better logging and error handling
- increase swipe tab padding to pt-24 (96px)
- increase swipe tab padding to pt-20 (80px)
- increase swipe tab padding to pt-16
- conditional padding for network tabs (swipe vs contacts/likes)
- increase network header padding (pt-20)
- add top padding to network screen for Telegram header
- repair likes display and swipe card layout
- restore scrolling, fix user manager build, disable text selection
- restore proper layout, add padding for header, fix scrolling
- make SupabaseSync robust against missing env vars
- restore content visibility with flex layout
- remove PageTransition (crash fix), add proper error display for debug
- remove unused import causing startup crash
## [1.1.10] - 2026-01-20

[0;34mGenerating changelog from v1.1.9 to HEAD[0m
### Added
- implement tinder-like immersive swipe card
- fullscreen Tinder-style swipe UI
- add Pro features - who liked you, undo, super like
- improve recipients modal with filtering and Telegram links
- add tenant blocks and hooks

### Fixed
- implemented missing setHideHeader action
- remove fixed positioning to prevent crash
- fix memory leak from undo timer on unmount
- fix layout overlap and infinity display for Pro users
- add scroll to admin settings panel
- increase recipients fetch limit to 1000
- capture click tracking before user loads
- auto-complete status when all recipients processed
- increase rate limit from 5 to 60 req/min
## [1.1.9] - 2026-01-18

[0;34mGenerating changelog from v1.1.8 to HEAD[0m
### Added
- harden Mini App API security
- add Team page with 7 specialist roles
- update retail case with Eurotorg branding
- add 3 new case studies (logistics, manufacturing, retail)
- add BelHard AI corporate assistant case study
- add TourBot CRM case study for tourism operator

### Fixed
- update Eurotorg suppliers count to 1000+
- update BelHard AI solution and testimonial
- correct A-100 launch date to November 2024
- correct TourBot launch date to October 2025
- update TourBot case with accurate metrics
- add v1.1.8 release data
- sync full release details to landing page
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
