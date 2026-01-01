#!/usr/bin/env python3
"""Test Supabase PostgreSQL connection for the bot"""

import asyncio
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text

# Different connection string options
CONNECTION_STRINGS = {
    "pooler_transaction": "postgresql+asyncpg://postgres.ndpkxustvcijykzxqxrn:nzqP25qXyV2LMlTa@aws-0-eu-central-1.pooler.supabase.com:6543/postgres",
    "pooler_session": "postgresql+asyncpg://postgres.ndpkxustvcijykzxqxrn:nzqP25qXyV2LMlTa@aws-0-eu-central-1.pooler.supabase.com:5432/postgres",
    "direct": "postgresql+asyncpg://postgres:nzqP25qXyV2LMlTa@db.ndpkxustvcijykzxqxrn.supabase.co:5432/postgres",
}

async def test_connection(name: str, url: str):
    print(f"\n{'='*50}")
    print(f"Testing: {name}")
    print(f"URL: {url[:50]}...")
    print('='*50)

    try:
        engine = create_async_engine(url, echo=False)
        async with engine.connect() as conn:
            # Test basic query
            result = await conn.execute(text("SELECT 1 as test"))
            row = result.fetchone()
            print(f"Basic query: OK (result={row[0]})")

            # Test bot_users table
            result = await conn.execute(text("SELECT COUNT(*) FROM bot_users"))
            count = result.fetchone()[0]
            print(f"bot_users count: {count}")

            # Test bot_events table
            result = await conn.execute(text("SELECT COUNT(*) FROM bot_events"))
            count = result.fetchone()[0]
            print(f"bot_events count: {count}")

            print(f"\n✅ SUCCESS: {name} works!")
            return True

    except Exception as e:
        print(f"\n❌ FAILED: {e}")
        return False
    finally:
        await engine.dispose()

async def main():
    print("Testing Supabase PostgreSQL connections...")

    results = {}
    for name, url in CONNECTION_STRINGS.items():
        results[name] = await test_connection(name, url)

    print("\n" + "="*50)
    print("SUMMARY")
    print("="*50)
    for name, success in results.items():
        status = "✅ OK" if success else "❌ FAILED"
        print(f"{name}: {status}")

if __name__ == "__main__":
    asyncio.run(main())
