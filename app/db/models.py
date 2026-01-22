from __future__ import annotations

from datetime import datetime
from typing import Optional

from sqlalchemy import Integer, String, DateTime, ForeignKey, Boolean, JSON
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship


class Base(DeclarativeBase):
    pass


class User(Base):
    __tablename__ = "bot_users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    tg_user_id: Mapped[int] = mapped_column(Integer, unique=True, index=True)
    username: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)
    first_name: Mapped[Optional[str]] = mapped_column(String(128), nullable=True)
    last_name: Mapped[Optional[str]] = mapped_column(String(128), nullable=True)
    phone_number: Mapped[Optional[str]] = mapped_column(String(32), nullable=True)
    first_seen_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    points: Mapped[int] = mapped_column(Integer, default=0)
    warns: Mapped[int] = mapped_column(Integer, default=0)
    banned: Mapped[bool] = mapped_column(Boolean, default=False)

    # Отслеживание источников
    source: Mapped[Optional[str]] = mapped_column(String(128), nullable=True)  # Откуда пришел (telegram, instagram, website)
    utm_source: Mapped[Optional[str]] = mapped_column(String(128), nullable=True)
    utm_medium: Mapped[Optional[str]] = mapped_column(String(128), nullable=True)
    utm_campaign: Mapped[Optional[str]] = mapped_column(String(128), nullable=True)
    referrer: Mapped[Optional[str]] = mapped_column(String(128), nullable=True)  # Кто пригласил
    team_role: Mapped[Optional[str]] = mapped_column(String(32), nullable=True)  # core, partner, sponsor, volunteer, speaker

    # Subscription fields
    subscription_tier: Mapped[str] = mapped_column(String(32), default='free')  # free, light, pro
    subscription_expires_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    daily_swipes_used: Mapped[int] = mapped_column(Integer, default=0)
    daily_swipes_reset_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)

    # Engagement tracking
    last_app_open_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)

    # Engagement notifications sent (timestamps to prevent duplicates)
    engagement_profile_sent_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    engagement_swipes_sent_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    engagement_inactive_7d_sent_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    engagement_inactive_14d_sent_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    engagement_likes_1_sent_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    engagement_likes_3_sent_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    engagement_likes_5_sent_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    engagement_likes_10_sent_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)

    posts: Mapped[list[Post]] = relationship(back_populates="author")
    roles: Mapped[list[UserRole]] = relationship(back_populates="user")
    registrations: Mapped[list["EventRegistration"]] = relationship(back_populates="user")
    profile: Mapped[Optional["UserProfile"]] = relationship(back_populates="user", uselist=False)
    matches_as_user1: Mapped[list["Match"]] = relationship(foreign_keys="[Match.user1_id]", back_populates="user1")
    matches_as_user2: Mapped[list["Match"]] = relationship(foreign_keys="[Match.user2_id]", back_populates="user2")
    swipes_made: Mapped[list["Swipe"]] = relationship(foreign_keys="[Swipe.swiper_id]", back_populates="swiper")
    swipes_received: Mapped[list["Swipe"]] = relationship(foreign_keys="[Swipe.swiped_id]", back_populates="swiped")


class Post(Base):
    __tablename__ = "bot_posts"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    chat_id: Mapped[int] = mapped_column(Integer, index=True)
    message_id: Mapped[int] = mapped_column(Integer, index=True)
    author_id: Mapped[int] = mapped_column(ForeignKey("bot_users.id"))
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    author: Mapped[User] = relationship(back_populates="posts")


class Role(Base):
    __tablename__ = "bot_roles"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(32), unique=True, index=True)
    description: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)

    users: Mapped[list[UserRole]] = relationship(back_populates="role")


class UserRole(Base):
    __tablename__ = "bot_user_roles"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("bot_users.id"))
    role_id: Mapped[int] = mapped_column(ForeignKey("bot_roles.id"))
    assigned_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    user: Mapped[User] = relationship(back_populates="roles")
    role: Mapped[Role] = relationship(back_populates="users")


class SourceChannel(Base):
    __tablename__ = "bot_source_channels"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    channel_id: Mapped[int] = mapped_column(Integer, unique=True, index=True)
    channel_username: Mapped[Optional[str]] = mapped_column(String(128), nullable=True)
    channel_title: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    enabled: Mapped[bool] = mapped_column(Boolean, default=True)
    last_checked_message_id: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    pending_posts: Mapped[list[PendingPost]] = relationship(back_populates="source_channel")


