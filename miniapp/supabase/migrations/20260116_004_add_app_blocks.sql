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
ON CONFLICT DO NOTHING;

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
