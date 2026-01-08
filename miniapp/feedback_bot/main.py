"""
Main entry point for MAIN Feedback Bot
Monitors Telegram testing group and saves classified feedback to Supabase
"""
import asyncio
import logging
from aiogram import Bot, Dispatcher
from aiogram.enums import ParseMode
from aiogram.client.default import DefaultBotProperties

from config import BOT_TOKEN, TEST_GROUP_CHAT_ID, LOG_LEVEL
from handlers.messages import router

# Configure logging
logging.basicConfig(
    level=getattr(logging, LOG_LEVEL),
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Initialize bot with default properties
bot = Bot(
    token=BOT_TOKEN,
    default=DefaultBotProperties(parse_mode=ParseMode.MARKDOWN)
)

# Initialize dispatcher
dp = Dispatcher()
dp.include_router(router)


async def on_startup():
    """Called when bot starts"""
    me = await bot.get_me()
    logger.info(f"🤖 Feedback Bot started: @{me.username}")
    logger.info(f"📍 Monitoring group: {TEST_GROUP_CHAT_ID}")
    
    # Try to get group info
    try:
        chat = await bot.get_chat(TEST_GROUP_CHAT_ID)
        logger.info(f"📌 Group name: {chat.title}")
    except Exception as e:
        logger.warning(f"⚠️ Could not get group info: {e}")
        logger.warning("Make sure the bot is added to the group!")


async def on_shutdown():
    """Called when bot stops"""
    logger.info("🛑 Feedback Bot stopped")
    await bot.session.close()


async def main():
    """Main function"""
    dp.startup.register(on_startup)
    dp.shutdown.register(on_shutdown)
    
    logger.info("Starting Feedback Bot...")
    await dp.start_polling(bot, allowed_updates=["message", "message_reaction"])


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        logger.info("Bot stopped by user")
    except Exception as e:
        logger.error(f"Bot crashed: {e}")
        raise
