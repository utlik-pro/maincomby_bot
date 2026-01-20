-- Engagement Analytics Table
-- Tracks all engagement notifications sent and their results

CREATE TABLE IF NOT EXISTS engagement_notifications (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES bot_users(id) ON DELETE CASCADE,
    notification_type VARCHAR(50) NOT NULL, -- profile_incomplete, no_swipes, inactive_7d, inactive_14d, likes_1, likes_3, likes_5, likes_10
    sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    delivered BOOLEAN DEFAULT TRUE, -- false if Telegram returned error
    error_message TEXT, -- error details if failed

    -- Conversion tracking
    converted BOOLEAN DEFAULT FALSE, -- user opened app within 24h
    converted_at TIMESTAMPTZ, -- when user opened app
    conversion_time_seconds INT, -- time between send and open

    -- Context data
    context JSONB DEFAULT '{}', -- additional data (likes_count, etc.)

    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for analytics queries
CREATE INDEX IF NOT EXISTS idx_engagement_notifications_user ON engagement_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_engagement_notifications_type ON engagement_notifications(notification_type);
CREATE INDEX IF NOT EXISTS idx_engagement_notifications_sent ON engagement_notifications(sent_at);
CREATE INDEX IF NOT EXISTS idx_engagement_notifications_converted ON engagement_notifications(converted) WHERE converted = TRUE;

-- Daily aggregated stats view for quick dashboard queries
CREATE OR REPLACE VIEW engagement_stats_daily AS
SELECT
    DATE(sent_at) as date,
    notification_type,
    COUNT(*) as total_sent,
    COUNT(*) FILTER (WHERE delivered = TRUE) as delivered,
    COUNT(*) FILTER (WHERE delivered = FALSE) as failed,
    COUNT(*) FILTER (WHERE converted = TRUE) as conversions,
    ROUND(
        COUNT(*) FILTER (WHERE converted = TRUE)::NUMERIC /
        NULLIF(COUNT(*) FILTER (WHERE delivered = TRUE), 0) * 100,
        2
    ) as conversion_rate,
    ROUND(AVG(conversion_time_seconds) FILTER (WHERE converted = TRUE) / 60.0, 1) as avg_conversion_minutes
FROM engagement_notifications
GROUP BY DATE(sent_at), notification_type
ORDER BY date DESC, notification_type;

-- Summary stats for all time
CREATE OR REPLACE VIEW engagement_stats_summary AS
SELECT
    notification_type,
    COUNT(*) as total_sent,
    COUNT(*) FILTER (WHERE delivered = TRUE) as delivered,
    COUNT(*) FILTER (WHERE converted = TRUE) as conversions,
    ROUND(
        COUNT(*) FILTER (WHERE converted = TRUE)::NUMERIC /
        NULLIF(COUNT(*) FILTER (WHERE delivered = TRUE), 0) * 100,
        2
    ) as conversion_rate,
    MIN(sent_at) as first_sent,
    MAX(sent_at) as last_sent
FROM engagement_notifications
GROUP BY notification_type
ORDER BY total_sent DESC;

-- Comments
COMMENT ON TABLE engagement_notifications IS 'Tracks all engagement notifications for analytics';
COMMENT ON COLUMN engagement_notifications.notification_type IS 'Type: profile_incomplete, no_swipes, inactive_7d, inactive_14d, likes_1/3/5/10';
COMMENT ON COLUMN engagement_notifications.converted IS 'User opened app within 24h of notification';
