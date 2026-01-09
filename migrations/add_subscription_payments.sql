-- Migration: Add subscription fields and payments table
-- Date: 2025-01-10

-- Add subscription fields to bot_users table
ALTER TABLE bot_users ADD COLUMN subscription_tier TEXT DEFAULT 'free';
ALTER TABLE bot_users ADD COLUMN subscription_expires_at DATETIME;
ALTER TABLE bot_users ADD COLUMN daily_swipes_used INTEGER DEFAULT 0;
ALTER TABLE bot_users ADD COLUMN daily_swipes_reset_at DATETIME;

-- Create payments table for Telegram Stars payments
CREATE TABLE IF NOT EXISTS bot_payments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES bot_users(id),
    amount_stars INTEGER NOT NULL,
    subscription_type TEXT NOT NULL,
    telegram_payment_charge_id TEXT UNIQUE NOT NULL,
    provider_payment_charge_id TEXT,
    status TEXT DEFAULT 'completed',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON bot_payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_created_at ON bot_payments(created_at);
