"""
Database connection and session management for the notification system.
Provides async_session_maker for use in services without circular imports.
"""

from typing import Optional
from sqlalchemy.ext.asyncio import async_sessionmaker, AsyncSession

# Global session maker - set by main.py after engine creation
_session_factory: Optional[async_sessionmaker[AsyncSession]] = None


def set_session_factory(factory: async_sessionmaker[AsyncSession]) -> None:
    """Set the global session factory. Called by main.py during startup."""
    global _session_factory
    _session_factory = factory


def async_session_maker() -> async_sessionmaker[AsyncSession]:
    """Get the async session context manager.

    Usage:
        async with async_session_maker() as session:
            # use session

    Returns:
        A session context manager

    Raises:
        RuntimeError: If session factory not initialized
    """
    if _session_factory is None:
        raise RuntimeError(
            "Database session factory not initialized. "
            "Call set_session_factory() first."
        )
    return _session_factory()
