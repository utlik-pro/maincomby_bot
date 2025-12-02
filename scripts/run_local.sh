#!/usr/bin/env bash
# Универсальный запуск бота локально, когда VPS недоступен.
# Использование:
#   bash scripts/run_local.sh               # создать venv (если нужно), установить зависимости и запустить бота
#   SKIP_INSTALL=1 bash scripts/run_local.sh  # пропустить установку зависимостей
#   RUN_ONLY=1 bash scripts/run_local.sh      # только запустить, без подготовки

set -euo pipefail

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
VENV_DIR="${VENV_DIR:-$PROJECT_ROOT/venv}"
PYTHON_BIN="${PYTHON_BIN:-python3}"
MAIN_MODULE="${MAIN_MODULE:-app.main}"
REQUIREMENTS_FILE="$PROJECT_ROOT/requirements.txt"

echo "📍 Проект: $PROJECT_ROOT"

if [[ -z "${RUN_ONLY:-}" ]]; then
  if [[ ! -d "$VENV_DIR" ]]; then
    echo "🌀 Создаю виртуальное окружение $VENV_DIR"
    "$PYTHON_BIN" -m venv "$VENV_DIR"
  fi

  echo "✅ Активирую виртуальное окружение"
  # shellcheck source=/dev/null
  source "$VENV_DIR/bin/activate"

  if [[ -z "${SKIP_INSTALL:-}" ]]; then
    echo "📦 Устанавливаю зависимости из $REQUIREMENTS_FILE"
    pip install --upgrade pip >/dev/null
    pip install -r "$REQUIREMENTS_FILE"
  else
    echo "⚠️  Пропускаю установку зависимостей (SKIP_INSTALL=1)"
  fi
else
  echo "⚠️  RUN_ONLY=1 — предполагаю уже активированное окружение"
fi

ENV_FILE="$PROJECT_ROOT/.env"
if [[ ! -f "$ENV_FILE" ]]; then
  echo "❌ Не найден .env ($ENV_FILE). Создайте файл с BOT_TOKEN и другими секретами."
  exit 1
fi

if ! grep -q "BOT_TOKEN" "$ENV_FILE"; then
  echo "⚠️  В .env не найден BOT_TOKEN — бот не сможет авторизоваться."
fi

echo "🚀 Запускаю бота ($MAIN_MODULE)"
python -m "$MAIN_MODULE"

