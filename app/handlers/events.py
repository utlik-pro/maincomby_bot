from __future__ import annotations

from datetime import datetime

from aiogram import Router, F, Bot
from aiogram.filters import Command, CommandStart, CommandObject
from aiogram.types import Message, CallbackQuery, InlineKeyboardMarkup, InlineKeyboardButton, ReplyKeyboardMarkup, KeyboardButton, ReplyKeyboardRemove
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
    logger.info(f"Получена команда /start от пользователя {message.from_user.id}")

    async with get_session() as session:
        # Парсим deep link (формат: /start source_utm_campaign_referrer)
        deep_link = command.args or ""
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

        # Проверяем, есть ли активные мероприятия
        result = await session.execute(
            select(Event)
            .where(
                and_(
                    Event.is_active == True,
                    Event.event_date > datetime.utcnow()
                )
            )
        )
        events = result.scalars().all()

        if not events:
            await message.answer(
                "Привет! 👋\n\n"
                "Пока нет активных мероприятий, но скоро они появятся. "
                "Следи за обновлениями!"
            )
            return

        # Предлагаем выбрать город
        await state.set_state(RegistrationStates.selecting_city)

        keyboard = InlineKeyboardMarkup(inline_keyboard=[
            [InlineKeyboardButton(text="🏙 Минск", callback_data="select_city_minsk")],
            [InlineKeyboardButton(text="🏰 Гродно", callback_data="select_city_grodno")],
            [InlineKeyboardButton(text="🌍 Оба города", callback_data="select_city_both")],
        ])

        await message.answer(
            "Привет! 👋\n\n"
            "Рады видеть тебя в боте ИИшницы!\n\n"
            "В каком городе ты хочешь посетить мероприятия?",
            reply_markup=keyboard
        )


@router.callback_query(F.data.in_(["select_city_minsk", "select_city_grodno", "select_city_both"]), RegistrationStates.selecting_city)
async def callback_select_city(callback: CallbackQuery, state: FSMContext, bot: Bot):
    """Обрабатывает выбор города пользователем и показывает доступные мероприятия."""
    # Определяем выбранный город
    if callback.data == "select_city_minsk":
        selected_cities = ["Минск"]
        city_text = "Минске"
    elif callback.data == "select_city_grodno":
        selected_cities = ["Гродно"]
        city_text = "Гродно"
    else:  # select_city_both
        selected_cities = ["Минск", "Гродно"]
        city_text = "обоих городах"

    await callback.answer()
    await state.clear()  # Очищаем состояние

    async with get_session() as session:
        # Получаем пользователя
        result = await session.execute(
            select(User).where(User.tg_user_id == callback.from_user.id)
        )
        user = result.scalar_one_or_none()

        # Получаем активные мероприятия в выбранных городах
        result = await session.execute(
            select(Event)
            .where(
                and_(
                    Event.is_active == True,
                    Event.event_date > datetime.utcnow(),
                    Event.city.in_(selected_cities)
                )
            )
            .order_by(Event.event_date)
        )
        events = result.scalars().all()

        if not events:
            await callback.message.answer(
                f"К сожалению, в {city_text} пока нет запланированных мероприятий.\n\n"
                "Следи за обновлениями!"
            )
            return

        # Группируем мероприятия по городам
        events_by_city = {}
        for event in events:
            if event.city not in events_by_city:
                events_by_city[event.city] = []
            events_by_city[event.city].append(event)

        # Отправляем информацию о каждом мероприятии
        intro_message = f"Отлично! Вот мероприятия в {city_text}:\n"
        await callback.message.answer(intro_message)

        for city in selected_cities:
            if city not in events_by_city:
                continue

            for event in events_by_city[city]:
                # Получаем количество зарегистрированных
                result = await session.execute(
                    select(EventRegistration).where(
                        and_(
                            EventRegistration.event_id == event.id,
                            EventRegistration.status == "registered"
                        )
                    )
                )
                registered_count = len(result.scalars().all())

                # Проверяем, зарегистрирован ли уже пользователь
                is_registered = False
                if user:
                    result = await session.execute(
                        select(EventRegistration).where(
                            and_(
                                EventRegistration.event_id == event.id,
                                EventRegistration.user_id == user.id,
                                EventRegistration.status == "registered"
                            )
                        )
                    )
                    is_registered = result.scalar_one_or_none() is not None

                # Формируем сообщение и кнопки
                event_message = format_event_message(event, registered_count)

                if is_registered:
                    keyboard = InlineKeyboardMarkup(inline_keyboard=[
                        [InlineKeyboardButton(text="✅ Я иду!", callback_data="already_registered")],
                        [InlineKeyboardButton(text="❌ Отменить регистрацию", callback_data=f"unregister_{event.id}")],
                    ])
                    event_message += "\n<b>✅ Вы уже зарегистрированы на это мероприятие!</b>"
                else:
                    keyboard = InlineKeyboardMarkup(inline_keyboard=[
                        [InlineKeyboardButton(text="😎 Иду!", callback_data=f"register_{event.id}")],
                    ])

                if event.location_url:
                    keyboard.inline_keyboard.append([
                        InlineKeyboardButton(text="📍 Показать на карте", url=event.location_url)
                    ])

                await callback.message.answer(event_message, parse_mode="HTML", reply_markup=keyboard)


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
