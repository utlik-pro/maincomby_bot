-- ================================================================
-- FIX RLS POLICIES - Allow anon access for admin panel
-- Run this in Supabase SQL Editor
-- ================================================================

-- Drop restrictive policies
DROP POLICY IF EXISTS "Anyone can read active badges" ON custom_badges;
DROP POLICY IF EXISTS "Anyone can read user badges" ON user_badges;
DROP POLICY IF EXISTS "Service role can manage badges" ON custom_badges;
DROP POLICY IF EXISTS "Service role can manage user badges" ON user_badges;

DROP POLICY IF EXISTS "Anyone can read active companies" ON companies;
DROP POLICY IF EXISTS "Service role can manage companies" ON companies;
DROP POLICY IF EXISTS "Anyone can read user companies" ON user_companies;
DROP POLICY IF EXISTS "Service role can manage user companies" ON user_companies;

DROP POLICY IF EXISTS "Anyone can read public links" ON user_links;
DROP POLICY IF EXISTS "Service role can manage links" ON user_links;

-- Create permissive policies for custom_badges
CREATE POLICY "Allow all on custom_badges" ON custom_badges
  FOR ALL USING (true) WITH CHECK (true);

-- Create permissive policies for user_badges
CREATE POLICY "Allow all on user_badges" ON user_badges
  FOR ALL USING (true) WITH CHECK (true);

-- Create permissive policies for companies
CREATE POLICY "Allow all on companies" ON companies
  FOR ALL USING (true) WITH CHECK (true);

-- Create permissive policies for user_companies
CREATE POLICY "Allow all on user_companies" ON user_companies
  FOR ALL USING (true) WITH CHECK (true);

-- Create permissive policies for user_links
CREATE POLICY "Allow all on user_links" ON user_links
  FOR ALL USING (true) WITH CHECK (true);

SELECT 'RLS policies fixed!' as result;
