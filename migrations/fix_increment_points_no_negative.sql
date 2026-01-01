-- Fix increment_user_points to prevent negative values
CREATE OR REPLACE FUNCTION increment_user_points(p_user_id INTEGER, p_points_to_add INTEGER)
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
$$ LANGUAGE plpgsql;
