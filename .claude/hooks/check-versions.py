#!/usr/bin/env python3
"""
Pre-commit hook to verify version consistency across all project components.

This hook runs before git commit operations to ensure all version files
are synchronized. If versions are mismatched, the commit is blocked.

Usage:
    Automatically triggered by Claude Code hooks configuration.
    Can also be run manually: python3 .claude/hooks/check-versions.py
"""

import subprocess
import sys
import os

def main():
    # Find project root (where VERSION file is)
    script_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.dirname(os.path.dirname(script_dir))

    check_script = os.path.join(project_root, 'scripts', 'check-versions.sh')

    if not os.path.exists(check_script):
        print(f"⚠️  Version check script not found: {check_script}")
        sys.exit(0)  # Don't block if script missing

    try:
        result = subprocess.run(
            ['bash', check_script],
            capture_output=True,
            text=True,
            cwd=project_root
        )

        if result.returncode != 0:
            print("❌ Version mismatch detected!")
            print("")
            print(result.stdout)
            print("")
            print("Run './scripts/release.sh patch' to sync versions before committing.")
            sys.exit(1)
        else:
            print("✅ All versions synchronized")
            sys.exit(0)

    except Exception as e:
        print(f"⚠️  Error running version check: {e}")
        sys.exit(0)  # Don't block on errors

if __name__ == '__main__':
    main()
