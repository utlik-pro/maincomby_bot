from __future__ import annotations

from datetime import datetime

from aiogram import Router, F, Bot
from aiogram.filters import Command, CommandStart, CommandObject
from aiogram.types import Message, CallbackQuery, InlineKeyboardMarkup, InlineKeyboardButton, ReplyKeyboardMarkup, KeyboardButton, ReplyKeyboardRemove, WebAppInfo
from aiogram.fsm.context import FSMContext
from loguru import logger
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_

from ..db.models import User, Event, EventRegistration
from ..config import load_settings
from .states import RegistrationStates

router = Router()

# Глобальная сессия (будет инициализирована в main.py)
_session_factory = None


def set_session_factory(factory):
    """Устанавливает фабрику сессий."""
    global _session_factory
    _session_factory = factory


def get_session() -> AsyncSession:
    """Получает сессию БД."""
    if _session_factory is None:
        raise RuntimeError("Session factory not initialized. Call set_session_factory() first.")
    return _session_factory()


async def get_or_create_user(
    session: AsyncSession,
    tg_user_id: int,
    username: str | None,
    first_name: str | None,
    last_name: str | None,
    source: str | None = None,
    utm_source: str | None = None,
    utm_medium: str | None = None,
    utm_campaign: str | None = None,
    referrer: str | None = None,
) -> User:
    """Получает или создает пользователя в БД."""
    result = await session.execute(
        select(User).where(User.tg_user_id == tg_user_id)
    )
    user = result.scalar_one_or_none()

    if not user:
        user = User(
            tg_user_id=tg_user_id,
            username=username,
            first_name=first_name,
            last_name=last_name,
            source=source,
            utm_source=utm_source,
            utm_medium=utm_medium,
            utm_campaign=utm_campaign,
            referrer=referrer,
        )
        session.add(user)
        await session.commit()
        await session.refresh(user)
        logger.info(f"Создан новый пользователь: {tg_user_id} (@{username}), source: {source}")

    return user


async def notify_admins_about_registration(
    bot: Bot,
    user: User,
    event: Event,
    first_name: str,
    last_name: str,
    phone_number: str
):
    """Отправляет уведомление всем администраторам о новой регистрации."""
    settings = load_settings()

    username_display = f"@{user.username}" if user.username else "нет username"

    notification = (
        f"🔔 <b>НОВАЯ РЕГИСТРАЦИЯ!</b>\n\n"
        f"📋 <b>Мероприятие:</b> {event.title}\n"
        f"📅 <b>Дата:</b> {event.event_date.strftime('%d.%m.%Y в %H:%M')}\n\n"
        f"👤 <b>Участник:</b>\n"
        f"  • Имя: {first_name} {last_name}\n"
        f"  • Телефон: {phone_number}\n"
        f"  • Username: {username_display}\n"
        f"  • User ID: {user.tg_user_id}\n\n"
        f"Используйте /event_stats {event.id} для просмотра всех участников"
    )

    # Отправляем уведомление каждому администратору
    for admin_id in settings.admin_ids:
        try:
            await bot.send_message(admin_id, notification, parse_mode="HTML")
            logger.info(f"Уведомление о регистрации отправлено администратору {admin_id}")
        except Exception as e:
            logger.error(f"Не удалось отправить уведомление администратору {admin_id}: {e}")


async def get_nearest_event(session: AsyncSession) -> Event | None:
    """Получает ближайшее активное мероприятие."""
    result = await session.execute(
        select(Event)
        .where(
            and_(
                Event.is_active == True,
                Event.event_date > datetime.utcnow()
            )
        )
        .order_by(Event.event_date)
        .limit(1)
    )
    return result.scalar_one_or_none()


def format_event_message(event: Event, registered_count: int = 0) -> str:
    """Форматирует сообщение о мероприятии."""
    # Специальное форматирование для ИИшницы
    message = f"🍳 <b>{event.title}</b> 🍳\n\n"

    if event.description:
        message += f"{event.description}\n\n"

    message += f"🏙 <b>Город:</b> {event.city}\n"
    message += f"🗓 <b>Дата:</b> {event.event_date.strftime('%d.%m.%Y')}\n"
    message += f"🕙 <b>Время:</b> {event.event_date.strftime('%H:%M')}\n"

    if event.location:
        message += f"📍 <b>Место:</b> {event.location}\n\n"

    if event.speakers:
        message += f"<b>👆 Что тебя ждет:</b>\n{event.speakers}\n\n"

    message += "Это отличный шанс прокачать свои знания, познакомиться с единомышленниками и узнать новое о развитии ИИ в реальных бизнес-кейсах!\n\n"

    if event.max_participants:
        message += f"<b>Зарегистрировано:</b> {registered_count}/{event.max_participants}\n"
    else:
        message += f"<b>Зарегистрировано:</b> {registered_count}\n"

    if event.registration_deadline:
        message += f"<b>Регистрация до:</b> {event.registration_deadline.strftime('%d.%m.%Y')}\n"

    return message


