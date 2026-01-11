# Changelog

All notable changes to MAIN Community will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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
