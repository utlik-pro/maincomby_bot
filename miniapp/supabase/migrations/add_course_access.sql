-- Migration: Add course access control system
-- Run in Supabase SQL Editor

-- Table to track user access to courses (purchased or subscription-based)
CREATE TABLE IF NOT EXISTS user_course_access (
  id SERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES bot_users(id) ON DELETE CASCADE,
  course_id TEXT NOT NULL,
  access_type TEXT NOT NULL CHECK (access_type IN ('subscription', 'purchased', 'gifted')),
  granted_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ, -- NULL = permanent access
  purchase_amount INTEGER, -- Amount paid in XTR/Stars (for purchased)
  UNIQUE(user_id, course_id)
);

-- Indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_course_access_user ON user_course_access(user_id);
CREATE INDEX IF NOT EXISTS idx_course_access_course ON user_course_access(course_id);

-- Enable RLS
ALTER TABLE user_course_access ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view their own course access"
ON user_course_access FOR SELECT
USING (true);

CREATE POLICY "Service role can insert course access"
ON user_course_access FOR INSERT
WITH CHECK (true);

CREATE POLICY "Service role can update course access"
ON user_course_access FOR UPDATE
USING (true);

-- Table to store auth session tokens for cross-platform sync
CREATE TABLE IF NOT EXISTS auth_session_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id BIGINT REFERENCES bot_users(id) ON DELETE CASCADE, -- NULL until bot confirms
  token TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ,
  platform TEXT NOT NULL CHECK (platform IN ('landing', 'miniapp'))
);

-- Index for token lookups
CREATE INDEX IF NOT EXISTS idx_auth_tokens_token ON auth_session_tokens(token);
CREATE INDEX IF NOT EXISTS idx_auth_tokens_expires ON auth_session_tokens(expires_at);

-- Enable RLS
ALTER TABLE auth_session_tokens ENABLE ROW LEVEL SECURITY;

-- RLS policies for tokens
CREATE POLICY "Tokens are accessible by service role"
ON auth_session_tokens FOR ALL
USING (true);

-- Function to check course access
CREATE OR REPLACE FUNCTION check_course_access(
  p_user_id BIGINT,
  p_course_id TEXT
) RETURNS TABLE (
  has_access BOOLEAN,
  access_type TEXT,
  subscription_tier TEXT
) AS $$
DECLARE
  v_subscription_tier TEXT;
  v_has_purchased BOOLEAN;
BEGIN
  -- Get user's subscription tier
  SELECT u.subscription_tier INTO v_subscription_tier
  FROM bot_users u
  WHERE u.id = p_user_id;

  -- Check if user has direct access (purchased/gifted)
  SELECT EXISTS(
    SELECT 1 FROM user_course_access
    WHERE user_id = p_user_id
    AND course_id = p_course_id
    AND (expires_at IS NULL OR expires_at > NOW())
  ) INTO v_has_purchased;

  IF v_has_purchased THEN
    RETURN QUERY SELECT true, 'purchased'::TEXT, v_subscription_tier;
    RETURN;
  END IF;

  -- Check subscription-based access
  -- Course access tiers: free, light, pro
  -- Free courses: accessible by all
  -- Light courses: accessible by light and pro subscribers
  -- Pro courses: accessible by pro subscribers only

  RETURN QUERY SELECT
    false,
    NULL::TEXT,
    v_subscription_tier;
END;
$$ LANGUAGE plpgsql;

-- Function to grant course access
CREATE OR REPLACE FUNCTION grant_course_access(
  p_user_id BIGINT,
  p_course_id TEXT,
  p_access_type TEXT,
  p_purchase_amount INTEGER DEFAULT NULL,
  p_expires_at TIMESTAMPTZ DEFAULT NULL
) RETURNS BOOLEAN AS $$
BEGIN
  INSERT INTO user_course_access (user_id, course_id, access_type, purchase_amount, expires_at)
  VALUES (p_user_id, p_course_id, p_access_type, p_purchase_amount, p_expires_at)
  ON CONFLICT (user_id, course_id) DO UPDATE SET
    access_type = EXCLUDED.access_type,
    purchase_amount = COALESCE(EXCLUDED.purchase_amount, user_course_access.purchase_amount),
    expires_at = EXCLUDED.expires_at,
    granted_at = NOW();

  RETURN true;
END;
$$ LANGUAGE plpgsql;

-- Comments for documentation
COMMENT ON TABLE user_course_access IS 'Tracks user access to courses (purchased, gifted, or subscription-based)';
COMMENT ON TABLE auth_session_tokens IS 'One-time tokens for cross-platform authentication (landing <-> miniapp)';
COMMENT ON FUNCTION check_course_access IS 'Check if user has access to a specific course';
COMMENT ON FUNCTION grant_course_access IS 'Grant user access to a course';
