"""
Handler для системы матчинга "Main Tinder"
Позволяет пользователям создавать профили и находить совпадения (матчи).
"""

from __future__ import annotations

from datetime import datetime
from typing import Optional

from aiogram import Router, F, Bot
from aiogram.filters import Command
from aiogram.types import Message, CallbackQuery, InlineKeyboardMarkup, InlineKeyboardButton, ReplyKeyboardRemove
from aiogram.fsm.context import FSMContext
from aiogram.fsm.state import State, StatesGroup
from loguru import logger
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, or_, func, not_

from ..db.models import User, UserProfile, Match, Swipe, EventRegistration
from ..config import load_settings

router = Router()

# Глобальная сессия
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


# FSM States для создания профиля
class ProfileCreationStates(StatesGroup):
    waiting_for_bio = State()
    waiting_for_occupation = State()
    waiting_for_looking_for = State()
    waiting_for_can_help = State()
    waiting_for_needs_help = State()
    waiting_for_photo = State()
    waiting_for_city = State()


# FSM для свайпа
class SwipeStates(StatesGroup):
    swiping = State()


async def get_or_create_user(
    session: AsyncSession,
    tg_user_id: int,
    username: str | None,
    first_name: str | None,
    last_name: str | None,
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
        )
        session.add(user)
        await session.commit()
        await session.refresh(user)
        logger.info(f"Создан новый пользователь: {tg_user_id} (@{username})")

    return user


async def get_user_profile(session: AsyncSession, user_id: int) -> Optional[UserProfile]:
    """Получает профиль пользователя."""
    result = await session.execute(
        select(UserProfile).where(UserProfile.user_id == user_id)
    )
    return result.scalar_one_or_none()


async def notify_admins_about_new_profile(bot: Bot, user: User, profile: UserProfile):
    """Отправляет уведомление администраторам о новом профиле на модерацию."""
    settings = load_settings()

    username_display = f"@{user.username}" if user.username else "нет username"

    text = (
        f"🔔 <b>НОВЫЙ ПРОФИЛЬ НА МОДЕРАЦИЮ</b>\n\n"
        f"👤 <b>Пользователь:</b> {user.first_name or ''} {user.last_name or ''}\n"
        f"  • Username: {username_display}\n"
        f"  • ID: {user.tg_user_id}\n\n"
        f"📝 <b>О себе:</b> {profile.bio or 'не указано'}\n"
        f"💼 <b>Чем занимается:</b> {profile.occupation or 'не указано'}\n"
        f"🔍 <b>Кого ищет:</b> {profile.looking_for or 'не указано'}\n"
        f"🤝 <b>Может помочь:</b> {profile.can_help_with or 'не указано'}\n"
        f"🆘 <b>Нуждается в помощи:</b> {profile.needs_help_with or 'не указано'}\n"
        f"🏙 <b>Город:</b> {profile.city}\n\n"
        f"Используйте /admin для модерации профилей"
    )

    # Отправляем фото, если есть
    for admin_id in settings.admin_ids:
        try:
            if profile.photo_file_id:
                await bot.send_photo(
                    chat_id=admin_id,
                    photo=profile.photo_file_id,
                    caption=text,
                    parse_mode="HTML"
                )
            else:
                await bot.send_message(
                    chat_id=admin_id,
                    text=text,
                    parse_mode="HTML"
                )
        except Exception as e:
            logger.error(f"Не удалось отправить уведомление админу {admin_id}: {e}")


async def notify_match(bot: Bot, user1: User, user2: User, profile1: UserProfile, profile2: UserProfile):
    """Уведомляет обоих пользователей о новом матче."""

    # Уведомление для user1
    username1_display = f"@{user1.username}" if user1.username else "Username не указан"
    username2_display = f"@{user2.username}" if user2.username else "Username не указан"

    text_for_user1 = (
        f"💕 <b>У ВАС НОВЫЙ МАТЧ!</b>\n\n"
        f"👤 <b>Имя:</b> {user2.first_name or ''} {user2.last_name or ''}\n"
        f"💼 <b>Чем занимается:</b> {profile2.occupation or 'не указано'}\n"
        f"🔍 <b>Ищет:</b> {profile2.looking_for or 'не указано'}\n"
        f"🤝 <b>Может помочь:</b> {profile2.can_help_with or 'не указано'}\n"
        f"🆘 <b>Нуждается:</b> {profile2.needs_help_with or 'не указано'}\n"
        f"🏙 <b>Город:</b> {profile2.city}\n\n"
        f"📞 <b>Контакты:</b> {username2_display}\n"
        f"{f'📱 Телефон: {user2.phone_number}' if user2.phone_number else ''}\n\n"
        f"Можете написать и познакомиться! 🎉"
    )

    text_for_user2 = (
        f"💕 <b>У ВАС НОВЫЙ МАТЧ!</b>\n\n"
        f"👤 <b>Имя:</b> {user1.first_name or ''} {user1.last_name or ''}\n"
        f"💼 <b>Чем занимается:</b> {profile1.occupation or 'не указано'}\n"
        f"🔍 <b>Ищет:</b> {profile1.looking_for or 'не указано'}\n"
        f"🤝 <b>Может помочь:</b> {profile1.can_help_with or 'не указано'}\n"
        f"🆘 <b>Нуждается:</b> {profile1.needs_help_with or 'не указано'}\n"
        f"🏙 <b>Город:</b> {profile1.city}\n\n"
        f"📞 <b>Контакты:</b> {username1_display}\n"
        f"{f'📱 Телефон: {user1.phone_number}' if user1.phone_number else ''}\n\n"
        f"Можете написать и познакомиться! 🎉"
    )

    try:
        if profile2.photo_file_id:
            await bot.send_photo(user1.tg_user_id, profile2.photo_file_id, caption=text_for_user1, parse_mode="HTML")
        else:
            await bot.send_message(user1.tg_user_id, text_for_user1, parse_mode="HTML")

        if profile1.photo_file_id:
            await bot.send_photo(user2.tg_user_id, profile1.photo_file_id, caption=text_for_user2, parse_mode="HTML")
        else:
            await bot.send_message(user2.tg_user_id, text_for_user2, parse_mode="HTML")
    except Exception as e:
        logger.error(f"Ошибка при отправке уведомления о матче: {e}")


