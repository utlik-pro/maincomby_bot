"""
Supabase Client Service
Handles all database operations for backlog items
"""
import logging
from typing import Optional, List
from supabase import create_client, Client

import sys
sys.path.append('..')
from config import SUPABASE_URL, SUPABASE_KEY

logger = logging.getLogger(__name__)

# Initialize Supabase client
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)


async def save_backlog_item(
    telegram_message_id: int,
    telegram_chat_id: int,
    telegram_user_id: Optional[int],
    sender_username: Optional[str],
    sender_name: str,
    original_message: str,
    item_type: str,
    priority: str,
    ai_confidence: float,
    ai_tags: List[str],
    ai_summary: str,
    processed_content: Optional[str] = None
) -> Optional[dict]:
    """
    Save a classified message to the backlog_items table.
    Returns the created record or None on error.
    """
    try:
        data = {
            "telegram_message_id": telegram_message_id,
            "telegram_chat_id": telegram_chat_id,
            "telegram_user_id": telegram_user_id,
            "sender_username": sender_username,
            "sender_name": sender_name,
            "original_message": original_message,
            "processed_content": processed_content,
            "item_type": item_type,
            "priority": priority,
            "ai_confidence": ai_confidence,
            "ai_tags": ai_tags,
            "ai_summary": ai_summary,
            "status": "new"
        }
        
        result = supabase.table("backlog_items").insert(data).execute()
        
        if result.data:
            logger.info(f"Created backlog item: {result.data[0].get('id')}")
            return result.data[0]
        
        return None
        
    except Exception as e:
        logger.error(f"Failed to save backlog item: {e}")
        return None


async def check_duplicate(message_id: int, chat_id: int) -> bool:
    """
    Check if a message has already been processed.
    Returns True if duplicate exists.
    """
    try:
        result = supabase.table("backlog_items").select("id").eq(
            "telegram_message_id", message_id
        ).eq(
            "telegram_chat_id", chat_id
        ).execute()
        
        return len(result.data) > 0
        
    except Exception as e:
        logger.error(f"Failed to check duplicate: {e}")
        return False


async def get_backlog_items(
    status: Optional[str] = None,
    item_type: Optional[str] = None,
    priority: Optional[str] = None,
    limit: int = 50
) -> List[dict]:
    """
    Get backlog items with optional filters.
    """
    try:
        query = supabase.table("backlog_items").select("*")
        
        if status:
            query = query.eq("status", status)
        if item_type:
            query = query.eq("item_type", item_type)
        if priority:
            query = query.eq("priority", priority)
        
        query = query.order("created_at", desc=True).limit(limit)
        
        result = query.execute()
        return result.data or []
        
    except Exception as e:
        logger.error(f"Failed to get backlog items: {e}")
        return []


async def update_backlog_item(
    item_id: int,
    updates: dict
) -> Optional[dict]:
    """
    Update a backlog item by ID.
    """
    try:
        result = supabase.table("backlog_items").update(updates).eq(
            "id", item_id
        ).execute()
        
        if result.data:
            return result.data[0]
        return None
        
    except Exception as e:
        logger.error(f"Failed to update backlog item: {e}")
        return None


async def get_backlog_stats() -> Optional[dict]:
    """
    Get backlog statistics using RPC function.
    """
    try:
        result = supabase.rpc("get_backlog_stats").execute()
        return result.data
    except Exception as e:
        logger.error(f"Failed to get backlog stats: {e}")
        return None
