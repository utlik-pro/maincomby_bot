-- Broadcast System Tables
-- For managing mass notifications via Telegram Bot API

-- Main broadcasts table
CREATE TABLE IF NOT EXISTS broadcasts (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  message_type TEXT DEFAULT 'text', -- 'text', 'markdown'
  deep_link_screen TEXT, -- 'home', 'events', 'network', 'matches', 'achievements', 'profile', 'notifications'
  deep_link_button_text TEXT,

  -- Targeting
  audience_type TEXT NOT NULL, -- 'all', 'city', 'subscription', 'team_role', 'event_not_registered', 'custom'
  audience_config JSONB DEFAULT '{}'::jsonb, -- {city: 'Minsk'}, {tiers: ['pro', 'light']}, {event_id: 123}
  exclude_banned BOOLEAN DEFAULT true,

  -- Scheduling
  status TEXT NOT NULL DEFAULT 'draft', -- 'draft', 'scheduled', 'sending', 'completed', 'cancelled', 'failed'
  scheduled_at TIMESTAMPTZ, -- null = manual send immediately
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,

  -- Stats
  total_recipients INTEGER DEFAULT 0,
  sent_count INTEGER DEFAULT 0,
  delivered_count INTEGER DEFAULT 0,
  failed_count INTEGER DEFAULT 0,

  -- Metadata
  created_by INTEGER REFERENCES bot_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Broadcast recipients (for tracking delivery)
CREATE TABLE IF NOT EXISTS broadcast_recipients (
  id SERIAL PRIMARY KEY,
  broadcast_id INTEGER REFERENCES broadcasts(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES bot_users(id) ON DELETE CASCADE,
  tg_user_id BIGINT NOT NULL,

  -- Delivery status
  status TEXT DEFAULT 'pending', -- 'pending', 'sent', 'delivered', 'failed'
  message_id BIGINT, -- Telegram message_id if sent
  error_message TEXT,

  -- Timestamps
  queued_at TIMESTAMPTZ DEFAULT NOW(),
  sent_at TIMESTAMPTZ,

  UNIQUE(broadcast_id, user_id)
);

-- Broadcast templates (reusable messages)
CREATE TABLE IF NOT EXISTS broadcast_templates (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  deep_link_screen TEXT,
  deep_link_button_text TEXT,

  -- Usage tracking
  use_count INTEGER DEFAULT 0,

  created_by INTEGER REFERENCES bot_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS policies
ALTER TABLE broadcasts ENABLE ROW LEVEL SECURITY;
ALTER TABLE broadcast_recipients ENABLE ROW LEVEL SECURITY;
ALTER TABLE broadcast_templates ENABLE ROW LEVEL SECURITY;

-- Allow read/write for authenticated users (app checks superadmin in code)
CREATE POLICY "Allow all on broadcasts" ON broadcasts FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on broadcast_recipients" ON broadcast_recipients FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on broadcast_templates" ON broadcast_templates FOR ALL USING (true) WITH CHECK (true);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_broadcasts_status ON broadcasts(status);
CREATE INDEX IF NOT EXISTS idx_broadcasts_scheduled_at ON broadcasts(scheduled_at) WHERE status = 'scheduled';
CREATE INDEX IF NOT EXISTS idx_broadcasts_created_at ON broadcasts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_recipients_broadcast_id ON broadcast_recipients(broadcast_id);
CREATE INDEX IF NOT EXISTS idx_recipients_broadcast_status ON broadcast_recipients(broadcast_id, status);

-- Function to update broadcast stats atomically
CREATE OR REPLACE FUNCTION update_broadcast_stats(
  p_broadcast_id INTEGER,
  p_sent INTEGER DEFAULT 0,
  p_delivered INTEGER DEFAULT 0,
  p_failed INTEGER DEFAULT 0
)
RETURNS void AS $$
BEGIN
  UPDATE broadcasts
  SET
    sent_count = sent_count + p_sent,
    delivered_count = delivered_count + p_delivered,
    failed_count = failed_count + p_failed,
    updated_at = NOW()
  WHERE id = p_broadcast_id;
END;
$$ LANGUAGE plpgsql;