# =============================================================================
# КОМАНДЫ
# =============================================================================

@router.message(Command("tinder"))
async def cmd_tinder(message: Message, state: FSMContext):
    """Главное меню матчинга."""
    await state.clear()

    async with get_session() as session:
        user = await get_or_create_user(
            session,
            message.from_user.id,
            message.from_user.username,
            message.from_user.first_name,
            message.from_user.last_name,
        )

        profile = await get_user_profile(session, user.id)

        if not profile:
            # Профиля нет - предлагаем создать
            keyboard = InlineKeyboardMarkup(inline_keyboard=[
                [InlineKeyboardButton(text="✏️ Создать профиль", callback_data="create_profile")],
                [InlineKeyboardButton(text="❓ О системе матчинга", callback_data="about_matching")],
            ])

            text = (
                "💕 <b>Main Tinder - система знакомств</b>\n\n"
                "Здесь вы можете найти единомышленников, партнёров для проектов, "
                "менторов или людей с общими интересами из нашего сообщества!\n\n"
                "Для начала нужно создать профиль."
            )

            await message.answer(text, reply_markup=keyboard, parse_mode="HTML")

        elif profile.moderation_status == "pending":
            # Профиль на модерации
            text = (
                "⏳ <b>Ваш профиль на модерации</b>\n\n"
                "Администраторы проверят ваш профиль в ближайшее время. "
                "После одобрения вы сможете начать искать совпадения!"
            )
            await message.answer(text, parse_mode="HTML")

        elif profile.moderation_status == "rejected":
            # Профиль отклонён
            keyboard = InlineKeyboardMarkup(inline_keyboard=[
                [InlineKeyboardButton(text="✏️ Пересоздать профиль", callback_data="create_profile")],
            ])

            text = (
                "❌ <b>Ваш профиль был отклонён</b>\n\n"
                "К сожалению, администраторы не одобрили ваш профиль. "
                "Возможно, он содержал неподобающий контент.\n\n"
                "Вы можете создать новый профиль."
            )
            await message.answer(text, reply_markup=keyboard, parse_mode="HTML")

        else:
            # Профиль одобрен - показываем меню
            keyboard = InlineKeyboardMarkup(inline_keyboard=[
                [InlineKeyboardButton(text="🔥 Начать свайпить", callback_data="start_swiping")],
                [InlineKeyboardButton(text="👤 Мой профиль", callback_data="my_profile")],
                [InlineKeyboardButton(text="💕 Мои матчи", callback_data="my_matches")],
                [InlineKeyboardButton(text="⚙️ Настройки", callback_data="matching_settings")],
            ])

            text = "💕 <b>Main Tinder</b>\n\nВыберите действие:"
            await message.answer(text, reply_markup=keyboard, parse_mode="HTML")


@router.message(Command("my_profile"))
async def cmd_my_profile(message: Message):
    """Показать свой профиль."""
    async with get_session() as session:
        user = await get_or_create_user(
            session,
            message.from_user.id,
            message.from_user.username,
            message.from_user.first_name,
            message.from_user.last_name,
        )

        profile = await get_user_profile(session, user.id)

        if not profile:
            await message.answer("У вас ещё нет профиля. Используйте /tinder для создания.")
            return

        await show_user_profile(message, user, profile)


@router.message(Command("my_matches"))
async def cmd_my_matches(message: Message):
    """Показать список матчей."""
    async with get_session() as session:
        user = await get_or_create_user(
            session,
            message.from_user.id,
            message.from_user.username,
            message.from_user.first_name,
            message.from_user.last_name,
        )

        await show_matches_list(message, session, user)


