-- ================================================================
-- EXTENDED PROFILE SYSTEM - ALL MIGRATIONS
-- Run this in Supabase SQL Editor
-- ================================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ================================================================
-- 1. CUSTOM BADGES
-- ================================================================

-- Custom Badges table - defines available badges
CREATE TABLE IF NOT EXISTS custom_badges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,  -- unique identifier: 'early_adopter', 'vip_2024'
  name TEXT NOT NULL,         -- display name: "Early Adopter"
  description TEXT,           -- what this badge represents
  emoji TEXT,                 -- emoji icon
  color TEXT DEFAULT '#c8ff00', -- badge color (hex)
  xp_reward INTEGER DEFAULT 0,  -- XP awarded when badge is given
  is_active BOOLEAN DEFAULT true, -- can be awarded
  sort_order INTEGER DEFAULT 0,   -- display order
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User Badges table - tracks awarded badges
CREATE TABLE IF NOT EXISTS user_badges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id INTEGER NOT NULL REFERENCES bot_users(id) ON DELETE CASCADE,
  badge_id UUID NOT NULL REFERENCES custom_badges(id) ON DELETE CASCADE,
  awarded_by INTEGER REFERENCES bot_users(id), -- admin who awarded (null = system)
  awarded_reason TEXT,        -- why badge was given
  awarded_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,     -- null = permanent
  is_featured BOOLEAN DEFAULT false, -- show prominently on profile
  UNIQUE(user_id, badge_id)
);

-- Indexes for badges
CREATE INDEX IF NOT EXISTS idx_user_badges_user_id ON user_badges(user_id);
CREATE INDEX IF NOT EXISTS idx_user_badges_badge_id ON user_badges(badge_id);
CREATE INDEX IF NOT EXISTS idx_custom_badges_slug ON custom_badges(slug);
CREATE INDEX IF NOT EXISTS idx_custom_badges_active ON custom_badges(is_active);

-- RLS for badges
ALTER TABLE custom_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can read active badges" ON custom_badges;
DROP POLICY IF EXISTS "Anyone can read user badges" ON user_badges;
DROP POLICY IF EXISTS "Service role can manage badges" ON custom_badges;
DROP POLICY IF EXISTS "Service role can manage user badges" ON user_badges;

-- Create policies
CREATE POLICY "Anyone can read active badges" ON custom_badges
  FOR SELECT USING (is_active = true);

CREATE POLICY "Anyone can read user badges" ON user_badges
  FOR SELECT USING (true);

CREATE POLICY "Service role can manage badges" ON custom_badges
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can manage user badges" ON user_badges
  FOR ALL USING (auth.role() = 'service_role');

-- Insert default badges
INSERT INTO custom_badges (slug, name, description, emoji, color, xp_reward, sort_order) VALUES
  ('early_adopter', 'Early Adopter', 'Одним из первых присоединился к MAIN Community', '🌟', '#FFD700', 100, 1),
  ('event_master', 'Event Master', 'Посетил 10+ мероприятий', '🎯', '#FF6B6B', 150, 2),
  ('networker_pro', 'Networker Pro', 'Создал 50+ связей через Tinder', '🤝', '#4ECDC4', 200, 3),
  ('feedback_hero', 'Feedback Hero', 'Оставил 20+ фидбеков', '💬', '#9B59B6', 100, 4),
  ('loyal_member', 'Loyal Member', '1 год в комьюнити', '💎', '#3498DB', 500, 5),
  ('speaker', 'Speaker', 'Выступал на мероприятии MAIN', '🎤', '#E74C3C', 300, 6),
  ('sponsor', 'Sponsor', 'Спонсор MAIN Community', '💰', '#F39C12', 0, 7),
  ('partner', 'Partner', 'Партнёр MAIN Community', '🤲', '#1ABC9C', 0, 8),
  ('vip', 'VIP', 'VIP участник', '👑', '#c8ff00', 0, 9),
  ('core_team', 'Core Team', 'Член основной команды MAIN', '⭐', '#c8ff00', 0, 10)
ON CONFLICT (slug) DO NOTHING;

-- ================================================================
-- 2. COMPANIES
-- ================================================================

