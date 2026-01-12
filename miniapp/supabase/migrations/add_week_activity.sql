-- Migration: Add week_activity field for weekly streak tracking
-- Run in Supabase SQL Editor

-- Add week_activity column to bot_users
ALTER TABLE bot_users
ADD COLUMN IF NOT EXISTS week_activity INTEGER[] DEFAULT '{}';

-- Comment for documentation
COMMENT ON COLUMN bot_users.week_activity IS 'Array of days visited this week (0=Mon, 6=Sun). Resets each Monday.';