# =============================================================================
# CALLBACK HANDLERS
# =============================================================================

@router.callback_query(F.data == "about_matching")
async def callback_about_matching(callback: CallbackQuery):
    """Информация о системе матчинга."""
    text = (
        "💕 <b>О системе Main Tinder</b>\n\n"
        "Это система знакомств внутри нашего сообщества. Вы можете:\n\n"
        "✅ Найти единомышленников\n"
        "✅ Познакомиться с участниками мероприятий\n"
        "✅ Найти партнёров для проектов\n"
        "✅ Получить или предложить помощь\n\n"
        "<b>Как это работает?</b>\n"
        "1. Создаёте профиль с информацией о себе\n"
        "2. Администраторы проверяют профиль (премодерация)\n"
        "3. После одобрения можете просматривать других участников\n"
        "4. Ставите лайк или скип\n"
        "5. При взаимном лайке — матч! 💕\n"
        "6. Получаете контакты для общения\n\n"
        "Алгоритм приоритизирует людей из вашего города "
        "и участников тех же мероприятий."
    )

    keyboard = InlineKeyboardMarkup(inline_keyboard=[
        [InlineKeyboardButton(text="✏️ Создать профиль", callback_data="create_profile")],
        [InlineKeyboardButton(text="◀️ Назад", callback_data="back_to_main")],
    ])

    await callback.message.edit_text(text, reply_markup=keyboard, parse_mode="HTML")
    await callback.answer()


@router.callback_query(F.data == "create_profile")
async def callback_create_profile(callback: CallbackQuery, state: FSMContext):
    """Начать создание профиля."""
    await state.set_state(ProfileCreationStates.waiting_for_bio)

    text = (
        "✏️ <b>Создание профиля - Шаг 1/6</b>\n\n"
        "Расскажите немного о себе (2-3 предложения):\n"
        "Кто вы, чем интересуетесь, что вас вдохновляет?\n\n"
        "<i>Это первое, что увидят другие участники.</i>"
    )

    await callback.message.edit_text(text, parse_mode="HTML")
    await callback.answer()


@router.callback_query(F.data == "my_profile")
async def callback_my_profile(callback: CallbackQuery):
    """Показать профиль пользователя."""
    async with get_session() as session:
        user = await get_or_create_user(
            session,
            callback.from_user.id,
            callback.from_user.username,
            callback.from_user.first_name,
            callback.from_user.last_name,
        )

        profile = await get_user_profile(session, user.id)

        if not profile:
            await callback.answer("У вас ещё нет профиля", show_alert=True)
            return

        await show_user_profile(callback.message, user, profile, edit=True)

    await callback.answer()


@router.callback_query(F.data == "my_matches")
async def callback_my_matches(callback: CallbackQuery):
    """Показать список матчей."""
    async with get_session() as session:
        user = await get_or_create_user(
            session,
            callback.from_user.id,
            callback.from_user.username,
            callback.from_user.first_name,
            callback.from_user.last_name,
        )

        await show_matches_list(callback.message, session, user, edit=True)

    await callback.answer()


@router.callback_query(F.data == "start_swiping")
async def callback_start_swiping(callback: CallbackQuery, state: FSMContext):
    """Начать свайпинг."""
    async with get_session() as session:
        user = await get_or_create_user(
            session,
            callback.from_user.id,
            callback.from_user.username,
            callback.from_user.first_name,
            callback.from_user.last_name,
        )

        profile = await get_user_profile(session, user.id)

        if not profile or profile.moderation_status != "approved":
            await callback.answer("Ваш профиль ещё не одобрен", show_alert=True)
            return

        await state.set_state(SwipeStates.swiping)
        await state.update_data(user_id=user.id, profile_city=profile.city)
        await show_next_profile(callback.message, state, session, user, edit=True)

    await callback.answer()


@router.callback_query(F.data.startswith("swipe_"))
async def callback_swipe(callback: CallbackQuery, state: FSMContext):
    """Обработка свайпа (like/skip)."""
    action = callback.data.split("_")[1]  # like или skip
    target_user_id = int(callback.data.split("_")[2])

    async with get_session() as session:
        user = await get_or_create_user(
            session,
            callback.from_user.id,
            callback.from_user.username,
            callback.from_user.first_name,
            callback.from_user.last_name,
        )

        # Записываем свайп
        swipe = Swipe(
            swiper_id=user.id,
            swiped_id=target_user_id,
            action=action
        )
        session.add(swipe)
        await session.commit()

        # Если лайк - проверяем взаимность
        if action == "like":
            # Проверяем, лайкнул ли нас этот пользователь
            result = await session.execute(
                select(Swipe).where(
                    and_(
                        Swipe.swiper_id == target_user_id,
                        Swipe.swiped_id == user.id,
                        Swipe.action == "like"
                    )
                )
            )
            mutual_like = result.scalar_one_or_none()

            if mutual_like:
                # Взаимный лайк! Создаём матч
                match = Match(
                    user1_id=min(user.id, target_user_id),
                    user2_id=max(user.id, target_user_id)
                )
                session.add(match)
                await session.commit()

                # Уведомляем обоих
                target_user_result = await session.execute(
                    select(User).where(User.id == target_user_id)
                )
                target_user = target_user_result.scalar_one()

                profile1 = await get_user_profile(session, user.id)
                profile2 = await get_user_profile(session, target_user_id)

                await notify_match(callback.bot, user, target_user, profile1, profile2)

                await callback.answer("💕 Это матч!", show_alert=True)

        # Показываем следующий профиль
        await show_next_profile(callback.message, state, session, user, edit=True)

    await callback.answer()


