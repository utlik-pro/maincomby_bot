-- Add short_code field for QR code / manual code entry auth
ALTER TABLE auth_session_tokens
ADD COLUMN IF NOT EXISTS short_code VARCHAR(6);

CREATE INDEX IF NOT EXISTS idx_auth_tokens_short_code
ON auth_session_tokens(short_code);
