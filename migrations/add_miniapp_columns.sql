-- Migration: Add Mini App columns to existing tables
-- Run this in Supabase SQL Editor

-- 1. Add subscription and swipe columns to bot_users
ALTER TABLE bot_users
ADD COLUMN IF NOT EXISTS subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'light', 'pro')),
ADD COLUMN IF NOT EXISTS subscription_expires_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS daily_swipes_used INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS daily_swipes_reset_at TIMESTAMPTZ;

-- 2. Add photo_url and extra fields to bot_profiles
ALTER TABLE bot_profiles
ADD COLUMN IF NOT EXISTS photo_url TEXT,
ADD COLUMN IF NOT EXISTS interests TEXT[],
ADD COLUMN IF NOT EXISTS telegram_username TEXT,
ADD COLUMN IF NOT EXISTS linkedin_url TEXT;

-- 3. Add QR ticket fields to bot_registrations
ALTER TABLE bot_registrations
ADD COLUMN IF NOT EXISTS ticket_code TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS checked_in_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS checked_in_by INTEGER REFERENCES bot_users(id);

-- 4. Create swipes table (for Tinder-like matching)
CREATE TABLE IF NOT EXISTS bot_swipes (
    id SERIAL PRIMARY KEY,
    swiper_id INTEGER NOT NULL REFERENCES bot_users(id) ON DELETE CASCADE,
    swiped_id INTEGER NOT NULL REFERENCES bot_users(id) ON DELETE CASCADE,
    action TEXT NOT NULL CHECK (action IN ('like', 'skip', 'superlike')),
    swiped_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(swiper_id, swiped_id)
);

-- 5. Create matches table
CREATE TABLE IF NOT EXISTS bot_matches (
    id SERIAL PRIMARY KEY,
    user1_id INTEGER NOT NULL REFERENCES bot_users(id) ON DELETE CASCADE,
    user2_id INTEGER NOT NULL REFERENCES bot_users(id) ON DELETE CASCADE,
    matched_at TIMESTAMPTZ DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE,
    UNIQUE(user1_id, user2_id),
    CHECK (user1_id < user2_id)
);

-- 6. Create XP transactions table
CREATE TABLE IF NOT EXISTS xp_transactions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES bot_users(id) ON DELETE CASCADE,
    amount INTEGER NOT NULL,
    reason TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Create user achievements table
CREATE TABLE IF NOT EXISTS user_achievements (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES bot_users(id) ON DELETE CASCADE,
    achievement_id TEXT NOT NULL,
    unlocked_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, achievement_id)
);

-- 8. Create function to increment user points
CREATE OR REPLACE FUNCTION increment_user_points(p_user_id INTEGER, p_points_to_add INTEGER)
RETURNS INTEGER AS $$
DECLARE
    new_points INTEGER;
BEGIN
    UPDATE bot_users
    SET points = points + p_points_to_add
    WHERE id = p_user_id
    RETURNING points INTO new_points;
    RETURN new_points;
END;
$$ LANGUAGE plpgsql;

-- 9. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_swipes_swiper ON bot_swipes(swiper_id);
CREATE INDEX IF NOT EXISTS idx_swipes_swiped ON bot_swipes(swiped_id);
CREATE INDEX IF NOT EXISTS idx_matches_user1 ON bot_matches(user1_id);
CREATE INDEX IF NOT EXISTS idx_matches_user2 ON bot_matches(user2_id);
CREATE INDEX IF NOT EXISTS idx_xp_user ON xp_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_achievements_user ON user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_registrations_ticket ON bot_registrations(ticket_code);

-- 10. Set Super Admin (Дмитрий) to Pro
UPDATE bot_users
SET subscription_tier = 'pro',
    subscription_expires_at = NOW() + INTERVAL '1 year'
WHERE id = 1;

-- Done!
SELECT 'Migration completed!' as status;
