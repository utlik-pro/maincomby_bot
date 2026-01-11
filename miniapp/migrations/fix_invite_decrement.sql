-- Fix: Add function to decrement invites when used
-- Also add referral stats function

-- Function to decrement inviter's remaining invites
CREATE OR REPLACE FUNCTION decrement_invites(p_user_id BIGINT)
RETURNS void AS $$
BEGIN
    UPDATE bot_users
    SET invites_remaining = GREATEST(0, COALESCE(invites_remaining, 0) - 1)
    WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION decrement_invites(BIGINT) TO anon, authenticated, service_role;

-- Function to get referral stats for a user (how many people they invited)
CREATE OR REPLACE FUNCTION get_referral_stats(p_user_id BIGINT)
RETURNS TABLE (
    total_invited BIGINT,
    total_xp_earned BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        COUNT(*)::BIGINT as total_invited,
        (COUNT(*) * 50)::BIGINT as total_xp_earned
    FROM bot_users
    WHERE invited_by = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION get_referral_stats(BIGINT) TO anon, authenticated, service_role;

-- Function to get referral tree (who invited whom)
CREATE OR REPLACE FUNCTION get_referral_tree()
RETURNS TABLE (
    inviter_id BIGINT,
    inviter_username TEXT,
    inviter_first_name TEXT,
    invitee_id BIGINT,
    invitee_username TEXT,
    invitee_first_name TEXT,
    invited_at TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        inviter.id::BIGINT as inviter_id,
        inviter.username::TEXT as inviter_username,
        inviter.first_name::TEXT as inviter_first_name,
        invitee.id::BIGINT as invitee_id,
        invitee.username::TEXT as invitee_username,
        invitee.first_name::TEXT as invitee_first_name,
        invitee.first_seen_at as invited_at
    FROM bot_users invitee
    JOIN bot_users inviter ON invitee.invited_by = inviter.id
    ORDER BY invitee.first_seen_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION get_referral_tree() TO anon, authenticated, service_role;

-- Function to get top referrers
CREATE OR REPLACE FUNCTION get_top_referrers(p_limit INTEGER DEFAULT 10)
RETURNS TABLE (
    user_id BIGINT,
    username TEXT,
    first_name TEXT,
    last_name TEXT,
    referral_count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        u.id::BIGINT as user_id,
        u.username::TEXT,
        u.first_name::TEXT,
        u.last_name::TEXT,
        COUNT(invited.id)::BIGINT as referral_count
    FROM bot_users u
    LEFT JOIN bot_users invited ON invited.invited_by = u.id
    GROUP BY u.id, u.username, u.first_name, u.last_name
    HAVING COUNT(invited.id) > 0
    ORDER BY referral_count DESC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION get_top_referrers(INTEGER) TO anon, authenticated, service_role;
