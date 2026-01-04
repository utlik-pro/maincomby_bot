-- Avatar Skins System Migration
-- Creates tables for managing avatar frame/ring skins

-- ============================================
-- 1. AVATAR SKINS CATALOG
-- ============================================
CREATE TABLE IF NOT EXISTS avatar_skins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,

    -- Visual styling
    ring_color TEXT NOT NULL DEFAULT '#c8ff00',        -- Main ring color
    ring_width INTEGER NOT NULL DEFAULT 4,              -- Ring width in pixels (2, 3, 4)
    ring_offset INTEGER NOT NULL DEFAULT 2,             -- Ring offset in pixels
    glow_enabled BOOLEAN NOT NULL DEFAULT false,        -- Enable glow effect
    glow_color TEXT,                                    -- Glow color (if enabled)
    glow_intensity INTEGER DEFAULT 20,                  -- Glow spread (0-50)
    css_class TEXT,                                     -- Additional CSS classes
    icon_emoji TEXT,                                    -- Emoji for display

    -- Grant rules
    grant_type TEXT NOT NULL DEFAULT 'manual',          -- manual, achievement, subscription, event, auto
    grant_config JSONB DEFAULT '{}',                    -- Config for auto-grant (e.g., achievement_id, subscription_tier)

    -- Permissions/privileges this skin grants
    permissions JSONB DEFAULT '[]',                     -- Array of permission strings
    -- Possible permissions:
    -- 'can_checkin_events' - Volunteer can check in attendees
    -- 'can_create_posts' - Can create community posts
    -- 'is_admin' - Admin access
    -- 'is_moderator' - Moderation access
    -- 'priority_matching' - Priority in matching feed
    -- 'unlimited_swipes' - Bypass swipe limits

    -- Metadata
    priority INTEGER NOT NULL DEFAULT 0,                -- Higher = more prestigious (for auto-select)
    is_active BOOLEAN NOT NULL DEFAULT true,
    is_premium BOOLEAN NOT NULL DEFAULT false,          -- Premium-only skin
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index for lookups
CREATE INDEX IF NOT EXISTS idx_avatar_skins_slug ON avatar_skins(slug);
CREATE INDEX IF NOT EXISTS idx_avatar_skins_active ON avatar_skins(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_avatar_skins_priority ON avatar_skins(priority DESC);

-- ============================================
-- 2. USER AVATAR SKINS (Awarded skins)
-- ============================================
CREATE TABLE IF NOT EXISTS user_avatar_skins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id INTEGER NOT NULL REFERENCES bot_users(id) ON DELETE CASCADE,
    skin_id UUID NOT NULL REFERENCES avatar_skins(id) ON DELETE CASCADE,

    -- Award info
    awarded_by INTEGER REFERENCES bot_users(id) ON DELETE SET NULL,  -- Admin who awarded
    awarded_reason TEXT,                                          -- Why awarded
    awarded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ,                                       -- NULL = permanent

    -- Unique constraint - user can have each skin only once
    UNIQUE(user_id, skin_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_user_avatar_skins_user ON user_avatar_skins(user_id);
CREATE INDEX IF NOT EXISTS idx_user_avatar_skins_skin ON user_avatar_skins(skin_id);
CREATE INDEX IF NOT EXISTS idx_user_avatar_skins_expires ON user_avatar_skins(expires_at) WHERE expires_at IS NOT NULL;

-- ============================================
-- 3. ADD ACTIVE SKIN TO BOT_USERS TABLE
-- ============================================
ALTER TABLE bot_users ADD COLUMN IF NOT EXISTS active_skin_id UUID REFERENCES avatar_skins(id) ON DELETE SET NULL;

-- ============================================
-- 4. INSERT DEFAULT SKINS
-- ============================================
INSERT INTO avatar_skins (slug, name, description, ring_color, ring_width, ring_offset, glow_enabled, glow_color, glow_intensity, icon_emoji, grant_type, permissions, priority, sort_order) VALUES
-- Core Team - most prestigious
('core_team', 'Core Team', 'Member of MAIN core team', '#c8ff00', 4, 2, true, 'rgba(200,255,0,0.3)', 20, '💎', 'manual', '["is_admin", "can_checkin_events", "can_create_posts", "priority_matching", "unlimited_swipes"]', 100, 1),

-- Speaker - for event speakers
('speaker', 'Speaker', 'Event speaker or presenter', '#a855f7', 4, 2, false, NULL, 0, '🎤', 'manual', '["can_create_posts", "priority_matching"]', 80, 2),

-- Partner - business partners
('partner', 'Partner', 'Official MAIN partner', '#2dd4bf', 4, 2, false, NULL, 0, '🤝', 'manual', '["priority_matching"]', 70, 3),

-- Sponsor - event sponsors
('sponsor', 'Sponsor', 'Event sponsor', '#fb923c', 4, 2, false, NULL, 0, '⭐', 'manual', '["priority_matching"]', 75, 4),

-- Volunteer - event volunteers
('volunteer', 'Volunteer', 'Community volunteer', '#22c55e', 4, 2, false, NULL, 0, '💚', 'manual', '["can_checkin_events"]', 50, 5),

-- Pro Member - PRO subscription
('pro_member', 'Pro Member', 'PRO subscription active', '#c8ff00', 2, 1, false, NULL, 0, '👑', 'subscription', '["priority_matching", "unlimited_swipes"]', 30, 6),

-- Early Bird - first 100 users
('early_bird', 'Early Bird', 'One of the first 100 members', '#ef4444', 3, 2, false, NULL, 0, '🔥', 'auto', '[]', 40, 7),

-- Champion - top 3 leaderboard
('champion', 'Champion', 'Top 3 in the leaderboard', '#fbbf24', 4, 2, true, 'rgba(251,191,36,0.3)', 15, '🏆', 'auto', '["priority_matching"]', 60, 8),

-- Event Regular - attended 10+ events
('event_regular', 'Event Regular', 'Attended 10+ events', '#8b5cf6', 3, 2, false, NULL, 0, '🎯', 'achievement', '[]', 25, 9),

-- Networker - 25+ matches
('networker', 'Networker', '25+ successful matches', '#ec4899', 3, 2, false, NULL, 0, '💕', 'achievement', '[]', 25, 10)

ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    ring_color = EXCLUDED.ring_color,
    ring_width = EXCLUDED.ring_width,
    ring_offset = EXCLUDED.ring_offset,
    glow_enabled = EXCLUDED.glow_enabled,
    glow_color = EXCLUDED.glow_color,
    glow_intensity = EXCLUDED.glow_intensity,
    icon_emoji = EXCLUDED.icon_emoji,
    grant_type = EXCLUDED.grant_type,
    permissions = EXCLUDED.permissions,
    priority = EXCLUDED.priority,
    sort_order = EXCLUDED.sort_order,
    updated_at = NOW();

-- ============================================
-- 5. MIGRATE EXISTING TEAM_ROLES TO SKINS
-- ============================================
-- Award skins to users based on their current team_role
DO $$
DECLARE
    skin_record RECORD;
    user_record RECORD;
BEGIN
    -- Core team
    SELECT id INTO skin_record FROM avatar_skins WHERE slug = 'core_team';
    IF FOUND THEN
        FOR user_record IN SELECT id FROM bot_users WHERE team_role = 'core' LOOP
            INSERT INTO user_avatar_skins (user_id, skin_id, awarded_reason)
            VALUES (user_record.id, skin_record.id, 'Migrated from team_role')
            ON CONFLICT (user_id, skin_id) DO NOTHING;

            UPDATE bot_users SET active_skin_id = skin_record.id WHERE id = user_record.id AND active_skin_id IS NULL;
        END LOOP;
    END IF;

    -- Speaker
    SELECT id INTO skin_record FROM avatar_skins WHERE slug = 'speaker';
    IF FOUND THEN
        FOR user_record IN SELECT id FROM bot_users WHERE team_role = 'speaker' LOOP
            INSERT INTO user_avatar_skins (user_id, skin_id, awarded_reason)
            VALUES (user_record.id, skin_record.id, 'Migrated from team_role')
            ON CONFLICT (user_id, skin_id) DO NOTHING;

            UPDATE bot_users SET active_skin_id = skin_record.id WHERE id = user_record.id AND active_skin_id IS NULL;
        END LOOP;
    END IF;

    -- Partner
    SELECT id INTO skin_record FROM avatar_skins WHERE slug = 'partner';
    IF FOUND THEN
        FOR user_record IN SELECT id FROM bot_users WHERE team_role = 'partner' LOOP
            INSERT INTO user_avatar_skins (user_id, skin_id, awarded_reason)
            VALUES (user_record.id, skin_record.id, 'Migrated from team_role')
            ON CONFLICT (user_id, skin_id) DO NOTHING;

            UPDATE bot_users SET active_skin_id = skin_record.id WHERE id = user_record.id AND active_skin_id IS NULL;
        END LOOP;
    END IF;

    -- Sponsor
    SELECT id INTO skin_record FROM avatar_skins WHERE slug = 'sponsor';
    IF FOUND THEN
        FOR user_record IN SELECT id FROM bot_users WHERE team_role = 'sponsor' LOOP
            INSERT INTO user_avatar_skins (user_id, skin_id, awarded_reason)
            VALUES (user_record.id, skin_record.id, 'Migrated from team_role')
            ON CONFLICT (user_id, skin_id) DO NOTHING;

            UPDATE bot_users SET active_skin_id = skin_record.id WHERE id = user_record.id AND active_skin_id IS NULL;
        END LOOP;
    END IF;

    -- Volunteer
    SELECT id INTO skin_record FROM avatar_skins WHERE slug = 'volunteer';
    IF FOUND THEN
        FOR user_record IN SELECT id FROM bot_users WHERE team_role = 'volunteer' LOOP
            INSERT INTO user_avatar_skins (user_id, skin_id, awarded_reason)
            VALUES (user_record.id, skin_record.id, 'Migrated from team_role')
            ON CONFLICT (user_id, skin_id) DO NOTHING;

            UPDATE bot_users SET active_skin_id = skin_record.id WHERE id = user_record.id AND active_skin_id IS NULL;
        END LOOP;
    END IF;
END $$;

-- ============================================
-- 6. RLS POLICIES
-- ============================================
ALTER TABLE avatar_skins ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_avatar_skins ENABLE ROW LEVEL SECURITY;

-- Anyone can view active skins
CREATE POLICY "Anyone can view active avatar skins"
    ON avatar_skins FOR SELECT
    USING (is_active = true);

-- Users can view their own awarded skins
CREATE POLICY "Users can view their own awarded skins"
    ON user_avatar_skins FOR SELECT
    USING (true);

-- Only admins can modify skins (through service role)
-- Admins will use service role key for modifications

-- ============================================
-- 7. HELPER FUNCTIONS
-- ============================================

-- Function to get user's active skin with full details
CREATE OR REPLACE FUNCTION get_user_active_skin(p_user_id INTEGER)
RETURNS TABLE (
    skin_id UUID,
    slug TEXT,
    name TEXT,
    ring_color TEXT,
    ring_width INTEGER,
    ring_offset INTEGER,
    glow_enabled BOOLEAN,
    glow_color TEXT,
    glow_intensity INTEGER,
    css_class TEXT,
    icon_emoji TEXT,
    permissions JSONB
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        s.id,
        s.slug,
        s.name,
        s.ring_color,
        s.ring_width,
        s.ring_offset,
        s.glow_enabled,
        s.glow_color,
        s.glow_intensity,
        s.css_class,
        s.icon_emoji,
        s.permissions
    FROM bot_users u
    JOIN avatar_skins s ON u.active_skin_id = s.id
    WHERE u.id = p_user_id AND s.is_active = true;
END;
$$ LANGUAGE plpgsql;

-- Function to get all user's available skins
CREATE OR REPLACE FUNCTION get_user_available_skins(p_user_id INTEGER)
RETURNS TABLE (
    skin_id UUID,
    slug TEXT,
    name TEXT,
    description TEXT,
    ring_color TEXT,
    ring_width INTEGER,
    ring_offset INTEGER,
    glow_enabled BOOLEAN,
    glow_color TEXT,
    glow_intensity INTEGER,
    css_class TEXT,
    icon_emoji TEXT,
    priority INTEGER,
    awarded_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    is_active_skin BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        s.id,
        s.slug,
        s.name,
        s.description,
        s.ring_color,
        s.ring_width,
        s.ring_offset,
        s.glow_enabled,
        s.glow_color,
        s.glow_intensity,
        s.css_class,
        s.icon_emoji,
        s.priority,
        uas.awarded_at,
        uas.expires_at,
        (u.active_skin_id = s.id) AS is_active_skin
    FROM user_avatar_skins uas
    JOIN avatar_skins s ON uas.skin_id = s.id
    JOIN bot_users u ON uas.user_id = u.id
    WHERE uas.user_id = p_user_id
      AND s.is_active = true
      AND (uas.expires_at IS NULL OR uas.expires_at > NOW())
    ORDER BY s.priority DESC, uas.awarded_at DESC;
END;
$$ LANGUAGE plpgsql;

-- Function to check if user has specific permission through any of their skins
CREATE OR REPLACE FUNCTION user_has_skin_permission(p_user_id INTEGER, p_permission TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1
        FROM user_avatar_skins uas
        JOIN avatar_skins s ON uas.skin_id = s.id
        WHERE uas.user_id = p_user_id
          AND s.is_active = true
          AND (uas.expires_at IS NULL OR uas.expires_at > NOW())
          AND s.permissions ? p_permission
    );
END;
$$ LANGUAGE plpgsql;

-- Function to award skin to user
CREATE OR REPLACE FUNCTION award_skin_to_user(
    p_user_id INTEGER,
    p_skin_slug TEXT,
    p_awarded_by INTEGER DEFAULT NULL,
    p_reason TEXT DEFAULT NULL,
    p_expires_at TIMESTAMPTZ DEFAULT NULL,
    p_set_active BOOLEAN DEFAULT true
)
RETURNS UUID AS $$
DECLARE
    v_skin_id UUID;
    v_award_id UUID;
BEGIN
    -- Get skin ID
    SELECT id INTO v_skin_id FROM avatar_skins WHERE slug = p_skin_slug AND is_active = true;
    IF v_skin_id IS NULL THEN
        RAISE EXCEPTION 'Skin with slug % not found or inactive', p_skin_slug;
    END IF;

    -- Award skin
    INSERT INTO user_avatar_skins (user_id, skin_id, awarded_by, awarded_reason, expires_at)
    VALUES (p_user_id, v_skin_id, p_awarded_by, p_reason, p_expires_at)
    ON CONFLICT (user_id, skin_id) DO UPDATE SET
        awarded_by = COALESCE(EXCLUDED.awarded_by, user_avatar_skins.awarded_by),
        awarded_reason = COALESCE(EXCLUDED.awarded_reason, user_avatar_skins.awarded_reason),
        expires_at = EXCLUDED.expires_at
    RETURNING id INTO v_award_id;

    -- Set as active if requested
    IF p_set_active THEN
        UPDATE bot_users SET active_skin_id = v_skin_id WHERE id = p_user_id;
    END IF;

    RETURN v_award_id;
END;
$$ LANGUAGE plpgsql;

-- Function to revoke skin from user
CREATE OR REPLACE FUNCTION revoke_skin_from_user(p_user_id INTEGER, p_skin_slug TEXT)
RETURNS BOOLEAN AS $$
DECLARE
    v_skin_id UUID;
BEGIN
    SELECT id INTO v_skin_id FROM avatar_skins WHERE slug = p_skin_slug;
    IF v_skin_id IS NULL THEN
        RETURN false;
    END IF;

    -- Remove the skin
    DELETE FROM user_avatar_skins WHERE user_id = p_user_id AND skin_id = v_skin_id;

    -- If this was active skin, clear it
    UPDATE bot_users SET active_skin_id = NULL WHERE id = p_user_id AND active_skin_id = v_skin_id;

    RETURN true;
END;
$$ LANGUAGE plpgsql;
