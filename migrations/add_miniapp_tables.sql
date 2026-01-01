-- Mini App Database Extensions
-- Run this migration on Supabase to add gamification and subscription support

-- 1. Add subscription fields to bot_users
ALTER TABLE bot_users
ADD COLUMN IF NOT EXISTS subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'light', 'pro')),
ADD COLUMN IF NOT EXISTS subscription_expires_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS daily_swipes_used INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS daily_swipes_reset_at TIMESTAMP WITH TIME ZONE;

-- 2. Add photo_url to bot_profiles for Mini App
ALTER TABLE bot_profiles
ADD COLUMN IF NOT EXISTS photo_url TEXT,
ADD COLUMN IF NOT EXISTS interests TEXT[], -- Array of interest tags
ADD COLUMN IF NOT EXISTS telegram_username TEXT,
ADD COLUMN IF NOT EXISTS linkedin_url TEXT;

-- 3. Add ticket_code and check-in fields to bot_registrations
ALTER TABLE bot_registrations
ADD COLUMN IF NOT EXISTS ticket_code TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS checked_in_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS checked_in_by INTEGER REFERENCES bot_users(id);

-- Generate ticket codes for existing registrations
UPDATE bot_registrations
SET ticket_code = 'MAIN-' || UPPER(TO_HEX(id * 1000 + EXTRACT(EPOCH FROM registered_at)::INTEGER))
WHERE ticket_code IS NULL;

-- 4. Add superlike to swipes
ALTER TABLE bot_swipes
DROP CONSTRAINT IF EXISTS bot_swipes_action_check;
ALTER TABLE bot_swipes
ADD CONSTRAINT bot_swipes_action_check CHECK (action IN ('like', 'skip', 'superlike'));

-- 5. Add event_type and price to bot_events
ALTER TABLE bot_events
ADD COLUMN IF NOT EXISTS event_type TEXT DEFAULT 'meetup' CHECK (event_type IN ('meetup', 'workshop', 'conference', 'hackathon')),
ADD COLUMN IF NOT EXISTS price INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS image_url TEXT;

-- 6. Create XP transactions table
CREATE TABLE IF NOT EXISTS xp_transactions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES bot_users(id) ON DELETE CASCADE,
    amount INTEGER NOT NULL,
    reason TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_xp_transactions_user_id ON xp_transactions(user_id);

-- 7. Create user achievements table
CREATE TABLE IF NOT EXISTS user_achievements (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES bot_users(id) ON DELETE CASCADE,
    achievement_id TEXT NOT NULL,
    unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, achievement_id)
);

CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON user_achievements(user_id);

-- 8. Create function to increment user points atomically
CREATE OR REPLACE FUNCTION increment_user_points(user_id INTEGER, points_to_add INTEGER)
RETURNS INTEGER AS $$
DECLARE
    new_points INTEGER;
BEGIN
    UPDATE bot_users
    SET points = COALESCE(points, 0) + points_to_add
    WHERE id = user_id
    RETURNING points INTO new_points;

    RETURN new_points;
END;
$$ LANGUAGE plpgsql;

-- 9. Create function to reset daily swipes (call this via cron)
CREATE OR REPLACE FUNCTION reset_daily_swipes()
RETURNS void AS $$
BEGIN
    UPDATE bot_users
    SET daily_swipes_used = 0,
        daily_swipes_reset_at = NOW()
    WHERE daily_swipes_reset_at IS NULL
       OR daily_swipes_reset_at < NOW() - INTERVAL '24 hours';
END;
$$ LANGUAGE plpgsql;

-- 10. Row Level Security policies
ALTER TABLE xp_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;

-- Users can read their own XP transactions
CREATE POLICY "Users can view own xp_transactions" ON xp_transactions
    FOR SELECT USING (true);

-- Users can read their own achievements
CREATE POLICY "Users can view own achievements" ON user_achievements
    FOR SELECT USING (true);

-- Authenticated users can insert XP transactions (via API)
CREATE POLICY "Service can insert xp_transactions" ON xp_transactions
    FOR INSERT WITH CHECK (true);

-- Authenticated users can insert achievements (via API)
CREATE POLICY "Service can insert achievements" ON user_achievements
    FOR INSERT WITH CHECK (true);

-- Grant permissions
GRANT SELECT, INSERT ON xp_transactions TO anon, authenticated;
GRANT SELECT, INSERT ON user_achievements TO anon, authenticated;
GRANT USAGE, SELECT ON SEQUENCE xp_transactions_id_seq TO anon, authenticated;
GRANT USAGE, SELECT ON SEQUENCE user_achievements_id_seq TO anon, authenticated;

-- 11. Create view for leaderboard
CREATE OR REPLACE VIEW leaderboard AS
SELECT
    u.id,
    u.first_name,
    u.last_name,
    u.username,
    u.points,
    p.photo_url,
    p.city,
    RANK() OVER (ORDER BY u.points DESC) as rank
FROM bot_users u
LEFT JOIN bot_profiles p ON p.user_id = u.id
WHERE u.points > 0
ORDER BY u.points DESC
LIMIT 100;

GRANT SELECT ON leaderboard TO anon, authenticated;

COMMENT ON TABLE xp_transactions IS 'Tracks all XP gains for users';
COMMENT ON TABLE user_achievements IS 'Tracks unlocked achievements per user';
COMMENT ON VIEW leaderboard IS 'Top 100 users by XP points';