@router.message(CommandStart())
async def cmd_start_handler(message: Message, command: CommandObject, bot: Bot, state: FSMContext):
    """Обрабатывает команду /start (с параметрами и без)."""
    from datetime import datetime

    logger.info(f"Получена команда /start от пользователя {message.from_user.id}")

    # Deep link для QR кода check-in: /start checkin
    deep_link = command.args or ""
    if deep_link == "checkin":
        logger.info(f"QR код check-in от пользователя {message.from_user.id}")
        await cmd_checkin(message)
        return

    async with get_session() as session:
        # Парсим deep link (формат: /start source_utm_campaign_referrer)
        parts = deep_link.split("_")

        source = parts[0] if len(parts) > 0 else None
        utm_source = parts[1] if len(parts) > 1 else None
        utm_campaign = parts[2] if len(parts) > 2 else None
        referrer = parts[3] if len(parts) > 3 else None

        # Создаем или получаем пользователя
        user = await get_or_create_user(
            session,
            tg_user_id=message.from_user.id,
            username=message.from_user.username,
            first_name=message.from_user.first_name,
            last_name=message.from_user.last_name,
            source=source,
            utm_source=utm_source,
            utm_campaign=utm_campaign,
            referrer=referrer,
        )

        # Загружаем настройки для получения webapp_url
        settings = load_settings()

        # Создаём клавиатуру с кнопкой "Поехали"
        keyboard = None
        if settings.webapp_url:
            keyboard = InlineKeyboardMarkup(
                inline_keyboard=[
                    [InlineKeyboardButton(
                        text="Поехали",
                        web_app=WebAppInfo(url=settings.webapp_url)
                    )]
                ]
            )

        # Отправляем приглашение в приложение
        await message.answer(
            "Привет! Добро пожаловать в MAIN Community.\n\n"
            "Нажми кнопку ниже, чтобы открыть приложение:",
            reply_markup=keyboard
        )


@router.callback_query(F.data.regexp(r"^register_(\d+)$"))
async def callback_register_event(callback: CallbackQuery, state: FSMContext):
    """Инициирует процесс регистрации пользователя на мероприятие."""
    import re
    match = re.match(r"^register_(\d+)$", callback.data)
    if not match:
        return

    event_id = int(match.group(1))

    async with get_session() as session:
        # Получаем пользователя
        result = await session.execute(
            select(User).where(User.tg_user_id == callback.from_user.id)
        )
        user = result.scalar_one_or_none()

        if not user:
            # Создаем пользователя, если его нет
            user = await get_or_create_user(
                session,
                tg_user_id=callback.from_user.id,
                username=callback.from_user.username,
                first_name=callback.from_user.first_name,
                last_name=callback.from_user.last_name,
            )

        # Получаем мероприятие
        result = await session.execute(
            select(Event).where(Event.id == event_id)
        )
        event = result.scalar_one_or_none()

        if not event:
            await callback.answer("Мероприятие не найдено.", show_alert=True)
            return

        # Проверяем, не истек ли дедлайн регистрации
        if event.registration_deadline and datetime.utcnow() > event.registration_deadline:
            await callback.answer("Регистрация на это мероприятие закрыта.", show_alert=True)
            return

        # Проверяем, не достигнут ли лимит участников
        result = await session.execute(
            select(EventRegistration).where(
                and_(
                    EventRegistration.event_id == event_id,
                    EventRegistration.status == "registered"
                )
            )
        )
        registered_count = len(result.scalars().all())

        if event.max_participants and registered_count >= event.max_participants:
            await callback.answer("К сожалению, все места заняты.", show_alert=True)
            return

        # Проверяем, не зарегистрирован ли уже
        result = await session.execute(
            select(EventRegistration).where(
                and_(
                    EventRegistration.event_id == event_id,
                    EventRegistration.user_id == user.id,
                    EventRegistration.status == "registered"
                )
            )
        )
        existing_registration = result.scalar_one_or_none()

        if existing_registration:
            await callback.answer("Вы уже зарегистрированы на это мероприятие.", show_alert=True)
            return

        # Сохраняем event_id в состояние
        await state.update_data(event_id=event_id)

        # Переводим в состояние ожидания имени и фамилии
        await state.set_state(RegistrationStates.waiting_for_full_name)

        await callback.answer()
        await callback.message.answer(
            "Отлично! 🎉\n\n"
            "Для завершения регистрации, пожалуйста, укажите ваше <b>Имя и Фамилию</b>:",
            parse_mode="HTML"
        )
        logger.info(f"Пользователь {user.tg_user_id} начал регистрацию на мероприятие {event.id}")


