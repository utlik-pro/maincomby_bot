-- ═══════════════════════════════════════════════════════════════
-- GOD MODE: Tenant Bots
-- Migration: 20260116_005_add_tenant_bots
-- ═══════════════════════════════════════════════════════════════

-- Таблица привязки ботов
CREATE TABLE IF NOT EXISTS tenant_bots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,
  bot_type TEXT NOT NULL CHECK (bot_type IN ('own', 'shared')),

  -- Для own бота (собственный бот партнёра)
  bot_token_encrypted TEXT, -- Зашифрованный токен
  bot_username TEXT,
  webhook_url TEXT,

  -- Для shared бота (общий бот с параметром startapp)
  startapp_param TEXT UNIQUE,

  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Индексы
CREATE INDEX IF NOT EXISTS idx_tenant_bots_tenant ON tenant_bots(tenant_id);
CREATE INDEX IF NOT EXISTS idx_tenant_bots_startapp ON tenant_bots(startapp_param) WHERE startapp_param IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_tenant_bots_username ON tenant_bots(bot_username) WHERE bot_username IS NOT NULL;

-- Constraint: один активный бот на tenant
CREATE UNIQUE INDEX IF NOT EXISTS idx_tenant_bots_one_active
  ON tenant_bots(tenant_id)
  WHERE is_active = true;

-- Триггер обновления
DROP TRIGGER IF EXISTS trigger_tenant_bots_updated_at ON tenant_bots;
CREATE TRIGGER trigger_tenant_bots_updated_at
  BEFORE UPDATE ON tenant_bots
  FOR EACH ROW
  EXECUTE FUNCTION update_tenant_updated_at();

-- ═══════════════════════════════════════════════════════════════
-- СОЗДАНИЕ БОТА ДЛЯ MAIN COMMUNITY
-- ═══════════════════════════════════════════════════════════════

INSERT INTO tenant_bots (tenant_id, bot_type, bot_username, is_active)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'own',
  'maincomapp_bot',
  true
)
ON CONFLICT DO NOTHING;

-- ═══════════════════════════════════════════════════════════════
-- RLS POLICIES
-- ═══════════════════════════════════════════════════════════════

ALTER TABLE tenant_bots ENABLE ROW LEVEL SECURITY;

-- Публичное чтение для определения tenant'а по startapp параметру
CREATE POLICY "tenant_bots_public_read" ON tenant_bots
  FOR SELECT
  USING (is_active = true);

-- God Mode может всё
CREATE POLICY "tenant_bots_god_mode_all" ON tenant_bots
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM admin_users au
      WHERE au.telegram_id = (current_setting('request.jwt.claims', true)::jsonb->>'telegram_id')::bigint
      AND au.role = 'god_mode'
      AND au.is_active = true
    )
  );

-- Partner Admin может редактировать только свой бот
CREATE POLICY "tenant_bots_partner_own" ON tenant_bots
  FOR ALL
  USING (
    tenant_id IN (
      SELECT au.tenant_id FROM admin_users au
      WHERE au.telegram_id = (current_setting('request.jwt.claims', true)::jsonb->>'telegram_id')::bigint
      AND au.role = 'partner_admin'
      AND au.is_active = true
    )
  );

-- ═══════════════════════════════════════════════════════════════
-- ФУНКЦИИ
-- ═══════════════════════════════════════════════════════════════

-- Получить tenant по startapp параметру
CREATE OR REPLACE FUNCTION get_tenant_by_startapp(p_startapp TEXT)
RETURNS UUID AS $$
BEGIN
  RETURN (
    SELECT tenant_id
    FROM tenant_bots
    WHERE startapp_param = p_startapp
      AND is_active = true
    LIMIT 1
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Генерировать уникальный startapp параметр
CREATE OR REPLACE FUNCTION generate_startapp_param(p_tenant_slug TEXT)
RETURNS TEXT AS $$
DECLARE
  v_param TEXT;
  v_exists BOOLEAN;
BEGIN
  LOOP
    v_param := p_tenant_slug || '-' || substr(md5(random()::text), 1, 6);

    SELECT EXISTS(
      SELECT 1 FROM tenant_bots WHERE startapp_param = v_param
    ) INTO v_exists;

    IF NOT v_exists THEN
      RETURN v_param;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

COMMENT ON TABLE tenant_bots IS 'God Mode: Привязка Telegram ботов к tenant''ам';
COMMENT ON COLUMN tenant_bots.bot_type IS 'own - собственный бот, shared - общий с startapp';
COMMENT ON COLUMN tenant_bots.bot_token_encrypted IS 'Зашифрованный токен (только для own)';
COMMENT ON COLUMN tenant_bots.startapp_param IS 'Уникальный параметр t.me/bot?startapp=PARAM (только для shared)';
