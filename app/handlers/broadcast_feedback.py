"""
Handler для сбора обратной связи из рассылок.

ИИшница №5 от M.AI.N Community в Минске (18.12.2024)

Функционал:
- Inline-форма с эмодзи-оценками (4-балльная система)
- Оценка для Олега и Алекса
- Множественный выбор интересных тем
- Опциональный текстовый комментарий
- Ссылка на комьюнити в конце
"""

from aiogram import Router, F
from aiogram.types import CallbackQuery, Message, InlineKeyboardMarkup, InlineKeyboardButton
from aiogram.fsm.context import FSMContext
from aiogram.fsm.state import State, StatesGroup
from sqlalchemy import select, and_
from datetime import datetime

from ..db.models import Event, EventFeedback, User

router = Router()

# Глобальная переменная для session_factory (устанавливается в main.py)
_session_factory = None


def set_session_factory(factory):
    """Устанавливает фабрику сессий БД."""
    global _session_factory
    _session_factory = factory


class BroadcastFeedbackStates(StatesGroup):
    """Состояния для сбора фидбека из рассылки."""
    waiting_speaker1_rating = State()
    waiting_speaker2_rating = State()
    waiting_topics = State()
    waiting_custom_topic = State()
    waiting_comment = State()


# Спикеры ИИшницы №5
SPEAKER1_NAME = "Олега"
SPEAKER1_TOPIC = "Почему ИИ делает одни компании успешными, а другие - темой для хейта"

SPEAKER2_NAME = "Алекса"
SPEAKER2_TOPIC = "Принимает роды у ИИ"

# Темы для выбора
TOPICS = [
    "ИИ в бизнесе",
    "ИИ в маркетинге",
    "ИИ в продуктах",
    "Автоматизация процессов"
]

# Ссылка на комьюнити
COMMUNITY_LINK = "https://t.me/maincomby/269"

# Эмодзи для 4-балльной системы оценки
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


def get_rating_keyboard(callback_prefix: str) -> InlineKeyboardMarkup:
    """Создаёт клавиатуру с 4 эмодзи для оценки в 1 ряд."""
    return InlineKeyboardMarkup(inline_keyboard=[
        [
            InlineKeyboardButton(text="😞", callback_data=f"{callback_prefix}_1"),
            InlineKeyboardButton(text="😐", callback_data=f"{callback_prefix}_2"),
            InlineKeyboardButton(text="🙂", callback_data=f"{callback_prefix}_3"),
            InlineKeyboardButton(text="😍", callback_data=f"{callback_prefix}_4"),
        ]
    ])


def get_topics_keyboard(selected_topics: set) -> InlineKeyboardMarkup:
    """Клавиатура с toggle-кнопками для выбора тем."""
    buttons = []
    for i, topic in enumerate(TOPICS):
        check = "☑" if topic in selected_topics else "☐"
        buttons.append([InlineKeyboardButton(
            text=f"{check} {topic}",
            callback_data=f"fb_topic_toggle_{i}"
        )])

    # Кнопка "Свой вариант"
    buttons.append([InlineKeyboardButton(
        text="✏️ Свой вариант",
        callback_data="fb_topic_custom"
    )])

    # Кнопка "Готово"
    buttons.append([InlineKeyboardButton(
        text="✅ Готово",
        callback_data="fb_topic_done"
    )])

    return InlineKeyboardMarkup(inline_keyboard=buttons)


def get_comment_keyboard() -> InlineKeyboardMarkup:
    """Клавиатура для пропуска комментария."""
    return InlineKeyboardMarkup(inline_keyboard=[
        [InlineKeyboardButton(text="⏭ Пропустить", callback_data="broadcast_fb_skip_comment")]
    ])


@router.callback_query(F.data.startswith("broadcast_fb_start_"))
async def start_broadcast_feedback(callback: CallbackQuery, state: FSMContext):
    """
    Начало заполнения формы обратной связи из рассылки.
    Callback data: broadcast_fb_start_{event_id}
    """
    # Извлекаем event_id из callback_data
    event_id = int(callback.data.split("_")[-1])

    async with _session_factory() as session:
        # Получаем пользователя
        result = await session.execute(
            select(User).where(User.tg_user_id == callback.from_user.id)
        )
        user = result.scalar_one_or_none()

        if not user:
            await callback.answer("Пользователь не найден", show_alert=True)
            return

        # Проверяем, не оставлен ли уже отзыв
        existing = await session.execute(
            select(EventFeedback).where(
                and_(
                    EventFeedback.event_id == event_id,
                    EventFeedback.user_id == user.id
                )
            )
        )
        if existing.scalar_one_or_none():
            await callback.message.edit_text(
                "Вы уже оставили отзыв о этом мероприятии!\n\n"
                "Спасибо за вашу обратную связь!"
            )
            await callback.answer()
            return

        # Получаем информацию о событии
        event_result = await session.execute(
            select(Event).where(Event.id == event_id)
        )
        event = event_result.scalar_one_or_none()

        if not event:
            await callback.answer("Событие не найдено", show_alert=True)
            return

        # Сохраняем event_id в FSM data
        await state.update_data(
            event_id=event_id,
            user_id=user.id,
            selected_topics=[]  # Список выбранных тем
        )
        await state.set_state(BroadcastFeedbackStates.waiting_speaker1_rating)

        # Показываем форму для оценки первого спикера (Олег)
        await callback.message.edit_text(
            f"<b>1. Оцени выступление {SPEAKER1_NAME}</b>\n"
            f"«{SPEAKER1_TOPIC}»\n\n"
            "Выбери оценку:",
            reply_markup=get_rating_keyboard("broadcast_fb_sp1"),
            parse_mode="HTML"
        )

        await callback.answer()


