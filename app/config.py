import os
from dataclasses import dataclass
from typing import List

from dotenv import load_dotenv


@dataclass
class Settings:
    bot_token: str
    admin_ids: List[int]
    database_url: str
    news_rss_feeds: List[str]
    timezone: str
    openai_api_key: str | None
    openai_model: str | None
    intermediate_chat_id: int | None  # ID канала/группы для модерации новостей
    target_channel_id: int | None  # ID основного канала для публикации после апрува
    welcome_chat_id: int | None  # ID чата для приветствий
    welcome_thread_id: int | None  # ID ветки для приветствий


def load_settings() -> Settings:
    load_dotenv(override=True)  # Принудительно перезагружаем .env
    bot_token = os.getenv("BOT_TOKEN", "").strip()
    if not bot_token:
        raise RuntimeError("BOT_TOKEN is required in environment")

    admin_ids_raw = os.getenv("ADMIN_IDS", "")
    admin_ids = [int(x) for x in admin_ids_raw.split(",") if x.strip().isdigit()]

    # Отладочный лог
    print(f"[CONFIG] Loaded admin_ids: {admin_ids} (raw: {admin_ids_raw})")

    database_url = os.getenv("DATABASE_URL", "sqlite+aiosqlite:///./bot.db")
    news_rss_feeds = [u.strip() for u in os.getenv("NEWS_RSS_FEEDS", "").split(",") if u.strip()]
    timezone = os.getenv("TIMEZONE", "Europe/Moscow")
    openai_api_key = os.getenv("OPENAI_API_KEY")
    openai_model = os.getenv("OPENAI_MODEL")
    
    intermediate_chat_id_raw = os.getenv("INTERMEDIATE_CHAT_ID")
    intermediate_chat_id = int(intermediate_chat_id_raw) if intermediate_chat_id_raw and intermediate_chat_id_raw.strip().lstrip("-").isdigit() else None

    target_channel_id_raw = os.getenv("TARGET_CHANNEL_ID")
    target_channel_id = int(target_channel_id_raw) if target_channel_id_raw and target_channel_id_raw.strip().lstrip("-").isdigit() else None

    welcome_chat_id_raw = os.getenv("WELCOME_CHAT_ID")
    welcome_chat_id = int(welcome_chat_id_raw) if welcome_chat_id_raw and welcome_chat_id_raw.strip().lstrip("-").isdigit() else None

    welcome_thread_id_raw = os.getenv("WELCOME_THREAD_ID")
    welcome_thread_id = int(welcome_thread_id_raw) if welcome_thread_id_raw and welcome_thread_id_raw.strip().isdigit() else None

    return Settings(
        bot_token=bot_token,
        admin_ids=admin_ids,
        database_url=database_url,
        news_rss_feeds=news_rss_feeds,
        timezone=timezone,
        openai_api_key=openai_api_key,
        openai_model=openai_model,
        intermediate_chat_id=intermediate_chat_id,
        target_channel_id=target_channel_id,
        welcome_chat_id=welcome_chat_id,
        welcome_thread_id=welcome_thread_id,
    )


