#!/usr/bin/env python3
"""Test the Supabase sync service"""

import asyncio
from app.db.session import create_engine, create_session_factory, init_models
from app.services.supabase_sync import SupabaseSync

async def main():
    print("=== Testing Supabase Sync Service ===\n")

    # Create database connection
    print("1. Creating SQLite engine...")
    engine = create_engine()
    await init_models(engine)
    session_factory = create_session_factory(engine)
    print("   OK\n")

    # Create sync service
    print("2. Creating sync service...")
    sync_service = SupabaseSync(session_factory)
    print("   OK\n")

    # Run full sync
    print("3. Running full sync to Supabase...")
    await sync_service.sync_all()
    print("\n=== Sync Complete! ===")

if __name__ == "__main__":
    asyncio.run(main())
