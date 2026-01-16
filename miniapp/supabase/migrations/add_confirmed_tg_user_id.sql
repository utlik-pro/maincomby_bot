-- Add confirmed_tg_user_id column to auth_session_tokens
-- This stores the Telegram user ID directly without foreign key constraint

ALTER TABLE auth_session_tokens
ADD COLUMN IF NOT EXISTS confirmed_tg_user_id BIGINT;

CREATE INDEX IF NOT EXISTS idx_auth_tokens_confirmed_tg_user_id
ON auth_session_tokens(confirmed_tg_user_id);

COMMENT ON COLUMN auth_session_tokens.confirmed_tg_user_id IS 'Telegram user ID that confirmed this token';
