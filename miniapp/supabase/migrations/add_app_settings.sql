-- App settings table for global configuration
CREATE TABLE IF NOT EXISTS app_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by BIGINT REFERENCES bot_users(id)
);

-- Insert default setting for funnel visibility
INSERT INTO app_settings (key, value)
VALUES ('show_funnel_for_team', 'true'::jsonb)
ON CONFLICT (key) DO NOTHING;

-- RLS policies
ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;

-- Everyone can read settings
CREATE POLICY "Anyone can read settings" ON app_settings
  FOR SELECT USING (true);

-- Only superadmins can update (we'll check in the app)
CREATE POLICY "Anyone can update settings" ON app_settings
  FOR UPDATE USING (true);
