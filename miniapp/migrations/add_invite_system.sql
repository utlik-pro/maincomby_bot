-- 1. App Settings Table
CREATE TABLE IF NOT EXISTS app_settings (
    key VARCHAR(100) PRIMARY KEY,
    value JSONB NOT NULL,
    description TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    updated_by INTEGER REFERENCES bot_users(id)
);

-- Initial setting: invites enabled by default
INSERT INTO app_settings (key, value, description)
VALUES ('invite_required', 'true', 'Требовать инвайт для доступа к приложению')
ON CONFLICT (key) DO NOTHING;

-- 2. Invites Table
CREATE TABLE IF NOT EXISTS invites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(12) NOT NULL UNIQUE,
    inviter_id INTEGER NOT NULL REFERENCES bot_users(id) ON DELETE CASCADE,
    invitee_id INTEGER REFERENCES bot_users(id) ON DELETE SET NULL,
    used_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Whitelist Table
CREATE TABLE IF NOT EXISTS admin_whitelist (
    id SERIAL PRIMARY KEY,
    tg_user_id BIGINT NOT NULL UNIQUE,
    added_by INTEGER REFERENCES bot_users(id),
    reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_invites_code ON invites(code);
CREATE INDEX IF NOT EXISTS idx_invites_inviter ON invites(inviter_id);
CREATE INDEX IF NOT EXISTS idx_invites_invitee ON invites(invitee_id);
CREATE INDEX IF NOT EXISTS idx_whitelist_tg_id ON admin_whitelist(tg_user_id);

-- 4. Update bot_users table
ALTER TABLE bot_users
ADD COLUMN IF NOT EXISTS invites_remaining INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS invited_by INTEGER REFERENCES bot_users(id),
ADD COLUMN IF NOT EXISTS invite_code_used VARCHAR(12);

CREATE INDEX IF NOT EXISTS idx_users_invited_by ON bot_users(invited_by);

-- 5. Functions

-- Generate unique invite code
CREATE OR REPLACE FUNCTION generate_invite_code()
RETURNS VARCHAR(12) AS $$
DECLARE
    chars VARCHAR := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    result VARCHAR(12) := '';
    i INTEGER;
BEGIN
    FOR i IN 1..12 LOOP
        result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
    END LOOP;
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Create invites for user
CREATE OR REPLACE FUNCTION create_user_invites(p_user_id INTEGER, p_count INTEGER DEFAULT 5)
RETURNS INTEGER AS $$
DECLARE
    i INTEGER;
    new_code VARCHAR(12);
    created_count INTEGER := 0;
BEGIN
    FOR i IN 1..p_count LOOP
        LOOP
            new_code := generate_invite_code();
            EXIT WHEN NOT EXISTS (SELECT 1 FROM invites WHERE code = new_code);
        END LOOP;

        INSERT INTO invites (code, inviter_id)
        VALUES (new_code, p_user_id);

        created_count := created_count + 1;
    END LOOP;

    -- Update user's remaining invites count
    UPDATE bot_users
    SET invites_remaining = COALESCE(invites_remaining, 0) + p_count
    WHERE id = p_user_id;

    RETURN created_count;
END;
$$ LANGUAGE plpgsql;

-- 6. Initial Migration Data

-- Give 5 invites to all existing users if they don't have any
UPDATE bot_users
SET invites_remaining = 5
WHERE invites_remaining IS NULL OR invites_remaining = 0;

-- Generate invite codes for existing users (this might be slow for many users, but fine for <10k)
DO $$
DECLARE
    user_record RECORD;
BEGIN
    FOR user_record IN SELECT id FROM bot_users WHERE invites_remaining > 0 AND NOT EXISTS (SELECT 1 FROM invites WHERE inviter_id = bot_users.id) LOOP
        PERFORM create_user_invites(user_record.id, 5);
        -- Reset count back to 5 because create_user_invites adds to existing count
        UPDATE bot_users SET invites_remaining = 5 WHERE id = user_record.id;
    END LOOP;
END $$;

-- Add Core Team to Whitelist (optional, based on role)
INSERT INTO admin_whitelist (tg_user_id, reason)
SELECT tg_user_id, 'Core team member'
FROM bot_users
WHERE team_role = 'core'
ON CONFLICT (tg_user_id) DO NOTHING;
