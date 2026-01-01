#!/usr/bin/env python3
"""
Миграция: Добавление поля interested_topics в таблицу event_feedback.

Поле хранит выбранные темы через запятую: "ИИ в бизнесе,ИИ в маркетинге"
"""

import asyncio
import sqlite3
from pathlib import Path


async def migrate():
    """Применяет миграцию для добавления поля interested_topics."""

    db_path = Path(__file__).parent.parent / "bot.db"

    print(f"Миграция: Добавление поля interested_topics в event_feedback")
    print(f"База данных: {db_path}")

    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    try:
        # Проверяем, существует ли колонка
        cursor.execute("PRAGMA table_info(event_feedback)")
        columns = [col[1] for col in cursor.fetchall()]

        if "interested_topics" in columns:
            print("Колонка interested_topics уже существует, пропускаем")
        else:
            # Добавляем колонку interested_topics
            cursor.execute("""
                ALTER TABLE event_feedback
                ADD COLUMN interested_topics VARCHAR(512)
            """)
            print("Колонка interested_topics добавлена")

        conn.commit()
        print("Миграция завершена успешно!")

        # Показываем структуру таблицы
        cursor.execute("PRAGMA table_info(event_feedback)")
        print("\nСтруктура таблицы event_feedback:")
        for col in cursor.fetchall():
            print(f"  - {col[1]} ({col[2]})")

    except Exception as e:
        conn.rollback()
        print(f"Ошибка при миграции: {e}")
        raise
    finally:
        conn.close()


if __name__ == "__main__":
    asyncio.run(migrate())
