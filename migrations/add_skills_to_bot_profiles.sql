-- Migration: Add skills column to bot_profiles table
-- Run this in Supabase SQL Editor
--
-- This migration adds a skills TEXT[] column for storing user skills
-- as part of the Complete Profile Editing feature.
--
-- The interests column already exists from add_miniapp_columns.sql.
-- This adds the matching skills column for professional/technical skills.

-- Add skills array column to bot_profiles
ALTER TABLE bot_profiles
ADD COLUMN IF NOT EXISTS skills TEXT[];

-- Add comment for documentation
COMMENT ON COLUMN bot_profiles.skills IS 'Array of user skills (max 10, max 30 chars each). Example: ["TypeScript", "React", "Node.js"]';

-- Verify the column was added
SELECT column_name, data_type, udt_name
FROM information_schema.columns
WHERE table_name = 'bot_profiles' AND column_name IN ('skills', 'interests');

-- Done!
SELECT 'Skills column added to bot_profiles successfully!' as status;
