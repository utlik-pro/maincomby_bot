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
