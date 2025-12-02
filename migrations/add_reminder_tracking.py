"""Add reminder tracking to event registrations

This migration adds fields to track when broadcast reminders are sent to users.
"""

import asyncio
import sys
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from sqlalchemy import text
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from app.config import load_settings


async def upgrade():
    """Add reminder_sent and reminder_sent_at fields to event_registrations"""
    settings = load_settings()
    engine = create_async_engine(settings.database_url, echo=False)
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

    async with async_session() as session:
        # Add reminder_sent column (Boolean)
        await session.execute(
            text("""
                ALTER TABLE event_registrations
                ADD COLUMN reminder_sent BOOLEAN NOT NULL DEFAULT 0
            """)
        )

        # Add reminder_sent_at column (DateTime, nullable)
        await session.execute(
            text("""
                ALTER TABLE event_registrations
                ADD COLUMN reminder_sent_at DATETIME NULL
            """)
        )

        # Create index for faster queries
        await session.execute(
            text("""
                CREATE INDEX ix_event_registrations_reminder_sent
                ON event_registrations (reminder_sent)
            """)
        )

        await session.commit()
        print("✅ Migration completed: Added reminder tracking fields")

    await engine.dispose()


async def downgrade():
    """Remove reminder tracking fields"""
    settings = load_settings()
    engine = create_async_engine(settings.database_url, echo=False)
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

    async with async_session() as session:
        # Drop index
        await session.execute(
            text("""
                DROP INDEX IF EXISTS ix_event_registrations_reminder_sent
            """)
        )

        # Drop columns
        await session.execute(
            text("""
                ALTER TABLE event_registrations
                DROP COLUMN reminder_sent_at
            """)
        )

        await session.execute(
            text("""
                ALTER TABLE event_registrations
                DROP COLUMN reminder_sent
            """)
        )

        await session.commit()
        print("✅ Downgrade completed: Removed reminder tracking fields")

    await engine.dispose()


if __name__ == "__main__":
    print("Running migration: add_reminder_tracking")
    asyncio.run(upgrade())
