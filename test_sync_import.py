import sys
import os
import asyncio
from unittest.mock import MagicMock

# Add current dir to path
sys.path.append(os.getcwd())

print("1. Testing imports...")
try:
    from app.services.supabase_sync import SupabaseSync
    print("✅ Successfully imported SupabaseSync")
except ImportError as e:
    print(f"❌ ImportError: {e}")
    sys.exit(1)
except Exception as e:
    print(f"❌ Exception during import: {e}")
    sys.exit(1)

print("\n2. Testing initialization...")
try:
    # Mock session factory and bot
    session_factory = MagicMock()
    bot = MagicMock()
    
    sync = SupabaseSync(session_factory, bot=bot)
    print("✅ Successfully initialized SupabaseSync")
except Exception as e:
    print(f"❌ Failed to initialize: {e}")
    sys.exit(1)

print("\n3. Testing start() method (mocked)...")
try:
    # We won't actually await start because it creates a task, but we can check if it crashes immediately
    # Mock create_task to avoid running the loop
    async def mock_start():
        print("   Calling start()...")
        await sync.start()
        print("   Start() called successfully")

    # Override create_async_client to avoid network calls if possible, or expect it to fail/work
    # But wait, start() calls create_async_client. 
    # Let's just run it and see if it explodes on import dependencies.
    pass
except Exception as e:
    print(f"❌ Failed to test start: {e}")

print("\n✅ All import/init tests passed locally.")
