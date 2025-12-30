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
import logging
from datetime import datetime, timedelta
from typing import Optional

from supabase import create_client, Client
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from ..db.models import User, Event, EventRegistration, EventFeedback, Question, SecurityLog, UserProfile, Match, Swipe

logger = logging.getLogger(__name__)

# Supabase configuration
SUPABASE_URL = "https://ndpkxustvcijykzxqxrn.supabase.co"
SUPABASE_KEY = "sb_publishable_SBb7mMchz99ZIfoPgnxQDQ_bbQpePNZ"


class SupabaseSync:
    """Syncs data between SQLite and Supabase"""

    def __init__(self, session_factory):
        self.session_factory = session_factory
        self.supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
        self._running = False
        self._sync_interval = 60  # seconds

    async def start(self):
        """Start background sync loop"""
        self._running = True
        logger.info("Starting Supabase sync service...")
        asyncio.create_task(self._sync_loop())

    async def stop(self):
        """Stop background sync loop"""
        self._running = False
        logger.info("Supabase sync service stopped")

    async def _sync_loop(self):
        """Main sync loop - runs periodically"""
        while self._running:
            try:
                await self.sync_all()
            except Exception as e:
                logger.error(f"Sync error: {e}")
            await asyncio.sleep(self._sync_interval)

    async def sync_all(self):
        """Sync all data to Supabase"""
        async with self.session_factory() as session:
            # Pull events from web admin (Supabase → SQLite)
            await self._pull_web_events(session)

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

    async def sync_user(self, user: User):
        """Sync a single user to Supabase (call after user creation/update)"""
        try:
            self.supabase.table("bot_users").upsert({
                "id": user.id,
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
                "referrer": user.referrer
            }).execute()
            logger.debug(f"Synced user {user.tg_user_id}")
        except Exception as e:
            logger.error(f"Failed to sync user {user.tg_user_id}: {e}")

    async def sync_registration(self, reg: EventRegistration):
        """Sync a single registration to Supabase"""
        try:
            self.supabase.table("bot_registrations").upsert({
                "id": reg.id,
                "event_id": reg.event_id,
                "user_id": reg.user_id,
                "registered_at": reg.registered_at.isoformat() if reg.registered_at else None,
                "status": reg.status,
                "notes": reg.notes,
                "registration_version": reg.registration_version,
                "confirmed": reg.confirmed,
                "confirmation_requested_at": reg.confirmation_requested_at.isoformat() if reg.confirmation_requested_at else None,
                "reminder_sent": reg.reminder_sent,
                "reminder_sent_at": reg.reminder_sent_at.isoformat() if reg.reminder_sent_at else None
            }).execute()
            logger.debug(f"Synced registration {reg.id}")
        except Exception as e:
            logger.error(f"Failed to sync registration {reg.id}: {e}")

    async def _pull_web_events(self, session: AsyncSession):
        """Pull events from web admin (events table) to local SQLite"""
        try:
            # Fetch events from web admin table
            web_events = self.supabase.table("events").select("*").eq("is_published", True).execute()

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

                if local_event:
                    # Update existing
                    for key, value in event_data.items():
                        if value is not None:
                            setattr(local_event, key, value)
                else:
                    # Create new
                    local_event = Event(**event_data)
                    session.add(local_event)
                    logger.info(f"Created new event from web admin: {event_data['title']}")

                synced_count += 1

            await session.commit()
            logger.info(f"Pulled {synced_count} events from web admin")

        except Exception as e:
            logger.error(f"Error pulling web events: {e}")

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
                    web_events = self.supabase.table("events").select("id").eq("title", event.title).execute()
                    if not web_events.data:
                        continue

                    web_event_id = web_events.data[0]["id"]

                    # Check if lead already exists
                    existing = self.supabase.table("leads").select("id").eq("event_id", web_event_id).eq("telegram_id", user.tg_user_id).execute()
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

                    self.supabase.table("leads").insert(lead_data).execute()
                    synced_count += 1

                except Exception as e:
                    logger.error(f"Error syncing registration {reg.id} to leads: {e}")

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
                self.supabase.table("bot_events").upsert({
                    "id": event.id,
                    "title": event.title,
                    "description": event.description,
                    "event_date": event.event_date.isoformat() if event.event_date else None,
                    "city": event.city,
                    "location": event.location,
                    "location_url": event.location_url,
                    "speakers": event.speakers,
                    "max_participants": event.max_participants,
                    "registration_deadline": event.registration_deadline.isoformat() if event.registration_deadline else None,
                    "is_active": event.is_active,
                    "created_at": event.created_at.isoformat() if event.created_at else None,
                    "created_by": event.created_by
                }).execute()
            except Exception as e:
                logger.error(f"Failed to sync event {event.id}: {e}")

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

        for fb in feedback_list:
            try:
                self.supabase.table("bot_feedback").upsert({
                    "id": fb.id,
                    "event_id": fb.event_id,
                    "user_id": fb.user_id,
                    "speaker1_rating": fb.speaker1_rating,
                    "speaker2_rating": fb.speaker2_rating,
                    "comment": fb.comment,
                    "interested_topics": fb.interested_topics,
                    "created_at": fb.created_at.isoformat() if fb.created_at else None
                }).execute()
            except Exception as e:
                logger.error(f"Failed to sync feedback {fb.id}: {e}")

        logger.info(f"Synced {len(feedback_list)} feedback entries to Supabase")

    async def _sync_questions(self, session: AsyncSession):
        """Sync questions to Supabase"""
        result = await session.execute(select(Question))
        questions = result.scalars().all()

        for q in questions:
            try:
                self.supabase.table("bot_questions").upsert({
                    "id": q.id,
                    "user_id": q.user_id,
                    "username": q.username,
                    "chat_id": q.chat_id,
                    "message_id": q.message_id,
                    "question_text": q.question_text,
                    "answer_text": q.answer_text,
                    "question_type": q.question_type,
                    "answered": q.answered,
                    "created_at": q.created_at.isoformat() if q.created_at else None,
                    "answered_at": q.answered_at.isoformat() if q.answered_at else None
                }).execute()
            except Exception as e:
                logger.error(f"Failed to sync question {q.id}: {e}")

        logger.info(f"Synced {len(questions)} questions to Supabase")

    async def _sync_security_logs(self, session: AsyncSession):
        """Sync security logs to Supabase"""
        result = await session.execute(select(SecurityLog))
        logs = result.scalars().all()

        for log in logs:
            try:
                self.supabase.table("bot_security_logs").upsert({
                    "id": log.id,
                    "user_id": log.user_id,
                    "username": log.username,
                    "chat_id": log.chat_id,
                    "attack_type": log.attack_type,
                    "user_input": log.user_input,
                    "detection_reason": log.detection_reason,
                    "action_taken": log.action_taken,
                    "created_at": log.created_at.isoformat() if log.created_at else None
                }).execute()
            except Exception as e:
                logger.error(f"Failed to sync security log {log.id}: {e}")

        logger.info(f"Synced {len(logs)} security logs to Supabase")

    async def _sync_profiles(self, session: AsyncSession):
        """Sync user profiles to Supabase"""
        result = await session.execute(select(UserProfile))
        profiles = result.scalars().all()

        for p in profiles:
            try:
                self.supabase.table("bot_profiles").upsert({
                    "id": p.id,
                    "user_id": p.user_id,
                    "bio": p.bio,
                    "occupation": p.occupation,
                    "looking_for": p.looking_for,
                    "can_help_with": p.can_help_with,
                    "needs_help_with": p.needs_help_with,
                    "photo_file_id": p.photo_file_id,
                    "city": p.city,
                    "moderation_status": p.moderation_status,
                    "is_visible": p.is_visible,
                    "created_at": p.created_at.isoformat() if p.created_at else None,
                    "updated_at": p.updated_at.isoformat() if p.updated_at else None
                }).execute()
            except Exception as e:
                logger.error(f"Failed to sync profile {p.id}: {e}")

        logger.info(f"Synced {len(profiles)} profiles to Supabase")

    async def _sync_swipes(self, session: AsyncSession):
        """Sync swipes to Supabase"""
        result = await session.execute(select(Swipe))
        swipes = result.scalars().all()

        for s in swipes:
            try:
                self.supabase.table("bot_swipes").upsert({
                    "id": s.id,
                    "swiper_id": s.swiper_id,
                    "swiped_id": s.swiped_id,
                    "action": s.action,
                    "swiped_at": s.swiped_at.isoformat() if s.swiped_at else None
                }).execute()
            except Exception as e:
                logger.error(f"Failed to sync swipe {s.id}: {e}")

        logger.info(f"Synced {len(swipes)} swipes to Supabase")

    async def _sync_matches(self, session: AsyncSession):
        """Sync matches to Supabase"""
        result = await session.execute(select(Match))
        matches = result.scalars().all()

        for m in matches:
            try:
                self.supabase.table("bot_matches").upsert({
                    "id": m.id,
                    "user1_id": m.user1_id,
                    "user2_id": m.user2_id,
                    "matched_at": m.matched_at.isoformat() if m.matched_at else None,
                    "is_active": m.is_active
                }).execute()
            except Exception as e:
                logger.error(f"Failed to sync match {m.id}: {e}")

        logger.info(f"Synced {len(matches)} matches to Supabase")


# Global instance
_sync_service: Optional[SupabaseSync] = None


def get_sync_service() -> Optional[SupabaseSync]:
    """Get the global sync service instance"""
    return _sync_service


def set_sync_service(service: SupabaseSync):
    """Set the global sync service instance"""
    global _sync_service
    _sync_service = service
