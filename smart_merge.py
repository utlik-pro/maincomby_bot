#!/usr/bin/env python3
"""
Smart database merge script for maincomby_bot
Merges local and VPS databases without data loss
"""
import sqlite3
import argparse
import sys
from datetime import datetime
from typing import Dict, Tuple, List

# Table processing order (respects foreign keys)
TABLE_ORDER = [
    "users",
    "user_profiles",
    "roles",
    "user_roles",
    "events",
    "event_registrations",
    "questions",
    "security_logs",
    "matches",
    "swipes",
    "posts",
    "pending_posts",
    "source_channels",
    # Archive tables
    "users_archive",
    "events_archive",
    "event_registrations_archive"
]

class MergeStats:
    def __init__(self):
        self.vps_copied = 0
        self.local_added = 0
        self.local_merged = 0
        self.local_skipped = 0
        self.duplicates_resolved = 0

    def __str__(self):
        return (f"VPS copied: {self.vps_copied}, "
                f"Local added: {self.local_added}, "
                f"Local merged: {self.local_merged}, "
                f"Local skipped: {self.local_skipped}, "
                f"Duplicates resolved: {self.duplicates_resolved}")

def log(message: str, verbose: bool = False):
    """Print log message with timestamp"""
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    print(f"[{timestamp}] {message}")

def merge_users(vps_conn: sqlite3.Connection, local_conn: sqlite3.Connection,
                merged_conn: sqlite3.Connection, verbose: bool = False) -> Dict[int, int]:
    """
    Merge users table with deduplication by tg_user_id
    Returns mapping: {old_local_user_id: new_merged_user_id}
    """
    log("Merging users table...")
    stats = MergeStats()
    user_id_mapping = {}

    vps_cur = vps_conn.cursor()
    local_cur = local_conn.cursor()
    merged_cur = merged_conn.cursor()

    # Step 1: Copy all VPS users
    vps_cur.execute("SELECT * FROM users")
    vps_users = vps_cur.fetchall()

    # Get column names
    col_names = [desc[0] for desc in vps_cur.description]
    placeholders = ','.join(['?' for _ in col_names])

    for user_row in vps_users:
        merged_cur.execute(f"INSERT INTO users ({','.join(col_names)}) VALUES ({placeholders})", user_row)
        stats.vps_copied += 1

    log(f"  Copied {stats.vps_copied} users from VPS")

    # Build VPS tg_user_id -> id mapping
    vps_tg_to_id = {}
    for row in vps_users:
        user_dict = dict(zip(col_names, row))
        vps_tg_to_id[user_dict['tg_user_id']] = user_dict['id']

    # Step 2: Process local users
    local_cur.execute("SELECT * FROM users")
    local_users = local_cur.fetchall()

    for local_row in local_users:
        local_user = dict(zip(col_names, local_row))
        local_id = local_user['id']
        tg_user_id = local_user['tg_user_id']

        if tg_user_id in vps_tg_to_id:
            # User exists in VPS - check if we need to merge fields
            vps_id = vps_tg_to_id[tg_user_id]
            user_id_mapping[local_id] = vps_id

            # Merge logic: update VPS user with non-NULL local data
            merged_cur.execute("SELECT * FROM users WHERE id = ?", (vps_id,))
            vps_row = merged_cur.fetchone()
            vps_user = dict(zip(col_names, vps_row))

            updates = []
            update_values = []

            for col in col_names:
                if col in ['id', 'tg_user_id']:
                    continue

                local_val = local_user[col]
                vps_val = vps_user[col]

                # Merge rule: prefer non-NULL, non-empty values
                if local_val is not None and local_val != '' and (vps_val is None or vps_val == ''):
                    updates.append(f"{col} = ?")
                    update_values.append(local_val)

            if updates:
                update_sql = f"UPDATE users SET {', '.join(updates)} WHERE id = ?"
                update_values.append(vps_id)
                merged_cur.execute(update_sql, update_values)
                stats.local_merged += 1
                if verbose:
                    log(f"  Merged user tg_id={tg_user_id}: updated {len(updates)} fields")
            else:
                stats.local_skipped += 1
        else:
            # New user from local - add to merged
            # Reuse the same ID if possible (no conflicts)
            merged_cur.execute("SELECT id FROM users WHERE id = ?", (local_id,))
            if merged_cur.fetchone():
                # ID conflict - use auto-increment
                local_user_copy = local_user.copy()
                del local_user_copy['id']
                cols = ','.join(local_user_copy.keys())
                vals = ','.join(['?' for _ in local_user_copy])
                merged_cur.execute(f"INSERT INTO users ({cols}) VALUES ({vals})",
                                 list(local_user_copy.values()))
                new_id = merged_cur.lastrowid
                user_id_mapping[local_id] = new_id
            else:
                # No conflict - keep same ID
                merged_cur.execute(f"INSERT INTO users ({','.join(col_names)}) VALUES ({placeholders})",
                                 local_row)
                user_id_mapping[local_id] = local_id

            stats.local_added += 1
            if verbose:
                log(f"  Added new user tg_id={tg_user_id} (local_id={local_id} -> merged_id={user_id_mapping[local_id]})")

    merged_conn.commit()
    log(f"  Users merge complete: {stats}")
    return user_id_mapping

