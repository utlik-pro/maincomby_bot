#!/usr/bin/env python3
"""Run SQL migration on Supabase."""

import psycopg2

# Supabase direct database connection
# Format: postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:5432/postgres
DATABASE_URL = "postgresql://postgres.ndpkxustvcijykzxqxrn:nzqP25qXyV2LMlTa@aws-0-eu-central-1.pooler.supabase.com:6543/postgres"

# Read SQL file
with open("migrations/extended_profile_all.sql", "r") as f:
    sql = f.read()

print("Connecting to Supabase...")

try:
    conn = psycopg2.connect(DATABASE_URL)
    conn.autocommit = True
    cur = conn.cursor()

    print("Executing migration...")
    cur.execute(sql)

    # Fetch result if any
    try:
        result = cur.fetchone()
        if result:
            print(f"Result: {result[0]}")
    except:
        pass

    cur.close()
    conn.close()

    print("Migration completed successfully!")

except Exception as e:
    print(f"Error: {e}")