-- Companies table - company profiles (created by admin only)
CREATE TABLE IF NOT EXISTS companies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  logo_url TEXT,              -- company logo
  website_url TEXT,           -- company website
  description TEXT,           -- short description
  industry TEXT,              -- IT, Marketing, Finance, etc.
  is_verified BOOLEAN DEFAULT false, -- admin verified
  is_active BOOLEAN DEFAULT true,    -- visible in list
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User-Company relationships
CREATE TABLE IF NOT EXISTS user_companies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id INTEGER NOT NULL REFERENCES bot_users(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  role TEXT,                  -- CEO, CTO, Marketing Manager, etc.
  is_primary BOOLEAN DEFAULT true, -- main company to display
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, company_id)
);

-- Indexes for companies
CREATE INDEX IF NOT EXISTS idx_companies_name ON companies(name);
CREATE INDEX IF NOT EXISTS idx_companies_active ON companies(is_active);
CREATE INDEX IF NOT EXISTS idx_user_companies_user_id ON user_companies(user_id);
CREATE INDEX IF NOT EXISTS idx_user_companies_company_id ON user_companies(company_id);

-- RLS for companies
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_companies ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can read active companies" ON companies;
DROP POLICY IF EXISTS "Service role can manage companies" ON companies;
DROP POLICY IF EXISTS "Anyone can read user companies" ON user_companies;
DROP POLICY IF EXISTS "Service role can manage user companies" ON user_companies;

-- Create policies
CREATE POLICY "Anyone can read active companies" ON companies
  FOR SELECT USING (is_active = true);

CREATE POLICY "Service role can manage companies" ON companies
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Anyone can read user companies" ON user_companies
  FOR SELECT USING (true);

CREATE POLICY "Service role can manage user companies" ON user_companies
  FOR ALL USING (auth.role() = 'service_role');

-- Trigger to update updated_at for companies
CREATE OR REPLACE FUNCTION update_companies_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS companies_updated_at ON companies;
CREATE TRIGGER companies_updated_at
  BEFORE UPDATE ON companies
  FOR EACH ROW
  EXECUTE FUNCTION update_companies_updated_at();

-- ================================================================
-- 3. USER LINKS
-- ================================================================

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

-- Indexes for links
CREATE INDEX IF NOT EXISTS idx_user_links_user_id ON user_links(user_id);
CREATE INDEX IF NOT EXISTS idx_user_links_type ON user_links(link_type);

-- RLS for links
ALTER TABLE user_links ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can read public links" ON user_links;
DROP POLICY IF EXISTS "Service role can manage links" ON user_links;

-- Create policies
CREATE POLICY "Anyone can read public links" ON user_links
  FOR SELECT USING (is_public = true);

CREATE POLICY "Service role can manage links" ON user_links
  FOR ALL USING (auth.role() = 'service_role');

-- Trigger to update updated_at for links
CREATE OR REPLACE FUNCTION update_user_links_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS user_links_updated_at ON user_links;
CREATE TRIGGER user_links_updated_at
  BEFORE UPDATE ON user_links
  FOR EACH ROW
  EXECUTE FUNCTION update_user_links_updated_at();

-- ================================================================
-- COMMENTS
-- ================================================================

COMMENT ON TABLE custom_badges IS 'Custom badges that can be awarded to users';
COMMENT ON TABLE user_badges IS 'Tracks which badges have been awarded to which users';
COMMENT ON TABLE companies IS 'Companies created by admin for users to associate with';
COMMENT ON TABLE user_companies IS 'Links users to their companies with roles';
COMMENT ON TABLE user_links IS 'Social media and portfolio links for user profiles';

COMMENT ON COLUMN companies.industry IS 'Industry values: IT, Marketing, Finance, Education, Healthcare, Retail, Manufacturing, Consulting, Media, Other';
COMMENT ON COLUMN user_links.link_type IS 'Supported types: linkedin, github, gitlab, behance, dribbble, instagram, telegram_channel, portfolio, website';

-- ================================================================
-- DONE!
-- ================================================================
SELECT 'Extended profile system tables created successfully!' as result;