@router.callback_query(F.data.startswith("view_profile_"))
async def callback_view_profile(callback: CallbackQuery):
    """Просмотр подробной информации о профиле."""
    target_user_id = int(callback.data.split("_")[2])

    async with get_session() as session:
        profile = await get_user_profile(session, target_user_id)

        if not profile:
            await callback.answer("Профиль не найден", show_alert=True)
            return

        user_result = await session.execute(
            select(User).where(User.id == target_user_id)
        )
        target_user = user_result.scalar_one()

        text = (
            f"👤 <b>{target_user.first_name or ''} {target_user.last_name or ''}</b>\n"
            f"🏙 {profile.city}\n\n"
            f"📝 <b>О себе:</b>\n{profile.bio or 'не указано'}\n\n"
            f"💼 <b>Чем занимается:</b>\n{profile.occupation or 'не указано'}\n\n"
            f"🔍 <b>Кого ищет:</b>\n{profile.looking_for or 'не указано'}\n\n"
            f"🤝 <b>Может помочь:</b>\n{profile.can_help_with or 'не указано'}\n\n"
            f"🆘 <b>Нуждается в помощи:</b>\n{profile.needs_help_with or 'не указано'}"
        )

        keyboard = InlineKeyboardMarkup(inline_keyboard=[
            [
                InlineKeyboardButton(text="❤️ Лайк", callback_data=f"swipe_like_{target_user_id}"),
                InlineKeyboardButton(text="👎 Скип", callback_data=f"swipe_skip_{target_user_id}")
            ],
            [InlineKeyboardButton(text="◀️ Назад к свайпингу", callback_data="start_swiping")]
        ])

        if profile.photo_file_id:
            await callback.message.delete()
            await callback.bot.send_photo(
                callback.from_user.id,
                profile.photo_file_id,
                caption=text,
                reply_markup=keyboard,
                parse_mode="HTML"
            )
        else:
            await callback.message.edit_text(text, reply_markup=keyboard, parse_mode="HTML")

    await callback.answer()


@router.callback_query(F.data == "matching_settings")
async def callback_matching_settings(callback: CallbackQuery):
    """Настройки матчинга."""
    async with get_session() as session:
        user = await get_or_create_user(
            session,
            callback.from_user.id,
            callback.from_user.username,
            callback.from_user.first_name,
            callback.from_user.last_name,
        )

        profile = await get_user_profile(session, user.id)

        if not profile:
            await callback.answer("У вас нет профиля", show_alert=True)
            return

        visibility_text = "🟢 Видим" if profile.is_visible else "🔴 Скрыт"

        keyboard = InlineKeyboardMarkup(inline_keyboard=[
            [InlineKeyboardButton(
                text=f"{'🔴 Скрыть' if profile.is_visible else '🟢 Показать'} профиль",
                callback_data="toggle_visibility"
            )],
            [InlineKeyboardButton(text="✏️ Редактировать профиль", callback_data="edit_profile")],
            [InlineKeyboardButton(text="◀️ Назад", callback_data="back_to_main")],
        ])

        text = (
            f"⚙️ <b>Настройки</b>\n\n"
            f"<b>Видимость профиля:</b> {visibility_text}\n"
            f"<i>Скрытые профили не показываются другим пользователям</i>\n\n"
            f"<b>Ваш город:</b> {profile.city}"
        )

        await callback.message.edit_text(text, reply_markup=keyboard, parse_mode="HTML")

    await callback.answer()


@router.callback_query(F.data == "toggle_visibility")
async def callback_toggle_visibility(callback: CallbackQuery):
    """Переключить видимость профиля."""
    async with get_session() as session:
        user = await get_or_create_user(
            session,
            callback.from_user.id,
            callback.from_user.username,
            callback.from_user.first_name,
            callback.from_user.last_name,
        )

        profile = await get_user_profile(session, user.id)
        profile.is_visible = not profile.is_visible
        await session.commit()

        await callback_matching_settings(callback)
        await callback.answer(
            f"Профиль {'виден' if profile.is_visible else 'скрыт'}",
            show_alert=False
        )


