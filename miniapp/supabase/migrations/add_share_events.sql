-- Migration: Add share_events table for tracking shares analytics
-- Run in Supabase SQL Editor

-- Таблица для отслеживания шейринга
CREATE TABLE IF NOT EXISTS share_events (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES bot_users(id) ON DELETE CASCADE,
  share_type VARCHAR(20) NOT NULL, -- 'event', 'profile', 'invite'
  target_id VARCHAR(50) NOT NULL,  -- event_id, user_id, invite_code
  method VARCHAR(20) NOT NULL,     -- 'telegram', 'qr_view'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Индексы для быстрых запросов
CREATE INDEX IF NOT EXISTS idx_share_events_user ON share_events(user_id);
CREATE INDEX IF NOT EXISTS idx_share_events_type ON share_events(share_type, created_at);
CREATE INDEX IF NOT EXISTS idx_share_events_target ON share_events(target_id);
CREATE INDEX IF NOT EXISTS idx_share_events_method ON share_events(method);

-- RLS политики для share_events
ALTER TABLE share_events ENABLE ROW LEVEL SECURITY;

-- Политика для чтения (все могут читать)
CREATE POLICY "Allow read share_events" ON share_events
FOR SELECT USING (true);

-- Политика для вставки (все могут создавать записи о шейринге)
CREATE POLICY "Allow insert share_events" ON share_events
FOR INSERT WITH CHECK (true);
