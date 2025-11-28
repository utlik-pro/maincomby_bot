"""
Migration: Add versioning fields to event_registrations table

This migration adds fields for tracking registration versions (old_date/new_date)
and confirmation status when event dates change.

Fields added:
- registration_version: Tracks whether registration was before or after date change
- confirmed: Whether user confirmed participation with new date
- confirmation_requested_at: When confirmation was requested
"""

import sqlite3
import sys
from pathlib import Path


def migrate():
    """Add versioning and confirmation fields to event_registrations table."""

    # Определяем путь к БД
    db_path = Path(__file__).parent.parent / "bot.db"

    if not db_path.exists():
        print(f"❌ Database not found at {db_path}")
        sys.exit(1)

    print(f"🔄 Starting migration on {db_path}")

    try:
        conn = sqlite3.connect(str(db_path))
        cursor = conn.cursor()

        # Проверяем, существует ли уже колонка registration_version
        cursor.execute("PRAGMA table_info(event_registrations)")
        columns = [column[1] for column in cursor.fetchall()]

        if 'registration_version' in columns:
            print("✅ Versioning columns already exist. Migration skipped.")
            conn.close()
            return

        # Добавляем колонку registration_version
        print("➕ Adding 'registration_version' column...")
        cursor.execute("""
            ALTER TABLE event_registrations
            ADD COLUMN registration_version VARCHAR(16) NOT NULL DEFAULT 'new_date'
        """)

        # Добавляем колонку confirmed
        print("➕ Adding 'confirmed' column...")
        cursor.execute("""
            ALTER TABLE event_registrations
            ADD COLUMN confirmed BOOLEAN NOT NULL DEFAULT 0
        """)

        # Добавляем колонку confirmation_requested_at
        print("➕ Adding 'confirmation_requested_at' column...")
        cursor.execute("""
            ALTER TABLE event_registrations
            ADD COLUMN confirmation_requested_at DATETIME
        """)

        # Создаем индексы для быстрых запросов
        print("📑 Creating indexes...")
        cursor.execute("""
            CREATE INDEX IF NOT EXISTS ix_event_registrations_version
            ON event_registrations (registration_version)
        """)
        cursor.execute("""
            CREATE INDEX IF NOT EXISTS ix_event_registrations_confirmed
            ON event_registrations (confirmed)
        """)

        conn.commit()

        # Проверяем результат
        cursor.execute("SELECT COUNT(*) FROM event_registrations")
        registration_count = cursor.fetchone()[0]

        print(f"✅ Migration completed successfully!")
        print(f"   - Added 'registration_version' column (default: 'new_date')")
        print(f"   - Added 'confirmed' column (default: FALSE)")
        print(f"   - Added 'confirmation_requested_at' column")
        print(f"   - Created indexes for version and confirmed columns")
        print(f"   - Updated {registration_count} existing registrations")

        conn.close()

    except Exception as e:
        print(f"❌ Migration failed: {e}")
        sys.exit(1)


if __name__ == "__main__":
    migrate()