@router.callback_query(F.data == "edit_profile")
async def callback_edit_profile(callback: CallbackQuery, state: FSMContext):
    """Редактировать профиль."""
    await callback.answer("Функция редактирования в разработке. Пока можно создать новый профиль через /tinder", show_alert=True)


@router.callback_query(F.data == "back_to_main")
async def callback_back_to_main(callback: CallbackQuery):
    """Вернуться в главное меню."""
    keyboard = InlineKeyboardMarkup(inline_keyboard=[
        [InlineKeyboardButton(text="🔥 Начать свайпить", callback_data="start_swiping")],
        [InlineKeyboardButton(text="👤 Мой профиль", callback_data="my_profile")],
        [InlineKeyboardButton(text="💕 Мои матчи", callback_data="my_matches")],
        [InlineKeyboardButton(text="⚙️ Настройки", callback_data="matching_settings")],
    ])

    text = "💕 <b>Main Tinder</b>\n\nВыберите действие:"
    await callback.message.edit_text(text, reply_markup=keyboard, parse_mode="HTML")
    await callback.answer()


# =============================================================================
# FSM HANDLERS - СОЗДАНИЕ ПРОФИЛЯ
# =============================================================================

@router.message(ProfileCreationStates.waiting_for_bio)
async def process_bio(message: Message, state: FSMContext):
    """Обработка био."""
    if len(message.text) > 512:
        await message.answer("❌ Слишком длинный текст. Максимум 512 символов. Попробуйте короче:")
        return

    await state.update_data(bio=message.text)
    await state.set_state(ProfileCreationStates.waiting_for_occupation)

    text = (
        "✏️ <b>Создание профиля - Шаг 2/6</b>\n\n"
        "Чем вы занимаетесь?\n"
        "Например: разработчик, дизайнер, предприниматель, студент..."
    )

    await message.answer(text, parse_mode="HTML")


@router.message(ProfileCreationStates.waiting_for_occupation)
async def process_occupation(message: Message, state: FSMContext):
    """Обработка занятия."""
    if len(message.text) > 256:
        await message.answer("❌ Слишком длинный текст. Максимум 256 символов.")
        return

    await state.update_data(occupation=message.text)
    await state.set_state(ProfileCreationStates.waiting_for_looking_for)

    text = (
        "✏️ <b>Создание профиля - Шаг 3/6</b>\n\n"
        "Кого вы ищете?\n"
        "Например: единомышленников, партнёров для проекта, ментора..."
    )

    await message.answer(text, parse_mode="HTML")


@router.message(ProfileCreationStates.waiting_for_looking_for)
async def process_looking_for(message: Message, state: FSMContext):
    """Обработка 'кого ищет'."""
    if len(message.text) > 512:
        await message.answer("❌ Слишком длинный текст. Максимум 512 символов.")
        return

    await state.update_data(looking_for=message.text)
    await state.set_state(ProfileCreationStates.waiting_for_can_help)

    text = (
        "✏️ <b>Создание профиля - Шаг 4/6</b>\n\n"
        "Чем вы можете помочь другим?\n"
        "Например: консультация по маркетингу, помощь с кодом, дизайн лого..."
    )

    await message.answer(text, parse_mode="HTML")


@router.message(ProfileCreationStates.waiting_for_can_help)
async def process_can_help(message: Message, state: FSMContext):
    """Обработка 'чем может помочь'."""
    if len(message.text) > 512:
        await message.answer("❌ Слишком длинный текст. Максимум 512 символов.")
        return

    await state.update_data(can_help_with=message.text)
    await state.set_state(ProfileCreationStates.waiting_for_needs_help)

    text = (
        "✏️ <b>Создание профиля - Шаг 5/6</b>\n\n"
        "В чём вы нуждаетесь? Какая помощь вам нужна?\n"
        "Например: нужен дизайнер для MVP, ищу ментора по продажам..."
    )

    await message.answer(text, parse_mode="HTML")


@router.message(ProfileCreationStates.waiting_for_needs_help)
async def process_needs_help(message: Message, state: FSMContext):
    """Обработка 'в чём нуждается'."""
    if len(message.text) > 512:
        await message.answer("❌ Слишком длинный текст. Максимум 512 символов.")
        return

    await state.update_data(needs_help_with=message.text)
    await state.set_state(ProfileCreationStates.waiting_for_photo)

    text = (
        "✏️ <b>Создание профиля - Шаг 6/7</b>\n\n"
        "Отправьте своё фото (необязательно).\n"
        "Профили с фото получают больше откликов! 📸\n\n"
        "Или напишите /skip чтобы пропустить."
    )

    await message.answer(text, parse_mode="HTML")


@router.message(ProfileCreationStates.waiting_for_photo, F.photo)
async def process_photo(message: Message, state: FSMContext):
    """Обработка фото."""
    photo_file_id = message.photo[-1].file_id
    await state.update_data(photo_file_id=photo_file_id)
    await ask_for_city(message, state)


