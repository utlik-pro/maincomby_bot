#!/usr/bin/env python3
"""
Миграция: Добавление таблицы event_feedback для сбора отзывов после мероприятий.

Создаёт таблицу для хранения:
- Оценок спикеров (4-балльная система с эмодзи)
- Свободных комментариев участников
"""

import asyncio
import sqlite3
from pathlib import Path


async def migrate():
    """Применяет миграцию для добавления таблицы event_feedback."""

    db_path = Path(__file__).parent.parent / "bot.db"

    print(f"📊 Миграция: Добавление таблицы event_feedback")
    print(f"📁 База данных: {db_path}")

    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    try:
        # Проверяем, существует ли таблица
        cursor.execute("""
            SELECT name FROM sqlite_master
            WHERE type='table' AND name='event_feedback'
        """)

        if cursor.fetchone():
            print("⚠️  Таблица event_feedback уже существует, пропускаем создание")
        else:
            # Создаём таблицу event_feedback
            cursor.execute("""
                CREATE TABLE event_feedback (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    event_id INTEGER NOT NULL,
                    user_id INTEGER NOT NULL,
                    speaker1_rating INTEGER,
                    speaker2_rating INTEGER,
                    comment TEXT,
                    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (event_id) REFERENCES events (id),
                    FOREIGN KEY (user_id) REFERENCES users (id)
                )
            """)
            print("✅ Таблица event_feedback создана")

            # Создаём индексы для быстрого поиска
            cursor.execute("""
                CREATE INDEX idx_event_feedback_event_id ON event_feedback(event_id)
            """)
            print("✅ Индекс idx_event_feedback_event_id создан")

            cursor.execute("""
                CREATE INDEX idx_event_feedback_user_id ON event_feedback(user_id)
            """)
            print("✅ Индекс idx_event_feedback_user_id создан")

            # Создаём уникальный индекс, чтобы один пользователь мог оставить только один фидбек на мероприятие
            cursor.execute("""
                CREATE UNIQUE INDEX idx_event_feedback_unique
                ON event_feedback(event_id, user_id)
            """)
            print("✅ Уникальный индекс idx_event_feedback_unique создан")

        conn.commit()
        print("✅ Миграция завершена успешно!")

        # Показываем статистику
        cursor.execute("SELECT COUNT(*) FROM event_feedback")
        count = cursor.fetchone()[0]
        print(f"📊 Записей в таблице event_feedback: {count}")

    except Exception as e:
        conn.rollback()
        print(f"❌ Ошибка при миграции: {e}")
        raise
    finally:
        conn.close()


if __name__ == "__main__":
    asyncio.run(migrate())
