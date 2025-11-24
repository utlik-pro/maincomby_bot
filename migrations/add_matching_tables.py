"""
Migration: Add matching system tables

This migration adds three new tables for the "Main Tinder" matching system:
- user_profiles: Extended user profiles with bio, interests, and photos
- matches: Table of mutual matches between users
- swipes: History of user swipes (like/skip)
"""

import sqlite3
import sys
from pathlib import Path


def migrate():
    """Add matching system tables."""

    # Определяем путь к БД
    db_path = Path(__file__).parent.parent / "bot.db"

    if not db_path.exists():
        print(f"❌ Database not found at {db_path}")
        sys.exit(1)

    print(f"🔄 Starting migration on {db_path}")

    try:
        conn = sqlite3.connect(str(db_path))
        cursor = conn.cursor()

        # Проверяем, существует ли уже таблица user_profiles
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='user_profiles'")
        if cursor.fetchone():
            print("✅ Matching tables already exist. Migration skipped.")
            conn.close()
            return

        # Создаем таблицу user_profiles
        print("➕ Creating 'user_profiles' table...")
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS user_profiles (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL UNIQUE,
                bio TEXT,
                occupation TEXT,
                looking_for TEXT,
                can_help_with TEXT,
                needs_help_with TEXT,
                photo_file_id TEXT,
                city VARCHAR(64) DEFAULT 'Минск',
                moderation_status VARCHAR(16) DEFAULT 'pending',
                is_visible BOOLEAN DEFAULT 1,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users (id)
            )
        """)

        # Создаем индексы для user_profiles
        cursor.execute("CREATE INDEX IF NOT EXISTS ix_user_profiles_user_id ON user_profiles (user_id)")
        cursor.execute("CREATE INDEX IF NOT EXISTS ix_user_profiles_city ON user_profiles (city)")
        cursor.execute("CREATE INDEX IF NOT EXISTS ix_user_profiles_moderation_status ON user_profiles (moderation_status)")
        cursor.execute("CREATE INDEX IF NOT EXISTS ix_user_profiles_is_visible ON user_profiles (is_visible)")

        # Создаем таблицу matches
        print("➕ Creating 'matches' table...")
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS matches (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user1_id INTEGER NOT NULL,
                user2_id INTEGER NOT NULL,
                matched_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                is_active BOOLEAN DEFAULT 1,
                FOREIGN KEY (user1_id) REFERENCES users (id),
                FOREIGN KEY (user2_id) REFERENCES users (id),
                UNIQUE (user1_id, user2_id)
            )
        """)

        # Создаем индексы для matches
        cursor.execute("CREATE INDEX IF NOT EXISTS ix_matches_user1_id ON matches (user1_id)")
        cursor.execute("CREATE INDEX IF NOT EXISTS ix_matches_user2_id ON matches (user2_id)")
        cursor.execute("CREATE INDEX IF NOT EXISTS ix_matches_is_active ON matches (is_active)")

        # Создаем таблицу swipes
        print("➕ Creating 'swipes' table...")
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS swipes (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                swiper_id INTEGER NOT NULL,
                swiped_id INTEGER NOT NULL,
                action VARCHAR(16) NOT NULL,
                swiped_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (swiper_id) REFERENCES users (id),
                FOREIGN KEY (swiped_id) REFERENCES users (id),
                UNIQUE (swiper_id, swiped_id)
            )
        """)

        # Создаем индексы для swipes
        cursor.execute("CREATE INDEX IF NOT EXISTS ix_swipes_swiper_id ON swipes (swiper_id)")
        cursor.execute("CREATE INDEX IF NOT EXISTS ix_swipes_swiped_id ON swipes (swiped_id)")
        cursor.execute("CREATE INDEX IF NOT EXISTS ix_swipes_action ON swipes (action)")

        conn.commit()

        print(f"✅ Migration completed successfully!")
        print(f"   - Created 'user_profiles' table with 13 columns")
        print(f"   - Created 'matches' table with 5 columns")
        print(f"   - Created 'swipes' table with 5 columns")
        print(f"   - Created all necessary indexes")

        conn.close()

    except Exception as e:
        print(f"❌ Migration failed: {e}")
        sys.exit(1)


if __name__ == "__main__":
    migrate()
