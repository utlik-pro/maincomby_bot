-- Add columns for Telegram bot registrations to leads table
ALTER TABLE leads ADD COLUMN IF NOT EXISTS event_id UUID REFERENCES events(id);
ALTER TABLE leads ADD COLUMN IF NOT EXISTS telegram_username TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS telegram_id BIGINT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'web';

-- Make email nullable for Telegram registrations
ALTER TABLE leads ALTER COLUMN email DROP NOT NULL;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_leads_event_id ON leads(event_id);
CREATE INDEX IF NOT EXISTS idx_leads_telegram_id ON leads(telegram_id);

-- Update existing Mini App registrations with event_id for "ИИшница №2 от M.AI.N Community в Гродно!"
UPDATE leads
SET event_id = '2c71422d-81a9-48ed-afec-7d87aaf62544',
    telegram_username = CASE
      WHEN notes LIKE '%@rework_minsk%' THEN 'rework_minsk'
      WHEN notes LIKE '%@utlik_offer%' THEN 'utlik_offer'
      ELSE NULL
    END,
    telegram_id = CASE
      WHEN email LIKE 'tg_%@telegram.placeholder' THEN
        CAST(REPLACE(REPLACE(email, 'tg_', ''), '@telegram.placeholder', '') AS BIGINT)
      ELSE NULL
    END,
    source = 'telegram_miniapp'
WHERE email LIKE 'tg_%@telegram.placeholder';
