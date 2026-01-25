from __future__ import annotations

from datetime import datetime

from aiogram import Router, F
from aiogram.filters import Command
from aiogram.types import Message, CallbackQuery, InlineKeyboardMarkup, InlineKeyboardButton
from aiogram.fsm.context import FSMContext
from aiogram.fsm.state import State, StatesGroup
from loguru import logger
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, func

from ..db.models import Event, EventRegistration, SecurityLog, User, UserProfile
from ..config import load_settings

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


async def is_admin(user_id: int) -> bool:
    """Проверяет, является ли пользователь администратором."""
    settings = load_settings()
    return user_id in settings.admin_ids


class CreateEventStates(StatesGroup):
    title = State()
    description = State()
    event_date = State()
    city = State()
    location = State()
    location_url = State()
    speakers = State()
    max_participants = State()
    registration_deadline = State()


@router.message(Command("create_event"))
async def cmd_create_event_start(message: Message, state: FSMContext):
    """Начинает процесс создания мероприятия."""
    if not await is_admin(message.from_user.id):
        await message.reply("Только администраторы могут создавать мероприятия.")
        return

    await state.update_data(is_test=False)
    await state.set_state(CreateEventStates.title)
    await message.answer(
        "Создание нового мероприятия.\n\n"
        "Шаг 1/9: Введите название мероприятия:"
    )


@router.message(Command("create_test_event"))
async def cmd_create_test_event_start(message: Message, state: FSMContext):
    """Начинает процесс создания ТЕСТОВОГО мероприятия (видно только тестировщикам)."""
    if not await is_admin(message.from_user.id):
        await message.reply("Только администраторы могут создавать мероприятия.")
        return

    await state.update_data(is_test=True)
    await state.set_state(CreateEventStates.title)
    await message.answer(
        "🧪 <b>Создание ТЕСТОВОГО мероприятия</b>\n\n"
        "⚠️ Это событие будет видно только тестировщикам (TESTER_IDS).\n\n"
        "Шаг 1/9: Введите название мероприятия:",
        parse_mode="HTML"
    )


@router.message(CreateEventStates.title)
async def cmd_create_event_title(message: Message, state: FSMContext):
    """Сохраняет название мероприятия."""
    await state.update_data(title=message.text)
    await state.set_state(CreateEventStates.description)
    await message.answer("Шаг 2/9: Введите описание мероприятия (или отправьте '-' чтобы пропустить):")


@router.message(CreateEventStates.description)
async def cmd_create_event_description(message: Message, state: FSMContext):
    """Сохраняет описание мероприятия."""
    description = message.text if message.text != "-" else None
    await state.update_data(description=description)
    await state.set_state(CreateEventStates.event_date)
    await message.answer(
        "Шаг 3/9: Введите дату и время мероприятия в формате:\n"
        "ДД.ММ.ГГГГ ЧЧ:ММ\n\n"
        "Например: 25.12.2025 19:00"
    )


@router.message(CreateEventStates.event_date)
async def cmd_create_event_date(message: Message, state: FSMContext):
    """Сохраняет дату мероприятия."""
    try:
        event_date = datetime.strptime(message.text, "%d.%m.%Y %H:%M")
        await state.update_data(event_date=event_date)
        await state.set_state(CreateEventStates.city)

        # Создаем кнопки для выбора города
        keyboard = InlineKeyboardMarkup(inline_keyboard=[
            [InlineKeyboardButton(text="🏙 Минск", callback_data="city_minsk")],
            [InlineKeyboardButton(text="🏰 Гродно", callback_data="city_grodno")],
        ])

        await message.answer(
            "Шаг 4/9: Выберите город проведения мероприятия:",
            reply_markup=keyboard
        )
    except ValueError:
        await message.answer(
            "Неверный формат даты. Попробуйте еще раз.\n"
            "Формат: ДД.ММ.ГГГГ ЧЧ:ММ\n"
            "Например: 25.12.2025 19:00"
        )


@router.callback_query(F.data.in_(["city_minsk", "city_grodno"]), CreateEventStates.city)
async def callback_select_city(callback: CallbackQuery, state: FSMContext):
    """Обрабатывает выбор города."""
    city = "Минск" if callback.data == "city_minsk" else "Гродно"
    await state.update_data(city=city)
    await state.set_state(CreateEventStates.location)

    await callback.answer()
    await callback.message.answer(f"Выбран город: {city}\n\nШаг 5/9: Введите место проведения (адрес) или '-' чтобы пропустить:")


@router.message(CreateEventStates.location)
async def cmd_create_event_location(message: Message, state: FSMContext):
    """Сохраняет место проведения."""
    location = message.text if message.text != "-" else None
    await state.update_data(location=location)
    await state.set_state(CreateEventStates.location_url)
    await message.answer("Шаг 6/9: Введите ссылку на карту (Google Maps, Yandex Maps) или '-' чтобы пропустить:")


@router.message(CreateEventStates.location_url)
async def cmd_create_event_location_url(message: Message, state: FSMContext):
    """Сохраняет ссылку на карту."""
    location_url = message.text if message.text != "-" else None
    await state.update_data(location_url=location_url)
    await state.set_state(CreateEventStates.speakers)
    await message.answer("Шаг 7/9: Введите информацию о спикерах (или '-' чтобы пропустить):")


@router.message(CreateEventStates.speakers)
async def cmd_create_event_speakers(message: Message, state: FSMContext):
    """Сохраняет информацию о спикерах."""
    speakers = message.text if message.text != "-" else None
    await state.update_data(speakers=speakers)
    await state.set_state(CreateEventStates.max_participants)
    await message.answer("Шаг 8/9: Введите максимальное количество участников (число или '-' для неограниченного):")


@router.message(CreateEventStates.max_participants)
async def cmd_create_event_max_participants(message: Message, state: FSMContext):
    """Сохраняет максимальное количество участников."""
    if message.text == "-":
        max_participants = None
    else:
        try:
            max_participants = int(message.text)
        except ValueError:
            await message.answer("Неверный формат. Введите число или '-':")
            return

    await state.update_data(max_participants=max_participants)
    await state.set_state(CreateEventStates.registration_deadline)
    await message.answer(
        "Шаг 9/9: Введите дедлайн регистрации в формате:\n"
        "ДД.ММ.ГГГГ\n\n"
        "Или отправьте '-' чтобы пропустить.\n"
        "Например: 24.12.2025"
    )


@router.message(CreateEventStates.registration_deadline)
async def cmd_create_event_deadline(message: Message, state: FSMContext):
    """Сохраняет дедлайн регистрации и создает мероприятие."""
    if message.text == "-":
        registration_deadline = None
    else:
        try:
            registration_deadline = datetime.strptime(message.text, "%d.%m.%Y")
        except ValueError:
            await message.answer(
                "Неверный формат даты. Попробуйте еще раз.\n"
                "Формат: ДД.ММ.ГГГГ\n"
                "Например: 24.12.2025"
            )
            return

    await state.update_data(registration_deadline=registration_deadline)

    # Получаем все данные
    data = await state.get_data()

    # Создаем мероприятие
    async with get_session() as session:
        try:
            is_test = data.get("is_test", False)
            event = Event(
                title=data["title"],
                description=data.get("description"),
                event_date=data["event_date"],
                city=data["city"],
                location=data.get("location"),
                location_url=data.get("location_url"),
                speakers=data.get("speakers"),
                max_participants=data.get("max_participants"),
                registration_deadline=data.get("registration_deadline"),
                is_active=True,
                is_test=is_test,
                created_by=message.from_user.id,
            )
            session.add(event)
            await session.commit()
            await session.refresh(event)

            test_badge = "🧪 [ТЕСТ] " if is_test else ""
            test_note = "\n\n⚠️ Это тестовое событие, видно только тестировщикам." if is_test else ""
            await message.answer(
                f"✅ {test_badge}Мероприятие создано!\n\n"
                f"<b>{event.title}</b>\n"
                f"ID: {event.id}\n"
                f"Дата: {event.event_date.strftime('%d.%m.%Y в %H:%M')}\n\n"
                f"🔗 Ссылка для регистрации:\n"
                f"<code>https://t.me/maincomapp_bot?startapp=event_{event.id}</code>{test_note}",
                parse_mode="HTML"
            )

            logger.info(f"Создано мероприятие {event.id}: {event.title}")
        except Exception as e:
            logger.error(f"Ошибка при создании мероприятия: {e}")
            await message.answer(f"Ошибка при создании мероприятия: {e}")

    await state.clear()


