-- Migration: Create speaker_ratings table for multiple speaker ratings per review
-- Run in Supabase SQL Editor

-- Create table for speaker ratings (one review can have ratings for multiple speakers)
CREATE TABLE IF NOT EXISTS speaker_ratings (
  id SERIAL PRIMARY KEY,
  review_id INTEGER NOT NULL REFERENCES bot_event_reviews(id) ON DELETE CASCADE,
  speaker_id UUID NOT NULL REFERENCES speakers(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(review_id, speaker_id)
);

-- Indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_speaker_ratings_review ON speaker_ratings(review_id);
CREATE INDEX IF NOT EXISTS idx_speaker_ratings_speaker ON speaker_ratings(speaker_id);

-- Enable RLS
ALTER TABLE speaker_ratings ENABLE ROW LEVEL SECURITY;

-- RLS policy: allow all reads (ratings are public)
CREATE POLICY "Speaker ratings are viewable by everyone"
ON speaker_ratings FOR SELECT
USING (true);

-- RLS policy: allow insert for authenticated users
CREATE POLICY "Users can insert speaker ratings"
ON speaker_ratings FOR INSERT
WITH CHECK (true);

-- Migrate existing speaker ratings from bot_event_reviews
INSERT INTO speaker_ratings (review_id, speaker_id, rating, created_at)
SELECT id, speaker_id, speaker_rating, created_at
FROM bot_event_reviews
WHERE speaker_id IS NOT NULL AND speaker_rating IS NOT NULL
ON CONFLICT (review_id, speaker_id) DO NOTHING;

-- Comments for documentation
COMMENT ON TABLE speaker_ratings IS 'Stores individual speaker ratings for event reviews';
COMMENT ON COLUMN speaker_ratings.review_id IS 'Reference to the parent event review';
COMMENT ON COLUMN speaker_ratings.speaker_id IS 'Reference to the speaker being rated';
COMMENT ON COLUMN speaker_ratings.rating IS 'Rating from 1 to 5 stars';
