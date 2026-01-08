"""
Configuration module for Feedback Bot
Loads environment variables from .env file
"""
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Telegram Bot
BOT_TOKEN = os.getenv("FEEDBACK_BOT_TOKEN")
if not BOT_TOKEN:
    raise ValueError("FEEDBACK_BOT_TOKEN is required")

# Testing group to monitor
TEST_GROUP_CHAT_ID = int(os.getenv("TEST_GROUP_CHAT_ID", "-1003682997071"))

# Supabase
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    raise ValueError("SUPABASE_URL and SUPABASE_SERVICE_KEY are required")

# OpenAI for AI classification
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
AI_MODEL = os.getenv("AI_MODEL", "gpt-4o-mini")

# Settings
REACT_TO_MESSAGES = os.getenv("REACT_TO_MESSAGES", "true").lower() == "true"
LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO")
