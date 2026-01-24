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


# === ENGAGEMENT NOTIFICATION JOBS ===

async def send_engagement_profile_job():
    """Job to send profile completion reminders (12:00 daily)"""
    try:
        from app.services.engagement_notifications import get_engagement_service
        service = get_engagement_service()
        if service:
            async with async_session_maker() as session:
                count = await service.send_profile_incomplete_batch(session)
                logger.info(f"Engagement profile job completed: {count} sent")
    except Exception as e:
        logger.error(f"Engagement profile job failed: {e}")


async def send_engagement_swipes_job():
    """Job to send networking invitations (12:00 daily)"""
    try:
        from app.services.engagement_notifications import get_engagement_service
        service = get_engagement_service()
        if service:
            async with async_session_maker() as session:
                count = await service.send_no_swipes_batch(session)
                logger.info(f"Engagement swipes job completed: {count} sent")
    except Exception as e:
        logger.error(f"Engagement swipes job failed: {e}")


async def send_engagement_inactive_job():
    """Job to send inactive user reminders (19:00 daily)"""
    try:
        from app.services.engagement_notifications import get_engagement_service
        service = get_engagement_service()
        if service:
            async with async_session_maker() as session:
                count_7d = await service.send_inactive_7d_batch(session)
                count_14d = await service.send_inactive_14d_batch(session)
                logger.info(f"Engagement inactive job completed: {count_7d} 7d + {count_14d} 14d sent")
    except Exception as e:
        logger.error(f"Engagement inactive job failed: {e}")


async def send_engagement_likes_job():
    """Job to send pending likes notifications (every 4 hours)"""
    try:
        from app.services.engagement_notifications import get_engagement_service
        service = get_engagement_service()
        if service:
            async with async_session_maker() as session:
                count = await service.send_pending_likes_batch(session)
                logger.info(f"Engagement likes job completed: {count} sent")
    except Exception as e:
        logger.error(f"Engagement likes job failed: {e}")


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

    # === ENGAGEMENT NOTIFICATION JOBS ===

    # Profile completion + networking invites at 12:00 daily
    scheduler.add_job(
        send_engagement_profile_job,
        'cron',
        hour=12,
        minute=0,
        id='engagement_profile',
        replace_existing=True
    )

    scheduler.add_job(
        send_engagement_swipes_job,
        'cron',
        hour=12,
        minute=5,  # Stagger by 5 minutes
        id='engagement_swipes',
        replace_existing=True
    )

    # Inactive user reminders at 19:00 daily
    scheduler.add_job(
        send_engagement_inactive_job,
        'cron',
        hour=19,
        minute=0,
        id='engagement_inactive',
        replace_existing=True
    )

    # Pending likes notifications every 4 hours (8:00, 12:00, 16:00, 20:00)
    scheduler.add_job(
        send_engagement_likes_job,
        'cron',
        hour='8,12,16,20',
        minute=10,  # Offset by 10 minutes
        id='engagement_likes',
        replace_existing=True
    )

    logger.info("Scheduled jobs configured: event_reminders (hourly), event_starting_soon (every 15 min), review_requests (22:30 daily), ticket_reminders (18:30 Minsk), engagement_profile (12:00), engagement_swipes (12:05), engagement_inactive (19:00), engagement_likes (8/12/16/20:10)")


