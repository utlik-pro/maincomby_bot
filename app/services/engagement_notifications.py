"""
Engagement Notification Service for MAIN Community Bot

Smart Queue System - Max 1 engagement notification per day per user.
Priority order (high to low):
1. Likes - most important, motivates return
2. Events - upcoming event invitation (onboarding day 3)
3. Profile - fill profile reminder (24h)
4. Networking - try swipes (48h)
5. Inactive - 7d/14d without activity
6. Feedback - how do you like the community? (7d)
"""

from datetime import datetime, timedelta
from typing import Optional, Tuple, Dict, Any
import logging

from aiogram import Bot
from aiogram.types import InlineKeyboardMarkup, InlineKeyboardButton
from sqlalchemy import select, and_, or_, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models import User, UserProfile, Swipe, EngagementNotification

from supabase import create_client, Client
import os

# Supabase configuration
SUPABASE_URL = os.getenv("SUPABASE_URL", "https://ndpkxustvcijykzxqxrn.supabase.co")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_KEY") or os.getenv("SUPABASE_ANON_KEY", "")

logger = logging.getLogger(__name__)

# Notification types in priority order
NOTIFICATION_TYPES = ['likes', 'event_invite', 'profile', 'swipes', 'inactive', 'feedback']


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

    # === SMART QUEUE - Main Entry Point ===

    async def process_engagement_queue_batch(self, session: AsyncSession) -> Dict[str, int]:
        """Process engagement notification queue for all users.

        Rules:
        - Max 1 engagement notification per day per user
        - Skip if last_engagement_sent_at is today
        - Check conditions by priority order
        - Send first matching notification
        - Update last_engagement_sent_at

        Returns:
            Dict with counts by notification type
        """
        now = datetime.utcnow()
        today_start = datetime.combine(now.date(), datetime.min.time())

        stats = {t: 0 for t in NOTIFICATION_TYPES}
        stats['skipped_today'] = 0
        stats['no_notification'] = 0

        # Get users who can receive notifications:
        # - Not banned
        # - Bot started (can receive messages)
        # - Haven't received engagement notification today
        query = select(User).where(
            and_(
                User.banned == False,
                User.bot_started == True,
                User.tg_user_id.isnot(None),
                or_(
                    User.last_engagement_sent_at.is_(None),
                    User.last_engagement_sent_at < today_start
                )
            )
        )
        result = await session.execute(query)
        users = result.scalars().all()

        logger.info(f"Smart queue: checking {len(users)} eligible users")

        for user in users:
            try:
                notification_type, context = await self._get_next_notification(session, user, now)

                if notification_type:
                    success = await self._send_queued_notification(user, notification_type, context)

                    if success:
                        # Update last sent timestamp (prevents more than 1 per day)
                        user.last_engagement_sent_at = now

                        # Update specific tracking field for this notification type
                        self._mark_notification_sent(user, notification_type, context, now)

                        # Log for analytics
                        await self._log_notification(
                            session, user.id, f'queue_{notification_type}',
                            delivered=True,
                            context=context
                        )
                        stats[notification_type] += 1
                else:
                    stats['no_notification'] += 1

            except Exception as e:
                logger.error(f"Queue processing failed for user {user.id}: {e}")
                continue

        await session.commit()

        total_sent = sum(stats[t] for t in NOTIFICATION_TYPES)
        logger.info(f"Smart queue completed: {total_sent} sent - {stats}")

        return stats

    async def _get_next_notification(
        self, session: AsyncSession, user: User, now: datetime
    ) -> Tuple[Optional[str], Dict[str, Any]]:
        """Determine which notification to send based on priority.

        Priority order:
        1. Likes - pending likes
        2. Event invite - upcoming event (onboarding)
        3. Profile - incomplete profile (24h)
        4. Swipes - no swipes (48h)
        5. Inactive - 7d/14d inactive
        6. Feedback - user for 7 days

        Returns:
            Tuple of (notification_type, context_dict) or (None, {})
        """
        context: Dict[str, Any] = {}

        # 1. LIKES - Check for pending likes (highest priority)
        likes_count = await self._check_pending_likes(user)
        if likes_count > 0:
            # Only send if we haven't sent this tier yet
            tier = self._get_likes_tier(likes_count, user)
            if tier:
                context = {'likes_count': likes_count, 'tier': tier}
                return ('likes', context)

        # 2. EVENT INVITE - Check for upcoming events (onboarding day 3+)
        if await self._should_send_event_invite(user, now):
            event = await self._get_upcoming_event()
            if event:
                context = {'event': event}
                return ('event_invite', context)

        # 3. PROFILE - Check if profile is incomplete (24h after registration)
        if await self._should_send_profile_reminder(user, now):
            return ('profile', {})

        # 4. SWIPES - Check if user has no swipes (48h after registration)
        if await self._should_send_swipes_invite(user, now):
            return ('swipes', {})

        # 5. INACTIVE - Check for 7d/14d inactivity
        inactive_type = self._check_inactive_status(user, now)
        if inactive_type:
            if inactive_type == '7d':
                context = {'likes_count': likes_count}
            else:  # 14d
                context = {'new_users_count': await self._count_new_users()}
            return ('inactive', context)

        # 6. FEEDBACK - Check if user is 7+ days old (onboarding complete)
        if self._should_send_feedback_request(user, now):
            return ('feedback', {})

        return (None, {})

    async def _send_queued_notification(
        self, user: User, notification_type: str, context: Dict[str, Any]
    ) -> bool:
        """Send a notification based on type."""
        try:
            if notification_type == 'likes':
                return await self.send_likes_notification(
                    user.tg_user_id,
                    context.get('likes_count', 1),
                    context.get('tier', 1)
                )

            elif notification_type == 'event_invite':
                return await self._send_event_invite(user.tg_user_id, context.get('event'))

            elif notification_type == 'profile':
                return await self.send_profile_incomplete(user.tg_user_id)

            elif notification_type == 'swipes':
                return await self.send_no_swipes(user.tg_user_id)

            elif notification_type == 'inactive':
                likes = context.get('likes_count', 0)
                new_users = context.get('new_users_count', 50)
                if likes > 0 or not context.get('new_users_count'):
                    return await self.send_inactive_7d(user.tg_user_id, likes)
                else:
                    return await self.send_inactive_14d(user.tg_user_id, new_users)

            elif notification_type == 'feedback':
                return await self._send_feedback_request(user.tg_user_id)

            return False
        except Exception as e:
            logger.error(f"Failed to send {notification_type} to {user.tg_user_id}: {e}")
            return False

    def _mark_notification_sent(
        self, user: User, notification_type: str, context: Dict[str, Any], now: datetime
    ) -> None:
        """Mark specific tracking field when notification is sent."""
        if notification_type == 'likes':
            tier = context.get('tier', 1)
            if tier == 1:
                user.engagement_likes_1_sent_at = now
            elif tier == 3:
                user.engagement_likes_3_sent_at = now
            elif tier == 5:
                user.engagement_likes_5_sent_at = now
            elif tier == 10:
                user.engagement_likes_10_sent_at = now

        elif notification_type == 'event_invite':
            user.onboarding_event_sent_at = now

        elif notification_type == 'profile':
            user.engagement_profile_sent_at = now

        elif notification_type == 'swipes':
            user.engagement_swipes_sent_at = now

        elif notification_type == 'inactive':
            # Mark based on which inactive type was sent
            if user.engagement_inactive_7d_sent_at is None:
                user.engagement_inactive_7d_sent_at = now
            else:
                user.engagement_inactive_14d_sent_at = now

        elif notification_type == 'feedback':
            user.onboarding_feedback_sent_at = now

    # === Queue Helper Methods ===

    async def _check_pending_likes(self, user: User) -> int:
        """Check how many pending likes the user has."""
        supabase = self._get_supabase()
        if not supabase:
            return 0

        try:
            likes = supabase.table("user_swipes").select("id", count="exact").eq(
                "swiped_id", user.id
            ).eq("action", "like").execute()
            return likes.count or 0
        except Exception as e:
            logger.warning(f"Failed to check likes for user {user.id}: {e}")
            return 0

    def _get_likes_tier(self, likes_count: int, user: User) -> Optional[int]:
        """Get the tier for likes notification (1, 3, 5, 10).

        Returns tier if we should send, None if already sent this tier.
        """
        if likes_count >= 10 and user.engagement_likes_10_sent_at is None:
            return 10
        elif likes_count >= 5 and user.engagement_likes_5_sent_at is None:
            return 5
        elif likes_count >= 3 and user.engagement_likes_3_sent_at is None:
            return 3
        elif likes_count >= 1 and user.engagement_likes_1_sent_at is None:
            return 1
        return None

    async def _should_send_event_invite(self, user: User, now: datetime) -> bool:
        """Check if we should send event invite (onboarding day 3+)."""
        # Skip if already sent
        if user.onboarding_event_sent_at is not None:
            return False

        # Only send after 3 days of registration
        if user.first_seen_at is None:
            return False

        days_since_registration = (now - user.first_seen_at).days
        return days_since_registration >= 3

    async def _get_upcoming_event(self) -> Optional[Dict[str, Any]]:
        """Get the nearest upcoming event."""
        supabase = self._get_supabase()
        if not supabase:
            return None

        try:
            now = datetime.utcnow()
            events = supabase.table("bot_events").select(
                "id, title, location, date"
            ).gte(
                "date", now.isoformat()
            ).eq(
                "is_test", False
            ).order("date").limit(1).execute()

            if events.data and len(events.data) > 0:
                return events.data[0]
            return None
        except Exception as e:
            logger.warning(f"Failed to get upcoming event: {e}")
            return None

    async def _should_send_profile_reminder(self, user: User, now: datetime) -> bool:
        """Check if we should send profile completion reminder."""
        # Skip if already sent
        if user.engagement_profile_sent_at is not None:
            return False

        # Only send after 24h of registration
        if user.first_seen_at is None:
            return False

        hours_since_registration = (now - user.first_seen_at).total_seconds() / 3600
        if hours_since_registration < 24:
            return False

        # Check if profile is actually incomplete
        supabase = self._get_supabase()
        if supabase:
            try:
                profile = supabase.table("bot_profiles").select("id, bio, occupation").eq(
                    "user_id", user.id
                ).execute()

                if profile.data and len(profile.data) > 0:
                    p = profile.data[0]
                    if p.get('bio') or p.get('occupation'):
                        # Profile is filled, don't send
                        return False
            except Exception as e:
                logger.warning(f"Failed to check profile for user {user.id}: {e}")

        return True

    async def _should_send_swipes_invite(self, user: User, now: datetime) -> bool:
        """Check if we should send networking/swipes invitation."""
        # Skip if already sent
        if user.engagement_swipes_sent_at is not None:
            return False

        # Only send after 48h of registration
        if user.first_seen_at is None:
            return False

        hours_since_registration = (now - user.first_seen_at).total_seconds() / 3600
        if hours_since_registration < 48:
            return False

        # Check if user has any swipes
        supabase = self._get_supabase()
        if supabase:
            try:
                swipes = supabase.table("user_swipes").select("id", count="exact").eq(
                    "swiper_id", user.id
                ).execute()

                if swipes.count and swipes.count > 0:
                    # Has swipes, don't send
                    return False
            except Exception as e:
                logger.warning(f"Failed to check swipes for user {user.id}: {e}")

        return True

    def _check_inactive_status(self, user: User, now: datetime) -> Optional[str]:
        """Check if user is inactive and which reminder to send.

        Returns '7d', '14d', or None.
        """
        cutoff_7d = now - timedelta(days=7)
        cutoff_14d = now - timedelta(days=14)

        # Determine last activity
        last_activity = user.last_app_open_at or user.first_seen_at
        if not last_activity:
            return None

        # Check 14d first (if already got 7d reminder)
        if user.engagement_inactive_7d_sent_at is not None:
            if user.engagement_inactive_14d_sent_at is None and last_activity <= cutoff_14d:
                return '14d'

        # Check 7d
        if user.engagement_inactive_7d_sent_at is None and last_activity <= cutoff_7d:
            return '7d'

        return None

    async def _count_new_users(self) -> int:
        """Count new users in last 2 weeks."""
        supabase = self._get_supabase()
        if not supabase:
            return 50

        try:
            two_weeks_ago = datetime.utcnow() - timedelta(days=14)
            new_users = supabase.table("bot_users").select("id", count="exact").gte(
                "first_seen_at", two_weeks_ago.isoformat()
            ).execute()
            return new_users.count or 50
        except Exception as e:
            logger.warning(f"Failed to count new users: {e}")
            return 50

    def _should_send_feedback_request(self, user: User, now: datetime) -> bool:
        """Check if we should send feedback request (7 days after registration)."""
        # Skip if already sent
        if user.onboarding_feedback_sent_at is not None:
            return False

        # Only send after 7 days of registration
        if user.first_seen_at is None:
            return False

        days_since_registration = (now - user.first_seen_at).days
        return days_since_registration >= 7

    async def _send_event_invite(self, user_id: int, event: Optional[Dict[str, Any]]) -> bool:
        """Send event invitation notification."""
        try:
            if not event:
                return False

            title = event.get('title', 'Мероприятие')
            location = event.get('location', '')
            date_str = event.get('date', '')

            # Format date
            try:
                date = datetime.fromisoformat(date_str.replace('Z', '+00:00'))
                formatted_date = date.strftime('%d.%m в %H:%M')
            except:
                formatted_date = date_str

            text = (
                f"📅 Скоро мероприятие!\n\n"
                f"<b>{title}</b>\n"
            )
            if location:
                text += f"📍 {location}\n"
            text += f"🗓 {formatted_date}\n\n"
            text += "Познакомься с сообществом вживую!"

            await self.bot.send_message(
                chat_id=user_id,
                text=text,
                parse_mode="HTML",
                reply_markup=self._get_miniapp_button("Зарегистрироваться →", f"event_{event.get('id', '')}")
            )
            logger.info(f"Sent event invite to user {user_id}")
            return True
        except Exception as e:
            logger.error(f"Failed to send event invite to {user_id}: {e}")
            return False

    async def _send_feedback_request(self, user_id: int) -> bool:
        """Send feedback request notification."""
        try:
            text = (
                "💬 Ты с нами уже неделю!\n\n"
                "Как тебе MAIN Community?\n"
                "Твой feedback поможет сделать сообщество лучше."
            )

            await self.bot.send_message(
                chat_id=user_id,
                text=text,
                parse_mode="HTML",
                reply_markup=self._get_miniapp_button("Оставить отзыв →", "feedback")
            )
            logger.info(f"Sent feedback request to user {user_id}")
            return True
        except Exception as e:
            logger.error(f"Failed to send feedback request to {user_id}: {e}")
            return False

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

    # === PROFILE COMPLETION PRO REWARD ===

    # Promotion deadline: January 25, 2026 23:59:59 UTC
    PROMO_DEADLINE = datetime(2026, 1, 25, 23, 59, 59)

    async def award_profile_completion_pro_batch(self, session: AsyncSession) -> int:
        """Award PRO to users with complete profile + photo.

        Promotion until Jan 25, 2026 23:59: 7 days PRO + 500 XP
        After promotion: 3 days PRO + 100 XP

        Conditions:
        - profile has bio and occupation filled
        - has at least 1 photo in profile_photos
        - hasn't received this reward yet (profile_completion_pro_awarded_at is NULL)
        """
        now = datetime.utcnow()
        awarded_count = 0

        # Check if we're in promo period
        is_promo = now <= self.PROMO_DEADLINE
        pro_days = 7 if is_promo else 3
        xp_reward = 500 if is_promo else 100

        logger.info(f"Profile completion PRO: promo={is_promo}, days={pro_days}, xp={xp_reward}")

        # Get users who haven't received this reward yet
        query = select(User).where(
            and_(
                User.banned == False,
                User.profile_completion_pro_awarded_at.is_(None)
            )
        )
        result = await session.execute(query)
        users = result.scalars().all()

        supabase = self._get_supabase()
        if not supabase:
            logger.warning("Supabase not available for profile completion PRO")
            return 0

        logger.info(f"Checking {len(users)} users for profile completion PRO reward")

        for user in users:
            try:
                # Check profile completion (bio + occupation)
                profile = supabase.table("bot_profiles").select("bio, occupation").eq(
                    "user_id", user.id
                ).execute()

                if not profile.data or len(profile.data) == 0:
                    continue  # No profile

                p = profile.data[0]
                if not p.get('bio') or not p.get('occupation'):
                    continue  # Profile not complete

                # Check for photos
                photos = supabase.table("profile_photos").select("id", count="exact").eq(
                    "user_id", user.id
                ).execute()

                if not photos.count or photos.count == 0:
                    continue  # No photos

                # All conditions met - award PRO!
                # Calculate expiration (extend if already PRO)
                if user.subscription_tier == 'pro' and user.subscription_expires_at and user.subscription_expires_at > now:
                    expires_at = user.subscription_expires_at + timedelta(days=pro_days)
                else:
                    expires_at = now + timedelta(days=pro_days)

                user.subscription_tier = 'pro'
                user.subscription_expires_at = expires_at
                user.profile_completion_pro_awarded_at = now

                # Award XP
                user.points += xp_reward

                # Send notification
                if user.tg_user_id and user.bot_started:
                    await self._send_profile_pro_reward_notification(user.tg_user_id, pro_days, xp_reward)

                # Log for analytics
                await self._log_notification(
                    session, user.id, 'profile_completion_pro',
                    delivered=True,
                    context={
                        'expires_at': expires_at.isoformat(),
                        'pro_days': pro_days,
                        'xp_reward': xp_reward,
                        'is_promo': is_promo
                    }
                )

                awarded_count += 1
                logger.info(f"Awarded {pro_days}-day PRO + {xp_reward} XP to user {user.id} for profile completion")

            except Exception as e:
                logger.error(f"Failed to check/award PRO to user {user.id}: {e}")
                continue

        await session.commit()
        logger.info(f"Profile completion PRO: {awarded_count} users awarded")
        return awarded_count

    async def _send_profile_pro_reward_notification(self, user_id: int, pro_days: int = 3, xp_reward: int = 100) -> bool:
        """Send notification about profile completion PRO reward."""
        try:
            text = (
                f"🎉 <b>Поздравляем!</b>\n\n"
                f"Ты заполнил профиль и добавил фото — получи:\n\n"
                f"⭐ PRO подписку на {pro_days} дней\n"
                f"✨ +{xp_reward} XP к рейтингу\n\n"
                f"Теперь тебе доступны:\n"
                f"• Безлимитные свайпы\n"
                f"• Смотреть кто тебя лайкнул\n"
                f"• 5 суперлайков в день"
            )

            await self.bot.send_message(
                chat_id=user_id,
                text=text,
                parse_mode="HTML",
                reply_markup=self._get_miniapp_button("Открыть →", "network")
            )
            logger.info(f"Sent profile PRO reward notification to user {user_id}")
            return True
        except Exception as e:
            logger.error(f"Failed to send profile PRO reward notification to {user_id}: {e}")
            return False


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
