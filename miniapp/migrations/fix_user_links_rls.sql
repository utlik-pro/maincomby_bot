-- Migration: Fix RLS policies for profile editing
-- Run this in Supabase SQL Editor to allow Mini App to manage profiles and links

-- ================================================================
-- 1. Fix user_links RLS policies
-- ================================================================
DROP POLICY IF EXISTS "Anyone can read public links" ON user_links;
DROP POLICY IF EXISTS "Service role can manage links" ON user_links;
DROP POLICY IF EXISTS "Allow all on user_links" ON user_links;

CREATE POLICY "Allow all on user_links" ON user_links
  FOR ALL USING (true) WITH CHECK (true);

GRANT SELECT, INSERT, UPDATE, DELETE ON user_links TO anon;

-- ================================================================
-- 2. Ensure bot_profiles has correct RLS policies
-- ================================================================
DROP POLICY IF EXISTS "Allow anon read profiles" ON bot_profiles;
DROP POLICY IF EXISTS "Allow anon insert profiles" ON bot_profiles;
DROP POLICY IF EXISTS "Allow anon update profiles" ON bot_profiles;

CREATE POLICY "Allow anon read profiles" ON bot_profiles
    FOR SELECT USING (true);

CREATE POLICY "Allow anon insert profiles" ON bot_profiles
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow anon update profiles" ON bot_profiles
    FOR UPDATE USING (true);

GRANT SELECT, INSERT, UPDATE ON bot_profiles TO anon;

-- ================================================================
-- 3. Grant sequence permissions (needed for auto-increment)
-- ================================================================
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon;

SELECT 'RLS policies for profiles and links fixed!' as result;
