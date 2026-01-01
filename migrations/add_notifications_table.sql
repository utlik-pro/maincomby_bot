-- Migration: Add notifications table for Mini App
-- Run this in Supabase SQL Editor

-- 1. Create notifications table
CREATE TABLE IF NOT EXISTS app_notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES bot_users(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('event_reminder', 'match', 'achievement', 'rank_up', 'system', 'xp')),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    data JSONB DEFAULT '{}',  -- Extra data (event_id, achievement_id, etc.)
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON app_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON app_notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON app_notifications(created_at DESC);

-- 3. Enable RLS
ALTER TABLE app_notifications ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies
DROP POLICY IF EXISTS "Users can view own notifications" ON app_notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON app_notifications;
DROP POLICY IF EXISTS "Service can insert notifications" ON app_notifications;

CREATE POLICY "Users can view own notifications" ON app_notifications
    FOR SELECT USING (true);

CREATE POLICY "Users can update own notifications" ON app_notifications
    FOR UPDATE USING (true);

CREATE POLICY "Service can insert notifications" ON app_notifications
    FOR INSERT WITH CHECK (true);

-- 5. Grant permissions
GRANT SELECT, INSERT, UPDATE ON app_notifications TO anon;
GRANT USAGE, SELECT ON SEQUENCE app_notifications_id_seq TO anon;

-- 6. Create function to get unread count
CREATE OR REPLACE FUNCTION get_unread_notifications_count(p_user_id INTEGER)
RETURNS INTEGER AS $$
BEGIN
    RETURN (
        SELECT COUNT(*)::INTEGER
        FROM app_notifications
        WHERE user_id = p_user_id AND is_read = FALSE
    );
END;
$$ LANGUAGE plpgsql;

-- Done!
SELECT 'Notifications table created!' as status;