@router.callback_query(F.data.startswith("broadcast_fb_sp1_"))
async def process_speaker1_rating(callback: CallbackQuery, state: FSMContext):
    """Обработка оценки первого спикера (Олег)."""
    rating = int(callback.data.split("_")[-1])

    await state.update_data(speaker1_rating=rating)
    await state.set_state(BroadcastFeedbackStates.waiting_speaker2_rating)

    emoji = RATING_EMOJI[rating]
    await callback.message.edit_text(
        f"Оценка {SPEAKER1_NAME}: {emoji}\n\n"
        f"<b>2. Оцени выступление {SPEAKER2_NAME}</b>\n"
        f"«{SPEAKER2_TOPIC}»\n\n"
        "Выбери оценку:",
        reply_markup=get_rating_keyboard("broadcast_fb_sp2"),
        parse_mode="HTML"
    )

    await callback.answer()


@router.callback_query(F.data.startswith("broadcast_fb_sp2_"))
async def process_speaker2_rating(callback: CallbackQuery, state: FSMContext):
    """Обработка оценки второго спикера (Алекс)."""
    rating = int(callback.data.split("_")[-1])

    await state.update_data(speaker2_rating=rating)
    await state.set_state(BroadcastFeedbackStates.waiting_topics)

    data = await state.get_data()
    sp1_emoji = RATING_EMOJI[data.get("speaker1_rating", 4)]
    sp2_emoji = RATING_EMOJI[rating]

    await callback.message.edit_text(
        f"Оценка {SPEAKER1_NAME}: {sp1_emoji}\n"
        f"Оценка {SPEAKER2_NAME}: {sp2_emoji}\n\n"
        "<b>3. Какая тема по ИИ тебе была бы интересна на следующем ивенте?</b>\n\n"
        "Можно выбрать несколько:",
        reply_markup=get_topics_keyboard(set()),
        parse_mode="HTML"
    )

    await callback.answer()


@router.callback_query(F.data.startswith("fb_topic_toggle_"))
async def toggle_topic(callback: CallbackQuery, state: FSMContext):
    """Toggle выбора темы."""
    topic_index = int(callback.data.split("_")[-1])
    topic = TOPICS[topic_index]

    data = await state.get_data()
    selected = set(data.get("selected_topics", []))

    if topic in selected:
        selected.remove(topic)
    else:
        selected.add(topic)

    await state.update_data(selected_topics=list(selected))

    sp1_emoji = RATING_EMOJI[data.get("speaker1_rating", 4)]
    sp2_emoji = RATING_EMOJI[data.get("speaker2_rating", 4)]

    await callback.message.edit_text(
        f"Оценка {SPEAKER1_NAME}: {sp1_emoji}\n"
        f"Оценка {SPEAKER2_NAME}: {sp2_emoji}\n\n"
        "<b>3. Какая тема по ИИ тебе была бы интересна на следующем ивенте?</b>\n\n"
        "Можно выбрать несколько:",
        reply_markup=get_topics_keyboard(selected),
        parse_mode="HTML"
    )

    await callback.answer()


@router.callback_query(F.data == "fb_topic_custom")
async def ask_custom_topic(callback: CallbackQuery, state: FSMContext):
    """Запрос ввода своей темы."""
    await state.set_state(BroadcastFeedbackStates.waiting_custom_topic)

    await callback.message.edit_text(
        "<b>Напиши свою тему:</b>\n\n"
        "Какая тема по ИИ тебе была бы интересна?",
        parse_mode="HTML"
    )

    await callback.answer()


@router.message(BroadcastFeedbackStates.waiting_custom_topic)
async def process_custom_topic(message: Message, state: FSMContext):
    """Обработка введённой пользователем темы."""
    custom_topic = message.text.strip()[:200]  # Ограничиваем длину

    data = await state.get_data()
    selected = set(data.get("selected_topics", []))
    selected.add(custom_topic)

    await state.update_data(selected_topics=list(selected))
    await state.set_state(BroadcastFeedbackStates.waiting_topics)

    sp1_emoji = RATING_EMOJI[data.get("speaker1_rating", 4)]
    sp2_emoji = RATING_EMOJI[data.get("speaker2_rating", 4)]

    await message.answer(
        f"Оценка {SPEAKER1_NAME}: {sp1_emoji}\n"
        f"Оценка {SPEAKER2_NAME}: {sp2_emoji}\n\n"
        "<b>3. Какая тема по ИИ тебе была бы интересна на следующем ивенте?</b>\n\n"
        f"Добавлено: «{custom_topic}»\n\n"
        "Можно выбрать ещё или нажми Готово:",
        reply_markup=get_topics_keyboard(selected),
        parse_mode="HTML"
    )


