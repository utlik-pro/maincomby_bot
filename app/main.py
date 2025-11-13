import asyncio
import logging

from loguru import logger
from aiogram import F
from aiogram.types import Message

from .bot import create_bot_and_dispatcher
from .db.session import create_engine, create_session_factory, init_models
from .handlers.moderation import router as moderation_router
from .handlers.news_moderation import router as news_moderation_router
from .handlers.utils import router as utils_router
from .handlers.qa import router as qa_router
from .handlers.events import router as events_router
from .handlers.event_admin import router as event_admin_router
from .handlers.welcome import router as welcome_router


async def main() -> None:
    logging.getLogger("aiogram.event").setLevel(logging.WARNING)
    bot, dp = create_bot_and_dispatcher()

    # Middleware для логирования всех сообщений
    @dp.message.outer_middleware()
    async def log_all_messages(handler, event: Message, data):
        logger.info(
            f"[MIDDLEWARE] Message received: "
            f"chat_type={event.chat.type}, "
            f"chat_id={event.chat.id}, "
            f"user_id={event.from_user.id}, "
            f"text={event.text[:50] if event.text else 'NO TEXT'}"
        )
        return await handler(event, data)

    # Middleware для логирования chat_member событий
    @dp.chat_member.outer_middleware()
    async def log_chat_member_updates(handler, event, data):
        logger.info(
            f"[CHAT_MEMBER] Event: "
            f"user={event.new_chat_member.user.id} (@{event.new_chat_member.user.username}), "
            f"old_status={event.old_chat_member.status}, "
            f"new_status={event.new_chat_member.status}, "
            f"chat={event.chat.title}"
        )
        return await handler(event, data)

    # DB init (SQLite/Async)
    engine = create_engine()
    await init_models(engine)
    session_factory = create_session_factory(engine)
    
    # Инициализируем сессию в хендлерах
    from .handlers.news_moderation import set_session_factory as set_news_session_factory
    from .handlers.qa import set_session_factory as set_qa_session_factory
    from .handlers.events import set_session_factory as set_events_session_factory
    from .handlers.event_admin import set_session_factory as set_event_admin_session_factory
    from .handlers.welcome import set_session_factory as set_welcome_session_factory
    set_news_session_factory(session_factory)
    set_qa_session_factory(session_factory)
    set_events_session_factory(session_factory)
    set_event_admin_session_factory(session_factory)
    set_welcome_session_factory(session_factory)

    # Routers (порядок важен!)
    # 0. welcome_router - первым для обработки новых участников
    dp.include_router(welcome_router)
    # 1. events_router - для обработки /start с deep link
    dp.include_router(events_router)
    dp.include_router(event_admin_router)
    # 2. qa_router - должен быть ДО moderation_router, чтобы обрабатывать упоминания
    dp.include_router(qa_router)
    # 3. остальные роутеры
    dp.include_router(moderation_router)
    dp.include_router(news_moderation_router)
    dp.include_router(utils_router)

    # Basic handlers (MVP)
    @dp.message(F.text == "/help")
    async def cmd_help(message: Message):
        from .config import load_settings
        settings = load_settings()
        is_admin_user = message.from_user.id in settings.admin_ids

        help_text = (
            "Доступные команды:\n"
            "- /help — список команд\n"
            "- /start — информация о ближайшем мероприятии\n"
            "- /my_events — мои регистрации на мероприятия\n\n"
        )

        if is_admin_user:
            help_text += (
                "<b>Админ-команды (мероприятия):</b>\n"
                "- /create_event — создать мероприятие\n"
                "- /list_events — список всех мероприятий\n"
                "- /event_stats [id] — статистика регистраций\n"
                "- /toggle_event <id> — активировать/деактивировать\n\n"

                "<b>Админ-команды (новости):</b>\n"
                "- /add_default_channels — добавить предустановленные каналы\n"
                "- /add_source_channel @channel — добавить канал-источник\n"
                "- /list_source_channels — список каналов\n"
                "- /list_pending — посты на модерации\n\n"

                "<b>Админ-команды (безопасность):</b>\n"
                "- /security_logs — последние попытки взлома\n\n"
            )

        help_text += (
            "<b>Модерация:</b>\n"
            "- /warn (в ответ на сообщение) — предупреждение\n"
            "- /ban (в ответ на сообщение) — забанить\n"
            "- /del (в ответ на сообщение) — удалить\n"
        )

        await message.answer(help_text, parse_mode="HTML")

    logger.info("Starting bot long-polling…")
    # Явно указываем типы обновлений, которые хотим получать
    await dp.start_polling(
        bot,
        allowed_updates=["message", "chat_member", "callback_query"]
    )


if __name__ == "__main__":
    asyncio.run(main())


