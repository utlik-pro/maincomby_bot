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
-- ═══════════════════════════════════════════════════════════════
-- GOD MODE: Tenant Themes
-- Migration: 20260116_003_add_tenant_themes
-- ═══════════════════════════════════════════════════════════════

-- Таблица тем
CREATE TABLE IF NOT EXISTS tenant_themes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  colors JSONB NOT NULL DEFAULT '{
    "accent": "#c8ff00",
    "accentHover": "#d4ff33",
    "bgPrimary": "#0a0a0a",
    "bgSecondary": "#1a1a1a",
    "bgCard": "#141414",
    "bgInput": "#1f1f1f",
    "textPrimary": "#ffffff",
    "textSecondary": "#a0a0a0",
    "textMuted": "#666666",
    "border": "#2a2a2a",
    "success": "#22c55e",
    "danger": "#ef4444",
    "warning": "#f59e0b",
    "info": "#3b82f6"
  }'::jsonb,
  fonts JSONB DEFAULT '{
    "primary": "Inter",
    "heading": "Inter",
    "mono": "JetBrains Mono"
  }'::jsonb,
  border_radius JSONB DEFAULT '{
    "sm": "8px",
    "md": "12px",
    "lg": "16px",
    "xl": "24px",
    "full": "9999px"
  }'::jsonb,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Индексы
CREATE INDEX IF NOT EXISTS idx_tenant_themes_tenant ON tenant_themes(tenant_id);
CREATE INDEX IF NOT EXISTS idx_tenant_themes_default ON tenant_themes(tenant_id, is_default) WHERE is_default = true;

-- Constraint: только одна дефолтная тема на tenant
CREATE UNIQUE INDEX IF NOT EXISTS idx_tenant_themes_one_default
  ON tenant_themes(tenant_id)
  WHERE is_default = true;

-- ═══════════════════════════════════════════════════════════════
-- СОЗДАНИЕ ДЕФОЛТНОЙ ТЕМЫ ДЛЯ MAIN COMMUNITY
-- ═══════════════════════════════════════════════════════════════

INSERT INTO tenant_themes (tenant_id, name, colors, is_default)
SELECT
  '00000000-0000-0000-0000-000000000001',
  'MAIN Dark',
  '{
    "accent": "#c8ff00",
    "accentHover": "#d4ff33",
    "bgPrimary": "#0a0a0a",
    "bgSecondary": "#1a1a1a",
    "bgCard": "#141414",
    "bgInput": "#1f1f1f",
    "textPrimary": "#ffffff",
    "textSecondary": "#a0a0a0",
    "textMuted": "#666666",
    "border": "#2a2a2a",
    "success": "#22c55e",
    "danger": "#ef4444",
    "warning": "#f59e0b",
    "info": "#3b82f6"
  }'::jsonb,
  true
WHERE NOT EXISTS (
  SELECT 1 FROM tenant_themes WHERE tenant_id = '00000000-0000-0000-0000-000000000001'
);

-- ═══════════════════════════════════════════════════════════════
-- RLS POLICIES
-- ═══════════════════════════════════════════════════════════════

ALTER TABLE tenant_themes ENABLE ROW LEVEL SECURITY;

-- Публичное чтение тем (для применения в Mini App)
CREATE POLICY "tenant_themes_public_read" ON tenant_themes
  FOR SELECT
  USING (true);

-- God Mode может всё
CREATE POLICY "tenant_themes_god_mode_all" ON tenant_themes
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM admin_users au
      WHERE au.telegram_id = (current_setting('request.jwt.claims', true)::jsonb->>'telegram_id')::bigint
      AND au.role = 'god_mode'
      AND au.is_active = true
    )
  );

-- Partner Admin может редактировать только свои темы
CREATE POLICY "tenant_themes_partner_own" ON tenant_themes
  FOR ALL
  USING (
    tenant_id IN (
      SELECT au.tenant_id FROM admin_users au
      WHERE au.telegram_id = (current_setting('request.jwt.claims', true)::jsonb->>'telegram_id')::bigint
      AND au.role = 'partner_admin'
      AND au.is_active = true
    )
  );

