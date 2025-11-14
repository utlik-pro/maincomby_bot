"""
Migration: Add city field to events table

This migration adds a 'city' column to the events table to support multi-city events.
"""

import sqlite3
import sys
from pathlib import Path


def migrate():
    """Add city column to events table."""

    # Определяем путь к БД
    db_path = Path(__file__).parent.parent / "bot.db"

    if not db_path.exists():
        print(f"❌ Database not found at {db_path}")
        sys.exit(1)

    print(f"🔄 Starting migration on {db_path}")

    try:
        conn = sqlite3.connect(str(db_path))
        cursor = conn.cursor()

        # Проверяем, существует ли уже колонка city
        cursor.execute("PRAGMA table_info(events)")
        columns = [column[1] for column in cursor.fetchall()]

        if 'city' in columns:
            print("✅ Column 'city' already exists. Migration skipped.")
            conn.close()
            return

        # Добавляем колонку city со значением по умолчанию "Минск"
        print("➕ Adding 'city' column to events table...")
        cursor.execute("""
            ALTER TABLE events
            ADD COLUMN city VARCHAR(64) NOT NULL DEFAULT 'Минск'
        """)

        # Создаем индекс для city
        print("📑 Creating index on 'city' column...")
        cursor.execute("""
            CREATE INDEX IF NOT EXISTS ix_events_city ON events (city)
        """)

        conn.commit()

        # Проверяем результат
        cursor.execute("SELECT COUNT(*) FROM events")
        event_count = cursor.fetchone()[0]

        print(f"✅ Migration completed successfully!")
        print(f"   - Added 'city' column with default value 'Минск'")
        print(f"   - Created index on 'city' column")
        print(f"   - Updated {event_count} existing events")

        conn.close()

    except Exception as e:
        print(f"❌ Migration failed: {e}")
        sys.exit(1)


if __name__ == "__main__":
    migrate()
