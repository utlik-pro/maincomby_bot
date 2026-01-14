-- Migration: Update courses table schema
-- Description: Add fields for pricing, currency, slugs, and course details
-- Date: 2026-01-14

-- Add price column (in Telegram Stars or cents)
ALTER TABLE courses ADD COLUMN IF NOT EXISTS price INTEGER DEFAULT 0;

-- Add currency column (default to 'XTR' for Telegram Stars)
ALTER TABLE courses ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'XTR';

-- Add slug for pretty URLs (must be unique)
ALTER TABLE courses ADD COLUMN IF NOT EXISTS slug TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS idx_courses_slug ON courses(slug);

-- Add difficulty level
ALTER TABLE courses ADD COLUMN IF NOT EXISTS difficulty TEXT CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')) DEFAULT 'beginner';

-- Add total duration in minutes
ALTER TABLE courses ADD COLUMN IF NOT EXISTS duration_minutes INTEGER DEFAULT 0;

-- Add total lessons count (cached value for faster display)
ALTER TABLE courses ADD COLUMN IF NOT EXISTS lessons_count INTEGER DEFAULT 0;

-- Add long description for the landing page details
ALTER TABLE courses ADD COLUMN IF NOT EXISTS long_description TEXT;

-- Add what you will learn (stored as JSON array of strings)
ALTER TABLE courses ADD COLUMN IF NOT EXISTS learning_outcomes JSONB DEFAULT '[]';

-- Add prerequisites (stored as JSON array of strings)
ALTER TABLE courses ADD COLUMN IF NOT EXISTS prerequisites JSONB DEFAULT '[]';
