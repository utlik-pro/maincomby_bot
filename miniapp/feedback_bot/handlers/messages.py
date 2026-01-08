"""
Message handlers for feedback collection
Processes all messages from the testing group
"""
import logging
from aiogram import Router, F
from aiogram.types import Message, ReactionTypeEmoji
from aiogram.exceptions import TelegramBadRequest

import sys
sys.path.append('..')
from config import TEST_GROUP_CHAT_ID, REACT_TO_MESSAGES
from services.ai_classifier import classify_message
from services.supabase_client import save_backlog_item, check_duplicate

logger = logging.getLogger(__name__)

router = Router()


def should_process_message(message: Message) -> bool:
    """Check if message should be processed"""
    # Must have text
    if not message.text:
        return False
    
    # Skip commands
    if message.text.startswith('/'):
        return False
    
    # Skip very short messages (likely reactions or single words)
    if len(message.text.strip()) < 10:
        return False
    
    # Skip bot messages
    if message.from_user and message.from_user.is_bot:
        return False
    
    return True


@router.message(F.chat.id == TEST_GROUP_CHAT_ID)
async def handle_group_message(message: Message):
    """
    Process all messages from testing group.
    Classifies with AI and saves to backlog.
    """
    # Check if should process
    if not should_process_message(message):
        return
    
    logger.info(f"📨 New message from {message.from_user.full_name}: {message.text[:50]}...")
    
    try:
        # Check for duplicate (same message ID)
        if await check_duplicate(message.message_id, message.chat.id):
            logger.debug("Duplicate message, skipping")
            return
        
        # AI Classification
        classification = await classify_message(message.text)
        logger.info(f"🤖 Classified as: {classification['type']} ({classification['priority']})")
        
        # Save to backlog
        result = await save_backlog_item(
            telegram_message_id=message.message_id,
            telegram_chat_id=message.chat.id,
            telegram_user_id=message.from_user.id if message.from_user else None,
            sender_username=message.from_user.username if message.from_user else None,
            sender_name=message.from_user.full_name if message.from_user else "Unknown",
            original_message=message.text,
            processed_content=classification.get('processed_content'),
            item_type=classification['type'],
            priority=classification['priority'],
            ai_confidence=classification['confidence'],
            ai_tags=classification['tags'],
            ai_summary=classification['summary']
        )
        
        if result:
            logger.info(f"✅ Saved to backlog: ID {result.get('id')}")
            
            # React to message to show it was processed
            if REACT_TO_MESSAGES:
                try:
                    # Choose emoji based on type
                    emoji_map = {
                        'bug': '🐛',
                        'feature': '💡',
                        'improvement': '✨',
                        'ux': '🎨',
                        'question': '❓',
                        'other': '📝'
                    }
                    emoji = emoji_map.get(classification['type'], '📝')
                    await message.react([ReactionTypeEmoji(emoji=emoji)])
                except TelegramBadRequest as e:
                    # Bot might not have reaction permissions
                    logger.debug(f"Could not react: {e}")
        else:
            logger.error("Failed to save to backlog")
            
    except Exception as e:
        logger.error(f"Error processing message: {e}", exc_info=True)


@router.message(F.chat.id == TEST_GROUP_CHAT_ID, F.reply_to_message)
async def handle_reply_message(message: Message):
    """
    Handle replies - link them to original backlog item
    """
    if not should_process_message(message):
        return
    
    # This is a reply, might be additional context for existing feedback
    # For now, just process as new message but could be enhanced
    # to link to original backlog item
    await handle_group_message(message)