@router.callback_query(F.data.regexp(r"^unregister_(\d+)$"))
async def callback_unregister_event(callback: CallbackQuery):
    """Отменяет регистрацию пользователя на мероприятие."""
    import re
    match = re.match(r"^unregister_(\d+)$", callback.data)
    if not match:
        return

    event_id = int(match.group(1))

    async with get_session() as session:
        # Получаем пользователя
        result = await session.execute(
            select(User).where(User.tg_user_id == callback.from_user.id)
        )
        user = result.scalar_one_or_none()

        if not user:
            await callback.answer("Пользователь не найден.", show_alert=True)
            return

        # Получаем мероприятие
        result = await session.execute(
            select(Event).where(Event.id == event_id)
        )
        event = result.scalar_one_or_none()

        if not event:
            await callback.answer("Мероприятие не найдено.", show_alert=True)
            return

        # Получаем регистрацию
        result = await session.execute(
            select(EventRegistration).where(
                and_(
                    EventRegistration.event_id == event_id,
                    EventRegistration.user_id == user.id,
                    EventRegistration.status == "registered"
                )
            )
        )
        registration = result.scalar_one_or_none()

        if not registration:
            await callback.answer("Вы не зарегистрированы на это мероприятие.", show_alert=True)
            return

        # Отменяем регистрацию
        registration.status = "cancelled"
        await session.commit()

        # Обновляем кнопки
        keyboard = InlineKeyboardMarkup(inline_keyboard=[
            [InlineKeyboardButton(text="📝 Зарегистрироваться", callback_data=f"register_{event.id}")],
        ])

        if event.location_url:
            keyboard.inline_keyboard.append([
                InlineKeyboardButton(text="📍 Показать на карте", url=event.location_url)
            ])

        try:
            await callback.message.edit_reply_markup(reply_markup=keyboard)
        except Exception:
            pass

        await callback.answer("Регистрация отменена.", show_alert=True)
        logger.info(f"Пользователь {user.tg_user_id} отменил регистрацию на мероприятие {event.id}")


@router.callback_query(F.data == "already_registered")
async def callback_already_registered(callback: CallbackQuery):
    """Заглушка для уже зарегистрированных."""
    await callback.answer("Вы уже зарегистрированы на это мероприятие.", show_alert=False)


@router.callback_query(F.data == "tinder")
async def callback_tinder(callback: CallbackQuery, state: FSMContext):
    """Открывает Main Tinder по нажатию кнопки."""
    from .matching import cmd_tinder

    # Создаем объект Message из callback для совместимости с cmd_tinder
    await callback.answer()
    await cmd_tinder(callback.message, state)


