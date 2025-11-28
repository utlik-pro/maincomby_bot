#!/usr/bin/env python3
"""
Database validation script for merged database
Checks integrity, constraints, and foreign keys
"""
import sqlite3
import sys
from typing import List, Tuple, Dict

class ValidationResult:
    def __init__(self, check_name: str, passed: bool, message: str, details: str = ""):
        self.check_name = check_name
        self.passed = passed
        self.message = message
        self.details = details

    def __str__(self):
        status = "✅ PASS" if self.passed else "❌ FAIL"
        result = f"{status}: {self.check_name}\n  {self.message}"
        if self.details:
            result += f"\n  Details: {self.details}"
        return result

def check_user_count(conn: sqlite3.Connection, min_expected: int = 198) -> ValidationResult:
    """Check that user count is reasonable"""
    cursor = conn.cursor()
    cursor.execute("SELECT COUNT(*) FROM users")
    count = cursor.fetchone()[0]

    if count >= min_expected:
        return ValidationResult(
            "User Count",
            True,
            f"Found {count} users (>= {min_expected})",
            f"Users table has valid record count"
        )
    else:
        return ValidationResult(
            "User Count",
            False,
            f"Found only {count} users (expected >= {min_expected})",
            "Possible data loss during merge"
        )

def check_tg_user_id_unique(conn: sqlite3.Connection) -> ValidationResult:
    """Check that tg_user_id is unique"""
    cursor = conn.cursor()
    cursor.execute("""
        SELECT tg_user_id, COUNT(*) as cnt
        FROM users
        GROUP BY tg_user_id
        HAVING cnt > 1
    """)
    duplicates = cursor.fetchall()

    if not duplicates:
        return ValidationResult(
            "TG User ID Uniqueness",
            True,
            "All tg_user_id values are unique",
            "No duplicate Telegram IDs found"
        )
    else:
        dup_ids = ', '.join([str(d[0]) for d in duplicates[:5]])
        return ValidationResult(
            "TG User ID Uniqueness",
            False,
            f"Found {len(duplicates)} duplicate tg_user_id values",
            f"Duplicates: {dup_ids}{'...' if len(duplicates) > 5 else ''}"
        )

def check_foreign_keys(conn: sqlite3.Connection) -> ValidationResult:
    """Check foreign key integrity"""
    cursor = conn.cursor()

    # Enable foreign keys check
    cursor.execute("PRAGMA foreign_keys = ON")
    cursor.execute("PRAGMA foreign_key_check")
    fk_violations = cursor.fetchall()

    if not fk_violations:
        return ValidationResult(
            "Foreign Key Integrity",
            True,
            "All foreign keys are valid",
            "No orphaned references found"
        )
    else:
        return ValidationResult(
            "Foreign Key Integrity",
            False,
            f"Found {len(fk_violations)} foreign key violations",
            f"Violations: {fk_violations[:5]}"
        )

def check_registration_uniqueness(conn: sqlite3.Connection) -> ValidationResult:
    """Check that (event_id, user_id) is unique in event_registrations"""
    cursor = conn.cursor()
    cursor.execute("""
        SELECT event_id, user_id, COUNT(*) as cnt
        FROM event_registrations
        GROUP BY event_id, user_id
        HAVING cnt > 1
    """)
    duplicates = cursor.fetchall()

    if not duplicates:
        return ValidationResult(
            "Registration Uniqueness",
            True,
            "All (event_id, user_id) pairs are unique",
            "No duplicate registrations found"
        )
    else:
        return ValidationResult(
            "Registration Uniqueness",
            False,
            f"Found {len(duplicates)} duplicate registrations",
            f"Duplicates: {duplicates[:5]}"
        )

def check_registration_count(conn: sqlite3.Connection, min_expected: int = 170) -> ValidationResult:
    """Check registration count"""
    cursor = conn.cursor()
    cursor.execute("SELECT COUNT(*) FROM event_registrations")
    count = cursor.fetchone()[0]

    if count >= min_expected:
        return ValidationResult(
            "Registration Count",
            True,
            f"Found {count} registrations (>= {min_expected})",
            "Registration data preserved"
        )
    else:
        return ValidationResult(
            "Registration Count",
            False,
            f"Found only {count} registrations (expected >= {min_expected})",
            "Possible registration data loss"
        )

