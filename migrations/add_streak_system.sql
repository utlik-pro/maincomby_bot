-- Add streak system for gamification rewards
-- Daily login streak + Swipe activity streak

-- Add streak columns to bot_users
ALTER TABLE bot_users
ADD COLUMN IF NOT EXISTS daily_streak INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_streak_check_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS swipe_streak INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_swipe_streak_at TIMESTAMPTZ;

-- Add index for streak queries
CREATE INDEX IF NOT EXISTS idx_bot_users_daily_streak ON bot_users(daily_streak) WHERE daily_streak > 0;

-- Add comments
COMMENT ON COLUMN bot_users.daily_streak IS 'Consecutive days user opened the app';
COMMENT ON COLUMN bot_users.last_streak_check_at IS 'Last date when streak was checked/updated';
COMMENT ON COLUMN bot_users.swipe_streak IS 'Consecutive days user used all free swipes';
COMMENT ON COLUMN bot_users.last_swipe_streak_at IS 'Last date when swipe streak was updated';

-- Grant permissions
GRANT UPDATE (daily_streak, last_streak_check_at, swipe_streak, last_swipe_streak_at) ON bot_users TO anon;

-- Create streak_rewards table to track awarded Pro subscriptions
CREATE TABLE IF NOT EXISTS streak_rewards (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES bot_users(id),
    reward_type TEXT NOT NULL, -- 'daily_streak_5', 'daily_streak_10', 'daily_streak_30', 'swipe_streak_5'
    days_awarded INTEGER NOT NULL, -- 1, 3, or 7 days of Pro
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, reward_type) -- Each reward type can only be claimed once
);

-- Enable RLS
ALTER TABLE streak_rewards ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view own streak_rewards" ON streak_rewards
    FOR SELECT USING (true);

CREATE POLICY "Allow insert streak_rewards" ON streak_rewards
    FOR INSERT WITH CHECK (true);

-- Grant permissions
GRANT SELECT, INSERT ON streak_rewards TO anon;
GRANT USAGE, SELECT ON SEQUENCE streak_rewards_id_seq TO anon;

-- Add new XP transaction reasons
-- (These will be used via the existing xp_transactions table)
-- PROFILE_PHOTO_ADDED, PROFILE_BIO_ADDED, PROFILE_OCCUPATION_ADDED,
-- PROFILE_CITY_ADDED, PROFILE_LINKEDIN_ADDED, PROFILE_SKILLS_ADDED,
-- PROFILE_INTERESTS_ADDED, PROFILE_COMPLETE_BONUS
