from __future__ import annotations

from typing import AsyncIterator

from sqlalchemy.ext.asyncio import AsyncEngine, AsyncSession, async_sessionmaker, create_async_engine

from ..config import load_settings
from .models import Base


def create_engine() -> AsyncEngine:
    settings = load_settings()
    return create_async_engine(settings.database_url, echo=False, future=True)


def create_session_factory(engine: AsyncEngine) -> async_sessionmaker[AsyncSession]:
    return async_sessionmaker(engine, autoflush=False, expire_on_commit=False)


async def init_models(engine: AsyncEngine) -> None:
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)


async def run_migrations(engine: AsyncEngine) -> None:
    """Run manual migrations to add new columns to existing tables."""
    from sqlalchemy import text
    from loguru import logger

    migrations = [
        # Add subscription columns to bot_users
        ("bot_users", "subscription_tier", "ALTER TABLE bot_users ADD COLUMN subscription_tier TEXT DEFAULT 'free'"),
        ("bot_users", "subscription_expires_at", "ALTER TABLE bot_users ADD COLUMN subscription_expires_at DATETIME"),
        ("bot_users", "daily_swipes_used", "ALTER TABLE bot_users ADD COLUMN daily_swipes_used INTEGER DEFAULT 0"),
        ("bot_users", "daily_swipes_reset_at", "ALTER TABLE bot_users ADD COLUMN daily_swipes_reset_at DATETIME"),
        # Add is_test column to bot_events for QA testing
        ("bot_events", "is_test", "ALTER TABLE bot_events ADD COLUMN is_test BOOLEAN DEFAULT 0"),
    ]

    async with engine.begin() as conn:
        for table, column, sql in migrations:
            try:
                # Check if column exists (SQLite specific)
                result = await conn.execute(text(f"PRAGMA table_info({table})"))
                columns = [row[1] for row in result.fetchall()]

                if column not in columns:
                    await conn.execute(text(sql))
                    logger.info(f"Migration: Added column {column} to {table}")
            except Exception as e:
                # Column might already exist or other error
                logger.debug(f"Migration skipped for {table}.{column}: {e}")


