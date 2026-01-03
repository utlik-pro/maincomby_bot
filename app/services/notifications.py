"""
Notification Service for MAIN Community Bot
Sends notifications to users via Telegram bot messages
"""

from datetime import datetime, timedelta
from typing import Optional
import logging

from aiogram import Bot
from aiogram.types import InlineKeyboardMarkup, InlineKeyboardButton
from sqlalchemy import select, and_
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models import User, Event, EventRegistration, UserProfile, Match
from app.db.database import async_session_maker

logger = logging.getLogger(__name__)

# Rank thresholds (same as Mini App)
RANK_THRESHOLDS = {
    'private': 0,
    'corporal': 100,
    'sergeant': 300,
    'sergeant_major': 600,
    'lieutenant': 1000,
    'captain': 2000,
    'major': 5000,
    'colonel': 10000,
    'general': 20000,
}

RANK_NAMES = {
    'private': 'Рядовой',
    'corporal': 'Капрал',
    'sergeant': 'Сержант',
    'sergeant_major': 'Старший сержант',
    'lieutenant': 'Лейтенант',
    'captain': 'Капитан',
    'major': 'Майор',
    'colonel': 'Полковник',
    'general': 'Генерал',
}

# Achievement definitions
ACHIEVEMENTS = {
    'first_event': {'name': 'Первое событие', 'description': 'Посетил первое мероприятие'},
    'networker': {'name': 'Нетворкер', 'description': 'Получил 5 матчей'},
    'regular': {'name': 'Постоянный участник', 'description': 'Посетил 5 мероприятий'},
    'helper': {'name': 'Помощник', 'description': 'Помог 3 участникам'},
    'profile_complete': {'name': 'Полный профиль', 'description': 'Заполнил все поля профиля'},
    'early_bird': {'name': 'Ранняя пташка', 'description': 'Зарегистрировался первым'},
    'social_butterfly': {'name': 'Душа компании', 'description': 'Получил 10 матчей'},
    'veteran': {'name': 'Ветеран', 'description': 'Посетил 10 мероприятий'},
}


def get_rank_from_points(points: int) -> str:
    """Get rank name from points"""
    if points >= RANK_THRESHOLDS['general']:
        return 'general'
    if points >= RANK_THRESHOLDS['colonel']:
        return 'colonel'
    if points >= RANK_THRESHOLDS['major']:
        return 'major'
    if points >= RANK_THRESHOLDS['captain']:
        return 'captain'
    if points >= RANK_THRESHOLDS['lieutenant']:
        return 'lieutenant'
    if points >= RANK_THRESHOLDS['sergeant_major']:
        return 'sergeant_major'
    if points >= RANK_THRESHOLDS['sergeant']:
        return 'sergeant'
    if points >= RANK_THRESHOLDS['corporal']:
        return 'corporal'
    return 'private'


