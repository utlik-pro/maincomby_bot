-- Migration: Add profile_photos table for multiple user photos
-- Date: 2025-01-09

-- Create profile_photos table
CREATE TABLE IF NOT EXISTS profile_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id INTEGER NOT NULL REFERENCES bot_users(id) ON DELETE CASCADE,
  photo_url TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  position INTEGER NOT NULL DEFAULT 0,
  is_primary BOOLEAN NOT NULL DEFAULT false,
  uploaded_at TIMESTAMPTZ DEFAULT NOW(),
  moderation_status TEXT DEFAULT 'approved' CHECK (moderation_status IN ('pending', 'approved', 'rejected')),

  -- Ensure unique position per user (0, 1, 2)
  UNIQUE(user_id, position),

  -- Ensure position is within limit
  CONSTRAINT valid_position CHECK (position >= 0 AND position < 3)
);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_profile_photos_user_id ON profile_photos(user_id);
CREATE INDEX IF NOT EXISTS idx_profile_photos_primary ON profile_photos(user_id) WHERE is_primary = true;

-- Trigger to ensure only one primary photo per user
CREATE OR REPLACE FUNCTION ensure_single_primary_photo()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_primary = true THEN
    UPDATE profile_photos
    SET is_primary = false
    WHERE user_id = NEW.user_id AND id != NEW.id AND is_primary = true;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_single_primary_photo ON profile_photos;
CREATE TRIGGER trigger_single_primary_photo
BEFORE INSERT OR UPDATE ON profile_photos
FOR EACH ROW EXECUTE FUNCTION ensure_single_primary_photo();

-- Note: Supabase Storage bucket 'profile-photos' needs to be created via Dashboard:
-- 1. Go to Storage in Supabase Dashboard
-- 2. Create bucket 'profile-photos' with public access
-- 3. Set file size limit to 5MB
-- 4. Allow MIME types: image/jpeg, image/png, image/webp

COMMENT ON TABLE profile_photos IS 'User profile photos for the networking/matching feature. Max 3 photos per user.';
COMMENT ON COLUMN profile_photos.position IS 'Order of photo (0 = first/primary, 1 = second, 2 = third)';
COMMENT ON COLUMN profile_photos.storage_path IS 'Path in Supabase Storage bucket profile-photos';
