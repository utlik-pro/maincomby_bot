-- Add daily superlike tracking to bot_users
ALTER TABLE bot_users
ADD COLUMN IF NOT EXISTS daily_superlikes_used INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS daily_superlikes_reset_at TIMESTAMPTZ;

-- Add index for efficient incoming likes queries
CREATE INDEX IF NOT EXISTS idx_bot_swipes_swiped_id_action
ON bot_swipes(swiped_id, action)
WHERE action IN ('like', 'superlike');

-- Comments for documentation
COMMENT ON COLUMN bot_users.daily_superlikes_used IS 'Number of superlikes used today';
COMMENT ON COLUMN bot_users.daily_superlikes_reset_at IS 'When daily superlike counter resets';