COMMENT ON TABLE tenant_themes IS 'God Mode: Темы и брендинг tenant''ов';
COMMENT ON COLUMN tenant_themes.colors IS 'JSON с цветами: accent, bg*, text*, success, danger и т.д.';
COMMENT ON COLUMN tenant_themes.is_default IS 'Дефолтная тема tenant''а (одна на tenant)';
-- ═══════════════════════════════════════════════════════════════
-- GOD MODE: App Blocks (Конструктор блоков)
-- Migration: 20260116_004_add_app_blocks
-- ═══════════════════════════════════════════════════════════════

-- Тип для блоков
DO $$ BEGIN
  CREATE TYPE block_type AS ENUM (
    'hero',           -- Главный баннер
    'events',         -- Список событий
    'leaderboard',    -- Таблица лидеров
    'network',        -- Нетворкинг (рекомендации)
    'courses',        -- Курсы
    'achievements',   -- Достижения
    'profile',        -- Мини-профиль
    'stats',          -- Статистика сообщества
    'announcements',  -- Объявления
    'custom_html'     -- Кастомный HTML
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Таблица блоков
CREATE TABLE IF NOT EXISTS app_blocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,
  block_type block_type NOT NULL,
  position INTEGER NOT NULL DEFAULT 0,
  title JSONB, -- Локализованное название {"ru": "...", "en": "..."}
  config JSONB DEFAULT '{}'::jsonb,
  is_visible BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Индексы
CREATE INDEX IF NOT EXISTS idx_app_blocks_tenant ON app_blocks(tenant_id);
CREATE INDEX IF NOT EXISTS idx_app_blocks_position ON app_blocks(tenant_id, position);
CREATE INDEX IF NOT EXISTS idx_app_blocks_visible ON app_blocks(tenant_id, is_visible) WHERE is_visible = true;

-- Unique constraint на позицию в рамках tenant'а
CREATE UNIQUE INDEX IF NOT EXISTS idx_app_blocks_unique_position
  ON app_blocks(tenant_id, position);

-- Триггер обновления
DROP TRIGGER IF EXISTS trigger_app_blocks_updated_at ON app_blocks;
CREATE TRIGGER trigger_app_blocks_updated_at
  BEFORE UPDATE ON app_blocks
  FOR EACH ROW
  EXECUTE FUNCTION update_tenant_updated_at();

-- ═══════════════════════════════════════════════════════════════
-- ДЕФОЛТНЫЕ БЛОКИ ДЛЯ MAIN COMMUNITY
-- ═══════════════════════════════════════════════════════════════

INSERT INTO app_blocks (tenant_id, block_type, position, title, config, is_visible)
VALUES
  -- Профиль пользователя
  (
    '00000000-0000-0000-0000-000000000001',
    'profile',
    0,
    '{"ru": "Мой профиль", "en": "My Profile"}'::jsonb,
    '{"showStats": true, "showLevel": true, "showNextAchievement": true, "compactMode": false}'::jsonb,
    true
  ),
  -- События
  (
    '00000000-0000-0000-0000-000000000001',
    'events',
    1,
    '{"ru": "Ближайшие события", "en": "Upcoming Events"}'::jsonb,
    '{"limit": 5, "showPastEvents": false, "showRegistrationButton": true, "layout": "list"}'::jsonb,
    true
  ),
  -- Лидерборд
  (
    '00000000-0000-0000-0000-000000000001',
    'leaderboard',
    2,
    '{"ru": "Топ участников", "en": "Top Members"}'::jsonb,
    '{"limit": 10, "period": "month", "showCurrentUser": true, "metric": "points"}'::jsonb,
    true
  ),
  -- Нетворкинг
  (
    '00000000-0000-0000-0000-000000000001',
    'network',
    3,
    '{"ru": "Рекомендации", "en": "Recommendations"}'::jsonb,
    '{"limit": 5, "showCompatibilityScore": true, "showSkills": true, "enableSwiping": false}'::jsonb,
    true
  ),
  -- Достижения
  (
    '00000000-0000-0000-0000-000000000001',
    'achievements',
    4,
    '{"ru": "Достижения", "en": "Achievements"}'::jsonb,
    '{"showLocked": true, "limit": 8, "layout": "grid"}'::jsonb,
    true
  )
ON CONFLICT (tenant_id, position) DO NOTHING;

-- ═══════════════════════════════════════════════════════════════
-- RLS POLICIES
-- ═══════════════════════════════════════════════════════════════

ALTER TABLE app_blocks ENABLE ROW LEVEL SECURITY;

-- Публичное чтение блоков (для рендеринга в Mini App)
CREATE POLICY "app_blocks_public_read" ON app_blocks
  FOR SELECT
  USING (is_visible = true);

-- God Mode может всё
CREATE POLICY "app_blocks_god_mode_all" ON app_blocks
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM admin_users au
      WHERE au.telegram_id = (current_setting('request.jwt.claims', true)::jsonb->>'telegram_id')::bigint
      AND au.role = 'god_mode'
      AND au.is_active = true
    )
  );

