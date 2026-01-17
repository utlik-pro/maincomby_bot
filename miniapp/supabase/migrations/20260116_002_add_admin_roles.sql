-- ═══════════════════════════════════════════════════════════════
-- GOD MODE: Admin Roles System
-- Migration: 20260116_002_add_admin_roles
-- ═══════════════════════════════════════════════════════════════

-- Тип для ролей
DO $$ BEGIN
  CREATE TYPE admin_role AS ENUM ('god_mode', 'partner_admin', 'moderator');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Таблица админов
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  role admin_role NOT NULL,
  telegram_id BIGINT UNIQUE,
  telegram_username TEXT UNIQUE,
  permissions JSONB DEFAULT '{}'::jsonb,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Индексы
CREATE INDEX IF NOT EXISTS idx_admin_users_tenant ON admin_users(tenant_id);
CREATE INDEX IF NOT EXISTS idx_admin_users_telegram ON admin_users(telegram_id);
CREATE INDEX IF NOT EXISTS idx_admin_users_role ON admin_users(role);
CREATE INDEX IF NOT EXISTS idx_admin_users_user ON admin_users(user_id);

-- Триггер обновления
DROP TRIGGER IF EXISTS trigger_admin_users_updated_at ON admin_users;
CREATE TRIGGER trigger_admin_users_updated_at
  BEFORE UPDATE ON admin_users
  FOR EACH ROW
  EXECUTE FUNCTION update_tenant_updated_at();

-- ═══════════════════════════════════════════════════════════════
-- СОЗДАНИЕ GOD MODE ПОЛЬЗОВАТЕЛЕЙ
-- ═══════════════════════════════════════════════════════════════

-- dmitryutlik - основной God Mode
INSERT INTO admin_users (tenant_id, role, telegram_username, permissions)
VALUES (
  NULL, -- God Mode имеет доступ ко всем tenant'ам
  'god_mode',
  'dmitryutlik',
  '{
    "tenants": {"create": true, "read": true, "update": true, "delete": true},
    "users": {"read": true, "update": true, "delete": true, "ban": true},
    "blocks": {"read": true, "create": true, "update": true, "delete": true},
    "themes": {"read": true, "create": true, "update": true, "delete": true},
    "events": {"read": true, "create": true, "update": true, "delete": true, "moderate": true},
    "courses": {"read": true, "create": true, "update": true, "delete": true, "publish": true},
    "settings": {"read": true, "update": true},
    "analytics": {"read": true, "export": true}
  }'::jsonb
)
ON CONFLICT (telegram_username) DO NOTHING;

-- utlik_offer - резервный God Mode
INSERT INTO admin_users (tenant_id, role, telegram_username, permissions)
VALUES (
  NULL,
  'god_mode',
  'utlik_offer',
  '{
    "tenants": {"create": true, "read": true, "update": true, "delete": true},
    "users": {"read": true, "update": true, "delete": true, "ban": true},
    "blocks": {"read": true, "create": true, "update": true, "delete": true},
    "themes": {"read": true, "create": true, "update": true, "delete": true},
    "events": {"read": true, "create": true, "update": true, "delete": true, "moderate": true},
    "courses": {"read": true, "create": true, "update": true, "delete": true, "publish": true},
    "settings": {"read": true, "update": true},
    "analytics": {"read": true, "export": true}
  }'::jsonb
)
ON CONFLICT (telegram_username) DO NOTHING;

-- ═══════════════════════════════════════════════════════════════
-- RLS POLICIES
-- ═══════════════════════════════════════════════════════════════

ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- God Mode видит всех админов
CREATE POLICY "admin_users_god_mode_all" ON admin_users
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM admin_users au
      WHERE au.telegram_id = (current_setting('request.jwt.claims', true)::jsonb->>'telegram_id')::bigint
      AND au.role = 'god_mode'
      AND au.is_active = true
    )
  );

-- Partner Admin видит только своих админов
CREATE POLICY "admin_users_partner_own" ON admin_users
  FOR SELECT
  USING (
    tenant_id IN (
      SELECT au.tenant_id FROM admin_users au
      WHERE au.telegram_id = (current_setting('request.jwt.claims', true)::jsonb->>'telegram_id')::bigint
      AND au.role = 'partner_admin'
      AND au.is_active = true
    )
  );

-- ═══════════════════════════════════════════════════════════════
-- ФУНКЦИЯ ПРОВЕРКИ РОЛИ
-- ═══════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION check_admin_role(
  p_telegram_id BIGINT,
  p_required_role admin_role DEFAULT 'moderator'
)
RETURNS BOOLEAN AS $$
DECLARE
  v_role admin_role;
BEGIN
  SELECT role INTO v_role
  FROM admin_users
  WHERE telegram_id = p_telegram_id
    AND is_active = true;

  IF v_role IS NULL THEN
    RETURN false;
  END IF;

  -- God Mode имеет все права
  IF v_role = 'god_mode' THEN
    RETURN true;
  END IF;

  -- Partner Admin имеет права partner_admin и moderator
  IF v_role = 'partner_admin' AND p_required_role IN ('partner_admin', 'moderator') THEN
    RETURN true;
  END IF;

  -- Moderator имеет только права moderator
  IF v_role = 'moderator' AND p_required_role = 'moderator' THEN
    RETURN true;
  END IF;

  RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ═══════════════════════════════════════════════════════════════
-- ФУНКЦИЯ ПОЛУЧЕНИЯ TENANT'А ПОЛЬЗОВАТЕЛЯ
-- ═══════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION get_admin_tenant_id(p_telegram_id BIGINT)
RETURNS UUID AS $$
BEGIN
  RETURN (
    SELECT tenant_id
    FROM admin_users
    WHERE telegram_id = p_telegram_id
      AND is_active = true
    LIMIT 1
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON TABLE admin_users IS 'God Mode: Администраторы платформы';
COMMENT ON COLUMN admin_users.tenant_id IS 'NULL для God Mode (доступ ко всем tenant''ам)';
COMMENT ON COLUMN admin_users.role IS 'god_mode, partner_admin, moderator';
COMMENT ON COLUMN admin_users.permissions IS 'JSON с правами доступа';
