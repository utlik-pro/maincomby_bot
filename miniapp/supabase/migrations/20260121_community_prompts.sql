-- Community Prompts Table
-- Gallery of AI image generation prompts shared by community

CREATE TABLE IF NOT EXISTS community_prompts (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES bot_users(id) ON DELETE CASCADE,

    -- Content
    prompt_text TEXT NOT NULL,
    image_url TEXT NOT NULL,

    -- Moderation
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    moderated_by BIGINT REFERENCES bot_users(id),
    moderated_at TIMESTAMPTZ,
    rejection_reason TEXT,

    -- Stats
    likes_count INT DEFAULT 0,
    copies_count INT DEFAULT 0,

    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_community_prompts_user ON community_prompts(user_id);
CREATE INDEX IF NOT EXISTS idx_community_prompts_status ON community_prompts(status);
CREATE INDEX IF NOT EXISTS idx_community_prompts_approved ON community_prompts(created_at DESC) WHERE status = 'approved';

-- Likes tracking table
CREATE TABLE IF NOT EXISTS community_prompt_likes (
    id BIGSERIAL PRIMARY KEY,
    prompt_id BIGINT NOT NULL REFERENCES community_prompts(id) ON DELETE CASCADE,
    user_id BIGINT NOT NULL REFERENCES bot_users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(prompt_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_prompt_likes_prompt ON community_prompt_likes(prompt_id);
CREATE INDEX IF NOT EXISTS idx_prompt_likes_user ON community_prompt_likes(user_id);

-- Function to update likes_count
CREATE OR REPLACE FUNCTION update_prompt_likes_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE community_prompts SET likes_count = likes_count + 1 WHERE id = NEW.prompt_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE community_prompts SET likes_count = likes_count - 1 WHERE id = OLD.prompt_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger for likes count
DROP TRIGGER IF EXISTS trigger_update_prompt_likes ON community_prompt_likes;
CREATE TRIGGER trigger_update_prompt_likes
AFTER INSERT OR DELETE ON community_prompt_likes
FOR EACH ROW EXECUTE FUNCTION update_prompt_likes_count();

-- Comments
COMMENT ON TABLE community_prompts IS 'AI image generation prompts shared by community';
COMMENT ON COLUMN community_prompts.status IS 'Moderation status: pending, approved, rejected';
COMMENT ON COLUMN community_prompts.copies_count IS 'How many times prompt was copied';
