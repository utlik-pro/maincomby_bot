"""
Supabase Sync Service
Synchronizes data between local SQLite and Supabase PostgreSQL via REST API.

This service runs in the background and syncs:
- New users to Supabase
- Event registrations
- Feedback
- Questions
- Security logs

Web admin events are synced via webhook or periodic pull.
"""

import asyncio
import os
from datetime import datetime, timedelta
from typing import Optional

from loguru import logger
from supabase._async.client import create_client as create_async_client, AsyncClient
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from ..db.models import User, Event, EventRegistration, EventFeedback, Question, SecurityLog, UserProfile, Match, Swipe
from .notifications import get_notification_service

# Supabase configuration from environment variables
SUPABASE_URL = os.getenv("SUPABASE_URL", "https://ndpkxustvcijykzxqxrn.supabase.co")
SUPABASE_KEY = os.getenv("SUPABASE_ANON_KEY", "")


class SupabaseSync:
    """Syncs data between SQLite and Supabase (async version)"""

    def __init__(self, session_factory, bot=None):
        if not SUPABASE_KEY:
            raise ValueError("SUPABASE_ANON_KEY environment variable is not set")
        self.session_factory = session_factory
        self.bot = bot  # Telegram bot instance for sending broadcasts
        self.supabase: Optional[AsyncClient] = None
        self._running = False
        self._sync_interval = 60  # seconds

    async def start(self):
        """Start background sync loop"""
        # Create async client
        if not self.supabase:
            self.supabase = await create_async_client(SUPABASE_URL, SUPABASE_KEY)
        self._running = True
        logger.info("Starting Supabase sync service...")
        asyncio.create_task(self._sync_loop())

    async def stop(self):
        """Stop background sync loop"""
        self._running = False
        logger.info("Supabase sync service stopped")

    async def _sync_loop(self):
        """Main sync loop - runs periodically"""
        logger.info("Sync loop started, waiting for first sync...")
        while self._running:
            try:
                logger.info("Starting sync cycle...")
                await self.sync_all()
                logger.info("Sync cycle completed")
            except Exception as e:
                logger.error(f"Sync error: {e}", exc_info=True)
            await asyncio.sleep(self._sync_interval)

    async def sync_all(self):
        """Sync all data to Supabase"""
        async with self.session_factory() as session:
            # Pull events from web admin (Supabase → SQLite)
            await self._pull_web_events(session)

            # Process pending broadcasts from web admin
            await self._process_broadcasts(session)

            # Push bot data to Supabase (SQLite → Supabase)
            await self._sync_users(session)
            await self._sync_events(session)
            await self._sync_registrations(session)
            await self._sync_feedback(session)
            await self._sync_questions(session)
            await self._sync_security_logs(session)
            await self._sync_profiles(session)
            await self._sync_swipes(session)
            await self._sync_matches(session)

            # Also sync registrations to web leads table
            await self._sync_registrations_to_leads(session)

            # Send event reminders (24h before events)
            await self._send_event_reminders(session)

    async def sync_user(self, user: User):
        """Sync a single user to Supabase (call after user creation/update)"""
        try:
            # First check if user exists
            existing = await self.supabase.table("bot_users").select("id").eq("tg_user_id", user.tg_user_id).execute()

            user_data = {
                "tg_user_id": user.tg_user_id,
                "username": user.username,
                "first_name": user.first_name,
                "last_name": user.last_name,
                "phone_number": user.phone_number,
                "first_seen_at": user.first_seen_at.isoformat() if user.first_seen_at else None,
                "points": user.points,
                "warns": user.warns,
                "banned": user.banned,
                "source": user.source,
                "utm_source": user.utm_source,
                "utm_medium": user.utm_medium,
                "utm_campaign": user.utm_campaign,
                "referrer": user.referrer,
                "team_role": getattr(user, 'team_role', None)
            }

            if existing.data:
                # Update existing user
                await self.supabase.table("bot_users").update(user_data).eq("tg_user_id", user.tg_user_id).execute()
            else:
                # Insert new user
                await self.supabase.table("bot_users").insert(user_data).execute()

            logger.debug(f"Synced user {user.tg_user_id}")
        except Exception as e:
            logger.debug(f"Failed to sync user {user.tg_user_id}: {e}")

    async def sync_registration(self, reg: EventRegistration):
        """Sync a single registration to Supabase"""
        try:
            await self.supabase.table("bot_registrations").upsert({
                "id": reg.id,
                "event_id": reg.event_id,
                "user_id": reg.user_id,
                "registered_at": reg.registered_at.isoformat() if reg.registered_at else None,
                "status": reg.status,
                "notes": reg.notes,
                "registration_version": getattr(reg, 'registration_version', None),
                "confirmed": getattr(reg, 'confirmed', None),
                "confirmation_requested_at": reg.confirmation_requested_at.isoformat() if getattr(reg, 'confirmation_requested_at', None) else None,
                "reminder_sent": getattr(reg, 'reminder_sent', None),
                "reminder_sent_at": reg.reminder_sent_at.isoformat() if getattr(reg, 'reminder_sent_at', None) else None
            }).execute()
            logger.debug(f"Synced registration {reg.id}")
        except Exception as e:
            logger.debug(f"Failed to sync registration {reg.id}: {e}")

    async def _pull_web_events(self, session: AsyncSession):
        """Pull events from web admin (events table) to local SQLite"""
        try:
            # Fetch events from web admin table
            web_events = await self.supabase.table("events").select("*").eq("is_published", True).execute()

            if not web_events.data:
                logger.debug("No web events to sync")
                return

            synced_count = 0
            for web_event in web_events.data:
                # Find existing event by title
                result = await session.execute(
                    select(Event).where(Event.title == web_event.get("title"))
                )
                local_event = result.scalar_one_or_none()

                # Parse date
                event_date = None
                if web_event.get("date"):
                    try:
                        date_str = web_event["date"]
                        if "T" in date_str:
                            event_date = datetime.fromisoformat(date_str.replace("Z", "+00:00").replace("+00:00", ""))
                        else:
                            event_date = datetime.fromisoformat(date_str)
                    except Exception as e:
                        logger.warning(f"Could not parse date {web_event.get('date')}: {e}")
                        event_date = datetime.utcnow()

                # Prepare event data
                event_data = {
                    "title": web_event.get("title", ""),
                    "description": web_event.get("description"),
                    "event_date": event_date,
                    "city": web_event.get("city", "Минск"),
                    "location": web_event.get("location_name") or web_event.get("location_address"),
                    "location_url": web_event.get("location_url"),
                    "speakers": web_event.get("speaker"),
                    "max_participants": web_event.get("max_participants"),
                    "is_active": web_event.get("is_published", True),
                }

                is_new_event = False
                if local_event:
                    # Update existing
                    for key, value in event_data.items():
                        if value is not None:
                            setattr(local_event, key, value)
                else:
                    # Create new
                    local_event = Event(**event_data)
                    session.add(local_event)
                    is_new_event = True
                    logger.info(f"Created new event from web admin: {event_data['title']}")

                synced_count += 1

                # Send notifications for new events
                if is_new_event and local_event.is_active:
                    await session.flush()  # Get the ID
                    notification_service = get_notification_service()
                    if notification_service:
                        try:
                            sent_count = await notification_service.send_new_event_invitations_batch(
                                session, local_event
                            )
                            logger.info(f"Sent {sent_count} invitations for new event: {local_event.title}")
                        except Exception as e:
                            logger.error(f"Failed to send invitations for event {local_event.title}: {e}")

            await session.commit()
            logger.info(f"Pulled {synced_count} events from web admin")

            # Check for manual notification triggers
            await self._process_event_notification_triggers(session)

        except Exception as e:
            logger.error(f"Error pulling web events: {e}")

    async def _process_event_notification_triggers(self, session: AsyncSession):
        """Process manual notification triggers from admin (send_notifications flag in bot_events)"""
        try:
            # Check for events with send_notifications = true
            events_to_notify = await self.supabase.table("bot_events") \
                .select("*") \
                .eq("send_notifications", True) \
                .execute()

            if not events_to_notify.data:
                return

            notification_service = get_notification_service()
            if not notification_service:
                logger.warning("Notification service not available for manual triggers")
                return

            for event_data in events_to_notify.data:
                event_id = event_data.get("id")

                # Get local event
                result = await session.execute(
                    select(Event).where(Event.id == event_id)
                )
                local_event = result.scalar_one_or_none()

                if local_event:
                    try:
                        sent_count = await notification_service.send_new_event_invitations_batch(
                            session, local_event
                        )
                        logger.info(f"Manual trigger: sent {sent_count} invitations for event {local_event.title}")

                        # Reset the flag
                        await self.supabase.table("bot_events") \
                            .update({"send_notifications": False}) \
                            .eq("id", event_id) \
                            .execute()
                    except Exception as e:
                        logger.error(f"Failed to send notifications for event {event_id}: {e}")
                else:
                    logger.warning(f"Event {event_id} not found in local DB for notification trigger")
                    # Reset flag anyway to prevent infinite loop
                    await self.supabase.table("bot_events") \
                        .update({"send_notifications": False}) \
                        .eq("id", event_id) \
                        .execute()

        except Exception as e:
            # Silently ignore if column doesn't exist
            if "column" not in str(e).lower():
                logger.error(f"Error processing notification triggers: {e}")

    async def _process_broadcasts(self, session: AsyncSession):
        """Process pending broadcasts from web admin"""
        if not self.bot:
            logger.debug("Bot not configured, skipping broadcasts")
            return

        try:
            # Fetch pending broadcasts
            broadcasts = await self.supabase.table("broadcast_queue") \
                .select("*") \
                .eq("status", "pending") \
                .execute()

            if not broadcasts.data:
                return

            for broadcast in broadcasts.data:
                await self._execute_broadcast(session, broadcast)

        except Exception as e:
            logger.error(f"Error processing broadcasts: {e}")

    async def _execute_broadcast(self, session: AsyncSession, broadcast: dict):
        """Execute a single broadcast"""
        broadcast_id = broadcast.get("id")
        target_type = broadcast.get("target_type", "all")
        target_event_id = broadcast.get("target_event_id")
        message_text = broadcast.get("message_text", "")

        try:
            # Update status to in_progress
            await self.supabase.table("broadcast_queue").update({
                "status": "in_progress",
                "started_at": datetime.utcnow().isoformat()
            }).eq("id", broadcast_id).execute()

            # Get target users based on target_type
            users = await self._get_broadcast_targets(session, target_type, target_event_id)

            if not users:
                await self.supabase.table("broadcast_queue").update({
                    "status": "completed",
                    "total_recipients": 0,
                    "sent_count": 0,
                    "completed_at": datetime.utcnow().isoformat()
                }).eq("id", broadcast_id).execute()
                logger.info(f"Broadcast {broadcast_id}: No users to send")
                return

            # Update total recipients
            await self.supabase.table("broadcast_queue").update({
                "total_recipients": len(users)
            }).eq("id", broadcast_id).execute()

            # Send messages
            sent_count = 0
            failed_count = 0

            for user in users:
                try:
                    await self.bot.send_message(
                        chat_id=user.tg_user_id,
                        text=message_text,
                        parse_mode="HTML"
                    )
                    sent_count += 1
                    await asyncio.sleep(0.05)  # Anti-flood: 20 messages per second
                except Exception as e:
                    error_msg = str(e).lower()
                    if "blocked" in error_msg or "deactivated" in error_msg:
                        failed_count += 1
                    else:
                        failed_count += 1
                        logger.debug(f"Failed to send to {user.tg_user_id}: {e}")

            # Update final status
            await self.supabase.table("broadcast_queue").update({
                "status": "completed",
                "sent_count": sent_count,
                "failed_count": failed_count,
                "completed_at": datetime.utcnow().isoformat()
            }).eq("id", broadcast_id).execute()

            logger.info(f"Broadcast {broadcast_id} completed: {sent_count} sent, {failed_count} failed")

        except Exception as e:
            logger.error(f"Error executing broadcast {broadcast_id}: {e}")
            await self.supabase.table("broadcast_queue").update({
                "status": "failed",
                "error_message": str(e)[:500],
                "completed_at": datetime.utcnow().isoformat()
            }).eq("id", broadcast_id).execute()

    async def _get_broadcast_targets(self, session: AsyncSession, target_type: str, target_event_id: str = None) -> list:
        """Get list of users for broadcast based on target type"""
        try:
            if target_type == "all":
                # All non-banned users
                result = await session.execute(
                    select(User).where(User.banned == False)
                )
                return result.scalars().all()

            elif target_type == "event_registered" and target_event_id:
                # Users registered for specific event
                # First find local event by web_event_id or title
                web_event = await self.supabase.table("events").select("title").eq("id", target_event_id).execute()
                if not web_event.data:
                    return []

                event_title = web_event.data[0].get("title")
                event_result = await session.execute(
                    select(Event).where(Event.title == event_title)
                )
                local_event = event_result.scalar_one_or_none()
                if not local_event:
                    return []

                result = await session.execute(
                    select(User)
                    .join(EventRegistration, EventRegistration.user_id == User.id)
                    .where(
                        EventRegistration.event_id == local_event.id,
                        EventRegistration.status == "registered",
                        User.banned == False
                    )
                )
                return result.scalars().all()

            elif target_type == "event_not_registered" and target_event_id:
                # Users NOT registered for specific event
                web_event = await self.supabase.table("events").select("title").eq("id", target_event_id).execute()
                if not web_event.data:
                    return []

                event_title = web_event.data[0].get("title")
                event_result = await session.execute(
                    select(Event).where(Event.title == event_title)
                )
                local_event = event_result.scalar_one_or_none()

                if local_event:
                    # Get registered user IDs
                    reg_result = await session.execute(
                        select(EventRegistration.user_id)
                        .where(
                            EventRegistration.event_id == local_event.id,
                            EventRegistration.status == "registered"
                        )
                    )
                    registered_ids = {row[0] for row in reg_result.all()}

                    # Get all users except registered
                    result = await session.execute(
                        select(User).where(
                            User.banned == False,
                            User.id.not_in(registered_ids) if registered_ids else True
                        )
                    )
                    return result.scalars().all()
                else:
                    # No local event, return all users
                    result = await session.execute(
                        select(User).where(User.banned == False)
                    )
                    return result.scalars().all()

            return []

        except Exception as e:
            logger.error(f"Error getting broadcast targets: {e}")
            return []

    async def _sync_registrations_to_leads(self, session: AsyncSession):
        """Sync bot registrations to web leads table"""
        try:
            # Get registrations with user and event data
            result = await session.execute(
                select(EventRegistration, User, Event)
                .join(User, EventRegistration.user_id == User.id)
                .join(Event, EventRegistration.event_id == Event.id)
                .where(EventRegistration.status == "registered")
            )
            registrations = result.all()

            synced_count = 0
            for reg, user, event in registrations:
                try:
                    # Find web event by title
                    web_events = await self.supabase.table("events").select("id").eq("title", event.title).execute()
                    if not web_events.data:
                        continue

                    web_event_id = web_events.data[0]["id"]

                    # Check if lead already exists
                    existing = await self.supabase.table("leads").select("id").eq("event_id", web_event_id).eq("telegram_id", user.tg_user_id).execute()
                    if existing.data:
                        continue

                    # Create lead
                    lead_data = {
                        "event_id": web_event_id,
                        "name": f"{user.first_name or ''} {user.last_name or ''}".strip() or user.username or "Unknown",
                        "phone": user.phone_number,
                        "telegram_username": user.username,
                        "telegram_id": user.tg_user_id,
                        "source": "telegram_bot",
                        "status": "registered",
                        "notes": f"Зарегистрирован через бота {reg.registered_at.strftime('%d.%m.%Y %H:%M') if reg.registered_at else ''}"
                    }

                    await self.supabase.table("leads").insert(lead_data).execute()
                    synced_count += 1

                except Exception as e:
                    logger.debug(f"Error syncing registration {reg.id} to leads: {e}")

            if synced_count > 0:
                logger.info(f"Synced {synced_count} registrations to web leads")

        except Exception as e:
            logger.error(f"Error syncing registrations to leads: {e}")

    async def _sync_users(self, session: AsyncSession):
        """Sync all users to Supabase"""
        result = await session.execute(select(User))
        users = result.scalars().all()

        for user in users:
            await self.sync_user(user)

        logger.info(f"Synced {len(users)} users to Supabase")

    async def _sync_events(self, session: AsyncSession):
        """Sync events to Supabase"""
        result = await session.execute(select(Event))
        events = result.scalars().all()

        for event in events:
            try:
                await self.supabase.table("bot_events").upsert({
                    "id": event.id,
                    "title": event.title,
                    "description": event.description,
                    "event_date": event.event_date.isoformat() if event.event_date else None,
                    "city": getattr(event, 'city', None),
                    "location": getattr(event, 'location', None),
                    "location_url": getattr(event, 'location_url', None),
                    "speakers": getattr(event, 'speakers', None),
                    "max_participants": getattr(event, 'max_participants', None),
                    "registration_deadline": event.registration_deadline.isoformat() if getattr(event, 'registration_deadline', None) else None,
                    "is_active": getattr(event, 'is_active', True),
                    "created_at": event.created_at.isoformat() if getattr(event, 'created_at', None) else None,
                    "created_by": getattr(event, 'created_by', None)
                }).execute()
            except Exception as e:
                logger.debug(f"Failed to sync event {event.id}: {e}")

        logger.info(f"Synced {len(events)} events to Supabase")

    async def _sync_registrations(self, session: AsyncSession):
        """Sync registrations to Supabase"""
        result = await session.execute(select(EventRegistration))
        regs = result.scalars().all()

        for reg in regs:
            await self.sync_registration(reg)

        logger.info(f"Synced {len(regs)} registrations to Supabase")

    async def _sync_feedback(self, session: AsyncSession):
        """Sync feedback to Supabase"""
        result = await session.execute(select(EventFeedback))
        feedback_list = result.scalars().all()

        synced = 0
        for fb in feedback_list:
            try:
                await self.supabase.table("bot_feedback").upsert({
                    "id": fb.id,
                    "event_id": fb.event_id,
                    "user_id": fb.user_id,
                    "speaker1_rating": getattr(fb, 'speaker1_rating', None),
                    "speaker2_rating": getattr(fb, 'speaker2_rating', None),
                    "comment": getattr(fb, 'comment', None),
                    "interested_topics": getattr(fb, 'interested_topics', None),
                    "created_at": fb.created_at.isoformat() if fb.created_at else None
                }).execute()
                synced += 1
            except Exception as e:
                logger.debug(f"Failed to sync feedback {fb.id}: {e}")

        if synced > 0:
            logger.info(f"Synced {synced}/{len(feedback_list)} feedback entries to Supabase")

    async def _sync_questions(self, session: AsyncSession):
        """Sync questions to Supabase"""
        result = await session.execute(select(Question))
        questions = result.scalars().all()

        for q in questions:
            try:
                await self.supabase.table("bot_questions").upsert({
                    "id": q.id,
                    "user_id": q.user_id,
                    "username": getattr(q, 'username', None),
                    "chat_id": getattr(q, 'chat_id', None),
                    "message_id": getattr(q, 'message_id', None),
                    "question_text": getattr(q, 'question_text', None),
                    "answer_text": getattr(q, 'answer_text', None),
                    "question_type": getattr(q, 'question_type', None),
                    "answered": getattr(q, 'answered', False),
                    "created_at": q.created_at.isoformat() if getattr(q, 'created_at', None) else None,
                    "answered_at": q.answered_at.isoformat() if getattr(q, 'answered_at', None) else None
                }).execute()
            except Exception as e:
                logger.debug(f"Failed to sync question {q.id}: {e}")

        logger.info(f"Synced {len(questions)} questions to Supabase")

    async def _sync_security_logs(self, session: AsyncSession):
        """Sync security logs to Supabase"""
        result = await session.execute(select(SecurityLog))
        logs = result.scalars().all()

        for log in logs:
            try:
                await self.supabase.table("bot_security_logs").upsert({
                    "id": log.id,
                    "user_id": log.user_id,
                    "username": getattr(log, 'username', None),
                    "chat_id": getattr(log, 'chat_id', None),
                    "attack_type": getattr(log, 'attack_type', None),
                    "user_input": getattr(log, 'user_input', None),
                    "detection_reason": getattr(log, 'detection_reason', None),
                    "action_taken": getattr(log, 'action_taken', None),
                    "created_at": log.created_at.isoformat() if getattr(log, 'created_at', None) else None
                }).execute()
            except Exception as e:
                logger.debug(f"Failed to sync security log {log.id}: {e}")

        logger.info(f"Synced {len(logs)} security logs to Supabase")

    async def _sync_profiles(self, session: AsyncSession):
        """Sync user profiles to Supabase"""
        result = await session.execute(select(UserProfile))
        profiles = result.scalars().all()

        for p in profiles:
            try:
                await self.supabase.table("bot_profiles").upsert({
                    "id": p.id,
                    "user_id": p.user_id,
                    "bio": getattr(p, 'bio', None),
                    "occupation": getattr(p, 'occupation', None),
                    "looking_for": getattr(p, 'looking_for', None),
                    "can_help_with": getattr(p, 'can_help_with', None),
                    "needs_help_with": getattr(p, 'needs_help_with', None),
                    "photo_file_id": getattr(p, 'photo_file_id', None),
                    "city": getattr(p, 'city', None),
                    "moderation_status": getattr(p, 'moderation_status', None),
                    "is_visible": getattr(p, 'is_visible', True),
                    "created_at": p.created_at.isoformat() if getattr(p, 'created_at', None) else None,
                    "updated_at": p.updated_at.isoformat() if getattr(p, 'updated_at', None) else None
                }).execute()
            except Exception as e:
                logger.debug(f"Failed to sync profile {p.id}: {e}")

        logger.info(f"Synced {len(profiles)} profiles to Supabase")

    async def _sync_swipes(self, session: AsyncSession):
        """Sync swipes to Supabase"""
        result = await session.execute(select(Swipe))
        swipes = result.scalars().all()

        for s in swipes:
            try:
                await self.supabase.table("bot_swipes").upsert({
                    "id": s.id,
                    "swiper_id": s.swiper_id,
                    "swiped_id": s.swiped_id,
                    "action": getattr(s, 'action', None),
                    "swiped_at": s.swiped_at.isoformat() if getattr(s, 'swiped_at', None) else None
                }).execute()
            except Exception as e:
                logger.debug(f"Failed to sync swipe {s.id}: {e}")

        logger.info(f"Synced {len(swipes)} swipes to Supabase")

    async def _sync_matches(self, session: AsyncSession):
        """Sync matches to Supabase"""
        result = await session.execute(select(Match))
        matches = result.scalars().all()

        for m in matches:
            try:
                await self.supabase.table("bot_matches").upsert({
                    "id": m.id,
                    "user1_id": m.user1_id,
                    "user2_id": m.user2_id,
                    "matched_at": m.matched_at.isoformat() if getattr(m, 'matched_at', None) else None,
                    "is_active": getattr(m, 'is_active', True)
                }).execute()
            except Exception as e:
                logger.debug(f"Failed to sync match {m.id}: {e}")

        logger.info(f"Synced {len(matches)} matches to Supabase")

    async def _send_event_reminders(self, session: AsyncSession):
        """Send reminders for events happening in ~24 hours"""
        if not self.bot:
            return

        try:
            from sqlalchemy import and_

            now = datetime.now()
            reminder_start = now + timedelta(hours=23)
            reminder_end = now + timedelta(hours=25)

            # Find events in reminder window
            result = await session.execute(
                select(Event).where(
                    and_(
                        Event.event_date >= reminder_start,
                        Event.event_date <= reminder_end,
                        Event.is_active == True
                    )
                )
            )
            events = result.scalars().all()

            if not events:
                return

            from .notifications import get_notification_service
            notification_service = get_notification_service()

            if not notification_service:
                return

            sent_count = 0
            for event in events:
                # Check if we already sent reminders (use a simple check - could add a flag in DB)
                # For now, we'll rely on the time window being checked every minute

                # Get registered users
                reg_result = await session.execute(
                    select(EventRegistration).where(
                        and_(
                            EventRegistration.event_id == event.id,
                            EventRegistration.status == 'registered'
                        )
                    )
                )
                registrations = reg_result.scalars().all()

                for reg in registrations:
                    user_result = await session.execute(
                        select(User).where(User.id == reg.user_id)
                    )
                    user = user_result.scalar_one_or_none()

                    if user and user.tg_user_id:
                        try:
                            success = await notification_service.send_event_reminder(
                                user.tg_user_id, event
                            )
                            if success:
                                sent_count += 1
                        except Exception as e:
                            logger.debug(f"Failed to send reminder to {user.tg_user_id}: {e}")

            if sent_count > 0:
                logger.info(f"Sent {sent_count} event reminders")

        except Exception as e:
            logger.error(f"Error sending event reminders: {e}")


# Global instance
_sync_service: Optional[SupabaseSync] = None


def get_sync_service() -> Optional[SupabaseSync]:
    """Get the global sync service instance"""
    return _sync_service


def set_sync_service(service: SupabaseSync):
    """Set the global sync service instance"""
    global _sync_service
    _sync_service = service