-- Partner Admin может редактировать только свои блоки
CREATE POLICY "app_blocks_partner_own" ON app_blocks
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
-- ФУНКЦИИ ДЛЯ РАБОТЫ С БЛОКАМИ
-- ═══════════════════════════════════════════════════════════════

-- Получить блоки tenant'а в правильном порядке
CREATE OR REPLACE FUNCTION get_tenant_blocks(p_tenant_id UUID)
RETURNS SETOF app_blocks AS $$
BEGIN
  RETURN QUERY
  SELECT *
  FROM app_blocks
  WHERE tenant_id = p_tenant_id
    AND is_visible = true
  ORDER BY position ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Переместить блок (обновить позицию)
CREATE OR REPLACE FUNCTION move_block(
  p_block_id UUID,
  p_new_position INTEGER
)
RETURNS BOOLEAN AS $$
DECLARE
  v_tenant_id UUID;
  v_old_position INTEGER;
BEGIN
  -- Получаем текущие данные блока
  SELECT tenant_id, position INTO v_tenant_id, v_old_position
  FROM app_blocks
  WHERE id = p_block_id;

  IF v_tenant_id IS NULL THEN
    RETURN false;
  END IF;

  -- Сдвигаем другие блоки
  IF p_new_position > v_old_position THEN
    -- Двигаем вниз
    UPDATE app_blocks
    SET position = position - 1
    WHERE tenant_id = v_tenant_id
      AND position > v_old_position
      AND position <= p_new_position;
  ELSE
    -- Двигаем вверх
    UPDATE app_blocks
    SET position = position + 1
    WHERE tenant_id = v_tenant_id
      AND position >= p_new_position
      AND position < v_old_position;
  END IF;

  -- Устанавливаем новую позицию
  UPDATE app_blocks
  SET position = p_new_position, updated_at = NOW()
  WHERE id = p_block_id;

  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON TABLE app_blocks IS 'God Mode: Конфигурация блоков Mini App';
COMMENT ON COLUMN app_blocks.block_type IS 'Тип блока: hero, events, leaderboard и т.д.';
COMMENT ON COLUMN app_blocks.position IS 'Порядок отображения (0-based)';
COMMENT ON COLUMN app_blocks.title IS 'Локализованное название {"ru": "...", "en": "..."}';
COMMENT ON COLUMN app_blocks.config IS 'JSON с настройками блока';
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
SELECT
  '00000000-0000-0000-0000-000000000001',
  'own',
  'maincomapp_bot',
  true
WHERE NOT EXISTS (
  SELECT 1 FROM tenant_bots WHERE tenant_id = '00000000-0000-0000-0000-000000000001'
);

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
-- ═══════════════════════════════════════════════════════════════
-- GOD MODE: Tenant Features (Feature Flags)
-- Migration: 20260116_006_add_tenant_features
-- ═══════════════════════════════════════════════════════════════

-- Таблица фич
CREATE TABLE IF NOT EXISTS tenant_features (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,
  feature_key TEXT NOT NULL,
  is_enabled BOOLEAN DEFAULT true,
  config JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(tenant_id, feature_key)
);

-- Индексы
CREATE INDEX IF NOT EXISTS idx_tenant_features_tenant ON tenant_features(tenant_id);
CREATE INDEX IF NOT EXISTS idx_tenant_features_key ON tenant_features(feature_key);
CREATE INDEX IF NOT EXISTS idx_tenant_features_enabled ON tenant_features(tenant_id, is_enabled) WHERE is_enabled = true;

