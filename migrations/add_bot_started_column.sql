-- Migration: Add bot_started tracking column to bot_users
-- Date: 2026-01-22
-- Description: Track whether user has started the bot (pressed /start) to enable notifications

-- Add bot_started column (boolean, default false for new users)
ALTER TABLE bot_users
ADD COLUMN IF NOT EXISTS bot_started BOOLEAN DEFAULT FALSE;

-- Set existing users who have interacted with bot as bot_started = true
-- (Users created before this migration likely already pressed /start)
UPDATE bot_users SET bot_started = TRUE WHERE created_at < NOW();

-- Create index for efficient queries
CREATE INDEX IF NOT EXISTS idx_bot_users_bot_started ON bot_users(bot_started);