@router.message(Command("list_events"))
async def cmd_list_events(message: Message):
    """Список всех мероприятий."""
    if not await is_admin(message.from_user.id):
        await message.reply("Только администраторы могут просматривать список мероприятий.")
        return

    async with get_session() as session:
        result = await session.execute(
            select(Event).order_by(Event.event_date.desc())
        )
        events = result.scalars().all()

        if not events:
            await message.answer("Мероприятий пока нет.")
            return

        response = "<b>Все мероприятия:</b>\n\n"

        for event in events:
            status = "✅ Активно" if event.is_active else "❌ Неактивно"
            test_badge = "🧪 " if getattr(event, 'is_test', False) else ""
            response += f"<b>ID {event.id}:</b> {test_badge}{event.title}\n"
            response += f"Город: {event.city}\n"
            response += f"Статус: {status}\n"
            if getattr(event, 'is_test', False):
                response += f"⚠️ Тестовое событие\n"
            response += f"Дата: {event.event_date.strftime('%d.%m.%Y в %H:%M')}\n"

            # Получаем количество зарегистрированных
            result = await session.execute(
                select(func.count(EventRegistration.id)).where(
                    and_(
                        EventRegistration.event_id == event.id,
                        EventRegistration.status == "registered"
                    )
                )
            )
            registered_count = result.scalar()

            response += f"Зарегистрировано: {registered_count}"
            if event.max_participants:
                response += f"/{event.max_participants}"
            response += f"\n🔗 <code>https://t.me/maincomapp_bot?startapp=event_{event.id}</code>\n\n"

        await message.answer(response, parse_mode="HTML")


@router.message(Command("event_stats"))
async def cmd_event_stats(message: Message):
    """Статистика по мероприятиям."""
    if not await is_admin(message.from_user.id):
        await message.reply("Только администраторы могут просматривать статистику.")
        return

    # Формат: /event_stats или /event_stats 1
    args = message.text.split()[1:] if message.text else []

    async with get_session() as session:
        if args and args[0].isdigit():
            # Статистика конкретного мероприятия
            event_id = int(args[0])

            result = await session.execute(
                select(Event).where(Event.id == event_id)
            )
            event = result.scalar_one_or_none()

            if not event:
                await message.answer(f"Мероприятие с ID {event_id} не найдено.")
                return

            # Получаем регистрации с данными пользователей
            result = await session.execute(
                select(EventRegistration, User)
                .join(User, EventRegistration.user_id == User.id)
                .where(EventRegistration.event_id == event_id)
                .order_by(EventRegistration.registered_at.desc())
            )
            registrations_with_users = result.all()

            registered_list = [(r, u) for r, u in registrations_with_users if r.status == "registered"]
            cancelled_count = sum(1 for r, u in registrations_with_users if r.status == "cancelled")

            # Подсчет статистики по версиям
            old_date_total = sum(1 for r, u in registrations_with_users if r.registration_version == "old_date")
            old_date_confirmed = sum(1 for r, u in registrations_with_users
                                    if r.registration_version == "old_date" and r.confirmed and r.status == "registered")
            old_date_pending = sum(1 for r, u in registrations_with_users
                                  if r.registration_version == "old_date" and not r.confirmed and r.status == "registered")
            old_date_declined = sum(1 for r, u in registrations_with_users
                                   if r.registration_version == "old_date" and r.status == "cancelled")

            new_date_total = sum(1 for r, u in registrations_with_users if r.registration_version == "new_date" and r.status == "registered")

            response = f"<b>📊 Статистика мероприятия:</b>\n\n"
            response += f"<b>{event.title}</b>\n"
            response += f"🏙 Город: {event.city}\n"
            response += f"📅 Дата: {event.event_date.strftime('%d.%m.%Y в %H:%M')}\n"
            response += f"🔗 <code>https://t.me/maincomapp_bot?startapp=event_{event.id}</code>\n\n"

            response += f"<b>📈 Общая статистика:</b>\n"
            response += f"✅ Зарегистрировано: {len(registered_list)}\n"
            response += f"❌ Отменено: {cancelled_count}\n"
            response += f"📋 Всего регистраций: {len(registrations_with_users)}\n\n"

            # Статистика по версиям регистрации
            if old_date_total > 0 or new_date_total > 0:
                response += f"<b>📅 По датам регистрации:</b>\n"

                if old_date_total > 0:
                    response += f"👴 Старая дата: {old_date_total} чел.\n"
                    response += f"   ├─ ✅ Подтвердили: {old_date_confirmed}\n"
                    response += f"   ├─ ⏳ Не ответили: {old_date_pending}\n"
                    response += f"   └─ ❌ Отказались: {old_date_declined}\n"

                    if old_date_total > 0:
                        confirmation_rate = (old_date_confirmed / old_date_total) * 100
                        response += f"   📊 Конверсия: {confirmation_rate:.1f}%\n"
                    response += "\n"

                if new_date_total > 0:
                    response += f"🆕 Новая дата: {new_date_total} чел.\n\n"

            if registered_list:
                response += "<b>👥 Список зарегистрированных:</b>\n\n"
                for idx, (reg, user) in enumerate(registered_list, 1):
                    response += f"{idx}. "

                    # Имя и фамилия
                    if user.first_name and user.last_name:
                        response += f"<b>{user.first_name} {user.last_name}</b>"
                    elif user.first_name:
                        response += f"<b>{user.first_name}</b>"
                    else:
                        response += f"<b>Имя не указано</b>"

                    # Username
                    if user.username:
                        response += f" (@{user.username})"

                    # Телефон
                    if user.phone_number:
                        response += f"\n   📱 {user.phone_number}"

                    # Дата регистрации
                    response += f"\n   📅 {reg.registered_at.strftime('%d.%m.%Y %H:%M')}"
                    response += "\n\n"

            await message.answer(response, parse_mode="HTML")
        else:
            # Общая статистика с разбивкой по мероприятиям
            result = await session.execute(
                select(Event).order_by(Event.event_date.desc())
            )
            events = result.scalars().all()

            if not events:
                await message.answer("❌ Мероприятий пока нет.")
                return

            response = "<b>📊 Общая статистика по мероприятиям:</b>\n\n"

            total_registrations = 0
            total_active = 0

            for event in events:
                # Получаем статистику для каждого мероприятия
                result = await session.execute(
                    select(EventRegistration)
                    .where(EventRegistration.event_id == event.id)
                )
                event_regs = result.scalars().all()

                registered_count = sum(1 for r in event_regs if r.status == "registered")
                cancelled_count = sum(1 for r in event_regs if r.status == "cancelled")
                total_count = len(event_regs)

                total_registrations += total_count
                total_active += registered_count

                # Статус мероприятия
                status_emoji = "✅" if event.is_active else "🔴"

                response += f"{status_emoji} <b>{event.title}</b>\n"
                response += f"   ID: {event.id} | 🏙 {event.city}\n"
                response += f"   📅 {event.event_date.strftime('%d.%m.%Y %H:%M')}\n"
                response += f"   👥 Участников: {registered_count}"

                if event.max_participants:
                    percentage = (registered_count / event.max_participants) * 100
                    response += f" / {event.max_participants} ({percentage:.0f}%)"

                response += "\n"

                if cancelled_count > 0:
                    response += f"   ❌ Отменено: {cancelled_count}\n"

                response += "\n"

            # Итоговая сводка
            response += "━━━━━━━━━━━━━━━━━━━━━━━━━\n"
            response += f"<b>📈 Итого:</b>\n"
            response += f"🎯 Всего мероприятий: {len(events)}\n"
            response += f"✅ Активных: {sum(1 for e in events if e.is_active)}\n"
            response += f"👥 Всего регистраций: {total_registrations}\n"
            response += f"✅ Активных регистраций: {total_active}\n\n"
            response += "💡 <i>Используйте /event_stats &lt;ID&gt; для детальной статистики мероприятия.</i>"

            await message.answer(response, parse_mode="HTML")


