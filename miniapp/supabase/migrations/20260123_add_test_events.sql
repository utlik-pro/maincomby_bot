-- Migration: Add is_test column to bot_events for QA testing
-- Test events are only visible to testers (users in TESTER_IDS)

-- Add is_test column to bot_events
ALTER TABLE bot_events
ADD COLUMN IF NOT EXISTS is_test BOOLEAN DEFAULT FALSE;

-- Create index for faster filtering
CREATE INDEX IF NOT EXISTS idx_bot_events_is_test ON bot_events(is_test);

-- Comment for documentation
COMMENT ON COLUMN bot_events.is_test IS 'Test event - only visible to testers in TESTER_IDS';
