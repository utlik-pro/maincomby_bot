from __future__ import annotations

import logging
from apscheduler.schedulers.asyncio import AsyncIOScheduler

from app.db.database import async_session_maker

logger = logging.getLogger(__name__)


def create_scheduler() -> AsyncIOScheduler:
    scheduler = AsyncIOScheduler()
    return scheduler


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
    logger.info("Scheduled jobs configured")


