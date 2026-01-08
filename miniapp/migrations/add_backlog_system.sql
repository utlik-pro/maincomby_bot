-- ============================================
-- Backlog System for Feedback Collection
-- ============================================
-- This migration creates tables for collecting and managing
-- feedback from Telegram testing group with AI classification

-- Backlog items table
CREATE TABLE IF NOT EXISTS backlog_items (
    id SERIAL PRIMARY KEY,
    
    -- Source info (from Telegram)
    telegram_message_id BIGINT,
    telegram_chat_id BIGINT,
    telegram_user_id BIGINT,
    sender_username TEXT,
    sender_name TEXT,
    
    -- Content
    original_message TEXT NOT NULL,
    processed_content TEXT,
    
    -- AI Classification
    item_type TEXT CHECK (item_type IN ('bug', 'feature', 'improvement', 'question', 'ux', 'other')) DEFAULT 'other',
    priority TEXT CHECK (priority IN ('critical', 'high', 'medium', 'low')) DEFAULT 'medium',
    ai_confidence DECIMAL(3,2),
    ai_tags TEXT[],
    ai_summary TEXT,
    
    -- Status tracking
    status TEXT CHECK (status IN ('new', 'in_review', 'accepted', 'rejected', 'in_progress', 'done')) DEFAULT 'new',
    assigned_to INTEGER REFERENCES bot_users(id),
    reviewed_by INTEGER REFERENCES bot_users(id),
    
    -- Notes and context
    admin_notes TEXT,
    related_item_id INTEGER REFERENCES backlog_items(id),
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    reviewed_at TIMESTAMPTZ
);

-- Create indexes for efficient filtering
CREATE INDEX IF NOT EXISTS idx_backlog_status ON backlog_items(status);
CREATE INDEX IF NOT EXISTS idx_backlog_type ON backlog_items(item_type);
CREATE INDEX IF NOT EXISTS idx_backlog_priority ON backlog_items(priority);
CREATE INDEX IF NOT EXISTS idx_backlog_created ON backlog_items(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_backlog_telegram_msg ON backlog_items(telegram_message_id);

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION update_backlog_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_backlog_updated_at ON backlog_items;
CREATE TRIGGER trigger_backlog_updated_at
    BEFORE UPDATE ON backlog_items
    FOR EACH ROW
    EXECUTE FUNCTION update_backlog_updated_at();

-- RPC function to get backlog statistics
CREATE OR REPLACE FUNCTION get_backlog_stats()
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'total', COUNT(*),
        'new', COUNT(*) FILTER (WHERE status = 'new'),
        'in_review', COUNT(*) FILTER (WHERE status = 'in_review'),
        'accepted', COUNT(*) FILTER (WHERE status = 'accepted'),
        'in_progress', COUNT(*) FILTER (WHERE status = 'in_progress'),
        'done', COUNT(*) FILTER (WHERE status = 'done'),
        'rejected', COUNT(*) FILTER (WHERE status = 'rejected'),
        'by_type', json_build_object(
            'bug', COUNT(*) FILTER (WHERE item_type = 'bug'),
            'feature', COUNT(*) FILTER (WHERE item_type = 'feature'),
            'improvement', COUNT(*) FILTER (WHERE item_type = 'improvement'),
            'ux', COUNT(*) FILTER (WHERE item_type = 'ux'),
            'question', COUNT(*) FILTER (WHERE item_type = 'question'),
            'other', COUNT(*) FILTER (WHERE item_type = 'other')
        ),
        'by_priority', json_build_object(
            'critical', COUNT(*) FILTER (WHERE priority = 'critical'),
            'high', COUNT(*) FILTER (WHERE priority = 'high'),
            'medium', COUNT(*) FILTER (WHERE priority = 'medium'),
            'low', COUNT(*) FILTER (WHERE priority = 'low')
        )
    ) INTO result
    FROM backlog_items
    WHERE status != 'rejected';
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Comment on table
COMMENT ON TABLE backlog_items IS 'Product backlog items collected from Telegram testing group with AI classification';
