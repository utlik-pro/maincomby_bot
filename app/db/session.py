from __future__ import annotations

from typing import AsyncIterator

from sqlalchemy.ext.asyncio import AsyncEngine, AsyncSession, async_sessionmaker, create_async_engine

from ..config import load_settings
from .models import Base


def create_engine() -> AsyncEngine:
    settings = load_settings()
    return create_async_engine(
        settings.database_url,
        echo=False,
        future=True,
        connect_args={"prepared_statement_cache_size": 0}  # Required for Supabase pooler (pgbouncer)
    )


def create_session_factory(engine: AsyncEngine) -> async_sessionmaker[AsyncSession]:
    return async_sessionmaker(engine, autoflush=False, expire_on_commit=False)


async def init_models(engine: AsyncEngine) -> None:
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)


async def run_migrations(engine: AsyncEngine) -> None:
    """Run manual migrations for PostgreSQL.

    Uses 'ADD COLUMN IF NOT EXISTS' which is PostgreSQL-specific.
    These migrations are idempotent - safe to run multiple times.
    """
    from sqlalchemy import text
    from loguru import logger

    migrations = [
        # Add subscription columns to bot_users
        ("bot_users", "subscription_tier",
         "ALTER TABLE bot_users ADD COLUMN IF NOT EXISTS subscription_tier TEXT DEFAULT 'free'"),
        ("bot_users", "subscription_expires_at",
         "ALTER TABLE bot_users ADD COLUMN IF NOT EXISTS subscription_expires_at TIMESTAMP"),
        ("bot_users", "daily_swipes_used",
         "ALTER TABLE bot_users ADD COLUMN IF NOT EXISTS daily_swipes_used INTEGER DEFAULT 0"),
        ("bot_users", "daily_swipes_reset_at",
         "ALTER TABLE bot_users ADD COLUMN IF NOT EXISTS daily_swipes_reset_at TIMESTAMP"),
        # Add is_test column to bot_events for QA testing
        ("bot_events", "is_test",
         "ALTER TABLE bot_events ADD COLUMN IF NOT EXISTS is_test BOOLEAN DEFAULT FALSE"),
        # Smart engagement queue tracking
        ("bot_users", "last_engagement_sent_at",
         "ALTER TABLE bot_users ADD COLUMN IF NOT EXISTS last_engagement_sent_at TIMESTAMP"),
        # Onboarding tracking
        ("bot_users", "onboarding_event_sent_at",
         "ALTER TABLE bot_users ADD COLUMN IF NOT EXISTS onboarding_event_sent_at TIMESTAMP"),
        ("bot_users", "onboarding_feedback_sent_at",
         "ALTER TABLE bot_users ADD COLUMN IF NOT EXISTS onboarding_feedback_sent_at TIMESTAMP"),
        # Profile completion PRO reward tracking
        ("bot_users", "profile_completion_pro_awarded_at",
         "ALTER TABLE bot_users ADD COLUMN IF NOT EXISTS profile_completion_pro_awarded_at TIMESTAMP"),
    ]

    async with engine.begin() as conn:
        for table, column, sql in migrations:
            try:
                await conn.execute(text(sql))
                logger.debug(f"Migration applied: {table}.{column}")
            except Exception as e:
                # Column might already exist or table doesn't exist yet
                logger.debug(f"Migration skipped for {table}.{column}: {e}")