@router.message(ProfileCreationStates.waiting_for_photo, Command("skip"))
async def skip_photo(message: Message, state: FSMContext):
    """Пропустить фото."""
    await state.update_data(photo_file_id=None)
    await ask_for_city(message, state)


@router.message(ProfileCreationStates.waiting_for_photo)
async def invalid_photo(message: Message):
    """Неверный формат фото."""
    await message.answer("❌ Пожалуйста, отправьте фото или используйте /skip")


async def ask_for_city(message: Message, state: FSMContext):
    """Запросить выбор города."""
    await state.set_state(ProfileCreationStates.waiting_for_city)

    keyboard = InlineKeyboardMarkup(inline_keyboard=[
        [InlineKeyboardButton(text="🏙 Минск", callback_data="city_Минск")],
        [InlineKeyboardButton(text="🏙 Гродно", callback_data="city_Гродно")],
        [InlineKeyboardButton(text="🏙 Другой город", callback_data="city_Другой")],
    ])

    text = "✏️ <b>Создание профиля - Шаг 7/7</b>\n\nВыберите ваш город:"

    await message.answer(text, reply_markup=keyboard, parse_mode="HTML")


@router.callback_query(F.data.startswith("city_"))
async def process_city(callback: CallbackQuery, state: FSMContext):
    """Обработка выбора города."""
    city = callback.data.split("_")[1]

    # Получаем все данные из state
    data = await state.get_data()

    async with get_session() as session:
        user = await get_or_create_user(
            session,
            callback.from_user.id,
            callback.from_user.username,
            callback.from_user.first_name,
            callback.from_user.last_name,
        )

        # Проверяем, есть ли уже профиль
        existing_profile = await get_user_profile(session, user.id)

        if existing_profile:
            # Обновляем существующий профиль
            existing_profile.bio = data.get("bio")
            existing_profile.occupation = data.get("occupation")
            existing_profile.looking_for = data.get("looking_for")
            existing_profile.can_help_with = data.get("can_help_with")
            existing_profile.needs_help_with = data.get("needs_help_with")
            existing_profile.photo_file_id = data.get("photo_file_id")
            existing_profile.city = city
            existing_profile.moderation_status = "pending"
            existing_profile.updated_at = datetime.utcnow()
            profile = existing_profile
        else:
            # Создаём новый профиль
            profile = UserProfile(
                user_id=user.id,
                bio=data.get("bio"),
                occupation=data.get("occupation"),
                looking_for=data.get("looking_for"),
                can_help_with=data.get("can_help_with"),
                needs_help_with=data.get("needs_help_with"),
                photo_file_id=data.get("photo_file_id"),
                city=city,
                moderation_status="pending"
            )
            session.add(profile)

        await session.commit()
        await session.refresh(profile)

        # Уведомляем админов
        await notify_admins_about_new_profile(callback.bot, user, profile)

    await state.clear()

    text = (
        "✅ <b>Профиль создан!</b>\n\n"
        "Ваш профиль отправлен на модерацию. "
        "После одобрения администраторами вы сможете начать искать совпадения!\n\n"
        "Обычно модерация занимает несколько часов. Мы уведомим вас!"
    )

    await callback.message.edit_text(text, parse_mode="HTML")
    await callback.answer()


# =============================================================================
# ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
# =============================================================================

async def show_user_profile(message: Message, user: User, profile: UserProfile, edit: bool = False):
    """Показать профиль пользователя."""
    status_emoji = {
        "pending": "⏳",
        "approved": "✅",
        "rejected": "❌"
    }

    status_text = {
        "pending": "На модерации",
        "approved": "Одобрен",
        "rejected": "Отклонён"
    }

    text = (
        f"👤 <b>Ваш профиль</b>\n\n"
        f"<b>Статус:</b> {status_emoji.get(profile.moderation_status, '')} {status_text.get(profile.moderation_status, '')}\n"
        f"<b>Видимость:</b> {'🟢 Виден' if profile.is_visible else '🔴 Скрыт'}\n"
        f"<b>Город:</b> {profile.city}\n\n"
        f"📝 <b>О себе:</b>\n{profile.bio or 'не указано'}\n\n"
        f"💼 <b>Чем занимаетесь:</b>\n{profile.occupation or 'не указано'}\n\n"
        f"🔍 <b>Кого ищете:</b>\n{profile.looking_for or 'не указано'}\n\n"
        f"🤝 <b>Можете помочь:</b>\n{profile.can_help_with or 'не указано'}\n\n"
        f"🆘 <b>Нуждаетесь в помощи:</b>\n{profile.needs_help_with or 'не указано'}"
    )

    keyboard = InlineKeyboardMarkup(inline_keyboard=[
        [InlineKeyboardButton(text="⚙️ Настройки", callback_data="matching_settings")],
        [InlineKeyboardButton(text="◀️ Назад", callback_data="back_to_main")],
    ])

    if edit:
        if profile.photo_file_id:
            await message.delete()
            await message.bot.send_photo(
                message.chat.id,
                profile.photo_file_id,
                caption=text,
                reply_markup=keyboard,
                parse_mode="HTML"
            )
        else:
            await message.edit_text(text, reply_markup=keyboard, parse_mode="HTML")
    else:
        if profile.photo_file_id:
            await message.answer_photo(
                profile.photo_file_id,
                caption=text,
                reply_markup=keyboard,
                parse_mode="HTML"
            )
        else:
            await message.answer(text, reply_markup=keyboard, parse_mode="HTML")


