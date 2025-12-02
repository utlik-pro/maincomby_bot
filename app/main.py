import asyncio
import logging
import sys

from loguru import logger
from aiogram import F
from aiogram.types import Message, CallbackQuery

from .bot import create_bot_and_dispatcher
from .db.session import create_engine, create_session_factory, init_models
from .handlers.moderation import router as moderation_router
from .handlers.news_moderation import router as news_moderation_router
from .handlers.utils import router as utils_router
from .handlers.qa import router as qa_router
from .handlers.events import router as events_router
from .handlers.event_admin import router as event_admin_router
from .handlers.welcome import router as welcome_router
from .handlers.broadcast import router as broadcast_router
from .handlers.matching import router as matching_router
from .handlers.feedback import router as feedback_router


async def main() -> None:
    logger.remove()  # Удаляем все предыдущие обработчики
    logger.add(
        sys.stderr,
        level="INFO",
        format="<green>{time:YYYY-MM-DD HH:mm:ss}</green> | <level>{level: <8}</level> | <cyan>{name}</cyan>:<cyan>{function}</cyan>:<cyan>{line}</cyan> - <level>{message}</level>",
        colorize=True
    )
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
    from .handlers.broadcast import set_session_factory as set_broadcast_session_factory
    from .handlers.matching import set_session_factory as set_matching_session_factory
    from .handlers.feedback import set_session_factory as set_feedback_session_factory
    set_news_session_factory(session_factory)
    set_qa_session_factory(session_factory)
    set_events_session_factory(session_factory)
    set_event_admin_session_factory(session_factory)
    set_welcome_session_factory(session_factory)
    set_broadcast_session_factory(session_factory)
    set_matching_session_factory(session_factory)
    set_feedback_session_factory(session_factory)

    # Routers (порядок важен!)
    # 0. welcome_router - первым для обработки новых участников
    dp.include_router(welcome_router)
    # 1. events_router - для обработки /start с deep link
    dp.include_router(events_router)
    dp.include_router(event_admin_router)
    dp.include_router(broadcast_router)
    # 2. matching_router - система матчинга
    dp.include_router(matching_router)
    # 3. feedback_router - фидбек после мероприятий
    dp.include_router(feedback_router)
    # 4. qa_router - должен быть ДО moderation_router, чтобы обрабатывать упоминания
    dp.include_router(qa_router)
    # 5. остальные роутеры
    dp.include_router(moderation_router)
    dp.include_router(news_moderation_router)
    dp.include_router(utils_router)

    # Basic handlers (MVP)
    @dp.message(F.text == "/admin")
    async def cmd_admin_menu(message: Message):
        """Админ-меню с кнопками для быстрого доступа к командам."""
        from .config import load_settings
        from aiogram.types import InlineKeyboardMarkup, InlineKeyboardButton

        settings = load_settings()
        if message.from_user.id not in settings.admin_ids:
            await message.answer("❌ Только администраторы могут использовать эту команду.")
            return

        keyboard = InlineKeyboardMarkup(inline_keyboard=[
            [InlineKeyboardButton(text="📊 Статистика", callback_data="admin_stats")],
            [InlineKeyboardButton(text="📹 Рассылки", callback_data="admin_broadcasts")],
            [InlineKeyboardButton(text="🎯 Мероприятия", callback_data="admin_events")],
            [InlineKeyboardButton(text="💕 Матчинг", callback_data="admin_matching")],
            [InlineKeyboardButton(text="📰 Новости", callback_data="admin_news")],
        ])

        await message.answer(
            "🔧 <b>Панель администратора</b>\n\n"
            "Выберите раздел:",
            reply_markup=keyboard,
            parse_mode="HTML"
        )

    @dp.callback_query(F.data == "admin_stats")
    async def admin_stats_menu(callback: CallbackQuery):
        """Меню статистики."""
        from aiogram.types import InlineKeyboardMarkup, InlineKeyboardButton

        keyboard = InlineKeyboardMarkup(inline_keyboard=[
            [InlineKeyboardButton(text="📊 Общая статистика", callback_data="cmd_event_stats_all")],
            [InlineKeyboardButton(text="📈 Статистика по мероприятию", callback_data="cmd_event_stats_ask")],
            [InlineKeyboardButton(text="✅ Статистика подтверждений", callback_data="cmd_confirmation_stats")],
            [InlineKeyboardButton(text="📉 Динамика регистраций", callback_data="cmd_registration_timeline")],
            [InlineKeyboardButton(text="« Назад", callback_data="admin_back")],
        ])

        await callback.message.edit_text(
            "📊 <b>Статистика</b>\n\n"
            "Выберите действие:",
            reply_markup=keyboard,
            parse_mode="HTML"
        )

    @dp.callback_query(F.data == "admin_broadcasts")
    async def admin_broadcasts_menu(callback: CallbackQuery):
        """Меню рассылок."""
        from aiogram.types import InlineKeyboardMarkup, InlineKeyboardButton

        keyboard = InlineKeyboardMarkup(inline_keyboard=[
            [InlineKeyboardButton(text="🎥 Тест видео (админам)", callback_data="cmd_broadcast_video_test")],
            [InlineKeyboardButton(text="📹 Рассылка видео", callback_data="cmd_broadcast_video_ask")],
            [InlineKeyboardButton(text="📝 Текстовая рассылка", callback_data="cmd_broadcast_text_ask")],
            [InlineKeyboardButton(text="« Назад", callback_data="admin_back")],
        ])

        await callback.message.edit_text(
            "📹 <b>Рассылки</b>\n\n"
            "Выберите действие:",
            reply_markup=keyboard,
            parse_mode="HTML"
        )

    @dp.callback_query(F.data == "admin_events")
    async def admin_events_menu(callback: CallbackQuery):
        """Меню управления мероприятиями."""
        from aiogram.types import InlineKeyboardMarkup, InlineKeyboardButton

        keyboard = InlineKeyboardMarkup(inline_keyboard=[
            [InlineKeyboardButton(text="➕ Создать мероприятие", callback_data="cmd_create_event")],
            [InlineKeyboardButton(text="📋 Список мероприятий", callback_data="cmd_list_events")],
            [InlineKeyboardButton(text="🔄 Пометить старые регистрации", callback_data="cmd_mark_old_ask")],
            [InlineKeyboardButton(text="✉️ Запросить подтверждения", callback_data="cmd_request_confirm_ask")],
            [InlineKeyboardButton(text="« Назад", callback_data="admin_back")],
        ])

        await callback.message.edit_text(
            "🎯 <b>Управление мероприятиями</b>\n\n"
            "Выберите действие:",
            reply_markup=keyboard,
            parse_mode="HTML"
        )

    @dp.callback_query(F.data == "admin_matching")
    async def admin_matching_menu(callback: CallbackQuery):
        """Меню матчинга."""
        from aiogram.types import InlineKeyboardMarkup, InlineKeyboardButton

        keyboard = InlineKeyboardMarkup(inline_keyboard=[
            [InlineKeyboardButton(text="📊 Статистика матчинга", callback_data="cmd_matching_stats")],
            [InlineKeyboardButton(text="⏳ Модерация профилей", callback_data="cmd_moderate_profiles")],
            [InlineKeyboardButton(text="« Назад", callback_data="admin_back")],
        ])

        await callback.message.edit_text(
            "💕 <b>Система матчинга</b>\n\n"
            "Выберите действие:",
            reply_markup=keyboard,
            parse_mode="HTML"
        )

    @dp.callback_query(F.data == "admin_news")
    async def admin_news_menu(callback: CallbackQuery):
        """Меню новостей."""
        from aiogram.types import InlineKeyboardMarkup, InlineKeyboardButton

        keyboard = InlineKeyboardMarkup(inline_keyboard=[
            [InlineKeyboardButton(text="📋 Список каналов", callback_data="cmd_list_source_channels")],
            [InlineKeyboardButton(text="⏳ Посты на модерации", callback_data="cmd_list_pending")],
            [InlineKeyboardButton(text="« Назад", callback_data="admin_back")],
        ])

        await callback.message.edit_text(
            "📰 <b>Новости</b>\n\n"
            "Выберите действие:",
            reply_markup=keyboard,
            parse_mode="HTML"
        )

    @dp.callback_query(F.data == "admin_back")
    async def admin_back_menu(callback: CallbackQuery):
        """Возврат в главное меню."""
        from aiogram.types import InlineKeyboardMarkup, InlineKeyboardButton

        keyboard = InlineKeyboardMarkup(inline_keyboard=[
            [InlineKeyboardButton(text="📊 Статистика", callback_data="admin_stats")],
            [InlineKeyboardButton(text="📹 Рассылки", callback_data="admin_broadcasts")],
            [InlineKeyboardButton(text="🎯 Мероприятия", callback_data="admin_events")],
            [InlineKeyboardButton(text="💕 Матчинг", callback_data="admin_matching")],
            [InlineKeyboardButton(text="📰 Новости", callback_data="admin_news")],
        ])

        await callback.message.edit_text(
            "🔧 <b>Панель администратора</b>\n\n"
            "Выберите раздел:",
            reply_markup=keyboard,
            parse_mode="HTML"
        )

    # Обработчики команд из меню
    @dp.callback_query(F.data == "cmd_event_stats_all")
    async def callback_event_stats_all(callback: CallbackQuery):
        """Вызов /event_stats без параметров."""
        await callback.answer()
        # Создаём фейковое сообщение для вызова команды
        fake_msg = Message(
            message_id=callback.message.message_id,
            date=callback.message.date,
            chat=callback.message.chat,
            from_user=callback.from_user,
            text="/event_stats"
        )
        from .handlers.event_admin import cmd_event_stats
        await cmd_event_stats(fake_msg)

    @dp.callback_query(F.data == "cmd_broadcast_video_test")
    async def callback_broadcast_test(callback: CallbackQuery):
        """Вызов /broadcast_video_test."""
        await callback.answer()
        fake_msg = Message(
            message_id=callback.message.message_id,
            date=callback.message.date,
            chat=callback.message.chat,
            from_user=callback.from_user,
            text="/broadcast_video_test"
        )
        from .handlers.broadcast import cmd_broadcast_video_test
        await cmd_broadcast_video_test(fake_msg, callback.bot)

    @dp.callback_query(F.data == "cmd_matching_stats")
    async def callback_matching_stats(callback: CallbackQuery):
        """Вызов /matching_stats."""
        await callback.answer()
        # Используем callback.message напрямую, она уже связана с bot
        from .handlers.event_admin import cmd_matching_stats
        await cmd_matching_stats(callback.message)

    @dp.callback_query(F.data == "cmd_moderate_profiles")
    async def callback_moderate_profiles(callback: CallbackQuery):
        """Вызов /moderate_profiles."""
        await callback.answer()
        # Используем callback.message напрямую, она уже связана с bot
        from .handlers.event_admin import cmd_moderate_profiles
        await cmd_moderate_profiles(callback.message)

    @dp.message(F.text == "/help")
    async def cmd_help(message: Message):
        from .config import load_settings
        settings = load_settings()
        is_admin_user = message.from_user.id in settings.admin_ids

        help_text = (
            "Доступные команды:\n"
            "- /help — список команд\n"
            "- /start — информация о ближайшем мероприятии\n"
            "- /my_events — мои регистрации на мероприятия\n"
            "- /feedback — оставить отзыв о мероприятии\n\n"
            "<b>💕 Система матчинга:</b>\n"
            "- /tinder — система знакомств и нетворкинга\n"
            "- /my_profile — мой профиль\n"
            "- /my_matches — мои матчи\n\n"
        )

        if is_admin_user:
            help_text += (
                "<b>🔧 Админ-панель:</b>\n"
                "- /admin — открыть панель с кнопками\n\n"

                "<b>Админ-команды (мероприятия):</b>\n"
                "- /create_event — создать мероприятие\n"
                "- /list_events — список всех мероприятий\n"
                "- /event_stats [id] — статистика регистраций\n"
                "- /confirmation_stats <id> — статистика подтверждений\n"
                "- /registration_timeline <id> — динамика регистраций\n"
                "- /toggle_event <id> — активировать/деактивировать\n"
                "- /mark_old_registrations <id> — пометить как старая дата\n"
                "- /request_confirmation <id> — запросить подтверждения\n\n"

                "<b>Админ-команды (рассылки):</b>\n"
                "- /broadcast_video_test — тест рассылки видео админам\n"
                "- /broadcast_video [id] — рассылка видео участникам\n"
                "- /broadcast_text <текст> — рассылка текста всем\n\n"

                "<b>Админ-команды (новости):</b>\n"
                "- /add_default_channels — добавить предустановленные каналы\n"
                "- /add_source_channel @channel — добавить канал-источник\n"
                "- /list_source_channels — список каналов\n"
                "- /list_pending — посты на модерации\n\n"

                "<b>Админ-команды (безопасность):</b>\n"
                "- /security_logs — последние попытки взлома\n\n"

                "<b>Админ-команды (матчинг):</b>\n"
                "- /matching_stats — статистика системы матчинга\n"
                "- /moderate_profiles — модерация профилей\n"
                "- /approve_profile <id> — одобрить профиль\n"
                "- /reject_profile <id> — отклонить профиль\n\n"
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


