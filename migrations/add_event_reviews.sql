-- Migration: Add event reviews table
-- Date: 2025-01-10

-- Create event reviews table
CREATE TABLE IF NOT EXISTS bot_event_reviews (
    id SERIAL PRIMARY KEY,
    event_id INTEGER NOT NULL REFERENCES bot_events(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES bot_users(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    text TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(event_id, user_id) -- один отзыв на пользователя на событие
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_event_reviews_event_id ON bot_event_reviews(event_id);
CREATE INDEX IF NOT EXISTS idx_event_reviews_user_id ON bot_event_reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_event_reviews_created_at ON bot_event_reviews(created_at DESC);

-- RLS policies
ALTER TABLE bot_event_reviews ENABLE ROW LEVEL SECURITY;

-- Allow read access for everyone
CREATE POLICY "Anyone can view reviews" ON bot_event_reviews
    FOR SELECT USING (true);

-- Allow insert for authenticated users
CREATE POLICY "Users can insert reviews" ON bot_event_reviews
    FOR INSERT WITH CHECK (true);

-- Comments
COMMENT ON TABLE bot_event_reviews IS 'User reviews and ratings for events';
COMMENT ON COLUMN bot_event_reviews.rating IS 'Rating from 1 to 5 stars';
COMMENT ON COLUMN bot_event_reviews.text IS 'Optional text review';
