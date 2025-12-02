"""
Хендлер для сбора фидбека после мероприятий.

Функционал:
- Форма с эмодзи-оценками (4-балльная система)
- Оценка для каждого спикера отдельно
- Опциональный текстовый комментарий
- Сохранение в БД для аналитики
"""

from aiogram import Router, F
from aiogram.types import Message, CallbackQuery, InlineKeyboardMarkup, InlineKeyboardButton
from aiogram.filters import Command
from aiogram.fsm.context import FSMContext
from aiogram.fsm.state import State, StatesGroup
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import datetime

from ..db.models import Event, EventFeedback, User, EventRegistration

router = Router()

# Глобальная переменная для session_factory (устанавливается в main.py)
_session_factory = None


def set_session_factory(factory):
    """Устанавливает фабрику сессий БД."""
    global _session_factory
    _session_factory = factory


class FeedbackForm(StatesGroup):
    """Состояния для сбора фидбека."""
    waiting_for_speaker1_rating = State()
    waiting_for_speaker2_rating = State()
    waiting_for_comment = State()


# Эмодзи для 4-балльной системы оценки
# 1 = 😞 (плохо), 2 = 😐 (нормально), 3 = 🙂 (хорошо), 4 = 😍 (отлично)
RATING_EMOJI = {
    1: "😞",
    2: "😐",
    3: "🙂",
    4: "😍"
}

RATING_TEXT = {
    1: "Не понравилось",
    2: "Нормально",
    3: "Хорошо",
    4: "Отлично!"
}


def get_rating_keyboard(speaker_name: str, callback_prefix: str) -> InlineKeyboardMarkup:
    """
    Создаёт клавиатуру с эмодзи для оценки спикера.

    Args:
        speaker_name: Имя спикера
        callback_prefix: Префикс для callback_data (speaker1 или speaker2)
    """
    buttons = []
    for rating in range(1, 5):  # 1, 2, 3, 4
        emoji = RATING_EMOJI[rating]
        text = RATING_TEXT[rating]
        buttons.append(
            InlineKeyboardButton(
                text=f"{emoji} {text}",
                callback_data=f"feedback_{callback_prefix}_{rating}"
            )
        )

    # Размещаем по 2 кнопки в ряд
    keyboard = InlineKeyboardMarkup(inline_keyboard=[
        buttons[0:2],  # 😞 и 😐
        buttons[2:4],  # 🙂 и 😍
    ])

    return keyboard


@router.message(Command("feedback"))
async def cmd_feedback(message: Message, state: FSMContext):
    """
    Команда /feedback - начать заполнение формы обратной связи.

    Показывает список последних мероприятий, на которые пользователь регистрировался.
    """
    async with _session_factory() as session:
        # Получаем пользователя
        result = await session.execute(
            select(User).where(User.tg_user_id == message.from_user.id)
        )
        user = result.scalar_one_or_none()

        if not user:
            await message.answer("❌ Вы не зарегистрированы в системе.")
            return

        # Получаем мероприятия, на которые пользователь регистрировался
        # и которые уже прошли (event_date < now)
        result = await session.execute(
            select(Event)
            .join(EventRegistration)
            .where(
                EventRegistration.user_id == user.id,
                Event.event_date < datetime.now()
            )
            .order_by(Event.event_date.desc())
            .limit(5)
        )
        past_events = result.scalars().all()

        if not past_events:
            await message.answer(
                "📭 У вас нет прошедших мероприятий для оценки.\n\n"
                "Зарегистрируйтесь на мероприятие через /start"
            )
            return

        # Показываем список мероприятий для выбора
        keyboard_buttons = []
        for event in past_events:
            # Проверяем, оставлял ли пользователь уже фидбек
            feedback_result = await session.execute(
                select(EventFeedback).where(
                    EventFeedback.event_id == event.id,
                    EventFeedback.user_id == user.id
                )
            )
            existing_feedback = feedback_result.scalar_one_or_none()

            emoji = "✅" if existing_feedback else "📝"
            button_text = f"{emoji} {event.title} ({event.event_date.strftime('%d.%m.%Y')})"

            keyboard_buttons.append([
                InlineKeyboardButton(
                    text=button_text,
                    callback_data=f"feedback_event_{event.id}"
                )
            ])

        keyboard = InlineKeyboardMarkup(inline_keyboard=keyboard_buttons)

        await message.answer(
            "📝 <b>Оставить отзыв о мероприятии</b>\n\n"
            "Выберите мероприятие:\n"
            "✅ - вы уже оставили отзыв\n"
            "📝 - отзыв ещё не оставлен",
            reply_markup=keyboard,
            parse_mode="HTML"
        )


