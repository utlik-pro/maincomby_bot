"""
Engagement Notification Service for MAIN Community Bot
Sends automated notifications to encourage app usage:
- Profile completion reminders
- Networking invitations
- Return inactive users
- Pending likes notifications
"""

from datetime import datetime, timedelta
from typing import Optional, Tuple
import logging

from aiogram import Bot
from aiogram.types import InlineKeyboardMarkup, InlineKeyboardButton
from sqlalchemy import select, and_, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models import User, UserProfile, Swipe, EngagementNotification

from supabase import create_client, Client
import os

# Supabase configuration
SUPABASE_URL = os.getenv("SUPABASE_URL", "https://ndpkxustvcijykzxqxrn.supabase.co")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_KEY") or os.getenv("SUPABASE_ANON_KEY", "")

logger = logging.getLogger(__name__)


class EngagementNotificationService:
    """Service for sending engagement notifications to users"""

    def __init__(self, bot: Bot):
        self.bot = bot
        self._supabase: Optional[Client] = None

    def _get_supabase(self) -> Optional[Client]:
        """Get Supabase client"""
        if not self._supabase and SUPABASE_KEY:
            try:
                self._supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
            except Exception as e:
                logger.error(f"Failed to create Supabase client: {e}")
        return self._supabase

    def _get_miniapp_button(self, text: str = "Открыть приложение", startapp: str = "") -> InlineKeyboardMarkup:
        """Create inline button to open Mini App"""
        url = "https://t.me/maincomapp_bot/app"
        if startapp:
            url += f"?startapp={startapp}"
        return InlineKeyboardMarkup(inline_keyboard=[
            [InlineKeyboardButton(text=text, url=url)]
        ])

    async def _log_notification(
        self,
        session: AsyncSession,
        user_id: int,
        notification_type: str,
        delivered: bool,
        error_message: Optional[str] = None,
        context: Optional[dict] = None
    ) -> EngagementNotification:
        """Log notification send to database for analytics"""
        notification = EngagementNotification(
            user_id=user_id,
            notification_type=notification_type,
            sent_at=datetime.utcnow(),
            delivered=delivered,
            error_message=error_message,
            context=context or {}
        )
        session.add(notification)
        return notification

    # === PROFILE INCOMPLETE ===

    async def send_profile_incomplete(self, user_id: int) -> bool:
        """Send reminder to complete profile"""
        try:
            text = (
                "👋 Привет! Ты зарегистрировался, но профиль пока пустой.\n\n"
                "Заполни его и получи:\n"
                "✨ +25 XP к рейтингу\n"
                "🔥 Доступ к нетворкингу\n"
                "👥 Возможность найти полезные контакты"
            )

            await self.bot.send_message(
                chat_id=user_id,
                text=text,
                parse_mode="HTML",
                reply_markup=self._get_miniapp_button("Заполнить профиль →", "profile")
            )
            logger.info(f"Sent profile incomplete reminder to user {user_id}")
            return True
        except Exception as e:
            logger.error(f"Failed to send profile incomplete reminder to {user_id}: {e}")
            return False

    async def send_profile_incomplete_batch(self, session: AsyncSession) -> int:
        """Send profile reminders to users registered >24h ago with empty profile"""
        try:
            now = datetime.utcnow()
            cutoff = now - timedelta(hours=24)

            # Get users without profile data who registered more than 24h ago
            # and haven't received this notification yet
            query = select(User).where(
                and_(
                    User.first_seen_at <= cutoff,
                    User.banned == False,
                    User.tg_user_id.isnot(None),
                    User.engagement_profile_sent_at.is_(None)
                )
            )
            result = await session.execute(query)
            users = result.scalars().all()

            sent_count = 0
            for user in users:
                # Check if user has profile via Supabase
                supabase = self._get_supabase()
                if supabase:
                    try:
                        profile = supabase.table("bot_profiles").select("id, bio, occupation").eq(
                            "user_id", user.id
                        ).execute()

                        # Skip if profile has content
                        if profile.data and len(profile.data) > 0:
                            p = profile.data[0]
                            if p.get('bio') or p.get('occupation'):
                                # Profile filled, mark as sent to skip in future
                                user.engagement_profile_sent_at = now
                                continue
                    except Exception as e:
                        logger.warning(f"Failed to check profile for user {user.id}: {e}")

                # Send notification
                if user.tg_user_id:
                    success = await self.send_profile_incomplete(user.tg_user_id)
                    # Log for analytics
                    await self._log_notification(
                        session, user.id, 'profile_incomplete',
                        delivered=success,
                        error_message=None if success else "Telegram send failed"
                    )
                    if success:
                        user.engagement_profile_sent_at = now
                        sent_count += 1

            await session.commit()
            logger.info(f"Sent {sent_count} profile incomplete reminders")
            return sent_count
        except Exception as e:
            logger.error(f"Failed to send profile incomplete batch: {e}")
            return 0

    # === NO SWIPES / NETWORKING INVITE ===

    async def send_no_swipes(self, user_id: int) -> bool:
        """Send networking invitation"""
        try:
            text = (
                "🔥 В нетворкинге уже 100+ участников!\n\n"
                "Среди них предприниматели, маркетологи, разработчики и другие специалисты.\n\n"
                "Попробуй найти полезные контакты — это бесплатно!"
            )

            await self.bot.send_message(
                chat_id=user_id,
                text=text,
                parse_mode="HTML",
                reply_markup=self._get_miniapp_button("Открыть нетворкинг →", "network")
            )
            logger.info(f"Sent networking invite to user {user_id}")
            return True
        except Exception as e:
            logger.error(f"Failed to send networking invite to {user_id}: {e}")
            return False

    async def send_no_swipes_batch(self, session: AsyncSession) -> int:
        """Send networking invites to users registered >48h ago with 0 swipes"""
        try:
            now = datetime.utcnow()
            cutoff = now - timedelta(hours=48)

            # Get users registered more than 48h ago
            # who haven't received this notification yet
            query = select(User).where(
                and_(
                    User.first_seen_at <= cutoff,
                    User.banned == False,
                    User.tg_user_id.isnot(None),
                    User.engagement_swipes_sent_at.is_(None)
                )
            )
            result = await session.execute(query)
            users = result.scalars().all()

            sent_count = 0
            for user in users:
                # Check swipe count via Supabase
                supabase = self._get_supabase()
                has_swipes = False

                if supabase:
                    try:
                        swipes = supabase.table("user_swipes").select("id", count="exact").eq(
                            "swiper_id", user.id
                        ).execute()

                        if swipes.count and swipes.count > 0:
                            has_swipes = True
                    except Exception as e:
                        logger.warning(f"Failed to check swipes for user {user.id}: {e}")

                if has_swipes:
                    # Has swipes, mark as sent to skip in future
                    user.engagement_swipes_sent_at = now
                    continue

                # Send notification
                if user.tg_user_id:
                    success = await self.send_no_swipes(user.tg_user_id)
                    # Log for analytics
                    await self._log_notification(
                        session, user.id, 'no_swipes',
                        delivered=success,
                        error_message=None if success else "Telegram send failed"
                    )
                    if success:
                        user.engagement_swipes_sent_at = now
                        sent_count += 1

            await session.commit()
            logger.info(f"Sent {sent_count} networking invites")
            return sent_count
        except Exception as e:
            logger.error(f"Failed to send networking invites batch: {e}")
            return 0

    # === INACTIVE 7 DAYS ===

    async def send_inactive_7d(self, user_id: int, likes_count: int) -> bool:
        """Send 7-day inactive reminder"""
        try:
            if likes_count > 0:
                text = (
                    f"👀 Пока тебя не было, кое-что произошло...\n\n"
                    f"У тебя {likes_count} новых лайков!\n"
                    f"Кто-то хочет познакомиться 😉"
                )
                button_text = "Посмотреть кто →"
            else:
                text = (
                    "👀 Пока тебя не было, в сообществе появились новые участники!\n\n"
                    "Загляни и посмотри, может найдешь интересные контакты."
                )
                button_text = "Вернуться в приложение →"

            await self.bot.send_message(
                chat_id=user_id,
                text=text,
                parse_mode="HTML",
                reply_markup=self._get_miniapp_button(button_text, "network")
            )
            logger.info(f"Sent 7d inactive reminder to user {user_id}")
            return True
        except Exception as e:
            logger.error(f"Failed to send 7d inactive reminder to {user_id}: {e}")
            return False

    async def send_inactive_7d_batch(self, session: AsyncSession) -> int:
        """Send reminders to users inactive for 7+ days"""
        try:
            now = datetime.utcnow()
            cutoff = now - timedelta(days=7)

            # Get users inactive for 7+ days
            query = select(User).where(
                and_(
                    User.banned == False,
                    User.tg_user_id.isnot(None),
                    User.engagement_inactive_7d_sent_at.is_(None),
                    # Either never opened app or opened more than 7 days ago
                    (
                        (User.last_app_open_at.is_(None) & (User.first_seen_at <= cutoff)) |
                        (User.last_app_open_at <= cutoff)
                    )
                )
            )
            result = await session.execute(query)
            users = result.scalars().all()

            supabase = self._get_supabase()
            sent_count = 0

            for user in users:
                likes_count = 0

                # Get pending likes count
                if supabase:
                    try:
                        likes = supabase.table("user_swipes").select("id", count="exact").eq(
                            "swiped_id", user.id
                        ).eq("action", "like").execute()

                        if likes.count:
                            likes_count = likes.count
                    except Exception as e:
                        logger.warning(f"Failed to get likes for user {user.id}: {e}")

                if user.tg_user_id:
                    success = await self.send_inactive_7d(user.tg_user_id, likes_count)
                    # Log for analytics
                    await self._log_notification(
                        session, user.id, 'inactive_7d',
                        delivered=success,
                        error_message=None if success else "Telegram send failed",
                        context={'likes_count': likes_count}
                    )
                    if success:
                        user.engagement_inactive_7d_sent_at = now
                        sent_count += 1

            await session.commit()
            logger.info(f"Sent {sent_count} 7d inactive reminders")
            return sent_count
        except Exception as e:
            logger.error(f"Failed to send 7d inactive batch: {e}")
            return 0

    # === INACTIVE 14 DAYS ===

    async def send_inactive_14d(self, user_id: int, new_users_count: int) -> bool:
        """Send 14-day inactive reminder"""
        try:
            text = (
                f"😢 Мы скучаем!\n\n"
                f"За 2 недели в сообществе появилось {new_users_count} новых участников.\n"
                f"Возможно, среди них есть полезные контакты для тебя."
            )

            await self.bot.send_message(
                chat_id=user_id,
                text=text,
                parse_mode="HTML",
                reply_markup=self._get_miniapp_button("Вернуться в приложение →", "network")
            )
            logger.info(f"Sent 14d inactive reminder to user {user_id}")
            return True
        except Exception as e:
            logger.error(f"Failed to send 14d inactive reminder to {user_id}: {e}")
            return False

    async def send_inactive_14d_batch(self, session: AsyncSession) -> int:
        """Send reminders to users inactive for 14+ days"""
        try:
            now = datetime.utcnow()
            cutoff = now - timedelta(days=14)
            two_weeks_ago = now - timedelta(days=14)

            # Count new users in last 2 weeks
            supabase = self._get_supabase()
            new_users_count = 50  # Default

            if supabase:
                try:
                    new_users = supabase.table("bot_users").select("id", count="exact").gte(
                        "first_seen_at", two_weeks_ago.isoformat()
                    ).execute()
                    if new_users.count:
                        new_users_count = new_users.count
                except Exception as e:
                    logger.warning(f"Failed to count new users: {e}")

            # Get users inactive for 14+ days (and already got 7d reminder)
            query = select(User).where(
                and_(
                    User.banned == False,
                    User.tg_user_id.isnot(None),
                    User.engagement_inactive_7d_sent_at.isnot(None),  # Already got 7d reminder
                    User.engagement_inactive_14d_sent_at.is_(None),
                    (
                        (User.last_app_open_at.is_(None) & (User.first_seen_at <= cutoff)) |
                        (User.last_app_open_at <= cutoff)
                    )
                )
            )
            result = await session.execute(query)
            users = result.scalars().all()

            sent_count = 0
            for user in users:
                if user.tg_user_id:
                    success = await self.send_inactive_14d(user.tg_user_id, new_users_count)
                    # Log for analytics
                    await self._log_notification(
                        session, user.id, 'inactive_14d',
                        delivered=success,
                        error_message=None if success else "Telegram send failed",
                        context={'new_users_count': new_users_count}
                    )
                    if success:
                        user.engagement_inactive_14d_sent_at = now
                        sent_count += 1

            await session.commit()
            logger.info(f"Sent {sent_count} 14d inactive reminders")
            return sent_count
        except Exception as e:
            logger.error(f"Failed to send 14d inactive batch: {e}")
            return 0

    # === PENDING LIKES ===

    async def send_likes_notification(self, user_id: int, likes_count: int, tier: int) -> bool:
        """Send notification about pending likes"""
        try:
            # Tier-based messages
            if tier == 1:
                text = "❤️ Тебя кто-то лайкнул! Посмотри кто это."
            elif tier == 3:
                text = "🔥 У тебя уже 3 лайка! Не упусти возможность познакомиться."
            elif tier == 5:
                text = "⭐ Вау! 5 человек хотят с тобой связаться!"
            else:  # tier == 10
                text = f"🎉 {likes_count} лайков! Ты популярен! Открой и посмотри кто тебя лайкнул."

            await self.bot.send_message(
                chat_id=user_id,
                text=text,
                parse_mode="HTML",
                reply_markup=self._get_miniapp_button("Посмотреть →", "network")
            )
            logger.info(f"Sent {tier}-likes notification to user {user_id} (total: {likes_count})")
            return True
        except Exception as e:
            logger.error(f"Failed to send likes notification to {user_id}: {e}")
            return False

    async def send_pending_likes_batch(self, session: AsyncSession) -> int:
        """Send notifications about pending likes (1, 3, 5, 10 progression)"""
        try:
            now = datetime.utcnow()
            supabase = self._get_supabase()

            if not supabase:
                logger.warning("Supabase not available for likes notifications")
                return 0

            # Get all active users
            query = select(User).where(
                and_(
                    User.banned == False,
                    User.tg_user_id.isnot(None)
                )
            )
            result = await session.execute(query)
            users = result.scalars().all()

            sent_count = 0

            for user in users:
                # Count pending likes (received likes that haven't been seen)
                try:
                    # Get likes where user was swiped on with 'like'
                    # Exclude likes that resulted in matches
                    likes_response = supabase.table("user_swipes").select("id", count="exact").eq(
                        "swiped_id", user.id
                    ).eq("action", "like").execute()

                    likes_count = likes_response.count or 0

                    if likes_count == 0:
                        continue

                    # Determine which tier notification to send
                    tier_to_send = None
                    tier_field = None

                    if likes_count >= 10 and user.engagement_likes_10_sent_at is None:
                        tier_to_send = 10
                        tier_field = 'engagement_likes_10_sent_at'
                    elif likes_count >= 5 and user.engagement_likes_5_sent_at is None:
                        tier_to_send = 5
                        tier_field = 'engagement_likes_5_sent_at'
                    elif likes_count >= 3 and user.engagement_likes_3_sent_at is None:
                        tier_to_send = 3
                        tier_field = 'engagement_likes_3_sent_at'
                    elif likes_count >= 1 and user.engagement_likes_1_sent_at is None:
                        tier_to_send = 1
                        tier_field = 'engagement_likes_1_sent_at'

                    if tier_to_send and tier_field and user.tg_user_id:
                        success = await self.send_likes_notification(
                            user.tg_user_id, likes_count, tier_to_send
                        )
                        # Log for analytics
                        await self._log_notification(
                            session, user.id, f'likes_{tier_to_send}',
                            delivered=success,
                            error_message=None if success else "Telegram send failed",
                            context={'likes_count': likes_count, 'tier': tier_to_send}
                        )
                        if success:
                            setattr(user, tier_field, now)
                            sent_count += 1

                except Exception as e:
                    logger.warning(f"Failed to check likes for user {user.id}: {e}")
                    continue

            await session.commit()
            logger.info(f"Sent {sent_count} likes notifications")
            return sent_count
        except Exception as e:
            logger.error(f"Failed to send pending likes batch: {e}")
            return 0


# Singleton instance
engagement_service: Optional[EngagementNotificationService] = None


def init_engagement_service(bot: Bot) -> EngagementNotificationService:
    """Initialize the engagement notification service"""
    global engagement_service
    engagement_service = EngagementNotificationService(bot)
    return engagement_service


def get_engagement_service() -> Optional[EngagementNotificationService]:
    """Get the engagement notification service instance"""
    return engagement_service
