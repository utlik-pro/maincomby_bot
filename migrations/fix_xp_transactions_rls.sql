-- Fix RLS policies for xp_transactions to allow insert from miniapp

-- Drop old restrictive policies
DROP POLICY IF EXISTS "Users can view own xp_transactions" ON xp_transactions;
DROP POLICY IF EXISTS "Service can insert xp_transactions" ON xp_transactions;
DROP POLICY IF EXISTS "Allow read xp_transactions" ON xp_transactions;
DROP POLICY IF EXISTS "Allow insert xp_transactions" ON xp_transactions;

-- Create permissive policies
CREATE POLICY "Allow all read xp_transactions" ON xp_transactions
    FOR SELECT USING (true);

CREATE POLICY "Allow all insert xp_transactions" ON xp_transactions
    FOR INSERT WITH CHECK (true);

-- Grant permissions to anon role (used by miniapp)
GRANT SELECT, INSERT ON xp_transactions TO anon;
GRANT USAGE, SELECT ON SEQUENCE xp_transactions_id_seq TO anon;

-- Also ensure bot_users can be updated
DROP POLICY IF EXISTS "Allow update bot_users points" ON bot_users;
CREATE POLICY "Allow update bot_users points" ON bot_users
    FOR UPDATE USING (true) WITH CHECK (true);

GRANT UPDATE ON bot_users TO anon;
