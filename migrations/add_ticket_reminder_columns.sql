-- Migration: Add ticket reminder tracking columns to bot_registrations
-- Date: 2026-01-21
-- Description: Adds columns to track ticket reminder notifications sent at 18:30 on event day

-- Add ticket_reminder_sent column (boolean, default false)
ALTER TABLE bot_registrations
ADD COLUMN IF NOT EXISTS ticket_reminder_sent BOOLEAN DEFAULT FALSE;

-- Add ticket_reminder_sent_at column (timestamp)
ALTER TABLE bot_registrations
ADD COLUMN IF NOT EXISTS ticket_reminder_sent_at TIMESTAMP;

-- Create index for efficient queries
CREATE INDEX IF NOT EXISTS idx_bot_registrations_ticket_reminder_sent
ON bot_registrations(ticket_reminder_sent);
