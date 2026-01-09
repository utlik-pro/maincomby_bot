-- Migration: Add payments table for Telegram Stars (Supabase/PostgreSQL)
-- Date: 2025-01-10
-- Note: subscription fields already exist in bot_users from add_miniapp_columns.sql

-- Create payments table for Telegram Stars payments
CREATE TABLE IF NOT EXISTS bot_payments (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES bot_users(id) ON DELETE CASCADE,
    amount_stars INTEGER NOT NULL,
    subscription_type TEXT NOT NULL CHECK (subscription_type IN ('light', 'pro')),
    telegram_payment_charge_id TEXT UNIQUE NOT NULL,
    provider_payment_charge_id TEXT,
    status TEXT DEFAULT 'completed' CHECK (status IN ('completed', 'refunded')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_bot_payments_user_id ON bot_payments(user_id);
CREATE INDEX IF NOT EXISTS idx_bot_payments_created_at ON bot_payments(created_at);

-- RLS policies
ALTER TABLE bot_payments ENABLE ROW LEVEL SECURITY;

-- Allow read access
CREATE POLICY "Anyone can view payments" ON bot_payments
    FOR SELECT USING (true);

-- Allow insert (for bot)
CREATE POLICY "Service can insert payments" ON bot_payments
    FOR INSERT WITH CHECK (true);

COMMENT ON TABLE bot_payments IS 'Telegram Stars payment records for subscription purchases';
