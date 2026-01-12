-- Migration: Add speaker ratings to event reviews
-- Run in Supabase SQL Editor

-- Add speaker rating fields to bot_event_reviews
ALTER TABLE bot_event_reviews
ADD COLUMN IF NOT EXISTS speaker_id UUID REFERENCES speakers(id),
ADD COLUMN IF NOT EXISTS speaker_rating INTEGER CHECK (speaker_rating >= 1 AND speaker_rating <= 5);

-- Index for faster speaker queries
CREATE INDEX IF NOT EXISTS idx_event_reviews_speaker ON bot_event_reviews(speaker_id) WHERE speaker_id IS NOT NULL;

-- Comment for documentation
COMMENT ON COLUMN bot_event_reviews.speaker_id IS 'Optional reference to speaker being rated';
COMMENT ON COLUMN bot_event_reviews.speaker_rating IS 'Rating for the speaker (1-5), separate from event rating';