@router.callback_query(F.data.regexp(r"^checkin_(\d+)$"))
async def callback_checkin_event(callback: CallbackQuery):
    """Обрабатывает чекин через кнопку."""
    import re
    match = re.match(r"^checkin_(\d+)$", callback.data)
    if not match:
        return

    event_id = int(match.group(1))

    async with get_session() as session:
        # Получаем пользователя
        result = await session.execute(
            select(User).where(User.tg_user_id == callback.from_user.id)
        )
        user = result.scalar_one_or_none()

        if not user:
            await callback.answer("Пользователь не найден в базе данных.", show_alert=True)
            return

        # Получаем мероприятие
        result = await session.execute(
            select(Event).where(Event.id == event_id)
        )
        event = result.scalar_one_or_none()

        if not event:
            await callback.answer("Мероприятие не найдено.", show_alert=True)
            return

        # Проверяем регистрацию
        result = await session.execute(
            select(EventRegistration)
            .where(
                and_(
                    EventRegistration.event_id == event_id,
                    EventRegistration.user_id == user.id
                )
            )
        )
        registration = result.scalar_one_or_none()

        if not registration:
            await callback.answer("❌ Вы не зарегистрированы на это мероприятие.", show_alert=True)
            return

        # Проверяем доступность чекина по времени
        from datetime import datetime, time, timezone, timedelta
        from ..config import load_settings
        settings = load_settings()
        is_admin = callback.from_user.id in settings.admin_ids

        # Получаем текущее время в Минске (UTC+3)
        minsk_tz = timezone(timedelta(hours=3))
        now_minsk = datetime.now(minsk_tz)
        current_time = now_minsk.time()
        checkin_start = time(17, 0)  # 17:00
        checkin_end = time(21, 0)    # 21:00

        if not is_admin and not (checkin_start <= current_time <= checkin_end):
            await callback.answer(
                f"⏰ Чекин доступен с {checkin_start.strftime('%H:%M')} до {checkin_end.strftime('%H:%M')}",
                show_alert=True
            )
            return

        # Отмечаем посещение
        registration.status = "attended"
        await session.commit()

        await callback.answer("✅ Чекин выполнен!", show_alert=True)

        await callback.message.answer(
            f"✅ <b>Чекин успешно выполнен!</b>\n\n"
            f"📋 Мероприятие: {event.title}\n"
            f"📅 {event.event_date.strftime('%d.%m.%Y в %H:%M')}\n"
            f"📍 {event.location or 'Место уточняется'}\n\n"
            f"Приятного времяпрепровождения! 🎉",
            parse_mode="HTML"
        )

        logger.info(
            f"✅ CHECK-IN (Button): User {user.tg_user_id} ({user.username}) checked in to event {event.id} ({event.title})"
        )


@router.message(RegistrationStates.waiting_for_full_name)
async def process_full_name(message: Message, state: FSMContext):
    """Обрабатывает получение имени и фамилии."""
    full_name = message.text.strip()

    # Проверяем, что введено минимум 2 слова (имя и фамилия)
    name_parts = full_name.split()
    if len(name_parts) < 2:
        await message.answer(
            "Пожалуйста, укажите <b>Имя и Фамилию</b> (минимум два слова).\n"
            "Например: Иван Иванов",
            parse_mode="HTML"
        )
        return

    # Сохраняем имя и фамилию
    first_name = name_parts[0]
    last_name = " ".join(name_parts[1:])

    await state.update_data(first_name=first_name, last_name=last_name)

    # Переходим к запросу телефона
    await state.set_state(RegistrationStates.waiting_for_phone)

    # Создаем клавиатуру с кнопкой "Поделиться контактом"
    keyboard = ReplyKeyboardMarkup(
        keyboard=[
            [KeyboardButton(text="📱 Поделиться номером телефона", request_contact=True)]
        ],
        resize_keyboard=True,
        one_time_keyboard=True
    )

    await message.answer(
        f"Отлично, {first_name}! 👍\n\n"
        "Теперь, пожалуйста, поделитесь вашим <b>номером телефона</b>.\n"
        "Вы можете нажать кнопку ниже или написать номер вручную:",
        parse_mode="HTML",
        reply_markup=keyboard
    )
    logger.info(f"Пользователь {message.from_user.id} указал имя: {first_name} {last_name}")


@router.message(RegistrationStates.waiting_for_phone, F.contact)
async def process_phone_contact(message: Message, state: FSMContext):
    """Обрабатывает получение номера телефона через кнопку 'Поделиться контактом'."""
    phone_number = message.contact.phone_number

    # Нормализуем номер телефона
    if not phone_number.startswith("+"):
        phone_number = f"+{phone_number}"

    await finalize_registration(message, state, phone_number)


@router.message(RegistrationStates.waiting_for_phone, F.text)
async def process_phone_text(message: Message, state: FSMContext):
    """Обрабатывает получение номера телефона в виде текста."""
    phone_number = message.text.strip()

    # Базовая валидация номера телефона (только цифры и +)
    cleaned_phone = ''.join(filter(lambda x: x.isdigit() or x == '+', phone_number))

    if len(cleaned_phone) < 10:
        await message.answer(
            "Пожалуйста, укажите корректный номер телефона.\n"
            "Например: +375291234567 или 80291234567",
            parse_mode="HTML"
        )
        return

    # Нормализуем номер
    if not cleaned_phone.startswith("+"):
        if cleaned_phone.startswith("8"):
            cleaned_phone = f"+375{cleaned_phone[1:]}"
        else:
            cleaned_phone = f"+{cleaned_phone}"

    await finalize_registration(message, state, cleaned_phone)