-- Триггер обновления
DROP TRIGGER IF EXISTS trigger_tenant_features_updated_at ON tenant_features;
CREATE TRIGGER trigger_tenant_features_updated_at
  BEFORE UPDATE ON tenant_features
  FOR EACH ROW
  EXECUTE FUNCTION update_tenant_updated_at();

-- ═══════════════════════════════════════════════════════════════
-- ДЕФОЛТНЫЕ ФИЧИ ДЛЯ MAIN COMMUNITY
-- ═══════════════════════════════════════════════════════════════

INSERT INTO tenant_features (tenant_id, feature_key, is_enabled, config)
VALUES
  -- Нетворкинг
  ('00000000-0000-0000-0000-000000000001', 'networking', true, '{"dailySwipesLimit": {"free": 5, "light": 20, "pro": -1}}'::jsonb),
  -- События
  ('00000000-0000-0000-0000-000000000001', 'events', true, '{"enableQrCheckin": true, "enableFeedback": true}'::jsonb),
  -- Обучение
  ('00000000-0000-0000-0000-000000000001', 'learning', true, '{"enableCourses": true, "enableProgress": true}'::jsonb),
  -- Достижения
  ('00000000-0000-0000-0000-000000000001', 'achievements', true, '{"enableBadges": true, "enableXP": true}'::jsonb),
  -- Лидерборд
  ('00000000-0000-0000-0000-000000000001', 'leaderboard', true, '{"periods": ["week", "month", "all_time"]}'::jsonb),
  -- Рефералы
  ('00000000-0000-0000-0000-000000000001', 'referrals', true, '{"bonusXP": 50, "enableInviteCodes": true}'::jsonb),
  -- Подписки
  ('00000000-0000-0000-0000-000000000001', 'subscriptions', true, '{"tiers": ["free", "light", "pro"]}'::jsonb)
ON CONFLICT (tenant_id, feature_key) DO NOTHING;

-- ═══════════════════════════════════════════════════════════════
-- RLS POLICIES
-- ═══════════════════════════════════════════════════════════════

ALTER TABLE tenant_features ENABLE ROW LEVEL SECURITY;

-- Публичное чтение (для проверки фич в Mini App)
CREATE POLICY "tenant_features_public_read" ON tenant_features
  FOR SELECT
  USING (true);

-- God Mode может всё
CREATE POLICY "tenant_features_god_mode_all" ON tenant_features
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM admin_users au
      WHERE au.telegram_id = (current_setting('request.jwt.claims', true)::jsonb->>'telegram_id')::bigint
      AND au.role = 'god_mode'
      AND au.is_active = true
    )
  );

-- Partner Admin может редактировать только свои фичи
CREATE POLICY "tenant_features_partner_own" ON tenant_features
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

-- Проверить включена ли фича
CREATE OR REPLACE FUNCTION is_feature_enabled(
  p_tenant_id UUID,
  p_feature_key TEXT
)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN COALESCE(
    (
      SELECT is_enabled
      FROM tenant_features
      WHERE tenant_id = p_tenant_id
        AND feature_key = p_feature_key
    ),
    true -- По умолчанию фичи включены
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Получить конфиг фичи
CREATE OR REPLACE FUNCTION get_feature_config(
  p_tenant_id UUID,
  p_feature_key TEXT
)
RETURNS JSONB AS $$
BEGIN
  RETURN COALESCE(
    (
      SELECT config
      FROM tenant_features
      WHERE tenant_id = p_tenant_id
        AND feature_key = p_feature_key
        AND is_enabled = true
    ),
    '{}'::jsonb
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Получить все фичи tenant'а
CREATE OR REPLACE FUNCTION get_tenant_features(p_tenant_id UUID)
RETURNS JSONB AS $$
BEGIN
  RETURN COALESCE(
    (
      SELECT jsonb_object_agg(
        feature_key,
        jsonb_build_object(
          'enabled', is_enabled,
          'config', config
        )
      )
      FROM tenant_features
      WHERE tenant_id = p_tenant_id
    ),
    '{}'::jsonb
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON TABLE tenant_features IS 'God Mode: Feature flags для tenant''ов';
COMMENT ON COLUMN tenant_features.feature_key IS 'networking, events, learning, achievements и т.д.';
COMMENT ON COLUMN tenant_features.config IS 'JSON с настройками фичи';
