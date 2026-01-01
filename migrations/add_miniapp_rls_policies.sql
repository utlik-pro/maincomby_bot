-- Migration: Add RLS policies for Mini App
-- Run this in Supabase SQL Editor to enable Mini App access

-- 1. Enable RLS on tables (if not already enabled)
ALTER TABLE bot_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE bot_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE bot_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE bot_registrations ENABLE ROW LEVEL SECURITY;

-- 2. Drop existing policies if any (to avoid conflicts)
DROP POLICY IF EXISTS "Allow anon read users" ON bot_users;
DROP POLICY IF EXISTS "Allow anon read profiles" ON bot_profiles;
DROP POLICY IF EXISTS "Allow anon read events" ON bot_events;
DROP POLICY IF EXISTS "Allow anon read registrations" ON bot_registrations;
DROP POLICY IF EXISTS "Allow anon insert registrations" ON bot_registrations;
DROP POLICY IF EXISTS "Allow anon update users" ON bot_users;
DROP POLICY IF EXISTS "Allow anon update profiles" ON bot_profiles;
DROP POLICY IF EXISTS "Allow anon insert profiles" ON bot_profiles;
DROP POLICY IF EXISTS "Allow anon insert users" ON bot_users;

-- 3. Users table policies
-- Anyone can read users (for profiles, leaderboard)
CREATE POLICY "Allow anon read users" ON bot_users
    FOR SELECT USING (true);

-- Anyone can insert new users (for registration)
CREATE POLICY "Allow anon insert users" ON bot_users
    FOR INSERT WITH CHECK (true);

-- Anyone can update users (for profile updates, XP)
CREATE POLICY "Allow anon update users" ON bot_users
    FOR UPDATE USING (true);

-- 4. Profiles table policies
-- Anyone can read approved profiles
CREATE POLICY "Allow anon read profiles" ON bot_profiles
    FOR SELECT USING (true);

-- Anyone can insert profiles
CREATE POLICY "Allow anon insert profiles" ON bot_profiles
    FOR INSERT WITH CHECK (true);

-- Anyone can update their profile
CREATE POLICY "Allow anon update profiles" ON bot_profiles
    FOR UPDATE USING (true);

-- 5. Events table policies
-- Anyone can read active events
CREATE POLICY "Allow anon read events" ON bot_events
    FOR SELECT USING (is_active = true);

-- 6. Registrations table policies
-- Anyone can read their registrations
CREATE POLICY "Allow anon read registrations" ON bot_registrations
    FOR SELECT USING (true);

-- Anyone can insert registrations (for event signup)
CREATE POLICY "Allow anon insert registrations" ON bot_registrations
    FOR INSERT WITH CHECK (true);

-- Anyone can update registrations (for check-in)
CREATE POLICY "Allow anon update registrations" ON bot_registrations
    FOR UPDATE USING (true);

-- 7. XP transactions policies (might already exist)
DROP POLICY IF EXISTS "Users can view own xp_transactions" ON xp_transactions;
DROP POLICY IF EXISTS "Service can insert xp_transactions" ON xp_transactions;

CREATE POLICY "Allow read xp_transactions" ON xp_transactions
    FOR SELECT USING (true);

CREATE POLICY "Allow insert xp_transactions" ON xp_transactions
    FOR INSERT WITH CHECK (true);

-- 8. User achievements policies (might already exist)
DROP POLICY IF EXISTS "Users can view own achievements" ON user_achievements;
DROP POLICY IF EXISTS "Service can insert achievements" ON user_achievements;

CREATE POLICY "Allow read achievements" ON user_achievements
    FOR SELECT USING (true);

CREATE POLICY "Allow insert achievements" ON user_achievements
    FOR INSERT WITH CHECK (true);

-- 9. Grant permissions to anon role
GRANT SELECT, INSERT, UPDATE ON bot_users TO anon;
GRANT SELECT, INSERT, UPDATE ON bot_profiles TO anon;
GRANT SELECT ON bot_events TO anon;
GRANT SELECT, INSERT, UPDATE ON bot_registrations TO anon;
GRANT SELECT, INSERT ON xp_transactions TO anon;
GRANT SELECT, INSERT ON user_achievements TO anon;

-- Grant sequence permissions
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon;

-- Done!
SELECT 'RLS policies for Mini App added!' as status;
