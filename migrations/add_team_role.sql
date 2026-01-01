-- Migration: Add team_role to bot_users for team badges
-- Run this in Supabase SQL Editor

-- 1. Add team_role column
ALTER TABLE bot_users
ADD COLUMN IF NOT EXISTS team_role TEXT CHECK (team_role IN ('core', 'partner', 'sponsor', 'volunteer', 'speaker'));

-- 2. Set core team members (update with actual user IDs)
-- Example: UPDATE bot_users SET team_role = 'core' WHERE id IN (1, 2, 3);

-- 3. Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_team_role ON bot_users(team_role) WHERE team_role IS NOT NULL;

-- Grant permissions
GRANT SELECT, UPDATE ON bot_users TO anon;

-- Done!
SELECT 'Team role column added!' as status;
