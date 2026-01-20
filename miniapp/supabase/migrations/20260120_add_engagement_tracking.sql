-- Add engagement tracking fields to bot_users
-- For automated notifications to encourage app usage

-- Track when user last opened the Mini App
ALTER TABLE bot_users ADD COLUMN IF NOT EXISTS last_app_open_at TIMESTAMPTZ;

-- Engagement notification timestamps (to prevent duplicate sends)
ALTER TABLE bot_users ADD COLUMN IF NOT EXISTS engagement_profile_sent_at TIMESTAMPTZ;
ALTER TABLE bot_users ADD COLUMN IF NOT EXISTS engagement_swipes_sent_at TIMESTAMPTZ;
ALTER TABLE bot_users ADD COLUMN IF NOT EXISTS engagement_inactive_7d_sent_at TIMESTAMPTZ;
ALTER TABLE bot_users ADD COLUMN IF NOT EXISTS engagement_inactive_14d_sent_at TIMESTAMPTZ;
ALTER TABLE bot_users ADD COLUMN IF NOT EXISTS engagement_likes_1_sent_at TIMESTAMPTZ;
ALTER TABLE bot_users ADD COLUMN IF NOT EXISTS engagement_likes_3_sent_at TIMESTAMPTZ;
ALTER TABLE bot_users ADD COLUMN IF NOT EXISTS engagement_likes_5_sent_at TIMESTAMPTZ;
ALTER TABLE bot_users ADD COLUMN IF NOT EXISTS engagement_likes_10_sent_at TIMESTAMPTZ;

-- Index for finding users by last activity
CREATE INDEX IF NOT EXISTS idx_bot_users_last_app_open ON bot_users(last_app_open_at);

-- Comment
COMMENT ON COLUMN bot_users.last_app_open_at IS 'When user last opened Mini App';
COMMENT ON COLUMN bot_users.engagement_profile_sent_at IS 'When profile reminder was sent';
COMMENT ON COLUMN bot_users.engagement_swipes_sent_at IS 'When networking invite was sent';
COMMENT ON COLUMN bot_users.engagement_inactive_7d_sent_at IS 'When 7-day inactive reminder was sent';
COMMENT ON COLUMN bot_users.engagement_inactive_14d_sent_at IS 'When 14-day inactive reminder was sent';
COMMENT ON COLUMN bot_users.engagement_likes_1_sent_at IS 'When 1 like notification was sent';
COMMENT ON COLUMN bot_users.engagement_likes_3_sent_at IS 'When 3 likes notification was sent';
COMMENT ON COLUMN bot_users.engagement_likes_5_sent_at IS 'When 5 likes notification was sent';
COMMENT ON COLUMN bot_users.engagement_likes_10_sent_at IS 'When 10 likes notification was sent';