@router.message(Command("toggle_event"))
async def cmd_toggle_event(message: Message):
    """Активирует/деактивирует мероприятие."""
    if not await is_admin(message.from_user.id):
        await message.reply("Только администраторы могут управлять мероприятиями.")
        return

    # Формат: /toggle_event 1
    args = message.text.split()[1:] if message.text else []

    if not args or not args[0].isdigit():
        await message.answer("Использование: /toggle_event <ID>")
        return

    event_id = int(args[0])

    async with get_session() as session:
        result = await session.execute(
            select(Event).where(Event.id == event_id)
        )
        event = result.scalar_one_or_none()

        if not event:
            await message.answer(f"Мероприятие с ID {event_id} не найдено.")
            return

        event.is_active = not event.is_active
        await session.commit()

        status = "активировано" if event.is_active else "деактивировано"
        await message.answer(f"Мероприятие '{event.title}' {status}.")


@router.message(Command("event_link"))
async def cmd_event_link(message: Message):
    """Получает ссылку на мероприятие для Mini App."""
    if not await is_admin(message.from_user.id):
        await message.reply("Только администраторы могут получать ссылки.")
        return

    args = message.text.split()[1:] if message.text else []

    if not args or not args[0].isdigit():
        await message.answer("Использование: /event_link <ID>")
        return

    event_id = int(args[0])

    async with get_session() as session:
        result = await session.execute(
            select(Event).where(Event.id == event_id)
        )
        event = result.scalar_one_or_none()

        if not event:
            await message.answer(f"Мероприятие с ID {event_id} не найдено.")
            return

        await message.answer(
            f"🔗 <b>{event.title}</b>\n\n"
            f"Ссылка для регистрации (нажмите чтобы скопировать):\n"
            f"<code>https://t.me/maincomapp_bot?startapp=event_{event.id}</code>",
            parse_mode="HTML"
        )


@router.message(Command("export_leads"))
async def cmd_export_leads(message: Message):
    """Экспортирует лиды мероприятия и отправляет в чат."""
    if not await is_admin(message.from_user.id):
        await message.reply("Только администраторы могут экспортировать лиды.")
        return

    # Формат: /export_leads <event_id> или /export_leads <event_id> <chat_id>
    args = message.text.split()[1:] if message.text else []

    if not args or not args[0].isdigit():
        await message.answer(
            "Использование:\n"
            "/export_leads <event_id> - отправить в текущий чат\n"
            "/export_leads <event_id> <chat_id> - отправить в указанный чат"
        )
        return

    event_id = int(args[0])
    target_chat_id = int(args[1]) if len(args) > 1 and (args[1].lstrip('-').isdigit()) else message.chat.id

    async with get_session() as session:
        # Получаем мероприятие
        result = await session.execute(
            select(Event).where(Event.id == event_id)
        )
        event = result.scalar_one_or_none()

        if not event:
            await message.answer(f"Мероприятие с ID {event_id} не найдено.")
            return

        # Получаем регистрации с данными пользователей (все статусы)
        result = await session.execute(
            select(EventRegistration, User)
            .join(User, EventRegistration.user_id == User.id)
            .where(EventRegistration.event_id == event_id)
            .order_by(EventRegistration.registered_at.desc())
        )
        registrations_with_users = result.all()

        if not registrations_with_users:
            await message.answer("На это мероприятие нет зарегистрированных участников.")
            return

        # Формируем сообщение с лидами
        leads_message = f"<b>📊 ЛИДЫ МЕРОПРИЯТИЯ</b>\n\n"
        leads_message += f"<b>Мероприятие:</b> {event.title}\n"
        leads_message += f"<b>Дата:</b> {event.event_date.strftime('%d.%m.%Y в %H:%M')}\n"
        leads_message += f"<b>Всего участников:</b> {len(registrations_with_users)}\n\n"
        leads_message += "━━━━━━━━━━━━━━━━━━━━\n\n"

        # CSV формат для экспорта
        csv_content = "№,Имя,Фамилия,Username,Телефон,Статус,Дата регистрации\n"

        for idx, (reg, user) in enumerate(registrations_with_users, 1):
            # Для сообщения
            leads_message += f"<b>{idx}.</b> "

            first_name = user.first_name or "—"
            last_name = user.last_name or "—"
            username = f"@{user.username}" if user.username else "—"
            phone = user.phone_number or "—"
            status = reg.status or "registered"

            # Эмодзи для статусов
            status_emoji = {
                "registered": "✅",
                "cancelled": "❌",
                "attended": "👤"
            }.get(status, "❓")

            leads_message += f"{first_name} {last_name}"
            if user.username:
                leads_message += f" ({username})"
            leads_message += f"\n📱 {phone}"
            leads_message += f"\n{status_emoji} {status}"
            leads_message += f"\n📅 {reg.registered_at.strftime('%d.%m.%Y %H:%M')}\n\n"

            # Для CSV
            csv_content += f'{idx},"{first_name}","{last_name}","{username}","{phone}","{status}","{reg.registered_at.strftime("%d.%m.%Y %H:%M")}"\n'

        # Отправляем сообщение с лидами
        try:
            from aiogram import Bot
            from ..config import load_settings
            settings = load_settings()
            bot = Bot(token=settings.bot_token)

            # Разбиваем на части если сообщение слишком длинное
            max_length = 4000
            if len(leads_message) > max_length:
                parts = []
                current_part = leads_message[:max_length]
                remaining = leads_message[max_length:]
                parts.append(current_part)

                while remaining:
                    parts.append(remaining[:max_length])
                    remaining = remaining[max_length:]

                for part in parts:
                    await bot.send_message(target_chat_id, part, parse_mode="HTML")
            else:
                await bot.send_message(target_chat_id, leads_message, parse_mode="HTML")

            # Отправляем CSV файл
            from io import BytesIO
            csv_file = BytesIO(csv_content.encode('utf-8'))
            csv_file.name = f"leads_event_{event_id}_{event.event_date.strftime('%Y%m%d')}.csv"

            from aiogram.types import BufferedInputFile
            file = BufferedInputFile(csv_file.getvalue(), filename=csv_file.name)
            await bot.send_document(
                target_chat_id,
                file,
                caption=f"📎 CSV файл с участниками мероприятия '{event.title}'"
            )

            if target_chat_id != message.chat.id:
                await message.answer(f"✅ Лиды отправлены в чат {target_chat_id}")
            else:
                await message.answer("✅ Лиды экспортированы")

            logger.info(f"Экспортированы лиды для мероприятия {event_id} ({len(registrations_with_users)} участников)")

        except Exception as e:
            logger.error(f"Ошибка при экспорте лидов: {e}")
            await message.answer(f"Ошибка при экспорте: {e}")


@router.message(Command("security_logs"))
async def cmd_security_logs(message: Message):
    """Показывает последние инциденты безопасности."""
    if not await is_admin(message.from_user.id):
        await message.reply("Только администраторы могут просматривать логи безопасности.")
        return

    async with get_session() as session:
        result = await session.execute(
            select(SecurityLog).order_by(SecurityLog.created_at.desc()).limit(10)
        )
        logs = result.scalars().all()

        if not logs:
            await message.answer("Инцидентов безопасности не обнаружено. 🎉")
            return

        response = "<b>🚨 Последние инциденты безопасности:</b>\n\n"

        for log in logs:
            response += f"<b>ID:</b> {log.id}\n"
            response += f"<b>Пользователь:</b> {log.user_id} (@{log.username or 'unknown'})\n"
            response += f"<b>Тип:</b> {log.attack_type}\n"
            response += f"<b>Причина:</b> {log.detection_reason}\n"
            response += f"<b>Действие:</b> {log.action_taken}\n"
            response += f"<b>Запрос:</b> {log.user_input[:100]}...\n"
            response += f"<b>Дата:</b> {log.created_at.strftime('%d.%m.%Y %H:%M')}\n\n"

        await message.answer(response, parse_mode="HTML")