async def show_matches_list(message: Message, session: AsyncSession, user: User, edit: bool = False):
    """Показать список матчей."""
    # Получаем все матчи пользователя
    result = await session.execute(
        select(Match).where(
            and_(
                or_(Match.user1_id == user.id, Match.user2_id == user.id),
                Match.is_active == True
            )
        ).order_by(Match.matched_at.desc())
    )
    matches = result.scalars().all()

    if not matches:
        text = "💔 У вас пока нет матчей.\n\nНачните свайпить, чтобы найти совпадения!"
        keyboard = InlineKeyboardMarkup(inline_keyboard=[
            [InlineKeyboardButton(text="🔥 Начать свайпить", callback_data="start_swiping")],
            [InlineKeyboardButton(text="◀️ Назад", callback_data="back_to_main")],
        ])
    else:
        text = f"💕 <b>Ваши матчи ({len(matches)})</b>\n\n"

        buttons = []
        for match in matches[:10]:  # Показываем максимум 10
            # Определяем, кто является матчем
            match_user_id = match.user2_id if match.user1_id == user.id else match.user1_id

            # Получаем информацию о пользователе
            match_user_result = await session.execute(
                select(User).where(User.id == match_user_id)
            )
            match_user = match_user_result.scalar_one()

            name = f"{match_user.first_name or ''} {match_user.last_name or ''}".strip()
            if not name:
                name = f"User {match_user.tg_user_id}"

            buttons.append([InlineKeyboardButton(
                text=f"💕 {name}",
                callback_data=f"view_match_{match_user_id}"
            )])

        buttons.append([InlineKeyboardButton(text="◀️ Назад", callback_data="back_to_main")])
        keyboard = InlineKeyboardMarkup(inline_keyboard=buttons)

        text += "Нажмите на имя, чтобы посмотреть профиль и контакты:"

    if edit:
        await message.edit_text(text, reply_markup=keyboard, parse_mode="HTML")
    else:
        await message.answer(text, reply_markup=keyboard, parse_mode="HTML")


@router.callback_query(F.data.startswith("view_match_"))
async def callback_view_match(callback: CallbackQuery):
    """Просмотр профиля матча с контактами."""
    match_user_id = int(callback.data.split("_")[2])

    async with get_session() as session:
        # Получаем пользователя-матч
        match_user_result = await session.execute(
            select(User).where(User.id == match_user_id)
        )
        match_user = match_user_result.scalar_one()

        # Получаем профиль
        profile = await get_user_profile(session, match_user_id)

        username_display = f"@{match_user.username}" if match_user.username else "Username не указан"
        phone_display = match_user.phone_number if match_user.phone_number else "не указан"

        text = (
            f"💕 <b>Ваш матч</b>\n\n"
            f"👤 <b>Имя:</b> {match_user.first_name or ''} {match_user.last_name or ''}\n"
            f"🏙 <b>Город:</b> {profile.city}\n\n"
            f"📝 <b>О себе:</b>\n{profile.bio or 'не указано'}\n\n"
            f"💼 <b>Чем занимается:</b>\n{profile.occupation or 'не указано'}\n\n"
            f"🔍 <b>Ищет:</b>\n{profile.looking_for or 'не указано'}\n\n"
            f"🤝 <b>Может помочь:</b>\n{profile.can_help_with or 'не указано'}\n\n"
            f"🆘 <b>Нуждается:</b>\n{profile.needs_help_with or 'не указано'}\n\n"
            f"📞 <b>Контакты:</b>\n"
            f"  • Telegram: {username_display}\n"
            f"  • Телефон: {phone_display}"
        )

        keyboard = InlineKeyboardMarkup(inline_keyboard=[
            [InlineKeyboardButton(text="◀️ К списку матчей", callback_data="my_matches")],
        ])

        if profile.photo_file_id:
            await callback.message.delete()
            await callback.bot.send_photo(
                callback.from_user.id,
                profile.photo_file_id,
                caption=text,
                reply_markup=keyboard,
                parse_mode="HTML"
            )
        else:
            await callback.message.edit_text(text, reply_markup=keyboard, parse_mode="HTML")

    await callback.answer()


