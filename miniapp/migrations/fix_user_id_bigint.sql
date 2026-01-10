-- Migration: Fix user_id type to BIGINT
-- Telegram user IDs can exceed INTEGER max value (2,147,483,647)
-- Run this in Supabase SQL Editor

-- Fix user_links table
ALTER TABLE user_links
  ALTER COLUMN user_id TYPE BIGINT;

-- Fix bot_users table (if needed)
ALTER TABLE bot_users
  ALTER COLUMN id TYPE BIGINT;

-- Fix bot_profiles table (if needed)
ALTER TABLE bot_profiles
  ALTER COLUMN user_id TYPE BIGINT;

SELECT 'user_id columns changed to BIGINT!' as result;