@router.message(Command("list_admins"))
async def cmd_list_admins(message: Message):
    """Показывает список администраторов."""
    if not await is_admin(message.from_user.id):
        await message.reply("Только администраторы могут просматривать список администраторов.")
        return

    settings = load_settings()

    if not settings.admin_ids:
        await message.answer("Список администраторов пуст.")
        return

    response = "<b>👥 Список администраторов:</b>\n\n"

    for idx, admin_id in enumerate(settings.admin_ids, 1):
        response += f"{idx}. User ID: <code>{admin_id}</code>\n"

    response += f"\n<b>Всего администраторов:</b> {len(settings.admin_ids)}\n\n"
    response += "Для добавления администратора используйте:\n/add_admin <user_id>\n\n"
    response += "Для удаления администратора используйте:\n/remove_admin <user_id>"

    await message.answer(response, parse_mode="HTML")


@router.message(Command("add_admin"))
async def cmd_add_admin(message: Message):
    """Добавляет нового администратора."""
    if not await is_admin(message.from_user.id):
        await message.reply("Только администраторы могут добавлять других администраторов.")
        return

    # Формат: /add_admin 123456789
    args = message.text.split()[1:] if message.text else []

    if not args or not args[0].isdigit():
        await message.answer(
            "Использование: /add_admin <user_id>\n\n"
            "Пример: /add_admin 123456789\n\n"
            "Чтобы узнать User ID человека, попросите его написать боту команду /start, "
            "и проверьте логи или базу данных."
        )
        return

    new_admin_id = int(args[0])
    settings = load_settings()

    if new_admin_id in settings.admin_ids:
        await message.answer(f"Пользователь {new_admin_id} уже является администратором.")
        return

    # Читаем текущий .env файл
    import os
    env_path = os.path.join(os.getcwd(), ".env")

    try:
        with open(env_path, "r") as f:
            env_lines = f.readlines()

        # Обновляем ADMIN_IDS
        new_admin_ids = settings.admin_ids + [new_admin_id]
        new_admin_ids_str = ",".join(map(str, new_admin_ids))

        updated_lines = []
        admin_ids_updated = False

        for line in env_lines:
            if line.startswith("ADMIN_IDS="):
                updated_lines.append(f"ADMIN_IDS={new_admin_ids_str}\n")
                admin_ids_updated = True
            else:
                updated_lines.append(line)

        # Если ADMIN_IDS не был найден, добавляем
        if not admin_ids_updated:
            updated_lines.append(f"ADMIN_IDS={new_admin_ids_str}\n")

        # Записываем обратно
        with open(env_path, "w") as f:
            f.writelines(updated_lines)

        await message.answer(
            f"✅ Администратор добавлен!\n\n"
            f"User ID: <code>{new_admin_id}</code>\n\n"
            f"⚠️ <b>Важно:</b> Для применения изменений необходимо перезапустить бота.\n"
            f"Администратор получит доступ ко всем командам после перезапуска.",
            parse_mode="HTML"
        )

        logger.info(f"Администратор {message.from_user.id} добавил нового администратора {new_admin_id}")

    except Exception as e:
        logger.error(f"Ошибка при добавлении администратора: {e}")
        await message.answer(f"❌ Ошибка при добавлении администратора: {e}")


@router.message(Command("remove_admin"))
async def cmd_remove_admin(message: Message):
    """Удаляет администратора."""
    if not await is_admin(message.from_user.id):
        await message.reply("Только администраторы могут удалять других администраторов.")
        return

    # Формат: /remove_admin 123456789
    args = message.text.split()[1:] if message.text else []

    if not args or not args[0].isdigit():
        await message.answer("Использование: /remove_admin <user_id>\n\nПример: /remove_admin 123456789")
        return

    remove_admin_id = int(args[0])
    settings = load_settings()

    if remove_admin_id not in settings.admin_ids:
        await message.answer(f"Пользователь {remove_admin_id} не является администратором.")
        return

    if remove_admin_id == message.from_user.id:
        await message.answer("❌ Вы не можете удалить сами себя из администраторов.")
        return

    if len(settings.admin_ids) == 1:
        await message.answer("❌ Нельзя удалить последнего администратора.")
        return

    # Читаем текущий .env файл
    import os
    env_path = os.path.join(os.getcwd(), ".env")

    try:
        with open(env_path, "r") as f:
            env_lines = f.readlines()

        # Обновляем ADMIN_IDS
        new_admin_ids = [aid for aid in settings.admin_ids if aid != remove_admin_id]
        new_admin_ids_str = ",".join(map(str, new_admin_ids))

        updated_lines = []

        for line in env_lines:
            if line.startswith("ADMIN_IDS="):
                updated_lines.append(f"ADMIN_IDS={new_admin_ids_str}\n")
            else:
                updated_lines.append(line)

        # Записываем обратно
        with open(env_path, "w") as f:
            f.writelines(updated_lines)

        await message.answer(
            f"✅ Администратор удален!\n\n"
            f"User ID: <code>{remove_admin_id}</code>\n\n"
            f"⚠️ <b>Важно:</b> Для применения изменений необходимо перезапустить бота.",
            parse_mode="HTML"
        )

        logger.info(f"Администратор {message.from_user.id} удалил администратора {remove_admin_id}")

    except Exception as e:
        logger.error(f"Ошибка при удалении администратора: {e}")
        await message.answer(f"❌ Ошибка при удалении администратора: {e}")