async def finalize_registration(message: Message, state: FSMContext, phone_number: str):
    """Завершает регистрацию пользователя на мероприятие."""
    # Получаем сохраненные данные
    data = await state.get_data()
    event_id = data.get("event_id")
    first_name = data.get("first_name")
    last_name = data.get("last_name")

    async with get_session() as session:
        # Получаем или создаем пользователя
        result = await session.execute(
            select(User).where(User.tg_user_id == message.from_user.id)
        )
        user = result.scalar_one_or_none()

        if not user:
            user = await get_or_create_user(
                session,
                tg_user_id=message.from_user.id,
                username=message.from_user.username,
                first_name=first_name,
                last_name=last_name,
            )

        # Обновляем данные пользователя
        user.first_name = first_name
        user.last_name = last_name
        user.phone_number = phone_number

        # Создаем регистрацию на мероприятие
        registration = EventRegistration(
            event_id=event_id,
            user_id=user.id,
            status="registered",
        )
        session.add(registration)
        await session.commit()

        # Получаем информацию о мероприятии
        result = await session.execute(
            select(Event).where(Event.id == event_id)
        )
        event = result.scalar_one_or_none()

        # Очищаем состояние
        await state.clear()

        # Отправляем подтверждение
        await message.answer(
            f"✅ <b>Регистрация завершена!</b>\n\n"
            f"Вы успешно зарегистрированы на мероприятие:\n"
            f"<b>{event.title}</b>\n\n"
            f"📅 {event.event_date.strftime('%d.%m.%Y в %H:%M')}\n"
            f"📍 {event.location}\n\n"
            f"До встречи! 👋",
            parse_mode="HTML",
            reply_markup=ReplyKeyboardRemove()
        )

        logger.info(
            f"Пользователь {user.tg_user_id} ({first_name} {last_name}, {phone_number}) "
            f"зарегистрирован на мероприятие {event.id}"
        )

        # Уведомление администраторам о новой регистрации
        await notify_admins_about_registration(
            bot=message.bot,
            user=user,
            event=event,
            first_name=first_name,
            last_name=last_name,
            phone_number=phone_number
        )


@router.message(Command("my_events"))
async def cmd_my_events(message: Message):
    """Показывает мероприятия, на которые зарегистрирован пользователь."""
    async with get_session() as session:
        result = await session.execute(
            select(User).where(User.tg_user_id == message.from_user.id)
        )
        user = result.scalar_one_or_none()

        if not user:
            await message.answer("Вы не зарегистрированы в системе.")
            return

        # Получаем все регистрации пользователя
        result = await session.execute(
            select(EventRegistration)
            .where(
                and_(
                    EventRegistration.user_id == user.id,
                    EventRegistration.status == "registered"
                )
            )
            .order_by(EventRegistration.registered_at.desc())
        )
        registrations = result.scalars().all()

        if not registrations:
            await message.answer("Вы не зарегистрированы ни на одно мероприятие.")
            return

        response = "<b>Ваши мероприятия:</b>\n\n"

        for reg in registrations:
            event = reg.event
            response += f"<b>{event.title}</b>\n"
            response += f"Дата: {event.event_date.strftime('%d.%m.%Y в %H:%M')}\n"
            if event.location:
                response += f"Место: {event.location}\n"
            response += "\n"

        await message.answer(response, parse_mode="HTML")


