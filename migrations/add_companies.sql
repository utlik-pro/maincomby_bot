-- Migration: Companies System
-- Description: Creates tables for companies and user-company relationships

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Companies table - company profiles (created by admin only)
CREATE TABLE IF NOT EXISTS companies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  logo_url TEXT,              -- company logo
  website_url TEXT,           -- company website
  description TEXT,           -- short description
  industry TEXT,              -- IT, Marketing, Finance, etc.
  is_verified BOOLEAN DEFAULT false, -- admin verified
  is_active BOOLEAN DEFAULT true,    -- visible in list
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. User-Company relationships
CREATE TABLE IF NOT EXISTS user_companies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id INTEGER NOT NULL REFERENCES bot_users(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  role TEXT,                  -- CEO, CTO, Marketing Manager, etc.
  is_primary BOOLEAN DEFAULT true, -- main company to display
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, company_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_companies_name ON companies(name);
CREATE INDEX IF NOT EXISTS idx_companies_active ON companies(is_active);
CREATE INDEX IF NOT EXISTS idx_user_companies_user_id ON user_companies(user_id);
CREATE INDEX IF NOT EXISTS idx_user_companies_company_id ON user_companies(company_id);

-- RLS Policies
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_companies ENABLE ROW LEVEL SECURITY;

-- Companies: everyone can read active companies
CREATE POLICY "Anyone can read active companies" ON companies
  FOR SELECT USING (is_active = true);

-- Service role can manage companies (admin only creates)
CREATE POLICY "Service role can manage companies" ON companies
  FOR ALL USING (auth.role() = 'service_role');

-- User companies: anyone can read (for profile display)
CREATE POLICY "Anyone can read user companies" ON user_companies
  FOR SELECT USING (true);

-- Service role can manage user-company relationships
CREATE POLICY "Service role can manage user companies" ON user_companies
  FOR ALL USING (auth.role() = 'service_role');

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION update_companies_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER companies_updated_at
  BEFORE UPDATE ON companies
  FOR EACH ROW
  EXECUTE FUNCTION update_companies_updated_at();

-- Industry options (as reference, stored in TEXT field)
COMMENT ON COLUMN companies.industry IS 'Industry values: IT, Marketing, Finance, Education, Healthcare, Retail, Manufacturing, Consulting, Media, Other';

-- Comment on tables
COMMENT ON TABLE companies IS 'Companies created by admin for users to associate with';
COMMENT ON TABLE user_companies IS 'Links users to their companies with roles';