@router.message(Command("request_confirmation"))
async def cmd_request_confirmation(message: Message):
    """
    Отправляет запрос подтверждения участия пользователям со старой датой регистрации.
    Использование: /request_confirmation <event_id>
    """
    if not await is_admin(message.from_user.id):
        await message.reply("❌ Только администраторы могут запрашивать подтверждения.")
        return

    # Парсинг аргументов
    args = message.text.split()

    if len(args) < 2 or not args[1].isdigit():
        await message.reply(
            "❌ Неверный формат команды.\n\n"
            "Использование: /request_confirmation <event_id>\n"
            "Пример: /request_confirmation 1"
        )
        return

    event_id = int(args[1])

    async with get_session() as session:
        # Проверяем существование мероприятия
        event_result = await session.execute(
            select(Event).where(Event.id == event_id)
        )
        event = event_result.scalar_one_or_none()

        if not event:
            await message.reply(f"❌ Мероприятие с ID {event_id} не найдено.")
            return

        # Получаем участников со старой датой регистрации, которые еще не подтвердили
        query = (
            select(EventRegistration, User)
            .join(User, EventRegistration.user_id == User.id)
            .where(
                and_(
                    EventRegistration.event_id == event_id,
                    EventRegistration.status == "registered",
                    EventRegistration.registration_version == "old_date",
                    EventRegistration.confirmed == False
                )
            )
        )

        result = await session.execute(query)
        registrations_with_users = result.all()

        if not registrations_with_users:
            await message.reply(
                f"✅ Все участники мероприятия '{event.title}' уже подтвердили участие "
                f"или регистраций со старой датой не найдено."
            )
            return

        # Начинаем рассылку запросов на подтверждение
        from aiogram import Bot
        from ..config import load_settings
        settings = load_settings()
        bot = Bot(token=settings.bot_token)

        status_message = await message.answer(
            f"🚀 Начинаю рассылку запросов на подтверждение...\n"
            f"<b>Мероприятие:</b> {event.title}\n"
            f"<b>Участников для уведомления:</b> {len(registrations_with_users)}",
            parse_mode="HTML"
        )

        success_count = 0
        failed_count = 0
        blocked_count = 0

        for registration, user in registrations_with_users:
            try:
                # Создаем inline кнопки для подтверждения
                keyboard = InlineKeyboardMarkup(inline_keyboard=[
                    [InlineKeyboardButton(
                        text="✅ Подтверждаю участие",
                        callback_data=f"confirm_{event_id}_{user.tg_user_id}"
                    )],
                    [InlineKeyboardButton(
                        text="❌ Не смогу прийти",
                        callback_data=f"decline_{event_id}_{user.tg_user_id}"
                    )]
                ])

                # Формируем сообщение
                confirmation_text = (
                    f"⚠️ <b>ВАЖНОЕ УВЕДОМЛЕНИЕ</b> ⚠️\n\n"
                    f"Дата и/или место проведения мероприятия изменились:\n\n"
                    f"🍳 <b>{event.title}</b>\n\n"
                    f"🏙 <b>Город:</b> {event.city}\n"
                    f"🗓 <b>Новая дата:</b> {event.event_date.strftime('%d.%m.%Y')}\n"
                    f"🕙 <b>Время:</b> {event.event_date.strftime('%H:%M')}\n"
                )

                if event.location:
                    confirmation_text += f"📍 <b>Место:</b> {event.location}\n"

                confirmation_text += (
                    f"\n<b>Пожалуйста, подтвердите ваше участие с новыми условиями:</b>\n"
                    f"• Если вы сможете прийти - нажмите '✅ Подтверждаю'\n"
                    f"• Если не сможете - нажмите '❌ Не смогу прийти'\n\n"
                    f"Ждём вас! 🎉"
                )

                await bot.send_message(
                    chat_id=user.tg_user_id,
                    text=confirmation_text,
                    reply_markup=keyboard,
                    parse_mode="HTML"
                )

                # Обновляем дату запроса подтверждения
                registration.confirmation_requested_at = datetime.utcnow()
                await session.commit()

                success_count += 1
                logger.info(f"Confirmation request sent to user {user.tg_user_id}")

                # Anti-flood защита
                import asyncio
                await asyncio.sleep(0.05)

            except Exception as e:
                error_message = str(e).lower()

                if "blocked" in error_message or "bot was blocked" in error_message:
                    blocked_count += 1
                    logger.warning(f"User {user.tg_user_id} has blocked the bot")
                else:
                    failed_count += 1
                    logger.error(f"Failed to send confirmation request to user {user.tg_user_id}: {e}")

        # Финальный отчет
        report = (
            f"✅ <b>Рассылка запросов завершена!</b>\n\n"
            f"📊 Результаты:\n"
            f"👥 Всего участников: {len(registrations_with_users)}\n"
            f"✅ Успешно отправлено: {success_count}\n"
            f"🚫 Заблокировали бота: {blocked_count}\n"
            f"❌ Ошибки отправки: {failed_count}"
        )

        await status_message.edit_text(report, parse_mode="HTML")
        logger.info(f"Confirmation requests sent: {success_count} success, {blocked_count} blocked, {failed_count} failed")


@router.message(Command("mark_old_registrations"))
async def cmd_mark_old_registrations(message: Message):
    """
    Помечает существующие регистрации как 'old_date' перед изменением даты мероприятия.
    Использование: /mark_old_registrations <event_id>
    """
    if not await is_admin(message.from_user.id):
        await message.reply("❌ Только администраторы могут использовать эту команду.")
        return

    args = message.text.split()

    if len(args) < 2 or not args[1].isdigit():
        await message.reply(
            "❌ Неверный формат команды.\n\n"
            "Использование: /mark_old_registrations <event_id>\n"
            "Пример: /mark_old_registrations 1\n\n"
            "⚠️ Используйте эту команду ПЕРЕД изменением даты мероприятия!"
        )
        return

    event_id = int(args[1])

    async with get_session() as session:
        # Проверяем существование мероприятия
        event_result = await session.execute(
            select(Event).where(Event.id == event_id)
        )
        event = event_result.scalar_one_or_none()

        if not event:
            await message.reply(f"❌ Мероприятие с ID {event_id} не найдено.")
            return

        # Получаем все активные регистрации с версией 'new_date'
        query = select(EventRegistration).where(
            and_(
                EventRegistration.event_id == event_id,
                EventRegistration.status == "registered",
                EventRegistration.registration_version == "new_date"
            )
        )

        result = await session.execute(query)
        registrations = result.scalars().all()

        if not registrations:
            await message.reply(
                f"❌ Для мероприятия '{event.title}' не найдено регистраций с версией 'new_date'."
            )
            return

        # Помечаем все как old_date
        for registration in registrations:
            registration.registration_version = "old_date"
            registration.confirmed = False

        await session.commit()

        await message.reply(
            f"✅ <b>Регистрации помечены!</b>\n\n"
            f"<b>Мероприятие:</b> {event.title}\n"
            f"<b>Помечено регистраций:</b> {len(registrations)}\n"
            f"<b>Новая версия:</b> old_date\n\n"
            f"Теперь можете изменить дату мероприятия и использовать\n"
            f"/request_confirmation {event_id} для запроса подтверждений.",
            parse_mode="HTML"
        )

        logger.info(f"Marked {len(registrations)} registrations as 'old_date' for event {event_id}")


@router.message(Command("confirmation_stats"))
async def cmd_confirmation_stats(message: Message):
    """
    Детальная статистика подтверждений для мероприятия.
    Использование: /confirmation_stats <event_id>
    """
    if not await is_admin(message.from_user.id):
        await message.reply("❌ Только администраторы могут просматривать статистику.")
        return

    args = message.text.split()

    if len(args) < 2 or not args[1].isdigit():
        await message.reply(
            "❌ Неверный формат команды.\n\n"
            "Использование: /confirmation_stats <event_id>\n"
            "Пример: /confirmation_stats 1"
        )
        return

    event_id = int(args[1])

    async with get_session() as session:
        # Проверяем существование мероприятия
        event_result = await session.execute(
            select(Event).where(Event.id == event_id)
        )
        event = event_result.scalar_one_or_none()

        if not event:
            await message.reply(f"❌ Мероприятие с ID {event_id} не найдено.")
            return

        # Получаем все регистрации со старой датой
        query = (
            select(EventRegistration, User)
            .join(User, EventRegistration.user_id == User.id)
            .where(
                and_(
                    EventRegistration.event_id == event_id,
                    EventRegistration.registration_version == "old_date"
                )
            )
            .order_by(EventRegistration.confirmation_requested_at.desc())
        )

        result = await session.execute(query)
        old_registrations = result.all()

        if not old_registrations:
            await message.reply(
                f"ℹ️ Для мероприятия '{event.title}' нет регистраций со старой датой."
            )
            return

        # Подсчет статистики
        total = len(old_registrations)
        confirmed = sum(1 for r, u in old_registrations if r.confirmed and r.status == "registered")
        declined = sum(1 for r, u in old_registrations if r.status == "cancelled")
        pending = sum(1 for r, u in old_registrations if not r.confirmed and r.status == "registered")
        requested = sum(1 for r, u in old_registrations if r.confirmation_requested_at is not None)

        response = (
            f"<b>📊 Статистика подтверждений</b>\n\n"
            f"<b>Мероприятие:</b> {event.title}\n"
            f"<b>Город:</b> {event.city}\n"
            f"<b>Дата:</b> {event.event_date.strftime('%d.%m.%Y в %H:%M')}\n\n"
            f"<b>📈 Итоги:</b>\n"
            f"👥 Всего участников (старая дата): {total}\n"
            f"📧 Отправлено запросов: {requested}\n\n"
            f"✅ Подтвердили: {confirmed}\n"
            f"❌ Отказались: {declined}\n"
            f"⏳ Не ответили: {pending}\n\n"
        )

        if total > 0:
            confirmed_rate = (confirmed / total) * 100
            declined_rate = (declined / total) * 100
            pending_rate = (pending / total) * 100

            response += (
                f"<b>📊 Процентное соотношение:</b>\n"
                f"✅ Подтвердили: {confirmed_rate:.1f}%\n"
                f"❌ Отказались: {declined_rate:.1f}%\n"
                f"⏳ Не ответили: {pending_rate:.1f}%\n\n"
            )

        # Список неответивших участников
        pending_users = [
            (r, u) for r, u in old_registrations
            if not r.confirmed and r.status == "registered"
        ]

        if pending_users:
            response += f"<b>⏳ Не ответили ({len(pending_users)} чел.):</b>\n"
            for idx, (reg, user) in enumerate(pending_users[:10], 1):
                name = f"{user.first_name} {user.last_name}" if user.first_name and user.last_name else user.first_name or "Имя не указано"
                username = f"@{user.username}" if user.username else "нет username"
                phone = user.phone_number or "нет телефона"

                response += f"{idx}. {name} ({username})\n"
                response += f"   📱 {phone}\n"

                if reg.confirmation_requested_at:
                    response += f"   📅 Запрос: {reg.confirmation_requested_at.strftime('%d.%m %H:%M')}\n"

            if len(pending_users) > 10:
                response += f"\n... и ещё {len(pending_users) - 10} участников\n"

        await message.answer(response, parse_mode="HTML")


