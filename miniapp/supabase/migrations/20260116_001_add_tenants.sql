-- ═══════════════════════════════════════════════════════════════
-- GOD MODE: Multi-Tenancy Foundation
-- Migration: 20260116_001_add_tenants
-- ═══════════════════════════════════════════════════════════════

-- Таблица партнёров (tenants)
CREATE TABLE IF NOT EXISTS tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  domain TEXT UNIQUE,
  logo_url TEXT,
  is_active BOOLEAN DEFAULT true,
  settings JSONB DEFAULT '{
    "appName": "Community App",
    "defaultLocale": "ru",
    "defaultCity": "Минск",
    "timezone": "Europe/Minsk",
    "features": {
      "networking": true,
      "events": true,
      "learning": true,
      "achievements": true,
      "leaderboard": true,
      "referrals": true,
      "subscriptions": true
    }
  }'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Индексы
CREATE INDEX IF NOT EXISTS idx_tenants_slug ON tenants(slug);
CREATE INDEX IF NOT EXISTS idx_tenants_domain ON tenants(domain) WHERE domain IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_tenants_active ON tenants(is_active);

-- Триггер обновления updated_at
CREATE OR REPLACE FUNCTION update_tenant_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_tenants_updated_at ON tenants;
CREATE TRIGGER trigger_tenants_updated_at
  BEFORE UPDATE ON tenants
  FOR EACH ROW
  EXECUTE FUNCTION update_tenant_updated_at();

-- ═══════════════════════════════════════════════════════════════
-- СОЗДАНИЕ ДЕФОЛТНОГО TENANT'А (MAIN Community)
-- ═══════════════════════════════════════════════════════════════

INSERT INTO tenants (id, name, slug, settings)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'MAIN Community',
  'main-community',
  '{
    "appName": "MAIN Community",
    "defaultLocale": "ru",
    "defaultCity": "Минск",
    "timezone": "Europe/Minsk",
    "supportContact": "yana_martynen",
    "consultationContact": "dmitryutlik",
    "telegramChannel": "@main_community",
    "features": {
      "networking": true,
      "events": true,
      "learning": true,
      "achievements": true,
      "leaderboard": true,
      "referrals": true,
      "subscriptions": true
    }
  }'::jsonb
)
ON CONFLICT (slug) DO NOTHING;

-- ═══════════════════════════════════════════════════════════════
-- RLS POLICIES
-- ═══════════════════════════════════════════════════════════════

ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;

-- Публичное чтение активных tenant'ов (для определения tenant по домену/slug)
CREATE POLICY "tenants_public_read" ON tenants
  FOR SELECT
  USING (is_active = true);

-- Только God Mode может создавать/редактировать tenant'ов
-- (будет добавлено после создания таблицы admin_users)

COMMENT ON TABLE tenants IS 'God Mode: Партнёры/сообщества платформы';
COMMENT ON COLUMN tenants.slug IS 'Уникальный идентификатор в URL';
COMMENT ON COLUMN tenants.domain IS 'Кастомный домен (опционально)';
COMMENT ON COLUMN tenants.settings IS 'JSON с настройками: appName, locale, city, features и т.д.';