class NotificationService:
    """Service for sending notifications to users"""

    def __init__(self, bot: Bot):
        self.bot = bot

    def _get_miniapp_button(self, text: str = "Открыть приложение") -> InlineKeyboardMarkup:
        """Create inline button to open Mini App"""
        return InlineKeyboardMarkup(inline_keyboard=[
            [InlineKeyboardButton(
                text=text,
                url="https://t.me/maincomapp_bot/app"
            )]
        ])

    async def send_event_reminder(self, user_id: int, event: Event) -> bool:
        """Send reminder 24h before event"""
        try:
            event_date = event.event_date.strftime("%d.%m в %H:%M")
            text = (
                f"🎫 <b>Напоминание о событии!</b>\n\n"
                f"Завтра состоится:\n"
                f"<b>{event.title}</b>\n\n"
                f"📅 {event_date}\n"
                f"📍 {event.location}\n\n"
                f"Не забудь прийти! До встречи! 👋"
            )

            await self.bot.send_message(
                chat_id=user_id,
                text=text,
                parse_mode="HTML",
                reply_markup=self._get_miniapp_button("Мой билет")
            )
            logger.info(f"Sent event reminder to user {user_id} for event {event.id}")
            return True
        except Exception as e:
            logger.error(f"Failed to send event reminder to {user_id}: {e}")
            return False

    async def send_match_notification(
        self,
        user_id: int,
        matched_user: User,
        matched_profile: Optional[UserProfile] = None
    ) -> bool:
        """Notify user about new match"""
        try:
            name = matched_user.first_name or matched_user.username or "Участник"
            occupation = ""
            if matched_profile and matched_profile.occupation:
                occupation = f"\n💼 {matched_profile.occupation}"

            text = (
                f"💚 <b>У вас новый матч!</b>\n\n"
                f"Вы понравились друг другу с {name}!{occupation}\n\n"
                f"Напишите друг другу и начните общение! 🤝"
            )

            # Add button to open chat with matched user
            keyboard = InlineKeyboardMarkup(inline_keyboard=[
                [InlineKeyboardButton(
                    text=f"Написать {name}",
                    url=f"https://t.me/{matched_user.username}" if matched_user.username else f"tg://user?id={matched_user.tg_user_id}"
                )],
                [InlineKeyboardButton(
                    text="Открыть приложение",
                    url="https://t.me/maincomapp_bot/app"
                )]
            ])

            await self.bot.send_message(
                chat_id=user_id,
                text=text,
                parse_mode="HTML",
                reply_markup=keyboard
            )
            logger.info(f"Sent match notification to user {user_id}")
            return True
        except Exception as e:
            logger.error(f"Failed to send match notification to {user_id}: {e}")
            return False

    async def send_achievement_notification(
        self,
        user_id: int,
        achievement_id: str,
        xp_reward: int = 0
    ) -> bool:
        """Notify user about new achievement"""
        try:
            achievement = ACHIEVEMENTS.get(achievement_id, {})
            name = achievement.get('name', 'Достижение')
            description = achievement.get('description', '')

            xp_text = f"\n\n+{xp_reward} XP" if xp_reward > 0 else ""

            text = (
                f"🏆 <b>Новое достижение!</b>\n\n"
                f"<b>{name}</b>\n"
                f"{description}{xp_text}"
            )

            await self.bot.send_message(
                chat_id=user_id,
                text=text,
                parse_mode="HTML",
                reply_markup=self._get_miniapp_button("Мои достижения")
            )
            logger.info(f"Sent achievement notification to user {user_id}: {achievement_id}")
            return True
        except Exception as e:
            logger.error(f"Failed to send achievement notification to {user_id}: {e}")
            return False

    async def send_rank_up_notification(
        self,
        user_id: int,
        new_rank: str,
        new_points: int
    ) -> bool:
        """Notify user about rank promotion"""
        try:
            rank_name = RANK_NAMES.get(new_rank, new_rank)

            # Rank emojis
            rank_emojis = {
                'corporal': '🎖',
                'sergeant': '🎖🎖',
                'sergeant_major': '🎖🎖🎖',
                'lieutenant': '⭐',
                'captain': '⭐⭐',
                'major': '⭐⭐⭐',
                'colonel': '🌟',
                'general': '🌟🌟',
            }
            emoji = rank_emojis.get(new_rank, '⭐')

            text = (
                f"{emoji} <b>Повышение!</b>\n\n"
                f"Поздравляем! Вы достигли звания:\n"
                f"<b>{rank_name}</b>\n\n"
                f"Всего XP: {new_points}\n\n"
                f"Продолжайте участвовать в событиях и развивать нетворк! 🚀"
            )

            await self.bot.send_message(
                chat_id=user_id,
                text=text,
                parse_mode="HTML",
                reply_markup=self._get_miniapp_button("Мой прогресс")
            )
            logger.info(f"Sent rank up notification to user {user_id}: {new_rank}")
            return True
        except Exception as e:
            logger.error(f"Failed to send rank up notification to {user_id}: {e}")
            return False

    async def send_event_reminders_batch(self, session: AsyncSession) -> int:
        """Send reminders for events happening in ~24 hours"""
        try:
            # Find events happening in 23-25 hours
            now = datetime.now()
            reminder_start = now + timedelta(hours=23)
            reminder_end = now + timedelta(hours=25)

            # Get events in reminder window
            events_query = select(Event).where(
                and_(
                    Event.event_date >= reminder_start,
                    Event.event_date <= reminder_end,
                    Event.is_active == True
                )
            )
            events_result = await session.execute(events_query)
            events = events_result.scalars().all()

            sent_count = 0
            for event in events:
                # Get registered users for this event
                regs_query = select(EventRegistration).where(
                    and_(
                        EventRegistration.event_id == event.id,
                        EventRegistration.status == 'registered'
                    )
                )
                regs_result = await session.execute(regs_query)
                registrations = regs_result.scalars().all()

                for reg in registrations:
                    # Get user's telegram ID
                    user_query = select(User).where(User.id == reg.user_id)
                    user_result = await session.execute(user_query)
                    user = user_result.scalar_one_or_none()

                    if user and user.tg_user_id:
                        success = await self.send_event_reminder(user.tg_user_id, event)
                        if success:
                            sent_count += 1

            logger.info(f"Sent {sent_count} event reminders")
            return sent_count
        except Exception as e:
            logger.error(f"Failed to send event reminders batch: {e}")
            return 0

    async def send_event_starting_soon(self, user_id: int, event: Event) -> bool:
        """Send reminder 1h before event starts"""
        try:
            event_time = event.event_date.strftime("%H:%M")
            text = (
                f"⏰ <b>Событие начнётся через 1 час!</b>\n\n"
                f"<b>{event.title}</b>\n\n"
                f"🕐 Начало в {event_time}\n"
                f"📍 {event.location}\n\n"
                f"Не опаздывай! 🏃"
            )

            await self.bot.send_message(
                chat_id=user_id,
                text=text,
                parse_mode="HTML",
                reply_markup=self._get_miniapp_button("Открыть билет")
            )
            logger.info(f"Sent 'starting soon' reminder to user {user_id} for event {event.id}")
            return True
        except Exception as e:
            logger.error(f"Failed to send 'starting soon' reminder to {user_id}: {e}")
            return False

    async def send_event_starting_soon_batch(self, session: AsyncSession) -> int:
        """Send reminders for events starting in ~1 hour"""
        try:
            # Find events starting in 45-75 minutes
            now = datetime.now()
            reminder_start = now + timedelta(minutes=45)
            reminder_end = now + timedelta(minutes=75)

            # Get events in reminder window
            events_query = select(Event).where(
                and_(
                    Event.event_date >= reminder_start,
                    Event.event_date <= reminder_end,
                    Event.is_active == True
                )
            )
            events_result = await session.execute(events_query)
            events = events_result.scalars().all()

            sent_count = 0
            for event in events:
                # Get registered users for this event
                regs_query = select(EventRegistration).where(
                    and_(
                        EventRegistration.event_id == event.id,
                        EventRegistration.status == 'registered'
                    )
                )
                regs_result = await session.execute(regs_query)
                registrations = regs_result.scalars().all()

                for reg in registrations:
                    # Get user's telegram ID
                    user_query = select(User).where(User.id == reg.user_id)
                    user_result = await session.execute(user_query)
                    user = user_result.scalar_one_or_none()

                    if user and user.tg_user_id:
                        success = await self.send_event_starting_soon(user.tg_user_id, event)
                        if success:
                            sent_count += 1

            logger.info(f"Sent {sent_count} 'starting soon' reminders")
            return sent_count
        except Exception as e:
            logger.error(f"Failed to send 'starting soon' reminders batch: {e}")
            return 0


# Helper function to check and notify rank up
async def check_and_notify_rank_up(
    bot: Bot,
    user_id: int,
    tg_user_id: int,
    old_points: int,
    new_points: int
) -> Optional[str]:
    """Check if user ranked up and send notification"""
    old_rank = get_rank_from_points(old_points)
    new_rank = get_rank_from_points(new_points)

    if new_rank != old_rank:
        service = NotificationService(bot)
        await service.send_rank_up_notification(tg_user_id, new_rank, new_points)
        return new_rank
    return None


# Singleton instance (initialized in main.py)
notification_service: Optional[NotificationService] = None


def init_notification_service(bot: Bot) -> NotificationService:
    """Initialize the notification service"""
    global notification_service
    notification_service = NotificationService(bot)
    return notification_service


def get_notification_service() -> Optional[NotificationService]:
    """Get the notification service instance"""
    return notification_service