@router.callback_query(F.data == "fb_topic_done")
async def finish_topics(callback: CallbackQuery, state: FSMContext):
    """Завершение выбора тем, переход к комментарию."""
    await state.set_state(BroadcastFeedbackStates.waiting_comment)

    data = await state.get_data()
    sp1_emoji = RATING_EMOJI[data.get("speaker1_rating", 4)]
    sp2_emoji = RATING_EMOJI[data.get("speaker2_rating", 4)]
    topics = data.get("selected_topics", [])

    topics_text = ", ".join(topics) if topics else "не выбрано"

    await callback.message.edit_text(
        f"Оценка {SPEAKER1_NAME}: {sp1_emoji}\n"
        f"Оценка {SPEAKER2_NAME}: {sp2_emoji}\n"
        f"Темы: {topics_text}\n\n"
        "<b>4. Здесь ты можешь в свободной форме написать что тебе понравилось, "
        "а также свои советы по улучшению ивента.</b>\n\n"
        "Напиши сообщение или нажми «Пропустить»:",
        reply_markup=get_comment_keyboard(),
        parse_mode="HTML"
    )

    await callback.answer()


@router.callback_query(F.data == "broadcast_fb_skip_comment")
async def skip_comment(callback: CallbackQuery, state: FSMContext):
    """Пропуск комментария - сохранение отзыва без комментария."""
    await save_feedback(callback.message, state, comment=None, is_callback=True)
    await callback.answer()


@router.message(BroadcastFeedbackStates.waiting_comment)
async def process_comment(message: Message, state: FSMContext):
    """Обработка текстового комментария."""
    comment_text = message.text

    if len(comment_text) > 2048:
        await message.answer(
            "Комментарий слишком длинный! Максимум 2048 символов.\n\n"
            "Пожалуйста, сократите комментарий и отправьте снова."
        )
        return

    await save_feedback(message, state, comment=comment_text, is_callback=False)


async def save_feedback(message: Message, state: FSMContext, comment: str = None, is_callback: bool = False):
    """Сохраняет отзыв в базу данных."""
    data = await state.get_data()
    event_id = data.get("event_id")
    user_id = data.get("user_id")
    speaker1_rating = data.get("speaker1_rating")
    speaker2_rating = data.get("speaker2_rating")
    selected_topics = data.get("selected_topics", [])

    # Преобразуем темы в строку
    topics_str = ",".join(selected_topics) if selected_topics else None

    async with _session_factory() as session:
        # Проверяем дубликат
        existing = await session.execute(
            select(EventFeedback).where(
                and_(
                    EventFeedback.event_id == event_id,
                    EventFeedback.user_id == user_id
                )
            )
        )
        if existing.scalar_one_or_none():
            text = "Вы уже оставили отзыв о этом мероприятии!\n\nСпасибо!"
            if is_callback:
                await message.edit_text(text)
            else:
                await message.answer(text)
            await state.clear()
            return

        # Создаем новый отзыв
        feedback = EventFeedback(
            event_id=event_id,
            user_id=user_id,
            speaker1_rating=speaker1_rating,
            speaker2_rating=speaker2_rating,
            comment=comment,
            interested_topics=topics_str,
            created_at=datetime.utcnow()
        )
        session.add(feedback)
        await session.commit()

        # Формируем благодарственное сообщение
        sp1_emoji = RATING_EMOJI[speaker1_rating]
        sp2_emoji = RATING_EMOJI[speaker2_rating]
        topics_text = ", ".join(selected_topics) if selected_topics else "—"

        thanks_text = (
            "<b>Спасибо за отзыв!</b>\n\n"
            f"Оценка {SPEAKER1_NAME}: {sp1_emoji} {RATING_TEXT[speaker1_rating]}\n"
            f"Оценка {SPEAKER2_NAME}: {sp2_emoji} {RATING_TEXT[speaker2_rating]}\n"
            f"Интересные темы: {topics_text}\n"
        )

        if comment:
            comment_preview = comment[:100] + "..." if len(comment) > 100 else comment
            thanks_text += f"Комментарий: «{comment_preview}»\n"

        thanks_text += (
            "\n<b>5. Переходи в комьюнити M.AI.N</b> и расскажи о себе в разделе визиток: "
            "чем ты занимаешься, как используешь ИИ, с кем тебе интересно тут познакомиться "
            "и какие ответы получить — мы учитываем интересы участников!\n\n"
            f"<a href=\"{COMMUNITY_LINK}\">Перейти в комьюнити M.AI.N</a>"
        )

        if is_callback:
            await message.edit_text(thanks_text, parse_mode="HTML", disable_web_page_preview=True)
        else:
            await message.answer(thanks_text, parse_mode="HTML", disable_web_page_preview=True)

    await state.clear()
