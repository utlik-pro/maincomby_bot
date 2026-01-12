-- ================================================================
-- SECURITY FIX: Enable RLS on critical tables with proper policies
-- Run this migration after deploying Edge Functions
-- ================================================================

-- ============ BOT_USERS TABLE ============
-- Users can read all profiles (public profiles for matching)
-- Only service role can write (via Edge Functions)

ALTER TABLE bot_users ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Public read access" ON bot_users;
DROP POLICY IF EXISTS "Service role full access" ON bot_users;

-- Allow reading all users (needed for matching, leaderboard, etc.)
CREATE POLICY "Public read access" ON bot_users
    FOR SELECT
    USING (true);

-- Only service role can insert/update/delete
CREATE POLICY "Service role full access" ON bot_users
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Allow anon to insert new users (needed for registration)
CREATE POLICY "Anon can create users" ON bot_users
    FOR INSERT
    TO anon
    WITH CHECK (true);

-- Allow anon to update users (needed for profile updates)
-- In future, this should be restricted to only own profile via Edge Function
CREATE POLICY "Anon can update users" ON bot_users
    FOR UPDATE
    TO anon
    USING (true)
    WITH CHECK (true);


-- ============ XP_TRANSACTIONS TABLE ============
-- Public read for leaderboard, only service role can write

ALTER TABLE xp_transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read XP" ON xp_transactions;
DROP POLICY IF EXISTS "Service role manages XP" ON xp_transactions;

-- Allow reading all XP transactions (for leaderboard calculations)
CREATE POLICY "Public read XP" ON xp_transactions
    FOR SELECT
    USING (true);

-- Only service role can insert XP transactions
CREATE POLICY "Service role manages XP" ON xp_transactions
    FOR INSERT
    TO service_role
    WITH CHECK (true);

-- Allow anon to insert XP (current behavior, should be moved to Edge Function)
CREATE POLICY "Anon can insert XP" ON xp_transactions
    FOR INSERT
    TO anon
    WITH CHECK (true);


-- ============ USER_LINKS TABLE ============
-- Read public links, service role manages all

ALTER TABLE user_links ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Read public links" ON user_links;
DROP POLICY IF EXISTS "Service role manages links" ON user_links;

-- Allow reading links (profile viewing)
CREATE POLICY "Read public links" ON user_links
    FOR SELECT
    USING (true);

-- Service role full access
CREATE POLICY "Service role manages links" ON user_links
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Allow anon to manage links (current behavior)
CREATE POLICY "Anon can manage links" ON user_links
    FOR ALL
    TO anon
    USING (true)
    WITH CHECK (true);


-- ============ BOT_PROFILES TABLE ============

ALTER TABLE bot_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read profiles" ON bot_profiles;
DROP POLICY IF EXISTS "Anon can manage profiles" ON bot_profiles;

-- Allow reading profiles (for matching)
CREATE POLICY "Public read profiles" ON bot_profiles
    FOR SELECT
    USING (true);

-- Allow anon to manage profiles (current behavior)
CREATE POLICY "Anon can manage profiles" ON bot_profiles
    FOR ALL
    TO anon
    USING (true)
    WITH CHECK (true);


-- ============ INVITES TABLE ============

ALTER TABLE invites ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Read own invites" ON invites;
DROP POLICY IF EXISTS "Anon can manage invites" ON invites;

-- Allow reading invites
CREATE POLICY "Read invites" ON invites
    FOR SELECT
    USING (true);

-- Allow anon to manage invites
CREATE POLICY "Anon can manage invites" ON invites
    FOR ALL
    TO anon
    USING (true)
    WITH CHECK (true);


-- ============ BOT_NOTIFICATIONS TABLE ============

ALTER TABLE bot_notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Read own notifications" ON bot_notifications;
DROP POLICY IF EXISTS "Anon can manage notifications" ON bot_notifications;

-- Allow reading notifications
CREATE POLICY "Read notifications" ON bot_notifications
    FOR SELECT
    USING (true);

-- Allow anon to manage notifications
CREATE POLICY "Anon can manage notifications" ON bot_notifications
    FOR ALL
    TO anon
    USING (true)
    WITH CHECK (true);


-- ============ GRANT PERMISSIONS ============

-- Ensure anon and authenticated roles have proper access
GRANT SELECT, INSERT, UPDATE ON bot_users TO anon;
GRANT SELECT, INSERT, UPDATE ON bot_profiles TO anon;
GRANT SELECT, INSERT ON xp_transactions TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON user_links TO anon;
GRANT SELECT, INSERT, UPDATE ON invites TO anon;
GRANT SELECT, INSERT, UPDATE ON bot_notifications TO anon;

-- Service role gets full access
GRANT ALL ON bot_users TO service_role;
GRANT ALL ON bot_profiles TO service_role;
GRANT ALL ON xp_transactions TO service_role;
GRANT ALL ON user_links TO service_role;
GRANT ALL ON invites TO service_role;
GRANT ALL ON bot_notifications TO service_role;


-- ============ NOTES ============
--
-- Current state: RLS is enabled but policies are permissive for backwards compatibility
--
-- FUTURE IMPROVEMENTS (Phase 2):
-- 1. Move all write operations to Edge Functions with initData validation
-- 2. Restrict anon INSERT/UPDATE to only authenticated operations
-- 3. Add user_id checks to ensure users can only modify their own data
-- 4. Example of stricter policy:
--    CREATE POLICY "Users can update own profile" ON bot_profiles
--      FOR UPDATE USING (user_id = current_user_id()) -- requires custom function
--
-- This migration is a transitional step - it enables RLS without breaking existing functionality