def check_orphaned_registrations(conn: sqlite3.Connection) -> ValidationResult:
    """Check for registrations with non-existent users"""
    cursor = conn.cursor()
    cursor.execute("""
        SELECT er.id, er.event_id, er.user_id
        FROM event_registrations er
        LEFT JOIN users u ON er.user_id = u.id
        WHERE u.id IS NULL
    """)
    orphaned = cursor.fetchall()

    if not orphaned:
        return ValidationResult(
            "Orphaned Registrations",
            True,
            "All registrations reference valid users",
            "No orphaned registration records"
        )
    else:
        return ValidationResult(
            "Orphaned Registrations",
            False,
            f"Found {len(orphaned)} registrations with invalid user_id",
            f"Orphaned IDs: {orphaned[:5]}"
        )

def check_orphaned_user_profiles(conn: sqlite3.Connection) -> ValidationResult:
    """Check for user_profiles with non-existent users"""
    cursor = conn.cursor()

    # Check if table exists
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='user_profiles'")
    if not cursor.fetchone():
        return ValidationResult(
            "Orphaned User Profiles",
            True,
            "Table user_profiles does not exist (skipped)",
            "N/A"
        )

    cursor.execute("""
        SELECT up.id, up.user_id
        FROM user_profiles up
        LEFT JOIN users u ON up.user_id = u.id
        WHERE u.id IS NULL
    """)
    orphaned = cursor.fetchall()

    if not orphaned:
        return ValidationResult(
            "Orphaned User Profiles",
            True,
            "All user profiles reference valid users",
            "No orphaned profile records"
        )
    else:
        return ValidationResult(
            "Orphaned User Profiles",
            False,
            f"Found {len(orphaned)} profiles with invalid user_id",
            f"Orphaned profile IDs: {orphaned[:5]}"
        )

def check_indexes(conn: sqlite3.Connection) -> ValidationResult:
    """Check that important indexes exist"""
    cursor = conn.cursor()
    cursor.execute("SELECT name FROM sqlite_master WHERE type='index'")
    indexes = [row[0] for row in cursor.fetchall()]

    required_indexes = [
        'ix_users_tg_user_id',
        'ix_event_registrations_user_id',
        'ix_event_registrations_event_id'
    ]

    missing = [idx for idx in required_indexes if idx not in indexes]

    if not missing:
        return ValidationResult(
            "Required Indexes",
            True,
            f"All {len(required_indexes)} required indexes exist",
            f"Indexes: {', '.join(required_indexes)}"
        )
    else:
        return ValidationResult(
            "Required Indexes",
            False,
            f"Missing {len(missing)} required indexes",
            f"Missing: {', '.join(missing)}"
        )

def check_table_counts(conn: sqlite3.Connection) -> ValidationResult:
    """Display row counts for all tables"""
    cursor = conn.cursor()
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name")
    tables = [row[0] for row in cursor.fetchall()]

    counts = {}
    for table in tables:
        if table == 'sqlite_sequence':
            continue
        cursor.execute(f"SELECT COUNT(*) FROM {table}")
        counts[table] = cursor.fetchone()[0]

    details_lines = [f"{table}: {count}" for table, count in counts.items()]
    details = "\n    ".join(details_lines)

    return ValidationResult(
        "Table Row Counts",
        True,
        f"Found {len(tables)} tables with data",
        f"\n    {details}"
    )

def validate_database(db_path: str) -> Tuple[bool, List[ValidationResult]]:
    """Run all validation checks"""
    print(f"Validating database: {db_path}")
    print("=" * 80)

    conn = sqlite3.connect(db_path)
    results = []

    # Run all checks
    checks = [
        check_user_count,
        check_tg_user_id_unique,
        check_registration_count,
        check_registration_uniqueness,
        check_orphaned_registrations,
        check_orphaned_user_profiles,
        check_foreign_keys,
        check_indexes,
        check_table_counts
    ]

    for check_func in checks:
        try:
            result = check_func(conn)
            results.append(result)
            print(result)
            print()
        except Exception as e:
            result = ValidationResult(
                check_func.__name__,
                False,
                f"Check failed with error: {e}",
                ""
            )
            results.append(result)
            print(result)
            print()

    conn.close()

    # Summary
    print("=" * 80)
    passed = sum(1 for r in results if r.passed)
    total = len(results)
    all_passed = passed == total

    if all_passed:
        print(f"✅ ALL CHECKS PASSED ({passed}/{total})")
        print("Database is valid and ready for production use!")
    else:
        print(f"❌ SOME CHECKS FAILED ({passed}/{total} passed)")
        print("Please review failed checks before deploying to production!")

    return all_passed, results

def main():
    if len(sys.argv) != 2:
        print("Usage: python3 validate_merged.py <database_file>")
        sys.exit(1)

    db_path = sys.argv[1]

    try:
        all_passed, results = validate_database(db_path)
        sys.exit(0 if all_passed else 1)
    except Exception as e:
        print(f"❌ Validation error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

if __name__ == '__main__':
    main()