def merge_event_registrations(vps_conn: sqlite3.Connection, local_conn: sqlite3.Connection,
                              merged_conn: sqlite3.Connection, user_mapping: Dict[int, int],
                              verbose: bool = False) -> MergeStats:
    """
    Merge event_registrations with smart duplicate handling
    Keep registration with earlier registered_at timestamp
    """
    log("Merging event_registrations table...")
    stats = MergeStats()

    vps_cur = vps_conn.cursor()
    local_cur = local_conn.cursor()
    merged_cur = merged_conn.cursor()

    # Step 1: Copy all VPS registrations
    vps_cur.execute("SELECT * FROM event_registrations")
    vps_regs = vps_cur.fetchall()
    col_names = [desc[0] for desc in vps_cur.description]
    placeholders = ','.join(['?' for _ in col_names])

    for reg_row in vps_regs:
        merged_cur.execute(f"INSERT INTO event_registrations ({','.join(col_names)}) VALUES ({placeholders})",
                          reg_row)
        stats.vps_copied += 1

    log(f"  Copied {stats.vps_copied} registrations from VPS")

    # Build VPS (event_id, user_id) -> registration mapping
    vps_event_user_regs = {}
    for row in vps_regs:
        reg = dict(zip(col_names, row))
        key = (reg['event_id'], reg['user_id'])
        vps_event_user_regs[key] = reg

    # Step 2: Process local registrations
    local_cur.execute("SELECT * FROM event_registrations")
    local_regs = local_cur.fetchall()

    for local_row in local_regs:
        local_reg = dict(zip(col_names, local_row))
        local_user_id = local_reg['user_id']
        event_id = local_reg['event_id']

        # Map local user_id to merged user_id
        merged_user_id = user_mapping.get(local_user_id, local_user_id)
        key = (event_id, merged_user_id)

        # Check if registration already exists in merged database
        merged_cur.execute(
            "SELECT registered_at FROM event_registrations WHERE event_id = ? AND user_id = ?",
            (event_id, merged_user_id)
        )
        existing_reg = merged_cur.fetchone()

        if existing_reg:
            # Duplicate registration - compare timestamps
            merged_time = datetime.fromisoformat(existing_reg[0])
            local_time = datetime.fromisoformat(local_reg['registered_at'])

            if local_time < merged_time:
                # Local registration is earlier - update in merged
                update_cols = [f"{col} = ?" for col in col_names if col not in ['id', 'event_id', 'user_id']]
                update_vals = [local_reg[col] for col in col_names if col not in ['id', 'event_id', 'user_id']]
                update_vals.extend([event_id, merged_user_id])

                merged_cur.execute(
                    f"UPDATE event_registrations SET {', '.join(update_cols)} "
                    f"WHERE event_id = ? AND user_id = ?",
                    update_vals
                )
                stats.duplicates_resolved += 1
                if verbose:
                    log(f"  Updated registration for event={event_id}, user={merged_user_id} "
                        f"(local earlier by {(merged_time - local_time).total_seconds():.0f}s)")
            else:
                stats.local_skipped += 1
                if verbose:
                    log(f"  Skipped duplicate registration for event={event_id}, user={merged_user_id} "
                        f"(merged earlier by {(local_time - merged_time).total_seconds():.0f}s)")
        else:
            # New registration from local
            local_reg_copy = local_reg.copy()
            local_reg_copy['user_id'] = merged_user_id
            del local_reg_copy['id']

            cols = ','.join(local_reg_copy.keys())
            vals = ','.join(['?' for _ in local_reg_copy])
            merged_cur.execute(f"INSERT INTO event_registrations ({cols}) VALUES ({vals})",
                             list(local_reg_copy.values()))
            stats.local_added += 1
            if verbose:
                log(f"  Added new registration for event={event_id}, user={merged_user_id}")

    merged_conn.commit()
    log(f"  Event registrations merge complete: {stats}")
    return stats