@router.message(Command("registration_timeline"))
async def cmd_registration_timeline(message: Message):
    """
    Показывает динамику регистраций по датам для мероприятия.
    Использование: /registration_timeline <event_id>
    """
    if not await is_admin(message.from_user.id):
        await message.reply("❌ Только администраторы могут просматривать статистику.")
        return

    args = message.text.split()

    if len(args) < 2 or not args[1].isdigit():
        await message.reply(
            "❌ Неверный формат команды.\n\n"
            "Использование: /registration_timeline <event_id>\n"
            "Пример: /registration_timeline 1"
        )
        return

    event_id = int(args[1])

    async with get_session() as session:
        # Проверяем существование мероприятия
        event_result = await session.execute(
            select(Event).where(Event.id == event_id)
        )
        event = event_result.scalar_one_or_none()

        if not event:
            await message.reply(f"❌ Мероприятие с ID {event_id} не найдено.")
            return

        # Получаем все регистрации
        query = (
            select(EventRegistration)
            .where(EventRegistration.event_id == event_id)
            .order_by(EventRegistration.registered_at)
        )

        result = await session.execute(query)
        registrations = result.scalars().all()

        if not registrations:
            await message.reply(f"ℹ️ На мероприятие '{event.title}' нет регистраций.")
            return

        # Группируем по датам
        from collections import defaultdict
        daily_stats = defaultdict(lambda: {"total": 0, "new_date": 0, "old_date": 0})

        for reg in registrations:
            date_key = reg.registered_at.strftime('%d.%m.%Y')
            daily_stats[date_key]["total"] += 1

            if reg.registration_version == "new_date":
                daily_stats[date_key]["new_date"] += 1
            else:
                daily_stats[date_key]["old_date"] += 1

        # Формируем ответ
        response = (
            f"<b>📅 Динамика регистраций</b>\n\n"
            f"<b>Мероприятие:</b> {event.title}\n"
            f"<b>Всего регистраций:</b> {len(registrations)}\n\n"
        )

        sorted_dates = sorted(daily_stats.keys(), key=lambda x: datetime.strptime(x, '%d.%m.%Y'))

        for date in sorted_dates:
            stats = daily_stats[date]
            response += f"<b>{date}:</b> {stats['total']} рег."

            if stats['old_date'] > 0 and stats['new_date'] > 0:
                response += f" (🆕{stats['new_date']} / 👴{stats['old_date']})"
            elif stats['old_date'] > 0:
                response += f" (👴 старая дата)"
            elif stats['new_date'] > 0:
                response += f" (🆕 новая дата)"

            response += "\n"

        await message.answer(response, parse_mode="HTML")


# =============================================================================
# МОДЕРАЦИЯ ПРОФИЛЕЙ МАТЧИНГА
# =============================================================================

@router.message(Command("moderate_profiles"))
async def cmd_moderate_profiles(message: Message, user_id: int = None):
    """Показать профили на модерации."""
    # Если user_id не передан, берём из message (для прямого вызова команды)
    check_user_id = user_id if user_id is not None else message.from_user.id
    if not await is_admin(check_user_id):
        await message.bot.send_message(message.chat.id, "Только администраторы могут модерировать профили.")
        return

    async with get_session() as session:
        # Получаем профили на модерации
        result = await session.execute(
            select(UserProfile)
            .where(UserProfile.moderation_status == "pending")
            .order_by(UserProfile.created_at.desc())
        )
        profiles = result.scalars().all()

        if not profiles:
            await message.bot.send_message(message.chat.id, "✅ Нет профилей на модерации.")
            return

        await message.bot.send_message(message.chat.id, f"📋 <b>Профилей на модерации: {len(profiles)}</b>\n\nОтправляю...", parse_mode="HTML")

        # Показываем каждый профиль
        for profile in profiles:
            # Получаем информацию о пользователе
            user_result = await session.execute(
                select(User).where(User.id == profile.user_id)
            )
            user = user_result.scalar_one()

            username_display = f"@{user.username}" if user.username else "нет username"

            text = (
                f"👤 <b>Профиль на модерации</b>\n\n"
                f"<b>Пользователь:</b> {user.first_name or ''} {user.last_name or ''}\n"
                f"<b>Username:</b> {username_display}\n"
                f"<b>ID:</b> {user.tg_user_id}\n"
                f"<b>Город:</b> {profile.city}\n\n"
                f"📝 <b>О себе:</b>\n{profile.bio or 'не указано'}\n\n"
                f"💼 <b>Чем занимается:</b>\n{profile.occupation or 'не указано'}\n\n"
                f"🔍 <b>Кого ищет:</b>\n{profile.looking_for or 'не указано'}\n\n"
                f"🤝 <b>Может помочь:</b>\n{profile.can_help_with or 'не указано'}\n\n"
                f"🆘 <b>Нуждается:</b>\n{profile.needs_help_with or 'не указано'}\n\n"
                f"Используйте:\n"
                f"/approve_profile {profile.id} - одобрить\n"
                f"/reject_profile {profile.id} - отклонить"
            )

            keyboard = InlineKeyboardMarkup(inline_keyboard=[
                [
                    InlineKeyboardButton(text="✅ Одобрить", callback_data=f"approve_profile_{profile.id}"),
                    InlineKeyboardButton(text="❌ Отклонить", callback_data=f"reject_profile_{profile.id}")
                ]
            ])

            try:
                if profile.photo_file_id:
                    await message.bot.send_photo(
                        message.chat.id,
                        profile.photo_file_id,
                        caption=text,
                        reply_markup=keyboard,
                        parse_mode="HTML"
                    )
                else:
                    await message.bot.send_message(message.chat.id, text, reply_markup=keyboard, parse_mode="HTML")
            except Exception as e:
                logger.error(f"Ошибка при отправке профиля на модерацию: {e}")


@router.callback_query(F.data.startswith("approve_profile_"))
async def callback_approve_profile(callback: CallbackQuery):
    """Одобрить профиль."""
    if not await is_admin(callback.from_user.id):
        await callback.answer("Только администраторы могут модерировать профили", show_alert=True)
        return

    profile_id = int(callback.data.split("_")[2])

    async with get_session() as session:
        result = await session.execute(
            select(UserProfile).where(UserProfile.id == profile_id)
        )
        profile = result.scalar_one_or_none()

        if not profile:
            await callback.answer("Профиль не найден", show_alert=True)
            return

        if profile.moderation_status == "approved":
            await callback.answer("Профиль уже одобрен", show_alert=True)
            return

        # Одобряем профиль
        profile.moderation_status = "approved"
        await session.commit()

        # Уведомляем пользователя
        user_result = await session.execute(
            select(User).where(User.id == profile.user_id)
        )
        user = user_result.scalar_one()

        try:
            await callback.bot.send_message(
                user.tg_user_id,
                "✅ <b>Ваш профиль одобрен!</b>\n\n"
                "Теперь вы можете начать искать совпадения.\n"
                "Используйте /tinder для начала.",
                parse_mode="HTML"
            )
        except Exception as e:
            logger.error(f"Не удалось уведомить пользователя {user.tg_user_id}: {e}")

        # Обновляем сообщение (caption для фото, text для текста)
        admin_username = callback.from_user.username or callback.from_user.id
        status_text = f"\n\n✅ <b>ОДОБРЕН</b> администратором @{admin_username}"
        try:
            if callback.message.caption:
                await callback.message.edit_caption(
                    caption=f"{callback.message.caption}{status_text}",
                    parse_mode="HTML"
                )
            else:
                await callback.message.edit_text(
                    text=f"{callback.message.text}{status_text}",
                    parse_mode="HTML"
                )
        except Exception as e:
            logger.error(f"Не удалось обновить сообщение: {e}")
        await callback.answer("✅ Профиль одобрен")

        logger.info(f"Профиль {profile_id} одобрен администратором {callback.from_user.id}")


