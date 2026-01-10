-- FIX: Grant execute permissions on RPC functions for XP system
-- The functions exist but anon/authenticated roles can't execute them

-- Grant execute on increment_user_points (used by addXP in miniapp)
GRANT EXECUTE ON FUNCTION increment_user_points(BIGINT, INTEGER) TO anon, authenticated, service_role;

-- Also grant the INTEGER version in case it exists
DO $$
BEGIN
    EXECUTE 'GRANT EXECUTE ON FUNCTION increment_user_points(INTEGER, INTEGER) TO anon, authenticated, service_role';
EXCEPTION WHEN undefined_function THEN
    -- Function with INTEGER signature doesn't exist, that's fine
    NULL;
END $$;

-- Grant execute on other helper functions
GRANT EXECUTE ON FUNCTION generate_invite_code() TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION create_user_invites(BIGINT, INTEGER) TO anon, authenticated, service_role;

-- Ensure xp_transactions table has proper permissions
GRANT ALL ON TABLE xp_transactions TO anon, authenticated, service_role;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;

-- Double-check RLS is disabled for xp_transactions
ALTER TABLE xp_transactions DISABLE ROW LEVEL SECURITY;

-- Verify the function exists and recreate if needed with proper SECURITY DEFINER
CREATE OR REPLACE FUNCTION increment_user_points(p_user_id BIGINT, p_points_to_add INTEGER)
RETURNS INTEGER AS $$
DECLARE
    new_points INTEGER;
BEGIN
    UPDATE bot_users
    SET points = GREATEST(0, COALESCE(points, 0) + p_points_to_add)
    WHERE id = p_user_id
    RETURNING points INTO new_points;
    RETURN new_points;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute again after recreating
GRANT EXECUTE ON FUNCTION increment_user_points(BIGINT, INTEGER) TO anon, authenticated, service_role;