@router.callback_query(F.data.regexp(r"^confirm_(\d+)_(\d+)$"))
async def callback_confirm_attendance(callback: CallbackQuery):
    """Обрабатывает подтверждение участия с новой датой."""
    # Парсим callback data
    parts = callback.data.split("_")
    event_id = int(parts[1])
    user_tg_id = int(parts[2])

    # Проверяем, что подтверждает именно тот пользователь, кому отправлено
    if callback.from_user.id != user_tg_id:
        await callback.answer("Это сообщение предназначено не для вас.", show_alert=True)
        return

    async with get_session() as session:
        # Получаем пользователя
        result = await session.execute(
            select(User).where(User.tg_user_id == user_tg_id)
        )
        user = result.scalar_one_or_none()

        if not user:
            await callback.answer("Пользователь не найден в системе.", show_alert=True)
            return

        # Получаем регистрацию
        result = await session.execute(
            select(EventRegistration)
            .where(
                and_(
                    EventRegistration.event_id == event_id,
                    EventRegistration.user_id == user.id,
                    EventRegistration.status == "registered"
                )
            )
        )
        registration = result.scalar_one_or_none()

        if not registration:
            await callback.answer("Регистрация не найдена.", show_alert=True)
            return

        # Проверяем, не подтверждена ли уже
        if registration.confirmed:
            await callback.answer("Вы уже подтвердили участие!", show_alert=False)
            return

        # Подтверждаем участие
        registration.confirmed = True
        await session.commit()

        # Получаем информацию о мероприятии
        result = await session.execute(
            select(Event).where(Event.id == event_id)
        )
        event = result.scalar_one_or_none()

        # Обновляем сообщение
        try:
            await callback.message.edit_text(
                f"✅ <b>Участие подтверждено!</b>\n\n"
                f"Вы подтвердили участие в мероприятии:\n"
                f"<b>{event.title}</b>\n\n"
                f"🏙 Город: {event.city}\n"
                f"🗓 Дата: {event.event_date.strftime('%d.%m.%Y')}\n"
                f"🕙 Время: {event.event_date.strftime('%H:%M')}\n"
                + (f"📍 Место: {event.location}\n" if event.location else "")
                + f"\nДо встречи! 🎉",
                parse_mode="HTML"
            )
        except Exception:
            pass

        await callback.answer("✅ Участие подтверждено!", show_alert=False)
        logger.info(f"User {user_tg_id} confirmed attendance for event {event_id}")

        # Уведомляем админов о подтверждении
        settings = load_settings()
        notification = (
            f"✅ <b>Подтверждение участия</b>\n\n"
            f"<b>Мероприятие:</b> {event.title}\n"
            f"<b>Участник:</b> {user.first_name} {user.last_name}\n"
            f"<b>Username:</b> @{user.username or 'нет'}\n"
            f"<b>Телефон:</b> {user.phone_number or 'нет'}\n\n"
            f"Участник подтвердил участие с новой датой."
        )

        for admin_id in settings.admin_ids:
            try:
                await callback.bot.send_message(admin_id, notification, parse_mode="HTML")
            except Exception as e:
                logger.error(f"Failed to notify admin {admin_id}: {e}")


@router.callback_query(F.data.regexp(r"^decline_(\d+)_(\d+)$"))
async def callback_decline_attendance(callback: CallbackQuery):
    """Обрабатывает отказ от участия."""
    # Парсим callback data
    parts = callback.data.split("_")
    event_id = int(parts[1])
    user_tg_id = int(parts[2])

    # Проверяем, что отказывается именно тот пользователь, кому отправлено
    if callback.from_user.id != user_tg_id:
        await callback.answer("Это сообщение предназначено не для вас.", show_alert=True)
        return

    async with get_session() as session:
        # Получаем пользователя
        result = await session.execute(
            select(User).where(User.tg_user_id == user_tg_id)
        )
        user = result.scalar_one_or_none()

        if not user:
            await callback.answer("Пользователь не найден в системе.", show_alert=True)
            return

        # Получаем регистрацию
        result = await session.execute(
            select(EventRegistration)
            .where(
                and_(
                    EventRegistration.event_id == event_id,
                    EventRegistration.user_id == user.id
                )
            )
        )
        registration = result.scalar_one_or_none()

        if not registration:
            await callback.answer("Регистрация не найдена.", show_alert=True)
            return

        # Отменяем регистрацию
        registration.status = "cancelled"
        await session.commit()

        # Получаем информацию о мероприятии
        result = await session.execute(
            select(Event).where(Event.id == event_id)
        )
        event = result.scalar_one_or_none()

        # Обновляем сообщение
        try:
            await callback.message.edit_text(
                f"❌ <b>Регистрация отменена</b>\n\n"
                f"Вы отменили регистрацию на мероприятие:\n"
                f"<b>{event.title}</b>\n\n"
                f"Если передумаете, вы можете зарегистрироваться снова через команду /start",
                parse_mode="HTML"
            )
        except Exception:
            pass

        await callback.answer("Регистрация отменена", show_alert=False)
        logger.info(f"User {user_tg_id} declined attendance for event {event_id}")

        # Уведомляем админов об отказе
        settings = load_settings()
        notification = (
            f"❌ <b>Отказ от участия</b>\n\n"
            f"<b>Мероприятие:</b> {event.title}\n"
            f"<b>Участник:</b> {user.first_name} {user.last_name}\n"
            f"<b>Username:</b> @{user.username or 'нет'}\n"
            f"<b>Телефон:</b> {user.phone_number or 'нет'}\n\n"
            f"Участник отказался от участия с новой датой."
        )

        for admin_id in settings.admin_ids:
            try:
                await callback.bot.send_message(admin_id, notification, parse_mode="HTML")
            except Exception as e:
                logger.error(f"Failed to notify admin {admin_id}: {e}")