class PendingPost(Base):
    __tablename__ = "bot_pending_posts"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    source_channel_id: Mapped[int] = mapped_column(ForeignKey("bot_source_channels.id"))
    original_message_id: Mapped[int] = mapped_column(Integer, index=True)
    original_text: Mapped[str] = mapped_column(String(4096))
    adapted_text: Mapped[Optional[str]] = mapped_column(String(4096), nullable=True)
    status: Mapped[str] = mapped_column(String(16), default="pending")  # pending, approved, rejected
    moderation_chat_id: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    moderation_message_id: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    approved_by: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    approved_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)

    source_channel: Mapped[SourceChannel] = relationship(back_populates="pending_posts")


class Question(Base):
    __tablename__ = "bot_questions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(Integer, index=True)  # Telegram user ID
    username: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)
    chat_id: Mapped[int] = mapped_column(Integer, index=True)
    message_id: Mapped[int] = mapped_column(Integer)
    question_text: Mapped[str] = mapped_column(String(4096))
    answer_text: Mapped[Optional[str]] = mapped_column(String(4096), nullable=True)
    question_type: Mapped[str] = mapped_column(String(16), default="reply")  # reply, mention, private
    answered: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    answered_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)


class Event(Base):
    __tablename__ = "bot_events"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    title: Mapped[str] = mapped_column(String(256), index=True)  # Название мероприятия
    description: Mapped[Optional[str]] = mapped_column(String(4096), nullable=True)  # Описание
    event_date: Mapped[datetime] = mapped_column(DateTime, index=True)  # Дата и время
    city: Mapped[str] = mapped_column(String(64), index=True, default="Минск")  # Город проведения
    location: Mapped[Optional[str]] = mapped_column(String(512), nullable=True)  # Место проведения (адрес)
    location_url: Mapped[Optional[str]] = mapped_column(String(512), nullable=True)  # Ссылка на карты
    speakers: Mapped[Optional[str]] = mapped_column(String(1024), nullable=True)  # Спикеры (JSON или текст)
    max_participants: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)  # Макс. участников
    registration_deadline: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)  # Дедлайн регистрации
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)  # Активно ли мероприятие
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    created_by: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)  # Кто создал (admin user_id)

    registrations: Mapped[list["EventRegistration"]] = relationship(back_populates="event")
    feedback: Mapped[list["EventFeedback"]] = relationship(back_populates="event")


class EventRegistration(Base):
    __tablename__ = "bot_registrations"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    event_id: Mapped[int] = mapped_column(ForeignKey("bot_events.id"), index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("bot_users.id"), index=True)
    registered_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    status: Mapped[str] = mapped_column(String(16), default="registered")  # registered, cancelled, attended
    notes: Mapped[Optional[str]] = mapped_column(String(512), nullable=True)  # Дополнительная информация

    # Версионирование и подтверждение при изменении даты мероприятия
    registration_version: Mapped[str] = mapped_column(String(16), default="new_date", index=True)  # old_date, new_date
    confirmed: Mapped[bool] = mapped_column(Boolean, default=False, index=True)  # Подтверждено ли участие
    confirmation_requested_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)  # Когда запрошено подтверждение

    # Tracking broadcast reminders
    reminder_sent: Mapped[bool] = mapped_column(Boolean, default=False, index=True)  # Отправлено ли напоминание
    reminder_sent_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)  # Когда отправлено напоминание

    # Tracking ticket reminders (sent at 18:30 on event day)
    ticket_reminder_sent: Mapped[bool] = mapped_column(Boolean, default=False, index=True)  # Отправлено ли напоминание о билете
    ticket_reminder_sent_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)  # Когда отправлено

    event: Mapped[Event] = relationship(back_populates="registrations")
    user: Mapped[User] = relationship(back_populates="registrations")


class SecurityLog(Base):
    __tablename__ = "bot_security_logs"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(Integer, index=True)  # Telegram user ID
    username: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)
    chat_id: Mapped[int] = mapped_column(Integer, index=True)
    attack_type: Mapped[str] = mapped_column(String(64), default="prompt_injection")  # prompt_injection, spam, etc
    user_input: Mapped[str] = mapped_column(String(4096))  # Что пытался сделать
    detection_reason: Mapped[str] = mapped_column(String(512))  # Почему было детектировано
    action_taken: Mapped[str] = mapped_column(String(128))  # Какое действие предприняли (mute, warn, etc)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class UserProfile(Base):
    """Расширенный профиль пользователя для системы матчинга."""
    __tablename__ = "bot_profiles"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("bot_users.id"), unique=True, index=True)
    bio: Mapped[Optional[str]] = mapped_column(String(512), nullable=True)  # О себе
    occupation: Mapped[Optional[str]] = mapped_column(String(256), nullable=True)  # Чем занимается
    looking_for: Mapped[Optional[str]] = mapped_column(String(512), nullable=True)  # Кого ищет
    can_help_with: Mapped[Optional[str]] = mapped_column(String(512), nullable=True)  # Чем может помочь
    needs_help_with: Mapped[Optional[str]] = mapped_column(String(512), nullable=True)  # В чем нуждается
    photo_file_id: Mapped[Optional[str]] = mapped_column(String(256), nullable=True)  # ID фото в Telegram
    city: Mapped[str] = mapped_column(String(64), index=True, default="Минск")  # Город
    moderation_status: Mapped[str] = mapped_column(String(16), index=True, default="pending")  # pending, approved, rejected
    is_visible: Mapped[bool] = mapped_column(Boolean, index=True, default=True)  # Виден ли профиль другим
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user: Mapped[User] = relationship(back_populates="profile")