@router.callback_query(F.data.startswith("reject_profile_"))
async def callback_reject_profile(callback: CallbackQuery):
    """Отклонить профиль."""
    if not await is_admin(callback.from_user.id):
        await callback.answer("Только администраторы могут модерировать профили", show_alert=True)
        return

    profile_id = int(callback.data.split("_")[2])

    async with get_session() as session:
        result = await session.execute(
            select(UserProfile).where(UserProfile.id == profile_id)
        )
        profile = result.scalar_one_or_none()

        if not profile:
            await callback.answer("Профиль не найден", show_alert=True)
            return

        if profile.moderation_status == "rejected":
            await callback.answer("Профиль уже отклонён", show_alert=True)
            return

        # Отклоняем профиль
        profile.moderation_status = "rejected"
        await session.commit()

        # Уведомляем пользователя
        user_result = await session.execute(
            select(User).where(User.id == profile.user_id)
        )
        user = user_result.scalar_one()

        try:
            await callback.bot.send_message(
                user.tg_user_id,
                "❌ <b>Ваш профиль был отклонён</b>\n\n"
                "К сожалению, администраторы не одобрили ваш профиль.\n"
                "Возможно, он содержал неподобающий контент.\n\n"
                "Вы можете создать новый профиль через /tinder",
                parse_mode="HTML"
            )
        except Exception as e:
            logger.error(f"Не удалось уведомить пользователя {user.tg_user_id}: {e}")

        # Обновляем сообщение (caption для фото, text для текста)
        admin_username = callback.from_user.username or callback.from_user.id
        status_text = f"\n\n❌ <b>ОТКЛОНЁН</b> администратором @{admin_username}"
        try:
            if callback.message.caption:
                await callback.message.edit_caption(
                    caption=f"{callback.message.caption}{status_text}",
                    parse_mode="HTML"
                )
            else:
                await callback.message.edit_text(
                    text=f"{callback.message.text}{status_text}",
                    parse_mode="HTML"
                )
        except Exception as e:
            logger.error(f"Не удалось обновить сообщение: {e}")
        await callback.answer("❌ Профиль отклонён")

        logger.info(f"Профиль {profile_id} отклонён администратором {callback.from_user.id}")


@router.message(Command("approve_profile"))
async def cmd_approve_profile(message: Message):
    """Одобрить профиль по ID."""
    if not await is_admin(message.from_user.id):
        await message.reply("Только администраторы могут модерировать профили.")
        return

    args = message.text.split()[1:] if message.text else []

    if not args or not args[0].isdigit():
        await message.reply("Использование: /approve_profile <profile_id>")
        return

    profile_id = int(args[0])

    async with get_session() as session:
        result = await session.execute(
            select(UserProfile).where(UserProfile.id == profile_id)
        )
        profile = result.scalar_one_or_none()

        if not profile:
            await message.reply(f"❌ Профиль с ID {profile_id} не найден.")
            return

        if profile.moderation_status == "approved":
            await message.reply("ℹ️ Профиль уже одобрен.")
            return

        # Одобряем профиль
        profile.moderation_status = "approved"
        await session.commit()

        # Уведомляем пользователя
        user_result = await session.execute(
            select(User).where(User.id == profile.user_id)
        )
        user = user_result.scalar_one()

        try:
            await message.bot.send_message(
                user.tg_user_id,
                "✅ <b>Ваш профиль одобрен!</b>\n\n"
                "Теперь вы можете начать искать совпадения.\n"
                "Используйте /tinder для начала.",
                parse_mode="HTML"
            )
        except Exception as e:
            logger.error(f"Не удалось уведомить пользователя {user.tg_user_id}: {e}")

        await message.reply(f"✅ Профиль {profile_id} одобрен. Пользователь уведомлён.")

        logger.info(f"Профиль {profile_id} одобрен администратором {message.from_user.id}")


@router.message(Command("reject_profile"))
async def cmd_reject_profile(message: Message):
    """Отклонить профиль по ID."""
    if not await is_admin(message.from_user.id):
        await message.reply("Только администраторы могут модерировать профили.")
        return

    args = message.text.split()[1:] if message.text else []

    if not args or not args[0].isdigit():
        await message.reply("Использование: /reject_profile <profile_id>")
        return

    profile_id = int(args[0])

    async with get_session() as session:
        result = await session.execute(
            select(UserProfile).where(UserProfile.id == profile_id)
        )
        profile = result.scalar_one_or_none()

        if not profile:
            await message.reply(f"❌ Профиль с ID {profile_id} не найден.")
            return

        if profile.moderation_status == "rejected":
            await message.reply("ℹ️ Профиль уже отклонён.")
            return

        # Отклоняем профиль
        profile.moderation_status = "rejected"
        await session.commit()

        # Уведомляем пользователя
        user_result = await session.execute(
            select(User).where(User.id == profile.user_id)
        )
        user = user_result.scalar_one()

        try:
            await message.bot.send_message(
                user.tg_user_id,
                "❌ <b>Ваш профиль был отклонён</b>\n\n"
                "К сожалению, администраторы не одобрили ваш профиль.\n"
                "Возможно, он содержал неподобающий контент.\n\n"
                "Вы можете создать новый профиль через /tinder",
                parse_mode="HTML"
            )
        except Exception as e:
            logger.error(f"Не удалось уведомить пользователя {user.tg_user_id}: {e}")

        await message.reply(f"❌ Профиль {profile_id} отклонён. Пользователь уведомлён.")

        logger.info(f"Профиль {profile_id} отклонён администратором {message.from_user.id}")


