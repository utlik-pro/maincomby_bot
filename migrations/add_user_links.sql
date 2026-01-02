-- Migration: User Social Links
-- Description: Creates table for user social media and portfolio links

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- User Links table
CREATE TABLE IF NOT EXISTS user_links (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id INTEGER NOT NULL REFERENCES bot_users(id) ON DELETE CASCADE,
  link_type TEXT NOT NULL,    -- linkedin, github, gitlab, behance, dribbble, instagram, telegram_channel, portfolio, website
  url TEXT NOT NULL,
  title TEXT,                 -- optional custom title
  is_public BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, link_type)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_user_links_user_id ON user_links(user_id);
CREATE INDEX IF NOT EXISTS idx_user_links_type ON user_links(link_type);

-- RLS Policies
ALTER TABLE user_links ENABLE ROW LEVEL SECURITY;

-- Anyone can read public links (for profile display)
CREATE POLICY "Anyone can read public links" ON user_links
  FOR SELECT USING (is_public = true);

-- Service role can manage all links
CREATE POLICY "Service role can manage links" ON user_links
  FOR ALL USING (auth.role() = 'service_role');

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION update_user_links_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER user_links_updated_at
  BEFORE UPDATE ON user_links
  FOR EACH ROW
  EXECUTE FUNCTION update_user_links_updated_at();

-- Link type reference
COMMENT ON COLUMN user_links.link_type IS 'Supported types: linkedin, github, gitlab, behance, dribbble, instagram, telegram_channel, portfolio, website';

-- Comment on table
COMMENT ON TABLE user_links IS 'Social media and portfolio links for user profiles';
