#!/usr/bin/env python3
"""
Export SQLite data to SQL file for Supabase import
"""

import sqlite3
from datetime import datetime

SQLITE_DB = "/Users/admin/maincomby_bot/bot.db"
OUTPUT_FILE = "/Users/admin/maincomby_bot/migration_data.sql"


def escape_sql(value):
    """Escape string for SQL"""
    if value is None:
        return "NULL"
    if isinstance(value, bool):
        return "TRUE" if value else "FALSE"
    if isinstance(value, (int, float)):
        return str(value)
    # Escape single quotes
    escaped = str(value).replace("'", "''")
    return f"'{escaped}'"


def main():
    conn = sqlite3.connect(SQLITE_DB)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()

    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        f.write("-- Migration from SQLite to Supabase\n")
        f.write(f"-- Generated: {datetime.now().isoformat()}\n\n")

        # 1. Export Users
        print("Exporting users...")
        cursor.execute("SELECT * FROM users")
        users = cursor.fetchall()

        f.write("-- ==================== USERS ====================\n")
        f.write(f"-- Total: {len(users)} users\n\n")

        for user in users:
            f.write(f"""INSERT INTO bot_users (id, tg_user_id, username, first_name, last_name, phone_number, first_seen_at, points, warns, banned, source, utm_source, utm_medium, utm_campaign, referrer)
VALUES ({user['id']}, {user['tg_user_id']}, {escape_sql(user['username'])}, {escape_sql(user['first_name'])}, {escape_sql(user['last_name'])}, {escape_sql(user['phone_number'])}, {escape_sql(user['first_seen_at'])}, {user['points'] or 0}, {user['warns'] or 0}, {escape_sql(bool(user['banned']))}, {escape_sql(user['source'])}, {escape_sql(user['utm_source'])}, {escape_sql(user['utm_medium'])}, {escape_sql(user['utm_campaign'])}, {escape_sql(user['referrer'])})
ON CONFLICT (tg_user_id) DO UPDATE SET username = EXCLUDED.username, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;\n\n""")

        # 2. Export Events
        print("Exporting events...")
        cursor.execute("SELECT * FROM events")
        events = cursor.fetchall()

        f.write("\n-- ==================== EVENTS ====================\n")
        f.write(f"-- Total: {len(events)} events\n\n")

        for event in events:
            f.write(f"""INSERT INTO bot_events (id, title, description, event_date, city, location, location_url, speakers, max_participants, registration_deadline, is_active, created_at, created_by)
VALUES ({event['id']}, {escape_sql(event['title'])}, {escape_sql(event['description'])}, {escape_sql(event['event_date'])}, {escape_sql(event['city'] or 'Минск')}, {escape_sql(event['location'])}, {escape_sql(event['location_url'])}, {escape_sql(event['speakers'])}, {event['max_participants'] if event['max_participants'] else 'NULL'}, {escape_sql(event['registration_deadline'])}, {escape_sql(bool(event['is_active']))}, {escape_sql(event['created_at'])}, {event['created_by'] if event['created_by'] else 'NULL'})
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, description = EXCLUDED.description;\n\n""")

        # 3. Export Registrations
        print("Exporting registrations...")
        cursor.execute("SELECT * FROM event_registrations")
        registrations = cursor.fetchall()

        f.write("\n-- ==================== REGISTRATIONS ====================\n")
        f.write(f"-- Total: {len(registrations)} registrations\n\n")

        for reg in registrations:
            f.write(f"""INSERT INTO bot_registrations (id, event_id, user_id, registered_at, status, notes, registration_version, confirmed, confirmation_requested_at, reminder_sent, reminder_sent_at)
VALUES ({reg['id']}, {reg['event_id']}, {reg['user_id']}, {escape_sql(reg['registered_at'])}, {escape_sql(reg['status'] or 'registered')}, {escape_sql(reg['notes'])}, {escape_sql(reg['registration_version'] or 'new_date')}, {escape_sql(bool(reg['confirmed']))}, {escape_sql(reg['confirmation_requested_at'])}, {escape_sql(bool(reg['reminder_sent']))}, {escape_sql(reg['reminder_sent_at'])})
ON CONFLICT (id) DO NOTHING;\n\n""")

        # 4. Export Feedback
        print("Exporting feedback...")
        cursor.execute("SELECT * FROM event_feedback")
        feedback = cursor.fetchall()

        f.write("\n-- ==================== FEEDBACK ====================\n")
        f.write(f"-- Total: {len(feedback)} feedback entries\n\n")

        for fb in feedback:
            f.write(f"""INSERT INTO bot_feedback (id, event_id, user_id, speaker1_rating, speaker2_rating, comment, interested_topics, created_at)
VALUES ({fb['id']}, {fb['event_id']}, {fb['user_id']}, {fb['speaker1_rating'] if fb['speaker1_rating'] else 'NULL'}, {fb['speaker2_rating'] if fb['speaker2_rating'] else 'NULL'}, {escape_sql(fb['comment'])}, {escape_sql(fb['interested_topics'])}, {escape_sql(fb['created_at'])})
ON CONFLICT (id) DO NOTHING;\n\n""")

        # 5. Export Profiles
        print("Exporting profiles...")
        cursor.execute("SELECT * FROM user_profiles")
        profiles = cursor.fetchall()

        f.write("\n-- ==================== PROFILES ====================\n")
        f.write(f"-- Total: {len(profiles)} profiles\n\n")

        for p in profiles:
            f.write(f"""INSERT INTO bot_profiles (id, user_id, bio, occupation, looking_for, can_help_with, needs_help_with, photo_file_id, city, moderation_status, is_visible, created_at, updated_at)
VALUES ({p['id']}, {p['user_id']}, {escape_sql(p['bio'])}, {escape_sql(p['occupation'])}, {escape_sql(p['looking_for'])}, {escape_sql(p['can_help_with'])}, {escape_sql(p['needs_help_with'])}, {escape_sql(p['photo_file_id'])}, {escape_sql(p['city'] or 'Минск')}, {escape_sql(p['moderation_status'] or 'pending')}, {escape_sql(bool(p['is_visible']))}, {escape_sql(p['created_at'])}, {escape_sql(p['updated_at'])})
ON CONFLICT (user_id) DO UPDATE SET bio = EXCLUDED.bio, occupation = EXCLUDED.occupation;\n\n""")

        # 6. Export Questions
        print("Exporting questions...")
        cursor.execute("SELECT * FROM questions")
        questions = cursor.fetchall()

        f.write("\n-- ==================== QUESTIONS ====================\n")
        f.write(f"-- Total: {len(questions)} questions\n\n")

        for q in questions:
            f.write(f"""INSERT INTO bot_questions (id, user_id, username, chat_id, message_id, question_text, answer_text, question_type, answered, created_at, answered_at)
VALUES ({q['id']}, {q['user_id']}, {escape_sql(q['username'])}, {q['chat_id']}, {q['message_id']}, {escape_sql(q['question_text'])}, {escape_sql(q['answer_text'])}, {escape_sql(q['question_type'] or 'reply')}, {escape_sql(bool(q['answered']))}, {escape_sql(q['created_at'])}, {escape_sql(q['answered_at'])})
ON CONFLICT (id) DO NOTHING;\n\n""")

        # 7. Export Security Logs
        print("Exporting security logs...")
        cursor.execute("SELECT * FROM security_logs")
        logs = cursor.fetchall()

        f.write("\n-- ==================== SECURITY LOGS ====================\n")
        f.write(f"-- Total: {len(logs)} logs\n\n")

        for log in logs:
            f.write(f"""INSERT INTO bot_security_logs (id, user_id, username, chat_id, attack_type, user_input, detection_reason, action_taken, created_at)
VALUES ({log['id']}, {log['user_id']}, {escape_sql(log['username'])}, {log['chat_id']}, {escape_sql(log['attack_type'] or 'prompt_injection')}, {escape_sql(log['user_input'])}, {escape_sql(log['detection_reason'])}, {escape_sql(log['action_taken'])}, {escape_sql(log['created_at'])})
ON CONFLICT (id) DO NOTHING;\n\n""")

        # 8. Export Swipes
        print("Exporting swipes...")
        cursor.execute("SELECT * FROM swipes")
        swipes = cursor.fetchall()

        f.write("\n-- ==================== SWIPES ====================\n")
        f.write(f"-- Total: {len(swipes)} swipes\n\n")

        for s in swipes:
            f.write(f"""INSERT INTO bot_swipes (id, swiper_id, swiped_id, action, swiped_at)
VALUES ({s['id']}, {s['swiper_id']}, {s['swiped_id']}, {escape_sql(s['action'])}, {escape_sql(s['swiped_at'])})
ON CONFLICT (id) DO NOTHING;\n\n""")

        # 9. Export Matches
        print("Exporting matches...")
        cursor.execute("SELECT * FROM matches")
        matches = cursor.fetchall()

        f.write("\n-- ==================== MATCHES ====================\n")
        f.write(f"-- Total: {len(matches)} matches\n\n")

        for m in matches:
            f.write(f"""INSERT INTO bot_matches (id, user1_id, user2_id, matched_at, is_active)
VALUES ({m['id']}, {m['user1_id']}, {m['user2_id']}, {escape_sql(m['matched_at'])}, {escape_sql(bool(m['is_active']))})
ON CONFLICT (id) DO NOTHING;\n\n""")

        # Reset sequences
        f.write("\n-- ==================== RESET SEQUENCES ====================\n")
        f.write("SELECT setval('bot_users_id_seq', (SELECT MAX(id) FROM bot_users));\n")
        f.write("SELECT setval('bot_events_id_seq', (SELECT MAX(id) FROM bot_events));\n")
        f.write("SELECT setval('bot_registrations_id_seq', (SELECT MAX(id) FROM bot_registrations));\n")
        f.write("SELECT setval('bot_feedback_id_seq', (SELECT MAX(id) FROM bot_feedback));\n")
        f.write("SELECT setval('bot_profiles_id_seq', (SELECT MAX(id) FROM bot_profiles));\n")
        f.write("SELECT setval('bot_questions_id_seq', (SELECT MAX(id) FROM bot_questions));\n")
        f.write("SELECT setval('bot_security_logs_id_seq', (SELECT MAX(id) FROM bot_security_logs));\n")
        f.write("SELECT setval('bot_swipes_id_seq', (SELECT MAX(id) FROM bot_swipes));\n")
        f.write("SELECT setval('bot_matches_id_seq', (SELECT MAX(id) FROM bot_matches));\n")

    conn.close()
    print(f"\n=== Export completed! ===")
    print(f"Output file: {OUTPUT_FILE}")
    print(f"Total size: {len(open(OUTPUT_FILE).read())} bytes")


if __name__ == "__main__":
    main()