@router.message(Command("matching_stats"))
async def cmd_matching_stats(message: Message):
    """Статистика по системе матчинга."""
    if not await is_admin(message.from_user.id):
        await message.bot.send_message(message.chat.id, "Только администраторы могут просматривать статистику.")
        return

    async with get_session() as session:
        from ..db.models import Match, Swipe

        # Общее количество профилей
        total_profiles_result = await session.execute(
            select(func.count(UserProfile.id))
        )
        total_profiles = total_profiles_result.scalar()

        # Профили на модерации
        pending_profiles_result = await session.execute(
            select(func.count(UserProfile.id)).where(UserProfile.moderation_status == "pending")
        )
        pending_profiles = pending_profiles_result.scalar()

        # Одобренные профили
        approved_profiles_result = await session.execute(
            select(func.count(UserProfile.id)).where(UserProfile.moderation_status == "approved")
        )
        approved_profiles = approved_profiles_result.scalar()

        # Отклонённые профили
        rejected_profiles_result = await session.execute(
            select(func.count(UserProfile.id)).where(UserProfile.moderation_status == "rejected")
        )
        rejected_profiles = rejected_profiles_result.scalar()

        # Видимые профили
        visible_profiles_result = await session.execute(
            select(func.count(UserProfile.id)).where(
                and_(
                    UserProfile.moderation_status == "approved",
                    UserProfile.is_visible == True
                )
            )
        )
        visible_profiles = visible_profiles_result.scalar()

        # Количество матчей
        matches_result = await session.execute(
            select(func.count(Match.id)).where(Match.is_active == True)
        )
        matches_count = matches_result.scalar()

        # Количество свайпов
        swipes_result = await session.execute(
            select(func.count(Swipe.id))
        )
        swipes_count = swipes_result.scalar()

        # Количество лайков
        likes_result = await session.execute(
            select(func.count(Swipe.id)).where(Swipe.action == "like")
        )
        likes_count = likes_result.scalar()

        response = (
            f"💕 <b>Статистика системы матчинга</b>\n\n"
            f"<b>Профили:</b>\n"
            f"  • Всего: {total_profiles}\n"
            f"  • ⏳ На модерации: {pending_profiles}\n"
            f"  • ✅ Одобрено: {approved_profiles}\n"
            f"  • ❌ Отклонено: {rejected_profiles}\n"
            f"  • 👁 Видимых: {visible_profiles}\n\n"
            f"<b>Активность:</b>\n"
            f"  • 💕 Матчей: {matches_count}\n"
            f"  • 👆 Свайпов: {swipes_count}\n"
            f"  • ❤️ Лайков: {likes_count}\n"
        )

        if swipes_count > 0:
            match_rate = (matches_count * 2 / likes_count * 100) if likes_count > 0 else 0
            response += f"  • 📊 Match rate: {match_rate:.1f}%\n"

        response += (
            f"\n<b>Команды:</b>\n"
            f"/moderate_profiles - модерация профилей\n"
            f"/approve_profile <id> - одобрить профиль\n"
            f"/reject_profile <id> - отклонить профиль"
        )

        await message.bot.send_message(message.chat.id, response, parse_mode="HTML")


@router.message(Command("pending_registrations"))
async def cmd_pending_registrations(message: Message):
    """
    Показывает пользователей с незавершённой регистрацией.
    Это те, кто нажал 'Иду' но не ввёл имя/фамилию или телефон.
    """
    if not await is_admin(message.from_user.id):
        await message.reply("Только администраторы могут использовать эту команду.")
        return

    from ..fsm_storage import get_pending_registrations

    pending = get_pending_registrations(db_path="data/bot.db")

    if not pending:
        await message.answer(
            "✅ <b>Нет незавершённых регистраций</b>\n\n"
            "Все пользователи либо завершили регистрацию, либо ещё не начинали.",
            parse_mode="HTML"
        )
        return

    response = f"⏳ <b>Незавершённые регистрации ({len(pending)})</b>\n\n"

    for p in pending[:20]:  # Показываем первые 20
        username = f"@{p['username']}" if p['username'] else "нет"
        name_parts = []
        if p['first_name']:
            name_parts.append(p['first_name'])
        if p['last_name']:
            name_parts.append(p['last_name'])
        name = " ".join(name_parts) if name_parts else "не указано"

        # Определяем этап регистрации
        state = p['state'] or ""
        if "waiting_for_full_name" in state:
            stage = "⏳ Ждём имя и фамилию"
        elif "waiting_for_phone" in state:
            stage = "📱 Ждём телефон"
        else:
            stage = f"🔄 {state.split(':')[-1] if ':' in state else state}"

        # Данные из FSM
        data = p.get('data', {})
        event_id = data.get('event_id', '?')

        response += (
            f"👤 <b>TG ID:</b> {p['tg_user_id']}\n"
            f"   {username} | {name}\n"
            f"   {stage}\n"
            f"   Мероприятие ID: {event_id}\n"
            f"   Обновлено: {p['updated_at']}\n\n"
        )

    if len(pending) > 20:
        response += f"\n... и ещё {len(pending) - 20}"

    await message.answer(response, parse_mode="HTML")


# ============================================
# Profile Completion PRO Award (Test Command)
# ============================================

@router.message(Command("award_pro"))
async def cmd_award_pro(message: Message):
    """Проверить и начислить PRO за заполнение профиля (для тестирования)."""
    if not await is_admin(message.from_user.id):
        await message.reply("Только администраторы могут использовать эту команду.")
        return

    from supabase import create_client
    import os
    from datetime import datetime, timedelta

    SUPABASE_URL = os.getenv("SUPABASE_URL", "https://ndpkxustvcijykzxqxrn.supabase.co")
    SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_KEY") or os.getenv("SUPABASE_ANON_KEY", "")

    if not SUPABASE_KEY:
        await message.answer("❌ Supabase не настроен")
        return

    supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
    user_id = message.from_user.id

    # Получаем пользователя
    user_resp = supabase.table("bot_users").select("*").eq("tg_user_id", user_id).execute()
    if not user_resp.data:
        await message.answer("❌ Пользователь не найден в базе")
        return

    user = user_resp.data[0]
    db_user_id = user['id']

    # Проверяем не получал ли уже награду
    if user.get('profile_completion_pro_awarded_at'):
        await message.answer(
            f"ℹ️ Вы уже получили эту награду\n"
            f"📅 Дата: {user['profile_completion_pro_awarded_at']}"
        )
        return

    # Проверяем профиль
    profile_resp = supabase.table("bot_profiles").select("bio, occupation").eq("user_id", db_user_id).execute()
    if not profile_resp.data:
        await message.answer("❌ Профиль не найден. Откройте Mini App и заполните профиль.")
        return

    p = profile_resp.data[0]
    bio = p.get('bio') or ''
    occupation = p.get('occupation') or ''

    # Проверяем фото
    photos_resp = supabase.table("profile_photos").select("id", count="exact").eq("user_id", db_user_id).execute()
    photo_count = photos_resp.count or 0

    # Формируем статус
    status = []
    if bio.strip():
        status.append("✅ Bio заполнено")
    else:
        status.append("❌ Bio пустое")

    if occupation.strip():
        status.append("✅ Род занятий заполнен")
    else:
        status.append("❌ Род занятий пустой")

    if photo_count > 0:
        status.append(f"✅ Фото загружено: {photo_count}")
    else:
        status.append("❌ Фото не загружено (нужно через + в профиле)")

    # Проверяем все условия
    is_complete = bool(bio.strip() and occupation.strip() and photo_count > 0)

    # Промо период (продлён до 31 января)
    PROMO_DEADLINE = datetime(2026, 1, 31, 23, 59, 59)
    now = datetime.utcnow()
    is_promo = now <= PROMO_DEADLINE
    pro_days = 7 if is_promo else 3
    xp_reward = 500 if is_promo else 100

    response = (
        f"📋 <b>Статус профиля:</b>\n\n"
        + "\n".join(status) +
        f"\n\n📊 <b>Промо:</b> {'✅ Активно' if is_promo else '❌ Закончилось'}\n"
        f"🎁 <b>Награда:</b> {pro_days} дней PRO + {xp_reward} XP\n\n"
    )

    if is_complete:
        # Начисляем PRO
        if user.get('subscription_tier') == 'pro' and user.get('subscription_expires_at'):
            expires_str = user['subscription_expires_at']
            current_expires = datetime.fromisoformat(expires_str.replace('Z', '+00:00'))
            if current_expires > now:
                expires_at = current_expires + timedelta(days=pro_days)
            else:
                expires_at = now + timedelta(days=pro_days)
        else:
            expires_at = now + timedelta(days=pro_days)

        # Обновляем пользователя
        new_points = (user.get('points') or 0) + xp_reward
        supabase.table("bot_users").update({
            "subscription_tier": "pro",
            "subscription_expires_at": expires_at.isoformat(),
            "profile_completion_pro_awarded_at": now.isoformat(),
            "points": new_points
        }).eq("id", db_user_id).execute()

        response += (
            f"🎉 <b>Награда начислена!</b>\n\n"
            f"⭐ PRO до: {expires_at.strftime('%d.%m.%Y %H:%M')}\n"
            f"✨ XP: {user.get('points', 0)} → {new_points}\n\n"
            f"Откройте Mini App чтобы увидеть изменения."
        )
    else:
        response += "⚠️ <b>Профиль не заполнен полностью</b>\n\nЗаполните все поля и загрузите фото."

    await message.answer(response, parse_mode="HTML")