@router.callback_query(F.data.regexp(r"^attend_(\d+)_(\d+)$"))
async def callback_attend_from_broadcast(callback: CallbackQuery):
    """
    Обработчик кнопки "✅ Буду!" из рассылки видео-кружка.
    Подтверждает участие пользователя.
    """
    match = callback.data.split("_")
    event_id = int(match[1])
    user_tg_id = int(match[2])

    async with get_session() as session:
        # Получаем регистрацию
        result = await session.execute(
            select(EventRegistration, User, Event)
            .join(User, EventRegistration.user_id == User.id)
            .join(Event, EventRegistration.event_id == Event.id)
            .where(
                and_(
                    EventRegistration.event_id == event_id,
                    User.tg_user_id == user_tg_id
                )
            )
        )
        data = result.first()

        if not data:
            await callback.answer("❌ Регистрация не найдена", show_alert=True)
            return

        registration, user, event = data

        # Обновляем подтверждение
        registration.confirmed = True
        registration.status = "registered"
        await session.commit()

    await callback.answer("✅ Спасибо! Ваше участие подтверждено")
    await callback.message.edit_text(
        f"✅ <b>Участие подтверждено</b>\n\n"
        f"Мероприятие: {event.title}\n"
        f"Дата: {event.event_date.strftime('%d.%m.%Y')}\n"
        f"Место: {event.location}\n\n"
        f"Ждём вас!",
        parse_mode="HTML"
    )

    # Уведомляем администраторов
    settings = load_settings()
    notification = (
        f"✅ <b>Подтверждение участия</b>\n\n"
        f"<b>Мероприятие:</b> {event.title}\n"
        f"<b>Участник:</b> {user.first_name} {user.last_name}\n"
        f"<b>Username:</b> @{user.username or 'нет'}\n"
        f"<b>Телефон:</b> {user.phone_number or 'нет'}\n\n"
        f"Участник подтвердил своё участие через рассылку."
    )

    for admin_id in settings.admin_ids:
        try:
            await callback.bot.send_message(admin_id, notification, parse_mode="HTML")
        except Exception as e:
            logger.error(f"Failed to notify admin {admin_id}: {e}")


@router.callback_query(F.data.regexp(r"^not_attend_(\d+)_(\d+)$"))
async def callback_not_attend_from_broadcast(callback: CallbackQuery):
    """
    Обработчик кнопки "❌ Не смогу прийти" из рассылки видео-кружка.
    Отменяет регистрацию пользователя.
    """
    match = callback.data.split("_")
    event_id = int(match[1])
    user_tg_id = int(match[2])

    async with get_session() as session:
        # Получаем регистрацию
        result = await session.execute(
            select(EventRegistration, User, Event)
            .join(User, EventRegistration.user_id == User.id)
            .join(Event, EventRegistration.event_id == Event.id)
            .where(
                and_(
                    EventRegistration.event_id == event_id,
                    User.tg_user_id == user_tg_id
                )
            )
        )
        data = result.first()

        if not data:
            await callback.answer("❌ Регистрация не найдена", show_alert=True)
            return

        registration, user, event = data

        # Отменяем регистрацию
        registration.status = "cancelled"
        registration.confirmed = False
        await session.commit()

    await callback.answer("Участие отменено")
    await callback.message.edit_text(
        f"❌ <b>Участие отменено</b>\n\n"
        f"Мероприятие: {event.title}\n\n"
        f"Будем рады видеть вас на других мероприятиях!",
        parse_mode="HTML"
    )

    # Уведомляем администраторов
    settings = load_settings()
    notification = (
        f"❌ <b>Отказ от участия (через рассылку)</b>\n\n"
        f"<b>Мероприятие:</b> {event.title}\n"
        f"<b>Участник:</b> {user.first_name} {user.last_name}\n"
        f"<b>Username:</b> @{user.username or 'нет'}\n"
        f"<b>Телефон:</b> {user.phone_number or 'нет'}\n\n"
        f"Участник отказался от участия через рассылку."
    )

    for admin_id in settings.admin_ids:
        try:
            await callback.bot.send_message(admin_id, notification, parse_mode="HTML")
        except Exception as e:
            logger.error(f"Failed to notify admin {admin_id}: {e}")


