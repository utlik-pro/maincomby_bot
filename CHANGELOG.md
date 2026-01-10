# Changelog

All notable changes to MAIN Community will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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
