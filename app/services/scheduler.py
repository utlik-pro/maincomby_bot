from __future__ import annotations

import logging
from typing import Optional
from apscheduler.schedulers.asyncio import AsyncIOScheduler

from app.db.database import async_session_maker

logger = logging.getLogger(__name__)

# Global scheduler instance for access from diagnostic commands
_scheduler: Optional[AsyncIOScheduler] = None


def create_scheduler() -> AsyncIOScheduler:
    global _scheduler
    _scheduler = AsyncIOScheduler()
    return _scheduler


def get_scheduler() -> Optional[AsyncIOScheduler]:
    """Get the scheduler instance for status checks."""
    return _scheduler


def get_jobs_status() -> list[dict]:
    """Get status of all scheduled jobs."""
    if not _scheduler:
        return []
    return [
        {
            "id": job.id,
            "next_run": str(job.next_run_time) if job.next_run_time else "Not scheduled",
            "trigger": str(job.trigger)
        }
        for job in _scheduler.get_jobs()
    ]


async def send_event_reminders_job():
    """Job to send event reminders (24h before)"""
    try:
        from app.services.notifications import get_notification_service
        service = get_notification_service()
        if service:
            async with async_session_maker() as session:
                count = await service.send_event_reminders_batch(session)
                logger.info(f"Event reminders job completed: {count} sent")
    except Exception as e:
        logger.error(f"Event reminders job failed: {e}")


async def send_event_starting_soon_job():
    """Job to send reminders 1h before event starts"""
    try:
        from app.services.notifications import get_notification_service
        service = get_notification_service()
        if service:
            async with async_session_maker() as session:
                count = await service.send_event_starting_soon_batch(session)
                logger.info(f"Event starting soon job completed: {count} sent")
    except Exception as e:
        logger.error(f"Event starting soon job failed: {e}")


async def send_review_requests_job():
    """Job to send review requests at 22:30 for events that ended today"""
    try:
        from app.services.notifications import get_notification_service
        service = get_notification_service()
        if service:
            async with async_session_maker() as session:
                count = await service.send_review_requests_batch(session)
                logger.info(f"Review requests job completed: {count} sent")
    except Exception as e:
        logger.error(f"Review requests job failed: {e}")


async def send_ticket_reminders_job():
    """Job to send ticket reminders at 18:30 on event day"""
    try:
        from app.services.notifications import get_notification_service
        service = get_notification_service()
        if service:
            async with async_session_maker() as session:
                count = await service.send_ticket_reminders_batch(session)
                logger.info(f"Ticket reminders job completed: {count} sent")
    except Exception as e:
        logger.error(f"Ticket reminders job failed: {e}")


# === SMART ENGAGEMENT QUEUE JOB ===

async def process_engagement_queue_job():
    """Smart queue job - max 1 engagement notification per day per user.

    Runs at 10:00, 14:00, 18:00 daily.
    Priority: likes > events > profile > swipes > inactive > feedback
    """
    try:
        from app.services.engagement_notifications import get_engagement_service
        service = get_engagement_service()
        if service:
            async with async_session_maker() as session:
                stats = await service.process_engagement_queue_batch(session)
                total = sum(stats.get(k, 0) for k in ['likes', 'event_invite', 'profile', 'swipes', 'inactive', 'feedback'])
                logger.info(f"Engagement queue completed: {total} sent - {stats}")
    except Exception as e:
        logger.error(f"Engagement queue job failed: {e}")


# === PROFILE COMPLETION PRO REWARD JOB ===

async def award_profile_completion_pro_job():
    """Award 3-day PRO to users with complete profile + photo.

    Runs daily at 11:00.
    Conditions: bio + occupation + at least 1 photo.
    """
    try:
        from app.services.engagement_notifications import get_engagement_service
        service = get_engagement_service()
        if service:
            async with async_session_maker() as session:
                count = await service.award_profile_completion_pro_batch(session)
                logger.info(f"Profile completion PRO job completed: {count} awarded")
    except Exception as e:
        logger.error(f"Profile completion PRO job failed: {e}")


def setup_scheduled_jobs(scheduler: AsyncIOScheduler):
    """Setup all scheduled jobs"""
    # Send event reminders every hour (checks for events in 24h window)
    scheduler.add_job(
        send_event_reminders_job,
        'cron',
        hour='*/1',  # Every hour
        minute=0,
        id='event_reminders',
        replace_existing=True
    )

    # Send "starting soon" reminders every 15 minutes (checks for events in 1h window)
    scheduler.add_job(
        send_event_starting_soon_job,
        'cron',
        minute='*/15',  # Every 15 minutes
        id='event_starting_soon',
        replace_existing=True
    )

    # Send review requests at 22:30 for events that ended today
    scheduler.add_job(
        send_review_requests_job,
        'cron',
        hour=22,
        minute=30,
        id='review_requests',
        replace_existing=True
    )

    # Send ticket reminders at 18:30 Minsk time on event day
    scheduler.add_job(
        send_ticket_reminders_job,
        'cron',
        hour=18,
        minute=30,
        timezone='Europe/Minsk',
        id='ticket_reminders',
        replace_existing=True
    )

    # === SMART ENGAGEMENT QUEUE ===
    # Single job replaces 4 separate engagement jobs
    # Max 1 engagement notification per day per user
    # Priority: likes > events > profile > swipes > inactive > feedback
    scheduler.add_job(
        process_engagement_queue_job,
        'cron',
        hour='10,14,18',  # 10:00, 14:00, 18:00 daily
        minute=0,
        id='engagement_queue',
        replace_existing=True
    )

    # === PROFILE COMPLETION PRO REWARD ===
    # Award 3-day PRO to users who completed profile + added photo
    scheduler.add_job(
        award_profile_completion_pro_job,
        'cron',
        hour=11,  # 11:00 daily
        minute=0,
        id='profile_completion_pro',
        replace_existing=True
    )

    logger.info("Scheduled jobs configured: event_reminders (hourly), event_starting_soon (every 15 min), review_requests (22:30 daily), ticket_reminders (18:30 Minsk), engagement_queue (10:00/14:00/18:00), profile_completion_pro (11:00)")


