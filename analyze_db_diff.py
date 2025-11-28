#!/usr/bin/env python3
"""
Analyze differences between local and VPS databases
"""
import sqlite3
from datetime import datetime

def analyze_database(db_path, label):
    """Analyze a database and return statistics"""
    conn = sqlite3.connect(db_path)
    c = conn.cursor()

    stats = {
        'label': label,
        'users': {},
        'events': {},
        'registrations': {},
        'posts': {}
    }

    # Users
    c.execute('SELECT COUNT(*) FROM users')
    stats['users']['count'] = c.fetchone()[0]
    c.execute('SELECT user_id, username, created_at FROM users ORDER BY user_id')
    stats['users']['data'] = c.fetchall()

    # Events
    c.execute('SELECT COUNT(*) FROM events')
    stats['events']['count'] = c.fetchone()[0]
    c.execute('SELECT id, title, city, event_date FROM events ORDER BY id')
    stats['events']['data'] = c.fetchall()

    # Event Registrations
    c.execute('SELECT COUNT(*) FROM event_registrations')
    stats['registrations']['count'] = c.fetchone()[0]
    c.execute('SELECT id, event_id, user_id, registered_at FROM event_registrations ORDER BY id')
    stats['registrations']['data'] = c.fetchall()

    # Posts
    c.execute('SELECT COUNT(*) FROM posts')
    stats['posts']['count'] = c.fetchone()[0]

    # Matches
    c.execute('SELECT COUNT(*) FROM matches')
    stats['matches_count'] = c.fetchone()[0]

    # Swipes
    c.execute('SELECT COUNT(*) FROM swipes')
    stats['swipes_count'] = c.fetchone()[0]

    conn.close()
    return stats

def find_conflicts(local_stats, vps_stats):
    """Find conflicts between databases"""
    conflicts = {
        'user_id_conflicts': [],
        'event_id_conflicts': [],
        'registration_conflicts': [],
        'users_only_in_local': [],
        'users_only_in_vps': [],
        'registrations_only_in_local': [],
        'registrations_only_in_vps': []
    }

    # User conflicts
    local_user_ids = {u[0] for u in local_stats['users']['data']}
    vps_user_ids = {u[0] for u in vps_stats['users']['data']}

    conflicts['users_only_in_local'] = local_user_ids - vps_user_ids
    conflicts['users_only_in_vps'] = vps_user_ids - local_user_ids

    # Check for same user_id but different data
    common_user_ids = local_user_ids & vps_user_ids
    local_users_dict = {u[0]: u for u in local_stats['users']['data']}
    vps_users_dict = {u[0]: u for u in vps_stats['users']['data']}

    for uid in common_user_ids:
        if local_users_dict[uid] != vps_users_dict[uid]:
            conflicts['user_id_conflicts'].append({
                'user_id': uid,
                'local': local_users_dict[uid],
                'vps': vps_users_dict[uid]
            })

    # Registration conflicts
    local_reg_ids = {r[0] for r in local_stats['registrations']['data']}
    vps_reg_ids = {r[0] for r in vps_stats['registrations']['data']}

    conflicts['registrations_only_in_local'] = local_reg_ids - vps_reg_ids
    conflicts['registrations_only_in_vps'] = vps_reg_ids - local_reg_ids

    return conflicts

def main():
    print("=" * 80)
    print("DATABASE COMPARISON ANALYSIS")
    print("=" * 80)

    local_stats = analyze_database('bot.db', 'LOCAL')
    vps_stats = analyze_database('bot.db.vps_download', 'VPS')

    # Print statistics
    print(f"\nLOCAL DATABASE:")
    print(f"  Users: {local_stats['users']['count']}")
    print(f"  Events: {local_stats['events']['count']}")
    print(f"  Registrations: {local_stats['registrations']['count']}")
    print(f"  Posts: {local_stats['posts']['count']}")
    print(f"  Matches: {local_stats['matches_count']}")
    print(f"  Swipes: {local_stats['swipes_count']}")

    print(f"\nVPS DATABASE:")
    print(f"  Users: {vps_stats['users']['count']}")
    print(f"  Events: {vps_stats['events']['count']}")
    print(f"  Registrations: {vps_stats['registrations']['count']}")
    print(f"  Posts: {vps_stats['posts']['count']}")
    print(f"  Matches: {vps_stats['matches_count']}")
    print(f"  Swipes: {vps_stats['swipes_count']}")

    # Find conflicts
    conflicts = find_conflicts(local_stats, vps_stats)

    print("\n" + "=" * 80)
    print("CONFLICT ANALYSIS")
    print("=" * 80)

    print(f"\nUsers only in LOCAL: {len(conflicts['users_only_in_local'])}")
    if conflicts['users_only_in_local']:
        print(f"  User IDs: {sorted(conflicts['users_only_in_local'])}")

    print(f"\nUsers only in VPS: {len(conflicts['users_only_in_vps'])}")
    if len(conflicts['users_only_in_vps']) <= 10:
        print(f"  User IDs: {sorted(conflicts['users_only_in_vps'])}")
    else:
        print(f"  (Too many to display - {len(conflicts['users_only_in_vps'])} users)")

    print(f"\nUser ID conflicts (same ID, different data): {len(conflicts['user_id_conflicts'])}")
    for conf in conflicts['user_id_conflicts']:
        print(f"  User {conf['user_id']}:")
        print(f"    LOCAL: {conf['local']}")
        print(f"    VPS:   {conf['vps']}")

    print(f"\nRegistrations only in LOCAL: {len(conflicts['registrations_only_in_local'])}")
    print(f"Registrations only in VPS: {len(conflicts['registrations_only_in_vps'])}")

    # Detailed registration analysis
    print("\n" + "=" * 80)
    print("DETAILED REGISTRATION ANALYSIS")
    print("=" * 80)

    print("\nLocal registrations:")
    for reg in local_stats['registrations']['data'][:10]:
        print(f"  ID={reg[0]}, event_id={reg[1]}, user_id={reg[2]}, time={reg[3]}")
    if len(local_stats['registrations']['data']) > 10:
        print(f"  ... and {len(local_stats['registrations']['data']) - 10} more")

    print("\nVPS registrations:")
    for reg in vps_stats['registrations']['data'][:10]:
        print(f"  ID={reg[0]}, event_id={reg[1]}, user_id={reg[2]}, time={reg[3]}")
    if len(vps_stats['registrations']['data']) > 10:
        print(f"  ... and {len(vps_stats['registrations']['data']) - 10} more")

    # Recommendations
    print("\n" + "=" * 80)
    print("MERGE RECOMMENDATIONS")
    print("=" * 80)

    if conflicts['user_id_conflicts']:
        print("\n⚠️  WARNING: User ID conflicts detected!")
        print("   You need to decide which version to keep for conflicting users.")

    if len(conflicts['users_only_in_vps']) > len(conflicts['users_only_in_local']):
        print("\n✓ VPS has more users - VPS should be the base")
    else:
        print("\n✓ LOCAL has more users - LOCAL should be the base")

    if local_stats['registrations']['count'] > vps_stats['registrations']['count']:
        print(f"✓ LOCAL has {local_stats['registrations']['count'] - vps_stats['registrations']['count']} more registrations")
        print("  These registrations should be added to VPS")

    print("\nSuggested merge strategy:")
    print("1. Use VPS database as base (has production users)")
    print("2. Add missing users from LOCAL (if any)")
    print("3. Add missing registrations from LOCAL")
    print("4. Resolve any ID conflicts manually")

if __name__ == '__main__':
    main()
