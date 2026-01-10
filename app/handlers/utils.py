from __future__ import annotations

import json
from pathlib import Path

from aiogram import Router, F
from aiogram.filters import Command
from aiogram.types import Message, CallbackQuery, InlineKeyboardMarkup, InlineKeyboardButton

from ..config import load_settings
from ..version import __version__, BOT_NAME


router = Router()


@router.message(Command("chat_id"))
async def cmd_chat_id(message: Message):
    settings = load_settings()
    if message.from_user.id not in settings.admin_ids:
        await message.reply("Только администраторы могут использовать эту команду.")
        return

    chat = message.chat
    await message.reply(
        f"Chat ID: {chat.id}\nType: {chat.type}\nTitle: {getattr(chat, 'title', None)}"
    )


@router.message(Command("version"))
async def cmd_version(message: Message):
    """Show bot version information."""
    await message.reply(
        f"<b>{BOT_NAME}</b>\n"
        f"Version: <code>{__version__}</code>\n\n"
        f"Use /changelog to see recent changes.",
        parse_mode="HTML"
    )


@router.message(Command("changelog"))
async def cmd_changelog(message: Message):
    """Show recent changelog entries."""
    releases_file = Path(__file__).parent.parent.parent / "releases" / "releases.json"

    if not releases_file.exists():
        await message.reply("Changelog not available.")
        return

    try:
        data = json.loads(releases_file.read_text())
        releases = data.get("releases", [])

        if not releases:
            await message.reply("No releases found.")
            return

        # Show latest 3 releases
        text = f"<b>{BOT_NAME} - Changelog</b>\n\n"

        for release in releases[:3]:
            version = release.get("version", "?")
            date = release.get("date", "?")
            summary = release.get("summary", "")
            highlights = release.get("highlights", [])

            text += f"<b>v{version}</b> ({date})\n"
            if summary:
                text += f"{summary}\n"
            if highlights:
                for h in highlights[:4]:
                    text += f"  - {h}\n"
            text += "\n"

        # Add link to full changelog if landing page exists
        settings = load_settings()
        if hasattr(settings, 'webapp_url') and settings.webapp_url:
            # Extract base URL from webapp URL
            base_url = settings.webapp_url.replace('/miniapp', '')
            keyboard = InlineKeyboardMarkup(inline_keyboard=[
                [InlineKeyboardButton(text="Full Changelog", url=f"{base_url}/changelog")]
            ])
            await message.reply(text, parse_mode="HTML", reply_markup=keyboard)
        else:
            await message.reply(text, parse_mode="HTML")

    except Exception as e:
        await message.reply(f"Error loading changelog: {e}")


@router.callback_query(F.data == "show_changelog")
async def callback_show_changelog(callback: CallbackQuery):
    """Handle changelog button from release notification."""
    await callback.answer()

    releases_file = Path(__file__).parent.parent.parent / "releases" / "releases.json"

    if not releases_file.exists():
        await callback.message.answer("Changelog not available.")
        return

    try:
        data = json.loads(releases_file.read_text())
        releases = data.get("releases", [])

        if not releases:
            await callback.message.answer("No releases found.")
            return

        # Show latest 3 releases
        text = f"<b>{BOT_NAME} - Changelog</b>\n\n"

        for release in releases[:3]:
            version = release.get("version", "?")
            date = release.get("date", "?")
            summary = release.get("summary", "")
            highlights = release.get("highlights", [])

            text += f"<b>v{version}</b> ({date})\n"
            if summary:
                text += f"{summary}\n"
            if highlights:
                for h in highlights[:4]:
                    text += f"  - {h}\n"
            text += "\n"

        await callback.message.answer(text, parse_mode="HTML")

    except Exception as e:
        await callback.message.answer(f"Error loading changelog: {e}")


# Session factory for release notification
_session_factory = None

def set_session_factory(factory):
    global _session_factory
    _session_factory = factory


@router.message(Command("broadcast_release"))
async def cmd_broadcast_release(message: Message):
    """Admin command to broadcast release notification to all users."""
    settings = load_settings()
    if message.from_user.id not in settings.admin_ids:
        await message.reply("Только администраторы могут использовать эту команду.")
        return

    if not _session_factory:
        await message.reply("Session factory not initialized.")
        return

    # Parse arguments
    args = message.text.split(maxsplit=1)
    test_mode = "--test" in message.text if len(args) > 1 else True  # Default to test mode

    await message.reply(
        f"{'[TEST MODE] ' if test_mode else ''}Начинаю рассылку уведомления о релизе...\n"
        f"Это может занять некоторое время."
    )

    try:
        from ..services.release_notifier import broadcast_release, get_latest_release

        release = await get_latest_release()
        if not release:
            await message.reply("Не найден релиз для рассылки.")
            return

        stats = await broadcast_release(
            bot=message.bot,
            session_factory=_session_factory,
            release=release,
            test_mode=test_mode,
            admin_ids=settings.admin_ids if test_mode else None
        )

        await message.reply(
            f"{'[TEST MODE] ' if test_mode else ''}Рассылка завершена!\n\n"
            f"Отправлено: {stats['sent']}\n"
            f"Ошибок: {stats['failed']}\n"
            f"Заблокировали бота: {stats['blocked']}\n\n"
            f"Версия: v{release.get('version', '?')}"
        )

    except Exception as e:
        await message.reply(f"Ошибка при рассылке: {e}")


@router.callback_query(F.data == "dismiss_review")
async def callback_dismiss_review(callback: CallbackQuery):
    """Dismiss review request notification."""
    await callback.answer("Хорошо, напомним позже!")
    try:
        await callback.message.delete()
    except Exception:
        pass  # Message may already be deleted

