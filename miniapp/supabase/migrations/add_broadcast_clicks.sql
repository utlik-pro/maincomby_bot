-- Migration: Add click tracking to broadcast system
-- This migration adds columns to track when users click on broadcast deep links

-- Add clicked_count to broadcasts table
ALTER TABLE broadcasts
ADD COLUMN IF NOT EXISTS clicked_count INTEGER DEFAULT 0;

-- Add clicked_at to broadcast_recipients table
ALTER TABLE broadcast_recipients
ADD COLUMN IF NOT EXISTS clicked_at TIMESTAMPTZ;

-- Index for efficient click queries
CREATE INDEX IF NOT EXISTS idx_broadcast_recipients_clicked
ON broadcast_recipients(broadcast_id) WHERE clicked_at IS NOT NULL;

-- Function to log a broadcast click (prevents duplicate counting)
CREATE OR REPLACE FUNCTION log_broadcast_click(
  p_broadcast_id INTEGER,
  p_user_id INTEGER
) RETURNS BOOLEAN AS $$
DECLARE
  v_already_clicked BOOLEAN;
BEGIN
  -- Check if already clicked
  SELECT (clicked_at IS NOT NULL) INTO v_already_clicked
  FROM broadcast_recipients
  WHERE broadcast_id = p_broadcast_id AND user_id = p_user_id;

  -- If not found or already clicked, return false
  IF NOT FOUND OR v_already_clicked THEN
    RETURN FALSE;
  END IF;

  -- Update recipient clicked_at
  UPDATE broadcast_recipients
  SET clicked_at = NOW()
  WHERE broadcast_id = p_broadcast_id AND user_id = p_user_id;

  -- Increment clicked_count in broadcasts
  UPDATE broadcasts
  SET clicked_count = clicked_count + 1,
      updated_at = NOW()
  WHERE id = p_broadcast_id;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;