class Match(Base):
    """Взаимный матч между двумя пользователями."""
    __tablename__ = "bot_matches"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user1_id: Mapped[int] = mapped_column(ForeignKey("bot_users.id"), index=True)
    user2_id: Mapped[int] = mapped_column(ForeignKey("bot_users.id"), index=True)
    matched_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    is_active: Mapped[bool] = mapped_column(Boolean, index=True, default=True)  # Активен ли матч

    user1: Mapped[User] = relationship(foreign_keys=[user1_id], back_populates="matches_as_user1")
    user2: Mapped[User] = relationship(foreign_keys=[user2_id], back_populates="matches_as_user2")


class Swipe(Base):
    """История свайпов (лайк/скип)."""
    __tablename__ = "bot_swipes"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    swiper_id: Mapped[int] = mapped_column(ForeignKey("bot_users.id"), index=True)  # Кто свайпнул
    swiped_id: Mapped[int] = mapped_column(ForeignKey("bot_users.id"), index=True)  # Кого свайпнули
    action: Mapped[str] = mapped_column(String(16), index=True)  # like, skip
    swiped_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    swiper: Mapped[User] = relationship(foreign_keys=[swiper_id], back_populates="swipes_made")
    swiped: Mapped[User] = relationship(foreign_keys=[swiped_id], back_populates="swipes_received")


class EventFeedback(Base):
    """Фидбек от участников после мероприятия."""
    __tablename__ = "bot_feedback"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    event_id: Mapped[int] = mapped_column(ForeignKey("bot_events.id"), index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("bot_users.id"), index=True)

    # Оценки по 4-балльной системе (1-4, где 4 - лучше всего)
    # Сохраняем как числа для аналитики
    speaker1_rating: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)  # Оценка первого спикера
    speaker2_rating: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)  # Оценка второго спикера

    # Свободный комментарий
    comment: Mapped[Optional[str]] = mapped_column(String(2048), nullable=True)

    # Интересующие темы (через запятую: "ИИ в бизнесе,ИИ в маркетинге")
    interested_topics: Mapped[Optional[str]] = mapped_column(String(512), nullable=True)

    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    event: Mapped["Event"] = relationship(back_populates="feedback")
    user: Mapped[User] = relationship()


class Payment(Base):
    """Telegram Stars payment record."""
    __tablename__ = "bot_payments"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("bot_users.id"), index=True)
    amount_stars: Mapped[int] = mapped_column(Integer)  # Amount in Telegram Stars
    subscription_type: Mapped[str] = mapped_column(String(32))  # light, pro
    telegram_payment_charge_id: Mapped[str] = mapped_column(String(256), unique=True)  # Telegram payment ID
    provider_payment_charge_id: Mapped[Optional[str]] = mapped_column(String(256), nullable=True)
    status: Mapped[str] = mapped_column(String(32), default='completed')  # completed, refunded
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    user: Mapped[User] = relationship()


class AdminAction(Base):
    """Очередь действий администратора (синхронизация Mini App -> Bot)."""
    __tablename__ = "bot_admin_actions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    action: Mapped[str] = mapped_column(String(64))
    payload: Mapped[dict] = mapped_column(JSON, default={})
    status: Mapped[str] = mapped_column(String(32), default='pending')  # pending, processing, completed, failed
    created_by: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    processed_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    error_message: Mapped[Optional[str]] = mapped_column(String, nullable=True)


class EngagementNotification(Base):
    """Tracks engagement notifications for analytics."""
    __tablename__ = "engagement_notifications"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("bot_users.id"), index=True)
    notification_type: Mapped[str] = mapped_column(String(50))  # profile_incomplete, no_swipes, inactive_7d, etc.
    sent_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    delivered: Mapped[bool] = mapped_column(Boolean, default=True)
    error_message: Mapped[Optional[str]] = mapped_column(String, nullable=True)

    # Conversion tracking
    converted: Mapped[bool] = mapped_column(Boolean, default=False)
    converted_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    conversion_time_seconds: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)

    # Context data
    context: Mapped[dict] = mapped_column(JSON, default={})

    user: Mapped[User] = relationship()

