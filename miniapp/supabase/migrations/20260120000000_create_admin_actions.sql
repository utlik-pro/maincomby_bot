-- Create table for admin actions queue
CREATE TABLE IF NOT EXISTS bot_admin_actions (
    id SERIAL PRIMARY KEY,
    action TEXT NOT NULL,
    payload JSONB NOT NULL DEFAULT '{}'::jsonb,
    status TEXT NOT NULL DEFAULT 'pending', -- pending, processing, completed, failed
    created_by INTEGER, -- admin user_id
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    processed_at TIMESTAMP WITH TIME ZONE,
    error_message TEXT
);

-- Index for faster polling
CREATE INDEX IF NOT EXISTS idx_bot_admin_actions_status ON bot_admin_actions(status);