def copy_table_simple(vps_conn: sqlite3.Connection, local_conn: sqlite3.Connection,
                     merged_conn: sqlite3.Connection, table_name: str,
                     user_mapping: Dict[int, int], verbose: bool = False) -> MergeStats:
    """
    Simple table copy: VPS first, then local (append mode)
    Remaps user_id foreign keys using user_mapping
    """
    log(f"Copying table {table_name}...")
    stats = MergeStats()

    vps_cur = vps_conn.cursor()
    local_cur = local_conn.cursor()
    merged_cur = merged_conn.cursor()

    # Check if table exists
    merged_cur.execute("SELECT name FROM sqlite_master WHERE type='table' AND name=?", (table_name,))
    if not merged_cur.fetchone():
        log(f"  Table {table_name} does not exist, skipping")
        return stats

    # Copy VPS rows
    vps_cur.execute(f"SELECT * FROM {table_name}")
    vps_rows = vps_cur.fetchall()

    if not vps_rows:
        col_names = []
    else:
        col_names = [desc[0] for desc in vps_cur.description]
        placeholders = ','.join(['?' for _ in col_names])

        for row in vps_rows:
            merged_cur.execute(f"INSERT INTO {table_name} ({','.join(col_names)}) VALUES ({placeholders})", row)
            stats.vps_copied += 1

    # Copy local rows
    local_cur.execute(f"SELECT * FROM {table_name}")
    local_rows = local_cur.fetchall()

    if local_rows:
        if not col_names:
            col_names = [desc[0] for desc in local_cur.description]

        has_user_id = 'user_id' in col_names
        user_id_idx = col_names.index('user_id') if has_user_id else -1

        for row in local_rows:
            row_list = list(row)

            # Remap user_id if present
            if has_user_id and user_id_idx >= 0:
                old_user_id = row_list[user_id_idx]
                row_list[user_id_idx] = user_mapping.get(old_user_id, old_user_id)

            # Remove id column (auto-increment)
            if 'id' in col_names:
                id_idx = col_names.index('id')
                row_list.pop(id_idx)
                cols_no_id = [c for c in col_names if c != 'id']
                placeholders = ','.join(['?' for _ in cols_no_id])
                merged_cur.execute(f"INSERT INTO {table_name} ({','.join(cols_no_id)}) VALUES ({placeholders})",
                                 row_list)
            else:
                placeholders = ','.join(['?' for _ in col_names])
                merged_cur.execute(f"INSERT INTO {table_name} ({','.join(col_names)}) VALUES ({placeholders})",
                                 row_list)

            stats.local_added += 1

    merged_conn.commit()
    log(f"  Table {table_name} copy complete: {stats}")
    return stats

def merge_databases(vps_db: str, local_db: str, output_db: str, verbose: bool = False):
    """Main merge function"""
    log(f"Starting database merge:")
    log(f"  VPS DB: {vps_db}")
    log(f"  Local DB: {local_db}")
    log(f"  Output DB: {output_db}")

    # Connect to databases
    vps_conn = sqlite3.connect(vps_db)
    local_conn = sqlite3.connect(local_db)
    merged_conn = sqlite3.connect(output_db)

    # Copy VPS schema to output (structure only, no data)
    log("Copying schema from VPS...")
    vps_cur = vps_conn.cursor()

    # Get all CREATE TABLE statements (skip sqlite_sequence)
    vps_cur.execute("SELECT sql FROM sqlite_master WHERE type='table' AND sql IS NOT NULL AND name != 'sqlite_sequence'")
    tables_sql = [row[0] for row in vps_cur.fetchall() if row[0]]

    # Get all CREATE INDEX statements
    vps_cur.execute("SELECT sql FROM sqlite_master WHERE type='index' AND sql IS NOT NULL")
    indexes_sql = [row[0] for row in vps_cur.fetchall() if row[0]]

    # Execute all CREATE statements
    for sql in tables_sql:
        merged_conn.execute(sql)

    for sql in indexes_sql:
        try:
            merged_conn.execute(sql)
        except sqlite3.OperationalError:
            # Some indexes are auto-created, ignore errors
            pass

    merged_conn.commit()

    # Merge users table (special handling)
    user_mapping = merge_users(vps_conn, local_conn, merged_conn, verbose)

    # Merge event_registrations (special handling)
    merge_event_registrations(vps_conn, local_conn, merged_conn, user_mapping, verbose)

    # Copy other tables
    skip_tables = ['users', 'event_registrations', 'sqlite_sequence']

    for table in TABLE_ORDER:
        if table in skip_tables:
            continue
        copy_table_simple(vps_conn, local_conn, merged_conn, table, user_mapping, verbose)

    # Close connections
    vps_conn.close()
    local_conn.close()
    merged_conn.close()

    log("✅ Database merge completed successfully!")
    log(f"Output saved to: {output_db}")

def main():
    parser = argparse.ArgumentParser(description='Smart SQLite database merger for maincomby_bot')
    parser.add_argument('--vps', required=True, help='VPS database file (base)')
    parser.add_argument('--local', required=True, help='Local database file (to merge)')
    parser.add_argument('--output', required=True, help='Output merged database file')
    parser.add_argument('--verbose', '-v', action='store_true', help='Verbose output')
    parser.add_argument('--log', help='Log file path')

    args = parser.parse_args()

    # Redirect output to log file if specified
    if args.log:
        sys.stdout = open(args.log, 'w')
        sys.stderr = sys.stdout

    try:
        merge_databases(args.vps, args.local, args.output, args.verbose)
    except Exception as e:
        log(f"❌ Error during merge: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

if __name__ == '__main__':
    main()