async def show_next_profile(message: Message, state: FSMContext, session: AsyncSession, user: User, edit: bool = False):
    """Показать следующий профиль для свайпа."""
    data = await state.get_data()
    profile_city = data.get("profile_city", "Минск")

    # Получаем ID уже просмотренных профилей
    swiped_result = await session.execute(
        select(Swipe.swiped_id).where(Swipe.swiper_id == user.id)
    )
    swiped_ids = [row[0] for row in swiped_result.fetchall()]

    # Получаем ID мероприятий, на которые зарегистрирован пользователь
    user_events_result = await session.execute(
        select(EventRegistration.event_id).where(EventRegistration.user_id == user.id)
    )
    user_event_ids = [row[0] for row in user_events_result.fetchall()]

    # Приоритет 1: пользователи с общими мероприятиями из того же города
    if user_event_ids:
        common_events_query = (
            select(UserProfile)
            .join(User, UserProfile.user_id == User.id)
            .join(EventRegistration, EventRegistration.user_id == User.id)
            .where(
                and_(
                    UserProfile.user_id != user.id,
                    UserProfile.moderation_status == "approved",
                    UserProfile.is_visible == True,
                    UserProfile.city == profile_city,
                    EventRegistration.event_id.in_(user_event_ids),
                    not_(UserProfile.user_id.in_(swiped_ids)) if swiped_ids else True
                )
            )
            .distinct()
        )
        result = await session.execute(common_events_query)
        next_profile = result.scalars().first()

        if next_profile:
            await display_profile_card(message, session, next_profile, edit)
            return

    # Приоритет 2: пользователи из того же города
    same_city_query = (
        select(UserProfile)
        .where(
            and_(
                UserProfile.user_id != user.id,
                UserProfile.moderation_status == "approved",
                UserProfile.is_visible == True,
                UserProfile.city == profile_city,
                not_(UserProfile.user_id.in_(swiped_ids)) if swiped_ids else True
            )
        )
    )
    result = await session.execute(same_city_query)
    next_profile = result.scalars().first()

    if next_profile:
        await display_profile_card(message, session, next_profile, edit)
        return

    # Приоритет 3: все остальные одобренные профили
    all_profiles_query = (
        select(UserProfile)
        .where(
            and_(
                UserProfile.user_id != user.id,
                UserProfile.moderation_status == "approved",
                UserProfile.is_visible == True,
                not_(UserProfile.user_id.in_(swiped_ids)) if swiped_ids else True
            )
        )
    )
    result = await session.execute(all_profiles_query)
    next_profile = result.scalars().first()

    if next_profile:
        await display_profile_card(message, session, next_profile, edit)
        return

    # Больше профилей нет
    text = "🎉 Вы посмотрели все доступные профили!\n\nЗагляните позже, возможно появятся новые участники."
    keyboard = InlineKeyboardMarkup(inline_keyboard=[
        [InlineKeyboardButton(text="💕 Мои матчи", callback_data="my_matches")],
        [InlineKeyboardButton(text="◀️ Назад", callback_data="back_to_main")],
    ])

    if edit:
        await message.edit_text(text, reply_markup=keyboard, parse_mode="HTML")
    else:
        await message.answer(text, reply_markup=keyboard, parse_mode="HTML")

    await state.clear()


async def display_profile_card(message: Message, session: AsyncSession, profile: UserProfile, edit: bool = False):
    """Отобразить карточку профиля для свайпа."""
    # Получаем информацию о пользователе
    user_result = await session.execute(
        select(User).where(User.id == profile.user_id)
    )
    profile_user = user_result.scalar_one()

    text = (
        f"👤 <b>{profile_user.first_name or ''} {profile_user.last_name or ''}</b>\n"
        f"🏙 {profile.city}\n\n"
        f"📝 {profile.bio or 'Описание отсутствует'}\n\n"
        f"💼 <b>Занимается:</b> {profile.occupation or 'не указано'}"
    )

    keyboard = InlineKeyboardMarkup(inline_keyboard=[
        [
            InlineKeyboardButton(text="❤️ Лайк", callback_data=f"swipe_like_{profile.user_id}"),
            InlineKeyboardButton(text="👎 Скип", callback_data=f"swipe_skip_{profile.user_id}")
        ],
        [InlineKeyboardButton(text="👀 Подробнее", callback_data=f"view_profile_{profile.user_id}")],
        [InlineKeyboardButton(text="◀️ Назад", callback_data="back_to_main")]
    ])

    if edit:
        if profile.photo_file_id:
            await message.delete()
            await message.bot.send_photo(
                message.chat.id,
                profile.photo_file_id,
                caption=text,
                reply_markup=keyboard,
                parse_mode="HTML"
            )
        else:
            await message.edit_text(text, reply_markup=keyboard, parse_mode="HTML")
    else:
        if profile.photo_file_id:
            await message.answer_photo(
                profile.photo_file_id,
                caption=text,
                reply_markup=keyboard,
                parse_mode="HTML"
            )
        else:
            await message.answer(text, reply_markup=keyboard, parse_mode="HTML")
