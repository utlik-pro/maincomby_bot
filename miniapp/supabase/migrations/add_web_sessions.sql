-- Create web_sessions table for tracking active landing sessions
-- This allows users to see and revoke their active sessions from the miniapp

CREATE TABLE IF NOT EXISTS web_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tg_user_id BIGINT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  revoked_at TIMESTAMPTZ,
  user_agent TEXT
);

-- Index for faster lookups by tg_user_id
CREATE INDEX IF NOT EXISTS idx_web_sessions_tg_user_id ON web_sessions(tg_user_id);

-- Index for finding active sessions (not expired, not revoked)
CREATE INDEX IF NOT EXISTS idx_web_sessions_active ON web_sessions(tg_user_id, expires_at) WHERE revoked_at IS NULL;

COMMENT ON TABLE web_sessions IS 'Tracks active web sessions for users logged in via miniapp';
COMMENT ON COLUMN web_sessions.tg_user_id IS 'Telegram user ID';
COMMENT ON COLUMN web_sessions.expires_at IS 'Session expiration time (30 days from creation)';
COMMENT ON COLUMN web_sessions.revoked_at IS 'When session was manually revoked (null if still active)';
COMMENT ON COLUMN web_sessions.user_agent IS 'Browser user agent for session identification';
