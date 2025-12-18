from aiogram import Bot, Dispatcher
from aiogram.client.default import DefaultBotProperties
from aiogram.enums import ParseMode

from .config import load_settings
from .fsm_storage import SQLiteStorage


def create_bot_and_dispatcher() -> tuple[Bot, Dispatcher]:
    settings = load_settings()
    bot = Bot(settings.bot_token, default=DefaultBotProperties(parse_mode=ParseMode.HTML))
    # SQLiteStorage - состояния сохраняются в БД и не теряются при перезапуске
    storage = SQLiteStorage(db_path="data/bot.db")
    dp = Dispatcher(storage=storage)
    return bot, dp


