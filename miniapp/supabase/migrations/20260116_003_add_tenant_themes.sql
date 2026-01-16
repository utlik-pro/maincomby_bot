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
VALUES (
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
)
ON CONFLICT DO NOTHING;

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