@router.callback_query(F.data.startswith("feedback_event_"))
async def start_feedback_for_event(callback: CallbackQuery, state: FSMContext):
    """Начинает процесс сбора фидбека для выбранного мероприятия."""
    event_id = int(callback.data.split("_")[-1])

    async with _session_factory() as session:
        # Получаем мероприятие
        result = await session.execute(
            select(Event).where(Event.id == event_id)
        )
        event = result.scalar_one_or_none()

        if not event:
            await callback.answer("❌ Мероприятие не найдено", show_alert=True)
            return

        # Получаем пользователя
        result = await session.execute(
            select(User).where(User.tg_user_id == callback.from_user.id)
        )
        user = result.scalar_one_or_none()

        # Проверяем, не оставлял ли пользователь уже фидбек
        result = await session.execute(
            select(EventFeedback).where(
                EventFeedback.event_id == event_id,
                EventFeedback.user_id == user.id
            )
        )
        existing_feedback = result.scalar_one_or_none()

        if existing_feedback:
            await callback.answer(
                "✅ Вы уже оставили отзыв об этом мероприятии",
                show_alert=True
            )
            return

        # Сохраняем event_id в состояние
        await state.update_data(event_id=event_id, event_title=event.title)

        # Начинаем с оценки первого спикера
        # TODO: Спикеров лучше хранить в отдельной таблице, пока хардкодим
        speaker1_name = "Дима"
        speaker1_topic = "Как переварить 3-часовое видео за 10 мин"

        await state.update_data(speaker1_name=speaker1_name)
        await state.set_state(FeedbackForm.waiting_for_speaker1_rating)

        keyboard = get_rating_keyboard(speaker1_name, "speaker1")

        await callback.message.edit_text(
            f"📝 <b>Отзыв о мероприятии</b>\n"
            f"<i>{event.title}</i>\n\n"
            f"<b>Оцените выступление {speaker1_name}:</b>\n"
            f'"{speaker1_topic}"\n\n'
            f"Выберите оценку:",
            reply_markup=keyboard,
            parse_mode="HTML"
        )

        await callback.answer()


@router.callback_query(F.data.startswith("feedback_speaker1_"))
async def handle_speaker1_rating(callback: CallbackQuery, state: FSMContext):
    """Обрабатывает оценку первого спикера."""
    rating = int(callback.data.split("_")[-1])

    # Сохраняем оценку
    await state.update_data(speaker1_rating=rating)

    # Переходим к оценке второго спикера
    speaker2_name = "Сергей"
    speaker2_topic = "его тема"  # TODO: заменить на реальную тему

    await state.update_data(speaker2_name=speaker2_name)
    await state.set_state(FeedbackForm.waiting_for_speaker2_rating)

    keyboard = get_rating_keyboard(speaker2_name, "speaker2")

    data = await state.get_data()
    emoji = RATING_EMOJI[rating]

    await callback.message.edit_text(
        f"✅ Оценка для Дима: {emoji}\n\n"
        f"<b>Оцените выступление {speaker2_name}:</b>\n"
        f'"{speaker2_topic}"\n\n'
        f"Выберите оценку:",
        reply_markup=keyboard,
        parse_mode="HTML"
    )

    await callback.answer()


@router.callback_query(F.data.startswith("feedback_speaker2_"))
async def handle_speaker2_rating(callback: CallbackQuery, state: FSMContext):
    """Обрабатывает оценку второго спикера."""
    rating = int(callback.data.split("_")[-1])

    # Сохраняем оценку
    await state.update_data(speaker2_rating=rating)

    # Предлагаем оставить комментарий
    await state.set_state(FeedbackForm.waiting_for_comment)

    data = await state.get_data()
    speaker1_emoji = RATING_EMOJI[data['speaker1_rating']]
    speaker2_emoji = RATING_EMOJI[rating]

    keyboard = InlineKeyboardMarkup(inline_keyboard=[
        [InlineKeyboardButton(text="✅ Пропустить комментарий", callback_data="feedback_skip_comment")]
    ])

    await callback.message.edit_text(
        f"✅ Оценка для Дима: {speaker1_emoji}\n"
        f"✅ Оценка для Сергей: {speaker2_emoji}\n\n"
        f"💬 <b>Ваши комментарии</b> (опционально)\n\n"
        f"Напишите что угодно - пожелания, предложения, критику.\n"
        f"Или нажмите кнопку ниже, чтобы пропустить.",
        reply_markup=keyboard,
        parse_mode="HTML"
    )

    await callback.answer()


@router.callback_query(F.data == "feedback_skip_comment")
async def skip_comment(callback: CallbackQuery, state: FSMContext):
    """Пропускает комментарий и сохраняет фидбек."""
    await save_feedback(callback.message, state, comment=None)
    await callback.answer()


@router.message(FeedbackForm.waiting_for_comment)
async def handle_comment(message: Message, state: FSMContext):
    """Обрабатывает текстовый комментарий."""
    comment = message.text[:2048]  # Ограничиваем до 2048 символов
    await save_feedback(message, state, comment=comment)


async def save_feedback(message: Message, state: FSMContext, comment: str = None):
    """Сохраняет фидбек в базу данных."""
    data = await state.get_data()

    async with _session_factory() as session:
        # Получаем пользователя
        result = await session.execute(
            select(User).where(User.tg_user_id == message.from_user.id)
        )
        user = result.scalar_one_or_none()

        # Создаём запись фидбека
        feedback = EventFeedback(
            event_id=data['event_id'],
            user_id=user.id,
            speaker1_rating=data['speaker1_rating'],
            speaker2_rating=data['speaker2_rating'],
            comment=comment
        )

        session.add(feedback)
        await session.commit()

    # Формируем итоговое сообщение
    speaker1_emoji = RATING_EMOJI[data['speaker1_rating']]
    speaker2_emoji = RATING_EMOJI[data['speaker2_rating']]

    result_text = (
        f"🎉 <b>Спасибо за ваш отзыв!</b>\n\n"
        f"<b>Мероприятие:</b> {data['event_title']}\n\n"
        f"<b>Ваши оценки:</b>\n"
        f"• Дима: {speaker1_emoji} {RATING_TEXT[data['speaker1_rating']]}\n"
        f"• Сергей: {speaker2_emoji} {RATING_TEXT[data['speaker2_rating']]}\n"
    )

    if comment:
        result_text += f"\n<b>Комментарий:</b>\n{comment}\n"

    result_text += "\n✅ Ваш отзыв учтён и поможет нам стать лучше!"

    await message.answer(result_text, parse_mode="HTML")
    await state.clear()
