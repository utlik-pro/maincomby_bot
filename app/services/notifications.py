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

from supabase import create_client, Client
import os

# Supabase client for creating in-app notifications
SUPABASE_URL = os.getenv("SUPABASE_URL", "https://ndpkxustvcijykzxqxrn.supabase.co")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_KEY") or os.getenv("SUPABASE_ANON_KEY", "")

logger = logging.getLogger(__name__)

# Rank thresholds (same as Mini App)
RANK_THRESHOLDS = {
    'newcomer': 0,
    'member': 100,
    'activist': 300,
    'enthusiast': 600,
    'contributor': 1000,
    'ambassador': 2000,
    'expert': 5000,
    'leader': 10000,
    'founder': 20000,
}

RANK_NAMES = {
    'newcomer': 'Новичок',
    'member': 'Участник',
    'activist': 'Активист',
    'enthusiast': 'Энтузиаст',
    'contributor': 'Контрибьютор',
    'ambassador': 'Амбассадор',
    'expert': 'Эксперт',
    'leader': 'Лидер',
    'founder': 'Основатель',
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
    if points >= RANK_THRESHOLDS['founder']:
        return 'founder'
    if points >= RANK_THRESHOLDS['leader']:
        return 'leader'
    if points >= RANK_THRESHOLDS['expert']:
        return 'expert'
    if points >= RANK_THRESHOLDS['ambassador']:
        return 'ambassador'
    if points >= RANK_THRESHOLDS['contributor']:
        return 'contributor'
    if points >= RANK_THRESHOLDS['enthusiast']:
        return 'enthusiast'
    if points >= RANK_THRESHOLDS['activist']:
        return 'activist'
    if points >= RANK_THRESHOLDS['member']:
        return 'member'
    return 'newcomer'


class NotificationService:
    """Service for sending notifications to users"""

    def __init__(self, bot: Bot):
        self.bot = bot
        self._supabase: Optional[Client] = None

    def _get_supabase(self) -> Optional[Client]:
        """Get Supabase client for in-app notifications"""
        if not self._supabase and SUPABASE_KEY:
            try:
                self._supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
            except Exception as e:
                logger.error(f"Failed to create Supabase client: {e}")
        return self._supabase

    def _create_app_notification(
        self,
        user_id: int,
        notification_type: str,
        title: str,
        message: str,
        data: Optional[dict] = None
    ) -> bool:
        """Create in-app notification in Supabase"""
        try:
            supabase = self._get_supabase()
            if not supabase:
                return False

            supabase.table("app_notifications").insert({
                "user_id": user_id,
                "type": notification_type,
                "title": title,
                "message": message,
                "data": data or {},
                "is_read": False
            }).execute()
            return True
        except Exception as e:
            logger.error(f"Failed to create app notification: {e}")
            return False

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
                'member': '👤',
                'activist': '🔥',
                'enthusiast': '🚀',
                'contributor': '🛠',
                'ambassador': '📢',
                'expert': '🧠',
                'leader': '👑',
                'founder': '🏛',
            }
            emoji = rank_emojis.get(new_rank, '👤')

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

    async def send_new_event_invitation(self, user_id: int, event: Event) -> bool:
        """Send invitation when a new event is created"""
        try:
            event_date = event.event_date.strftime("%d.%m в %H:%M")

            # Event type labels
            event_type_labels = {
                'meetup': 'Митап',
                'workshop': 'Воркшоп',
                'conference': 'Конференция',
                'hackathon': 'Хакатон',
            }
            event_type = event_type_labels.get(getattr(event, 'event_type', None), 'Мероприятие')

            text = (
                f"📅 <b>Новое мероприятие!</b>\n\n"
                f"<b>{event.title}</b>\n\n"
                f"🏷 {event_type}\n"
                f"📆 {event_date}\n"
                f"📍 {event.location or event.city}\n\n"
                f"Приглашаем вас принять участие!"
            )

            keyboard = InlineKeyboardMarkup(inline_keyboard=[
                [InlineKeyboardButton(
                    text="Подробнее",
                    url="https://t.me/maincomapp_bot/app?startapp=events"
                )]
            ])

            await self.bot.send_message(
                chat_id=user_id,
                text=text,
                parse_mode="HTML",
                reply_markup=keyboard
            )
            logger.info(f"Sent new event invitation to user {user_id} for event {event.id}")
            return True
        except Exception as e:
            logger.error(f"Failed to send new event invitation to {user_id}: {e}")
            return False

    async def send_new_event_invitations_batch(self, session: AsyncSession, event: Event) -> int:
        """Send new event invitations to all active users"""
        try:
            # Get all active users
            users_query = select(User).where(
                and_(
                    User.banned == False,
                    User.tg_user_id.isnot(None)
                )
            )
            users_result = await session.execute(users_query)
            users = users_result.scalars().all()

            event_date = event.event_date.strftime("%d.%m в %H:%M")
            sent_count = 0
            for user in users:
                if user.tg_user_id:
                    # Send Telegram push notification
                    success = await self.send_new_event_invitation(user.tg_user_id, event)
                    if success:
                        sent_count += 1

                    # Create in-app notification
                    self._create_app_notification(
                        user_id=user.id,
                        notification_type="event_invitation",
                        title=f"Новое мероприятие: {event.title}",
                        message=f"{event_date} | {event.location or event.city}",
                        data={"event_id": event.id}
                    )

            logger.info(f"Sent {sent_count} new event invitations for event {event.id}")
            return sent_count
        except Exception as e:
            logger.error(f"Failed to send new event invitations batch: {e}")
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

    async def send_review_request(self, user_id: int, event: Event) -> bool:
        """Send request to leave a review after attending an event"""
        try:
            text = (
                f"🎉 <b>Как прошло мероприятие?</b>\n\n"
                f"Вы посетили <b>{event.title}</b>!\n\n"
                f"Поделитесь впечатлениями — это поможет нам стать лучше "
                f"и поможет другим участникам выбрать интересные события.\n\n"
                f"За отзыв вы получите <b>+20 XP</b> ⭐"
            )

            keyboard = InlineKeyboardMarkup(inline_keyboard=[
                [InlineKeyboardButton(
                    text="⭐ Оставить отзыв",
                    url=f"https://t.me/maincomapp_bot/app?startapp=review_{event.id}"
                )],
                [InlineKeyboardButton(
                    text="Позже",
                    callback_data="dismiss_review"
                )]
            ])

            await self.bot.send_message(
                chat_id=user_id,
                text=text,
                parse_mode="HTML",
                reply_markup=keyboard
            )
            logger.info(f"Sent review request to user {user_id} for event {event.id}")
            return True
        except Exception as e:
            logger.error(f"Failed to send review request to {user_id}: {e}")
            return False

    async def send_review_requests_batch(self, session: AsyncSession) -> int:
        """Send review requests to users who attended events today"""
        try:
            # Find events that ended today (event_date was today)
            now = datetime.now()
            today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
            today_end = now.replace(hour=23, minute=59, second=59, microsecond=999999)

            # Get events that happened today
            events_query = select(Event).where(
                and_(
                    Event.event_date >= today_start,
                    Event.event_date <= today_end
                )
            )
            events_result = await session.execute(events_query)
            events = events_result.scalars().all()

            if not events:
                logger.info("No events today for review requests")
                return 0

            # Get Supabase client for checking reviews
            supabase = self._get_supabase()

            sent_count = 0
            for event in events:
                # Get users who attended this event
                regs_query = select(EventRegistration).where(
                    and_(
                        EventRegistration.event_id == event.id,
                        EventRegistration.status == 'attended'
                    )
                )
                regs_result = await session.execute(regs_query)
                registrations = regs_result.scalars().all()

                for reg in registrations:
                    # Get user's telegram ID
                    user_query = select(User).where(User.id == reg.user_id)
                    user_result = await session.execute(user_query)
                    user = user_result.scalar_one_or_none()

                    if not user or not user.tg_user_id:
                        continue

                    # Check if user already left a review (via Supabase)
                    if supabase:
                        try:
                            existing_review = supabase.table("bot_event_reviews").select("id").eq(
                                "event_id", event.id
                            ).eq("user_id", user.id).execute()

                            if existing_review.data and len(existing_review.data) > 0:
                                # User already reviewed, skip
                                continue
                        except Exception as e:
                            logger.warning(f"Failed to check existing review: {e}")

                    success = await self.send_review_request(user.tg_user_id, event)
                    if success:
                        sent_count += 1

            logger.info(f"Sent {sent_count} review requests")
            return sent_count
        except Exception as e:
            logger.error(f"Failed to send review requests batch: {e}")
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
