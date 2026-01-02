-- Migration: Custom Badges System
-- Description: Creates tables for custom badges and user badge assignments

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Custom Badges table - defines available badges
CREATE TABLE IF NOT EXISTS custom_badges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,  -- unique identifier: 'early_adopter', 'vip_2024'
  name TEXT NOT NULL,         -- display name: "Early Adopter"
  description TEXT,           -- what this badge represents
  emoji TEXT,                 -- emoji icon: 🏆, 🌟, 💎
  color TEXT DEFAULT '#c8ff00', -- badge color (hex)
  xp_reward INTEGER DEFAULT 0,  -- XP awarded when badge is given
  is_active BOOLEAN DEFAULT true, -- can be awarded
  sort_order INTEGER DEFAULT 0,   -- display order
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. User Badges table - tracks awarded badges
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

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_badges_user_id ON user_badges(user_id);
CREATE INDEX IF NOT EXISTS idx_user_badges_badge_id ON user_badges(badge_id);
CREATE INDEX IF NOT EXISTS idx_custom_badges_slug ON custom_badges(slug);
CREATE INDEX IF NOT EXISTS idx_custom_badges_active ON custom_badges(is_active);

-- RLS Policies
ALTER TABLE custom_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;

-- Custom badges: everyone can read active badges
CREATE POLICY "Anyone can read active badges" ON custom_badges
  FOR SELECT USING (is_active = true);

-- User badges: users can read their own and others' badges (for profile display)
CREATE POLICY "Anyone can read user badges" ON user_badges
  FOR SELECT USING (true);

-- Only service role can insert/update badges (admin panel uses service key)
CREATE POLICY "Service role can manage badges" ON custom_badges
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can manage user badges" ON user_badges
  FOR ALL USING (auth.role() = 'service_role');

-- Insert some default badges
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

-- Comment on tables
COMMENT ON TABLE custom_badges IS 'Custom badges that can be awarded to users';
COMMENT ON TABLE user_badges IS 'Tracks which badges have been awarded to which users';
