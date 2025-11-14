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

from ..db.models import Event, EventRegistration, SecurityLog, User
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

    await state.set_state(CreateEventStates.title)
    await message.answer(
        "Создание нового мероприятия.\n\n"
        "Шаг 1/9: Введите название мероприятия:"
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
                created_by=message.from_user.id,
            )
            session.add(event)
            await session.commit()
            await session.refresh(event)

            await message.answer(
                f"✅ Мероприятие создано!\n\n"
                f"<b>{event.title}</b>\n"
                f"ID: {event.id}\n"
                f"Дата: {event.event_date.strftime('%d.%m.%Y в %H:%M')}\n\n"
                f"Теперь пользователи смогут зарегистрироваться через /start",
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
            response += f"<b>ID {event.id}:</b> {event.title}\n"
            response += f"Город: {event.city}\n"
            response += f"Статус: {status}\n"
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
            response += "\n\n"

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

            response = f"<b>📊 Статистика мероприятия:</b>\n\n"
            response += f"<b>{event.title}</b>\n"
            response += f"🏙 Город: {event.city}\n"
            response += f"📅 Дата: {event.event_date.strftime('%d.%m.%Y в %H:%M')}\n\n"
            response += f"✅ Зарегистрировано: {len(registered_list)}\n"
            response += f"❌ Отменено: {cancelled_count}\n"
            response += f"📋 Всего регистраций: {len(registrations_with_users)}\n\n"

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
            # Общая статистика
            result = await session.execute(select(Event))
            events = result.scalars().all()

            total_events = len(events)
            active_events = sum(1 for e in events if e.is_active)

            result = await session.execute(select(EventRegistration))
            registrations = result.scalars().all()

            total_registrations = len(registrations)
            active_registrations = sum(1 for r in registrations if r.status == "registered")

            response = "<b>Общая статистика:</b>\n\n"
            response += f"Всего мероприятий: {total_events}\n"
            response += f"Активных: {active_events}\n\n"
            response += f"Всего регистраций: {total_registrations}\n"
            response += f"Активных: {active_registrations}\n\n"
            response += "Используйте /event_stats &lt;ID&gt; для статистики конкретного мероприятия."

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

        # Получаем регистрации с данными пользователей
        result = await session.execute(
            select(EventRegistration, User)
            .join(User, EventRegistration.user_id == User.id)
            .where(
                and_(
                    EventRegistration.event_id == event_id,
                    EventRegistration.status == "registered"
                )
            )
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
        csv_content = "№,Имя,Фамилия,Username,Телефон,Дата регистрации\n"

        for idx, (reg, user) in enumerate(registrations_with_users, 1):
            # Для сообщения
            leads_message += f"<b>{idx}.</b> "

            first_name = user.first_name or "—"
            last_name = user.last_name or "—"
            username = f"@{user.username}" if user.username else "—"
            phone = user.phone_number or "—"

            leads_message += f"{first_name} {last_name}"
            if user.username:
                leads_message += f" ({username})"
            leads_message += f"\n📱 {phone}"
            leads_message += f"\n📅 {reg.registered_at.strftime('%d.%m.%Y %H:%M')}\n\n"

            # Для CSV
            csv_content += f'{idx},"{first_name}","{last_name}","{username}","{phone}","{reg.registered_at.strftime("%d.%m.%Y %H:%M")}"\n'

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
