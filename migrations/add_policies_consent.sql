-- Add policies consent fields to bot_users table
-- Required for compliance with Belarus Law №99-З on Personal Data Protection

-- Add policies_accepted field (default FALSE to require consent from all users)
ALTER TABLE bot_users ADD COLUMN IF NOT EXISTS policies_accepted BOOLEAN DEFAULT FALSE;

-- Add timestamp when policies were accepted
ALTER TABLE bot_users ADD COLUMN IF NOT EXISTS policies_accepted_at TIMESTAMP;

-- Add version of policies user accepted (to re-require consent when policies change)
ALTER TABLE bot_users ADD COLUMN IF NOT EXISTS policies_version INTEGER DEFAULT 0;

-- Index for querying users who haven't accepted policies
CREATE INDEX IF NOT EXISTS idx_bot_users_policies_accepted ON bot_users(policies_accepted);
