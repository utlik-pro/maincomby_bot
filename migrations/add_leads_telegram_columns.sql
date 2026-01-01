-- Add columns for Telegram bot registrations to leads table
ALTER TABLE leads ADD COLUMN IF NOT EXISTS event_id UUID REFERENCES events(id);
ALTER TABLE leads ADD COLUMN IF NOT EXISTS telegram_username TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS telegram_id BIGINT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'web';

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_leads_event_id ON leads(event_id);
CREATE INDEX IF NOT EXISTS idx_leads_telegram_id ON leads(telegram_id);

-- Add unique constraint to prevent duplicate registrations
ALTER TABLE leads ADD CONSTRAINT unique_event_telegram_id UNIQUE (event_id, telegram_id);
