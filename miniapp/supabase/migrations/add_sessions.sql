-- Migration: Add user_sessions table for tracking app usage
-- Run in Supabase SQL Editor

-- Таблица сессий
CREATE TABLE IF NOT EXISTS user_sessions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES bot_users(id) ON DELETE CASCADE,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  last_heartbeat_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  duration_seconds INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Индексы для быстрых запросов
CREATE INDEX IF NOT EXISTS idx_sessions_user ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_started ON user_sessions(started_at);
CREATE INDEX IF NOT EXISTS idx_sessions_heartbeat ON user_sessions(last_heartbeat_at);
CREATE INDEX IF NOT EXISTS idx_sessions_ended ON user_sessions(ended_at);

-- Поле для total time в bot_users
ALTER TABLE bot_users
ADD COLUMN IF NOT EXISTS total_time_seconds INTEGER DEFAULT 0;

-- RLS политики для user_sessions
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;

-- Политика для чтения (все могут читать свои сессии)
CREATE POLICY "Users can view own sessions" ON user_sessions
FOR SELECT USING (true);

-- Политика для вставки (все могут создавать свои сессии)
CREATE POLICY "Users can insert own sessions" ON user_sessions
FOR INSERT WITH CHECK (true);

-- Политика для обновления (все могут обновлять свои сессии)
CREATE POLICY "Users can update own sessions" ON user_sessions
FOR UPDATE USING (true);
