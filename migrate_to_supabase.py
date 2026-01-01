#!/usr/bin/env python3
"""
Migration script: SQLite -> Supabase PostgreSQL
Migrates all bot data from local SQLite to Supabase
"""

import sqlite3
import asyncio
import asyncpg
from datetime import datetime

# Supabase connection (session mode pooler)
SUPABASE_HOST = "aws-0-eu-central-1.pooler.supabase.com"
SUPABASE_PORT = 5432
SUPABASE_USER = "postgres.ndpkxustvcijykzxqxrn"
SUPABASE_PASS = "nzqP25qXyV2LMlTa"
SUPABASE_DB = "postgres"

# SQLite database
SQLITE_DB = "/Users/admin/maincomby_bot/bot.db"


def get_sqlite_data():
    """Extract all data from SQLite"""
    conn = sqlite3.connect(SQLITE_DB)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()

    data = {}

    # Users
    cursor.execute("SELECT * FROM users")
    data['users'] = [dict(row) for row in cursor.fetchall()]
    print(f"Found {len(data['users'])} users")

    # Events
    cursor.execute("SELECT * FROM events")
    data['events'] = [dict(row) for row in cursor.fetchall()]
    print(f"Found {len(data['events'])} events")

    # Event registrations
    cursor.execute("SELECT * FROM event_registrations")
    data['registrations'] = [dict(row) for row in cursor.fetchall()]
    print(f"Found {len(data['registrations'])} registrations")

    # Event feedback
    cursor.execute("SELECT * FROM event_feedback")
    data['feedback'] = [dict(row) for row in cursor.fetchall()]
    print(f"Found {len(data['feedback'])} feedback entries")

    # User profiles
    cursor.execute("SELECT * FROM user_profiles")
    data['profiles'] = [dict(row) for row in cursor.fetchall()]
    print(f"Found {len(data['profiles'])} profiles")

    # Questions
    cursor.execute("SELECT * FROM questions")
    data['questions'] = [dict(row) for row in cursor.fetchall()]
    print(f"Found {len(data['questions'])} questions")

    # Security logs
    cursor.execute("SELECT * FROM security_logs")
    data['security_logs'] = [dict(row) for row in cursor.fetchall()]
    print(f"Found {len(data['security_logs'])} security logs")

    # Swipes
    cursor.execute("SELECT * FROM swipes")
    data['swipes'] = [dict(row) for row in cursor.fetchall()]
    print(f"Found {len(data['swipes'])} swipes")

    # Matches
    cursor.execute("SELECT * FROM matches")
    data['matches'] = [dict(row) for row in cursor.fetchall()]
    print(f"Found {len(data['matches'])} matches")

    # Archive tables
    cursor.execute("SELECT * FROM users_archive")
    data['users_archive'] = [dict(row) for row in cursor.fetchall()]
    print(f"Found {len(data['users_archive'])} archived users")

    cursor.execute("SELECT * FROM events_archive")
    data['events_archive'] = [dict(row) for row in cursor.fetchall()]
    print(f"Found {len(data['events_archive'])} archived events")

    cursor.execute("SELECT * FROM event_registrations_archive")
    data['registrations_archive'] = [dict(row) for row in cursor.fetchall()]
    print(f"Found {len(data['registrations_archive'])} archived registrations")

    conn.close()
    return data