@router.message(Command("checkin"))
async def cmd_checkin(message: Message):
    """
    Самостоятельная отметка участника о приходе на мероприятие.

    Проверяет:
    1. Есть ли активная регистрация на сегодняшнее событие
    2. Событие происходит сегодня (допуск ±4 часа)

    Действия:
    - Обновляет статус на 'attended'
    - Отправляет подтверждение участнику
    - Логирует успешный check-in
    """
    from datetime import datetime, timedelta
    from sqlalchemy import update

    user_tg_id = message.from_user.id

    logger.info(f"Check-in attempt by user {user_tg_id}")

    # Проверка времени доступности чекина: только 18 декабря 2025 с 17:00 до 21:00 (Минск)
    minsk_offset = timedelta(hours=3)
    now_utc = datetime.utcnow()
    now_minsk = now_utc + minsk_offset

    # Определяем временное окно для чекина
    checkin_date = datetime(2025, 12, 18, 17, 0, 0)  # 18 декабря 2025, 17:00
    checkin_end = datetime(2025, 12, 18, 21, 0, 0)   # 18 декабря 2025, 21:00

    if not (checkin_date <= now_minsk <= checkin_end):
        logger.info(f"Check-in not available at {now_minsk} (Minsk time)")
        await message.reply(
            "📍 <b>Чекин временно недоступен</b>\n\n"
            "Чекин будет доступен:\n"
            "📅 18 декабря 2025\n"
            "🕐 с 17:00 до 21:00\n\n"
            "Пожалуйста, попробуйте в указанное время.",
            parse_mode="HTML"
        )
        return

    async with get_session() as session:
        # 1. Найти пользователя
        user_result = await session.execute(
            select(User).where(User.tg_user_id == user_tg_id)
        )
        user = user_result.scalar_one_or_none()

        if not user:
            logger.warning(f"User {user_tg_id} not found in DB.")
            await message.reply(
                "❌ Вы не зарегистрированы в системе.\n"
                "Пожалуйста, зарегистрируйтесь сначала через /start"
            )
            return

        # 2. Найти активное событие на сегодня
        # ВАЖНО: event_date в БД хранится по времени Минска (UTC+3), но без timezone
        # Поэтому сравниваем с "сегодня" по Минску
        minsk_offset = timedelta(hours=3)
        now_utc = datetime.utcnow()
        now_minsk = now_utc + minsk_offset

        today_start_minsk = now_minsk.replace(hour=0, minute=0, second=0, microsecond=0)
        today_end_minsk = today_start_minsk + timedelta(days=1)

        logger.info(f"Searching for events for user {user.id} between {today_start_minsk} and {today_end_minsk} (Minsk time)")

        query = (
            select(Event, EventRegistration)
            .join(EventRegistration, EventRegistration.event_id == Event.id)
            .where(
                and_(
                    EventRegistration.user_id == user.id,
                    EventRegistration.status == "registered",
                    Event.event_date >= today_start_minsk,
                    Event.event_date < today_end_minsk,
                    Event.is_active == True
                )
            )
            .order_by(Event.event_date)  # Ближайшее событие
        )

        result = await session.execute(query)
        event_registration = result.first()

        if not event_registration:
            logger.warning(f"No active registration found for user {user.id}")
            await message.reply(
                "❌ У вас нет активной регистрации на сегодняшнее мероприятие.\n\n"
                "Пожалуйста, зарегистрируйтесь через /events или обратитесь к организатору."
            )
            return

        event, registration = event_registration

        # Защита от двойного check-in
        if registration.status == "attended":
            await message.reply(
                f"✅ Вы уже отметились на этом мероприятии!\n\n"
                f"📋 {event.title}\n"
                f"Добро пожаловать! 🎉"
            )
            return

        # 3. Обновить статус на 'attended'
        await session.execute(
            update(EventRegistration)
            .where(EventRegistration.id == registration.id)
            .values(status="attended")
        )
        await session.commit()

        # 4. Подтверждение участнику
        await message.reply(
            f"✅ <b>Добро пожаловать!</b>\n\n"
            f"📋 Мероприятие: {event.title}\n"
            f"📅 {event.event_date.strftime('%d.%m.%Y в %H:%M')}\n"
            f"📍 {event.location or 'Место уточняется'}\n\n"
            f"Ваше присутствие отмечено. Приятного времяпрепровождения! 🎉",
            parse_mode="HTML"
        )

        logger.info(
            f"✅ CHECK-IN: User {user.tg_user_id} ({user.username}) checked in to event {event.id} ({event.title})"
        )

