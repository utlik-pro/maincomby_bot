-- Fix: Make user_id nullable in auth_session_tokens
-- This allows creating tokens before bot confirmation

ALTER TABLE auth_session_tokens
ALTER COLUMN user_id DROP NOT NULL;