async def migrate_to_supabase(data):
    """Import data to Supabase PostgreSQL"""
    conn = await asyncpg.connect(
        host=SUPABASE_HOST,
        port=SUPABASE_PORT,
        user=SUPABASE_USER,
        password=SUPABASE_PASS,
        database=SUPABASE_DB,
        ssl='require'
    )

    try:
        # 1. Migrate Users
        print("\n--- Migrating users ---")
        user_id_map = {}  # old_id -> new_id

        for user in data['users']:
            try:
                new_id = await conn.fetchval("""
                    INSERT INTO bot_users (tg_user_id, username, first_name, last_name, phone_number,
                                          first_seen_at, points, warns, banned, source,
                                          utm_source, utm_medium, utm_campaign, referrer)
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
                    ON CONFLICT (tg_user_id) DO UPDATE SET
                        username = EXCLUDED.username,
                        first_name = EXCLUDED.first_name,
                        last_name = EXCLUDED.last_name
                    RETURNING id
                """,
                    user['tg_user_id'],
                    user.get('username'),
                    user.get('first_name'),
                    user.get('last_name'),
                    user.get('phone_number'),
                    datetime.fromisoformat(user['first_seen_at']) if user.get('first_seen_at') else datetime.now(),
                    user.get('points', 0),
                    user.get('warns', 0),
                    bool(user.get('banned', False)),
                    user.get('source'),
                    user.get('utm_source'),
                    user.get('utm_medium'),
                    user.get('utm_campaign'),
                    user.get('referrer')
                )
                user_id_map[user['id']] = new_id
            except Exception as e:
                print(f"  Error migrating user {user.get('tg_user_id')}: {e}")

        print(f"  Migrated {len(user_id_map)} users")

        # 2. Migrate Events
        print("\n--- Migrating events ---")
        event_id_map = {}  # old_id -> new_id

        for event in data['events']:
            try:
                new_id = await conn.fetchval("""
                    INSERT INTO bot_events (title, description, event_date, city, location,
                                           location_url, speakers, max_participants,
                                           registration_deadline, is_active, created_at, created_by)
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
                    RETURNING id
                """,
                    event['title'],
                    event.get('description'),
                    datetime.fromisoformat(event['event_date']) if event.get('event_date') else datetime.now(),
                    event.get('city', 'Минск'),
                    event.get('location'),
                    event.get('location_url'),
                    event.get('speakers'),
                    event.get('max_participants'),
                    datetime.fromisoformat(event['registration_deadline']) if event.get('registration_deadline') else None,
                    bool(event.get('is_active', True)),
                    datetime.fromisoformat(event['created_at']) if event.get('created_at') else datetime.now(),
                    event.get('created_by')
                )
                event_id_map[event['id']] = new_id
            except Exception as e:
                print(f"  Error migrating event {event.get('title')}: {e}")

        print(f"  Migrated {len(event_id_map)} events")

        # 3. Migrate Event Registrations
        print("\n--- Migrating registrations ---")
        reg_count = 0

        for reg in data['registrations']:
            try:
                new_event_id = event_id_map.get(reg['event_id'])
                new_user_id = user_id_map.get(reg['user_id'])

                if new_event_id and new_user_id:
                    await conn.execute("""
                        INSERT INTO bot_registrations (event_id, user_id, registered_at, status, notes,
                                                      registration_version, confirmed,
                                                      confirmation_requested_at, reminder_sent, reminder_sent_at)
                        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
                        ON CONFLICT DO NOTHING
                    """,
                        new_event_id,
                        new_user_id,
                        datetime.fromisoformat(reg['registered_at']) if reg.get('registered_at') else datetime.now(),
                        reg.get('status', 'registered'),
                        reg.get('notes'),
                        reg.get('registration_version', 'new_date'),
                        bool(reg.get('confirmed', False)),
                        datetime.fromisoformat(reg['confirmation_requested_at']) if reg.get('confirmation_requested_at') else None,
                        bool(reg.get('reminder_sent', False)),
                        datetime.fromisoformat(reg['reminder_sent_at']) if reg.get('reminder_sent_at') else None
                    )
                    reg_count += 1
            except Exception as e:
                print(f"  Error migrating registration: {e}")

        print(f"  Migrated {reg_count} registrations")

        # 4. Migrate Feedback
        print("\n--- Migrating feedback ---")
        fb_count = 0

        for fb in data['feedback']:
            try:
                new_event_id = event_id_map.get(fb['event_id'])
                new_user_id = user_id_map.get(fb['user_id'])

                if new_event_id and new_user_id:
                    await conn.execute("""
                        INSERT INTO bot_feedback (event_id, user_id, speaker1_rating, speaker2_rating,
                                                 comment, interested_topics, created_at)
                        VALUES ($1, $2, $3, $4, $5, $6, $7)
                        ON CONFLICT DO NOTHING
                    """,
                        new_event_id,
                        new_user_id,
                        fb.get('speaker1_rating'),
                        fb.get('speaker2_rating'),
                        fb.get('comment'),
                        fb.get('interested_topics'),
                        datetime.fromisoformat(fb['created_at']) if fb.get('created_at') else datetime.now()
                    )
                    fb_count += 1
            except Exception as e:
                print(f"  Error migrating feedback: {e}")

        print(f"  Migrated {fb_count} feedback entries")

        # 5. Migrate User Profiles
        print("\n--- Migrating profiles ---")
        profile_count = 0

        for profile in data['profiles']:
            try:
                new_user_id = user_id_map.get(profile['user_id'])

                if new_user_id:
                    await conn.execute("""
                        INSERT INTO bot_profiles (user_id, bio, occupation, looking_for, can_help_with,
                                                 needs_help_with, photo_file_id, city, moderation_status,
                                                 is_visible, created_at, updated_at)
                        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
                        ON CONFLICT (user_id) DO UPDATE SET
                            bio = EXCLUDED.bio,
                            occupation = EXCLUDED.occupation
                    """,
                        new_user_id,
                        profile.get('bio'),
                        profile.get('occupation'),
                        profile.get('looking_for'),
                        profile.get('can_help_with'),
                        profile.get('needs_help_with'),
                        profile.get('photo_file_id'),
                        profile.get('city', 'Минск'),
                        profile.get('moderation_status', 'pending'),
                        bool(profile.get('is_visible', True)),
                        datetime.fromisoformat(profile['created_at']) if profile.get('created_at') else datetime.now(),
                        datetime.fromisoformat(profile['updated_at']) if profile.get('updated_at') else datetime.now()
                    )
                    profile_count += 1
            except Exception as e:
                print(f"  Error migrating profile: {e}")

        print(f"  Migrated {profile_count} profiles")

        # 6. Migrate Questions
        print("\n--- Migrating questions ---")
        q_count = 0

        for q in data['questions']:
            try:
                await conn.execute("""
                    INSERT INTO bot_questions (user_id, username, chat_id, message_id, question_text,
                                              answer_text, question_type, answered, created_at, answered_at)
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
                    ON CONFLICT DO NOTHING
                """,
                    q['user_id'],
                    q.get('username'),
                    q['chat_id'],
                    q['message_id'],
                    q['question_text'],
                    q.get('answer_text'),
                    q.get('question_type', 'reply'),
                    bool(q.get('answered', False)),
                    datetime.fromisoformat(q['created_at']) if q.get('created_at') else datetime.now(),
                    datetime.fromisoformat(q['answered_at']) if q.get('answered_at') else None
                )
                q_count += 1
            except Exception as e:
                print(f"  Error migrating question: {e}")

        print(f"  Migrated {q_count} questions")

        # 7. Migrate Security Logs
        print("\n--- Migrating security logs ---")
        log_count = 0

        for log in data['security_logs']:
            try:
                await conn.execute("""
                    INSERT INTO bot_security_logs (user_id, username, chat_id, attack_type,
                                                  user_input, detection_reason, action_taken, created_at)
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                    ON CONFLICT DO NOTHING
                """,
                    log['user_id'],
                    log.get('username'),
                    log['chat_id'],
                    log.get('attack_type', 'prompt_injection'),
                    log['user_input'],
                    log['detection_reason'],
                    log['action_taken'],
                    datetime.fromisoformat(log['created_at']) if log.get('created_at') else datetime.now()
                )
                log_count += 1
            except Exception as e:
                print(f"  Error migrating security log: {e}")

        print(f"  Migrated {log_count} security logs")

        # 8. Migrate Swipes
        print("\n--- Migrating swipes ---")
        swipe_count = 0

        for swipe in data['swipes']:
            try:
                new_swiper_id = user_id_map.get(swipe['swiper_id'])
                new_swiped_id = user_id_map.get(swipe['swiped_id'])

                if new_swiper_id and new_swiped_id:
                    await conn.execute("""
                        INSERT INTO bot_swipes (swiper_id, swiped_id, action, swiped_at)
                        VALUES ($1, $2, $3, $4)
                        ON CONFLICT DO NOTHING
                    """,
                        new_swiper_id,
                        new_swiped_id,
                        swipe['action'],
                        datetime.fromisoformat(swipe['swiped_at']) if swipe.get('swiped_at') else datetime.now()
                    )
                    swipe_count += 1
            except Exception as e:
                print(f"  Error migrating swipe: {e}")

        print(f"  Migrated {swipe_count} swipes")

        # 9. Migrate Matches
        print("\n--- Migrating matches ---")
        match_count = 0

        for match in data['matches']:
            try:
                new_user1_id = user_id_map.get(match['user1_id'])
                new_user2_id = user_id_map.get(match['user2_id'])

                if new_user1_id and new_user2_id:
                    await conn.execute("""
                        INSERT INTO bot_matches (user1_id, user2_id, matched_at, is_active)
                        VALUES ($1, $2, $3, $4)
                        ON CONFLICT DO NOTHING
                    """,
                        new_user1_id,
                        new_user2_id,
                        datetime.fromisoformat(match['matched_at']) if match.get('matched_at') else datetime.now(),
                        bool(match.get('is_active', True))
                    )
                    match_count += 1
            except Exception as e:
                print(f"  Error migrating match: {e}")

        print(f"  Migrated {match_count} matches")

        print("\n=== Migration completed! ===")

    finally:
        await conn.close()


async def main():
    print("=== SQLite to Supabase Migration ===\n")

    print("Extracting data from SQLite...")
    data = get_sqlite_data()

    print("\nMigrating to Supabase...")
    await migrate_to_supabase(data)


if __name__ == "__main__":
    asyncio.run(main())
