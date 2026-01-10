"""
Release Notification Service for MAIN Community Bot.

Broadcasts release notifications to all users when a new version is published.
Can be triggered manually or via webhook from release.sh script.
"""

import asyncio
import json
from pathlib import Path
from typing import Optional
from datetime import datetime

from loguru import logger
from aiogram import Bot
from aiogram.types import InlineKeyboardMarkup, InlineKeyboardButton
from aiogram.exceptions import TelegramForbiddenError, TelegramBadRequest

from ..version import __version__, BOT_NAME
from ..db.session import create_engine, create_session_factory
from ..db.models import User
from sqlalchemy import select


# Path to releases.json
RELEASES_FILE = Path(__file__).parent.parent.parent / "releases" / "releases.json"


async def get_latest_release() -> Optional[dict]:
    """Get the latest release from releases.json."""
    if not RELEASES_FILE.exists():
        return None

    try:
        data = json.loads(RELEASES_FILE.read_text())
        releases = data.get("releases", [])
        if releases:
            return releases[0]
        return None
    except Exception as e:
        logger.error(f"Failed to read releases.json: {e}")
        return None


def format_release_message(release: dict) -> str:
    """Format a release for Telegram message."""
    version = release.get("version", "?")
    date = release.get("date", "?")
    summary = release.get("summary", "")
    highlights = release.get("highlights", [])
    release_type = release.get("type", "patch")

    # Emoji based on release type
    type_emoji = {
        "major": "🎉",
        "minor": "✨",
        "patch": "🔧"
    }.get(release_type, "📦")

    message = f"{type_emoji} <b>Обновление v{version}</b>\n"
    message += f"<i>{date}</i>\n\n"

    if summary:
        message += f"{summary}\n\n"

    if highlights:
        message += "<b>Что нового:</b>\n"
        for h in highlights[:5]:  # Max 5 highlights
            message += f"  • {h}\n"

    return message


async def broadcast_release(
    bot: Bot,
    session_factory,
    release: Optional[dict] = None,
    test_mode: bool = False,
    admin_ids: Optional[list] = None
) -> dict:
    """
    Broadcast release notification to users.

    Args:
        bot: Telegram Bot instance
        session_factory: SQLAlchemy session factory
        release: Release dict (if None, uses latest from file)
        test_mode: If True, only send to admins
        admin_ids: List of admin user IDs for test mode

    Returns:
        dict with stats: sent, failed, blocked
    """
    if release is None:
        release = await get_latest_release()
        if not release:
            logger.warning("No release found to broadcast")
            return {"sent": 0, "failed": 0, "blocked": 0}

    message = format_release_message(release)
    version = release.get("version", __version__)

    # Add changelog button
    keyboard = InlineKeyboardMarkup(inline_keyboard=[
        [InlineKeyboardButton(text="📋 Полный changelog", callback_data="show_changelog")]
    ])

    stats = {"sent": 0, "failed": 0, "blocked": 0}

    async with session_factory() as session:
        # Get users to notify
        if test_mode and admin_ids:
            # Test mode - only admins
            result = await session.execute(
                select(User).where(User.tg_user_id.in_(admin_ids))
            )
        else:
            # Production - all non-banned users
            result = await session.execute(
                select(User).where(User.banned == False)
            )

        users = result.scalars().all()
        logger.info(f"Broadcasting release v{version} to {len(users)} users")

        for user in users:
            try:
                await bot.send_message(
                    chat_id=user.tg_user_id,
                    text=message,
                    parse_mode="HTML",
                    reply_markup=keyboard
                )
                stats["sent"] += 1

                # Small delay to avoid rate limiting
                await asyncio.sleep(0.05)

            except TelegramForbiddenError:
                # User blocked the bot
                stats["blocked"] += 1
                logger.debug(f"User {user.tg_user_id} has blocked the bot")

            except TelegramBadRequest as e:
                stats["failed"] += 1
                logger.warning(f"Failed to send to {user.tg_user_id}: {e}")

            except Exception as e:
                stats["failed"] += 1
                logger.error(f"Unexpected error sending to {user.tg_user_id}: {e}")

    logger.info(
        f"Release broadcast complete: "
        f"sent={stats['sent']}, failed={stats['failed']}, blocked={stats['blocked']}"
    )

    return stats


async def main():
    """CLI entry point for manual broadcast."""
    import argparse
    from ..config import load_settings
    from ..bot import create_bot_and_dispatcher

    parser = argparse.ArgumentParser(description="Broadcast release notification")
    parser.add_argument("--version", type=str, help="Specific version to broadcast")
    parser.add_argument("--test", action="store_true", help="Test mode (admins only)")
    args = parser.parse_args()

    settings = load_settings()
    bot, _ = create_bot_and_dispatcher()

    engine = create_engine()
    session_factory = create_session_factory(engine)

    # Get release to broadcast
    release = None
    if args.version:
        # Find specific version
        all_releases = await get_latest_release()
        if RELEASES_FILE.exists():
            data = json.loads(RELEASES_FILE.read_text())
            for r in data.get("releases", []):
                if r.get("version") == args.version:
                    release = r
                    break

    stats = await broadcast_release(
        bot=bot,
        session_factory=session_factory,
        release=release,
        test_mode=args.test,
        admin_ids=settings.admin_ids if args.test else None
    )

    print(f"Broadcast complete:")
    print(f"  Sent: {stats['sent']}")
    print(f"  Failed: {stats['failed']}")
    print(f"  Blocked: {stats['blocked']}")

    await bot.session.close()


if __name__ == "__main__":
    asyncio.run(main())
