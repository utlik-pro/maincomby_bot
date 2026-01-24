import asyncio
import logging
import sys

from loguru import logger
from aiogram import F, Bot
from aiogram.types import Message, CallbackQuery, InlineKeyboardMarkup, InlineKeyboardButton

from .bot import create_bot_and_dispatcher
from .db.session import create_engine, create_session_factory, init_models, run_migrations
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
from .handlers.broadcast_feedback import router as broadcast_feedback_router
from .handlers.payments import router as payments_router
from .version import __version__, BOT_NAME


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

    async def check_subscription(handler, event, data):
        """
        Проверяет, подписан ли пользователь на основной канал.
        """
        logger.info(f"[SUBSCRIPTION] check_subscription middleware called for event type: {type(event).__name__}")

        # Пропускаем callback "check_subscription" - он будет обработан отдельным handler
        if isinstance(event, CallbackQuery) and event.data == "check_subscription":
            logger.info(f"[SUBSCRIPTION] Skipping middleware for check_subscription callback")
            return await handler(event, data)

        user_id = event.from_user.id
        bot: Bot = data.get('bot')
        logger.info(f"[SUBSCRIPTION] Processing user_id: {user_id}")

        # Пропускаем администраторов
        from .config import load_settings
        settings = load_settings()
        if user_id in settings.admin_ids:
            logger.info(f"[SUBSCRIPTION] User {user_id} is admin, skipping check")
            return await handler(event, data)

        if not settings.check_subscription_channel_id or not settings.check_subscription_channel_url:
            # Если канал не настроен, пропускаем проверку
            logger.warning(f"[SUBSCRIPTION] Channel not configured, skipping check")
            return await handler(event, data)

        try:
            member = await bot.get_chat_member(chat_id=settings.check_subscription_channel_id, user_id=user_id)
            logger.info(f"[SUBSCRIPTION] User {user_id} status: {member.status}")

            if member.status not in ("member", "administrator", "creator"):
                # Пользователь не подписан
                logger.warning(f"[SUBSCRIPTION] User {user_id} is NOT subscribed, blocking access")
                keyboard = InlineKeyboardMarkup(inline_keyboard=[
                    [InlineKeyboardButton(text="🔗 Перейти в канал", url=settings.check_subscription_channel_url)],
                    [InlineKeyboardButton(text="✅ Я подписался", callback_data="check_subscription")]
                ])

                # Определяем, как ответить: редактировать сообщение или отправить новое
                if isinstance(event, Message):
                    await event.answer(
                        "Для доступа к боту, пожалуйста, подпишитесь на наш основной канал.",
                        reply_markup=keyboard
                    )
                elif isinstance(event, CallbackQuery):
                    await event.message.answer(
                        "Для доступа к боту, пожалуйста, подпишитесь на наш основной канал.",
                        reply_markup=keyboard
                    )
                    await event.answer() # Закрываем уведомление от нажатия на кнопку
                logger.info(f"[SUBSCRIPTION] Sent subscription message to user {user_id}")
                return
        except Exception as e:
            logger.error(f"[SUBSCRIPTION] Error checking subscription for user_id={user_id}: {e}")
            # В случае ошибки (например, бот не админ в канале), пропускаем проверку
            return await handler(event, data)

        logger.info(f"[SUBSCRIPTION] User {user_id} is subscribed, allowing access")
        return await handler(event, data)

    dp.message.outer_middleware()(check_subscription)
    dp.callback_query.outer_middleware()(check_subscription)

    @dp.callback_query(F.data == "check_subscription")
    async def process_check_subscription_callback(callback: CallbackQuery, bot: Bot):
        """
        Обрабатывает нажатие кнопки "Я подписался".
        """
        from .config import load_settings
        settings = load_settings()
        user_id = callback.from_user.id
        try:
            member = await bot.get_chat_member(chat_id=settings.check_subscription_channel_id, user_id=user_id)
            if member.status in ("member", "administrator", "creator"):
                # Пользователь подписан, удаляем сообщение с кнопкой
                await callback.message.delete()
                await callback.answer("Спасибо за подписку! Теперь вы можете пользоваться ботом. ✨", show_alert=True)
            else:
                # Пользователь все еще не подписан
                keyboard = InlineKeyboardMarkup(inline_keyboard=[
                    [InlineKeyboardButton(text="🔗 Перейти в канал", url=settings.check_subscription_channel_url)],
                    [InlineKeyboardButton(text="✅ Я подписался", callback_data="check_subscription")]
                ])

                await callback.message.edit_text(
                    "⚠️ <b>Вы все еще не подписаны на канал!</b>\n\n"
                    "Для доступа к боту необходимо подписаться на наш основной канал.\n\n"
                    "👇 Нажмите на кнопку ниже, подпишитесь на канал, "
                    "а затем вернитесь и нажмите «✅ Я подписался».",
                    reply_markup=keyboard,
                    parse_mode="HTML"
                )
                await callback.answer("❌ Вы не подписаны! Сначала подпишитесь на канал.", show_alert=True)
        except Exception as e:
            logger.error(f"Ошибка при повторной проверке подписки для user_id={user_id}: {e}")
            await callback.answer("Произошла ошибка при проверке. Попробуйте позже.", show_alert=True)


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
    await run_migrations(engine)  # Auto-add missing columns
    session_factory = create_session_factory(engine)

    # Initialize database session factory for scheduler jobs
    from .db.database import set_session_factory as set_db_session_factory
    set_db_session_factory(session_factory)

    # Инициализируем сессию в хендлерах
    from .handlers.news_moderation import set_session_factory as set_news_session_factory
    from .handlers.qa import set_session_factory as set_qa_session_factory
    from .handlers.events import set_session_factory as set_events_session_factory
    from .handlers.event_admin import set_session_factory as set_event_admin_session_factory
    from .handlers.welcome import set_session_factory as set_welcome_session_factory
    from .handlers.broadcast import set_session_factory as set_broadcast_session_factory
    from .handlers.matching import set_session_factory as set_matching_session_factory
    from .handlers.feedback import set_session_factory as set_feedback_session_factory
    from .handlers.broadcast_feedback import set_session_factory as set_broadcast_feedback_session_factory
    from .handlers.payments import set_session_factory as set_payments_session_factory
    from .handlers.utils import set_session_factory as set_utils_session_factory
    set_news_session_factory(session_factory)
    set_qa_session_factory(session_factory)
    set_events_session_factory(session_factory)
    set_event_admin_session_factory(session_factory)
    set_welcome_session_factory(session_factory)
    set_broadcast_session_factory(session_factory)
    set_matching_session_factory(session_factory)
    set_feedback_session_factory(session_factory)
    set_broadcast_feedback_session_factory(session_factory)
    set_payments_session_factory(session_factory)
    set_utils_session_factory(session_factory)

    # Инициализируем Supabase sync service (async версия)
    sync_service = None
    try:
        from .services.supabase_sync import SupabaseSync, set_sync_service
        sync_service = SupabaseSync(session_factory, bot=bot)
        set_sync_service(sync_service)
        logger.info("Supabase sync service initialized with bot for broadcasts")
    except Exception as e:
        logger.warning(f"Supabase sync service не инициализирован: {e}")

    # Инициализируем Notification service
    notification_service = None
    try:
        from .services.notifications import init_notification_service
        notification_service = init_notification_service(bot)
        logger.info("Notification service initialized")
    except Exception as e:
        logger.warning(f"Notification service не инициализирован: {e}")

    # Инициализируем Engagement Notification service
    engagement_service = None
    try:
        from .services.engagement_notifications import init_engagement_service
        engagement_service = init_engagement_service(bot)
        logger.info("Engagement notification service initialized")
    except Exception as e:
        logger.warning(f"Engagement notification service не инициализирован: {e}")

    # Handler для сохранения номера телефона (от Mini App)
    from aiogram.types import ContentType
    from sqlalchemy import select
    from .db.models import User as DBUser

    @dp.message(F.content_type == ContentType.CONTACT)
    async def handle_contact(message: Message):
        """Сохраняет номер телефона от пользователя (для Mini App регистрации)"""
        contact = message.contact
        if contact and contact.user_id == message.from_user.id:
            # Это контакт самого пользователя
            phone = contact.phone_number
            if not phone.startswith('+'):
                phone = '+' + phone

            async with session_factory() as session:
                # Найти пользователя
                result = await session.execute(
                    select(DBUser).where(DBUser.tg_user_id == message.from_user.id)
                )
                user = result.scalar_one_or_none()

                if user:
                    # Обновить номер телефона
                    user.phone_number = phone
                    await session.commit()
                    await session.refresh(user)
                    logger.info(f"Phone saved for user {message.from_user.id}: {phone}")

                    # Синхронизируем с Supabase
                    if sync_service:
                        try:
                            await sync_service.sync_user(user)
                            logger.info(f"User {message.from_user.id} synced to Supabase")
                        except Exception as e:
                            logger.error(f"Failed to sync user to Supabase: {e}")

                    await message.answer("✅ Номер телефона сохранён! Вернитесь в приложение.")
                else:
                    await message.answer("⚠️ Сначала запустите бота командой /start")

    # Routers (порядок важен!)
    # 0. welcome_router - первым для обработки новых участников
    dp.include_router(welcome_router)
    # 1. events_router - для обработки /start с deep link
    dp.include_router(events_router)
    # 1.5. payments_router - оплата подписок через Telegram Stars
    dp.include_router(payments_router)
    dp.include_router(event_admin_router)
    dp.include_router(broadcast_router)
    # 2. matching_router - система матчинга
    dp.include_router(matching_router)
    # 3. feedback_router - фидбек после мероприятий
    dp.include_router(feedback_router)
    # 3.5. broadcast_feedback_router - фидбек из рассылок
    dp.include_router(broadcast_feedback_router)
    # 4. qa_router - ОТКЛЮЧЕН (ИИ консультации выключены)
    # dp.include_router(qa_router)
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
            [InlineKeyboardButton(text="⏳ Незавершённые регистрации", callback_data="cmd_pending_registrations")],
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
        # Передаём user_id из callback, т.к. callback.message.from_user — это бот
        from .handlers.event_admin import cmd_moderate_profiles
        await cmd_moderate_profiles(callback.message, user_id=callback.from_user.id)

    @dp.callback_query(F.data == "cmd_pending_registrations")
    async def callback_pending_registrations(callback: CallbackQuery):
        """Вызов /pending_registrations."""
        await callback.answer()
        from .handlers.event_admin import cmd_pending_registrations
        # Создаём фейковое сообщение с правильным from_user
        fake_msg = Message(
            message_id=callback.message.message_id,
            date=callback.message.date,
            chat=callback.message.chat,
            from_user=callback.from_user,
            text="/pending_registrations"
        )
        await cmd_pending_registrations(fake_msg)

    @dp.message(F.text == "/trigger_reminders")
    async def cmd_trigger_reminders(message: Message):
        """Ручной запуск всех notification jobs (только для админов)."""
        from .config import load_settings
        settings = load_settings()
        if message.from_user.id not in settings.admin_ids:
            return

        await message.answer("⏳ Запускаю все notification jobs...")

        results = []

        # 1. Event reminders (24h)
        try:
            from .services.notifications import get_notification_service
            service = get_notification_service()
            if service:
                async with session_factory() as session:
                    count = await service.send_event_reminders_batch(session)
                    results.append(f"📅 Event reminders (24ч): {count} отправлено")
            else:
                results.append("❌ Event reminders: service not initialized")
        except Exception as e:
            results.append(f"❌ Event reminders: {e}")

        # 2. Event starting soon (1h)
        try:
            from .services.notifications import get_notification_service
            service = get_notification_service()
            if service:
                async with session_factory() as session:
                    count = await service.send_event_starting_soon_batch(session)
                    results.append(f"⏰ Starting soon (1ч): {count} отправлено")
            else:
                results.append("❌ Starting soon: service not initialized")
        except Exception as e:
            results.append(f"❌ Starting soon: {e}")

        # 3. Ticket reminders
        try:
            from .services.notifications import get_notification_service
            service = get_notification_service()
            if service:
                async with session_factory() as session:
                    count = await service.send_ticket_reminders_batch(session)
                    results.append(f"🎫 Ticket reminders: {count} отправлено")
            else:
                results.append("❌ Ticket reminders: service not initialized")
        except Exception as e:
            results.append(f"❌ Ticket reminders: {e}")

        # 4. Engagement - profile incomplete
        try:
            from .services.engagement_notifications import get_engagement_service
            eng_service = get_engagement_service()
            if eng_service:
                async with session_factory() as session:
                    count = await eng_service.send_profile_incomplete_batch(session)
                    results.append(f"👤 Profile incomplete: {count} отправлено")
            else:
                results.append("❌ Profile incomplete: service not initialized")
        except Exception as e:
            results.append(f"❌ Profile incomplete: {e}")

        # 5. Engagement - no swipes
        try:
            from .services.engagement_notifications import get_engagement_service
            eng_service = get_engagement_service()
            if eng_service:
                async with session_factory() as session:
                    count = await eng_service.send_no_swipes_batch(session)
                    results.append(f"💕 No swipes: {count} отправлено")
            else:
                results.append("❌ No swipes: service not initialized")
        except Exception as e:
            results.append(f"❌ No swipes: {e}")

        # 6. Engagement - pending likes
        try:
            from .services.engagement_notifications import get_engagement_service
            eng_service = get_engagement_service()
            if eng_service:
                async with session_factory() as session:
                    count = await eng_service.send_pending_likes_batch(session)
                    results.append(f"❤️ Pending likes: {count} отправлено")
            else:
                results.append("❌ Pending likes: service not initialized")
        except Exception as e:
            results.append(f"❌ Pending likes: {e}")

        # 7. Check upcoming events in window
        try:
            from datetime import datetime, timedelta
            from sqlalchemy import select, and_
            from .db.models import Event

            async with session_factory() as session:
                minsk_offset = timedelta(hours=3)
                now_utc = datetime.utcnow()
                now_minsk = now_utc + minsk_offset

                # Events in 24h window
                start_24h = now_minsk + timedelta(hours=23)
                end_24h = now_minsk + timedelta(hours=25)

                events_query = select(Event).where(
                    and_(
                        Event.event_date >= start_24h,
                        Event.event_date <= end_24h,
                        Event.is_active == True
                    )
                )
                events_result = await session.execute(events_query)
                events_24h = events_result.scalars().all()

                # Events in 1h window
                start_1h = now_minsk + timedelta(minutes=45)
                end_1h = now_minsk + timedelta(minutes=75)

                events_1h_query = select(Event).where(
                    and_(
                        Event.event_date >= start_1h,
                        Event.event_date <= end_1h,
                        Event.is_active == True
                    )
                )
                events_1h_result = await session.execute(events_1h_query)
                events_1h = events_1h_result.scalars().all()

                results.append(f"\n📊 <b>События в окнах:</b>")
                results.append(f"   24ч окно ({start_24h.strftime('%H:%M')}-{end_24h.strftime('%H:%M')}): {len(events_24h)} событий")
                results.append(f"   1ч окно ({start_1h.strftime('%H:%M')}-{end_1h.strftime('%H:%M')}): {len(events_1h)} событий")

                if events_24h:
                    for ev in events_24h[:3]:
                        results.append(f"   • {ev.title} @ {ev.event_date.strftime('%d.%m %H:%M')}")

        except Exception as e:
            results.append(f"❌ Check events: {e}")

        await message.answer(
            "🔔 <b>Результаты ручного запуска</b>\n\n" +
            "\n".join(results),
            parse_mode="HTML"
        )

    @dp.message(F.text == "/test_notifications")
    async def cmd_test_notifications(message: Message):
        """Диагностика системы уведомлений (только для админов)."""
        from .config import load_settings
        settings = load_settings()
        if message.from_user.id not in settings.admin_ids:
            return

        status_lines = []

        # 1. Проверить NotificationService
        from .services.notifications import get_notification_service
        notif_service = get_notification_service()
        if notif_service:
            status_lines.append("✅ NotificationService: OK")
            # Попробовать отправить тестовое сообщение
            try:
                await notif_service.bot.send_message(
                    chat_id=message.from_user.id,
                    text="🔔 Тестовое уведомление работает!"
                )
                status_lines.append("✅ Bot.send_message: OK")
            except Exception as e:
                status_lines.append(f"❌ Bot.send_message: {e}")
        else:
            status_lines.append("❌ NotificationService: NOT INITIALIZED")

        # 2. Проверить EngagementService
        from .services.engagement_notifications import get_engagement_service
        eng_service = get_engagement_service()
        if eng_service:
            status_lines.append("✅ EngagementService: OK")
        else:
            status_lines.append("❌ EngagementService: NOT INITIALIZED")

        # 3. Проверить Scheduler
        from .services.scheduler import get_scheduler, get_jobs_status
        sched = get_scheduler()
        if sched and sched.running:
            status_lines.append("✅ Scheduler: RUNNING")
            jobs = get_jobs_status()
            if jobs:
                status_lines.append(f"   Jobs: {len(jobs)} активных")
                for job in jobs[:5]:  # Показать первые 5
                    status_lines.append(f"   • {job['id']}: {job['next_run']}")
        elif sched:
            status_lines.append("⚠️ Scheduler: NOT RUNNING")
        else:
            status_lines.append("❌ Scheduler: NOT INITIALIZED")

        # 4. Проверить Database
        try:
            from .db.database import async_session_maker
            async with async_session_maker() as session:
                # Простой запрос для проверки
                from sqlalchemy import text
                await session.execute(text("SELECT 1"))
                status_lines.append("✅ Database session: OK")
        except Exception as e:
            status_lines.append(f"❌ Database session: {e}")

        await message.answer(
            "🔧 <b>Диагностика уведомлений</b>\n\n" +
            "\n".join(status_lines),
            parse_mode="HTML"
        )

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
            "- /checkin — отметиться на мероприятии (доступно 18 декабря с 17:00 до 21:00)\n\n"
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
                "- /pending_registrations — незавершённые регистрации\n"
                "- /confirmation_stats [id] — статистика подтверждений\n"
                "- /registration_timeline [id] — динамика регистраций\n"
                "- /toggle_event [id] — активировать/деактивировать\n"
                "- /mark_old_registrations [id] — пометить как старая дата\n"
                "- /request_confirmation [id] — запросить подтверждения\n\n"

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
                "- /approve_profile [id] — одобрить профиль\n"
                "- /reject_profile [id] — отклонить профиль\n\n"
            )

        help_text += (
            "<b>Модерация:</b>\n"
            "- /warn (в ответ на сообщение) — предупреждение\n"
            "- /ban (в ответ на сообщение) — забанить\n"
            "- /del (в ответ на сообщение) — удалить\n"
        )

        await message.answer(help_text, parse_mode="HTML")

    # Удаляем все команды из меню
    await bot.delete_my_commands()
    logger.info("Bot menu commands deleted")

    # Запускаем sync service перед polling
    if sync_service:
        await sync_service.start()
        logger.info("Supabase sync service started")

    # Запускаем scheduler для автоматических задач (напоминания о событиях)
    try:
        from .services.scheduler import create_scheduler, setup_scheduled_jobs
        scheduler = create_scheduler()
        setup_scheduled_jobs(scheduler)
        scheduler.start()
        logger.info("Scheduler started for event reminders")
    except Exception as e:
        logger.warning(f"Scheduler не запущен: {e}")

    logger.info(f"Starting {BOT_NAME} v{__version__}")
    # Явно указываем типы обновлений, которые хотим получать
    await dp.start_polling(
        bot,
        allowed_updates=["message", "chat_member", "callback_query"]
    )


if __name__ == "__main__":
    asyncio.run(main())


