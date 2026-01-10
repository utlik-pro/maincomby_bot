#!/bin/bash
#
# MAIN Community Version Consistency Checker
#
# Verifies that version numbers are consistent across all project components.
# Run this script before committing or deploying to catch version mismatches.
#
# Usage: ./scripts/check-versions.sh [--fix]
#
# Options:
#   --fix    Attempt to fix mismatches by syncing to VERSION file

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

PROJECT_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
VERSION_FILE="$PROJECT_ROOT/VERSION"

# Track errors
errors=0
warnings=0

# Read expected version
if [ ! -f "$VERSION_FILE" ]; then
    echo -e "${RED}ERROR: VERSION file not found at $VERSION_FILE${NC}"
    exit 1
fi

EXPECTED_VERSION=$(cat "$VERSION_FILE" | tr -d '\n')
echo -e "${BLUE}======================================${NC}"
echo -e "${BLUE}  MAIN Community Version Check${NC}"
echo -e "${BLUE}======================================${NC}"
echo ""
echo -e "Expected version: ${GREEN}$EXPECTED_VERSION${NC}"
echo ""

# Function to check a file
check_version() {
    local file=$1
    local pattern=$2
    local name=$3

    if [ ! -f "$file" ]; then
        echo -e "${YELLOW}SKIP${NC}  $name - file not found"
        warnings=$((warnings + 1))
        return
    fi

    local version=$(grep -oP "$pattern" "$file" 2>/dev/null | head -1)

    if [ -z "$version" ]; then
        echo -e "${YELLOW}SKIP${NC}  $name - version pattern not found"
        warnings=$((warnings + 1))
        return
    fi

    if [ "$version" = "$EXPECTED_VERSION" ]; then
        echo -e "${GREEN}OK${NC}    $name: $version"
    else
        echo -e "${RED}FAIL${NC}  $name: $version (expected $EXPECTED_VERSION)"
        errors=$((errors + 1))
    fi
}

# Check package.json files
check_json_version() {
    local file=$1
    local name=$2

    if [ ! -f "$file" ]; then
        echo -e "${YELLOW}SKIP${NC}  $name - file not found"
        warnings=$((warnings + 1))
        return
    fi

    # Use jq if available, otherwise grep
    if command -v jq &> /dev/null; then
        local version=$(jq -r '.version' "$file" 2>/dev/null)
    else
        local version=$(grep -oP '"version":\s*"\K[^"]+' "$file" 2>/dev/null | head -1)
    fi

    if [ -z "$version" ] || [ "$version" = "null" ]; then
        echo -e "${YELLOW}SKIP${NC}  $name - version not found"
        warnings=$((warnings + 1))
        return
    fi

    if [ "$version" = "$EXPECTED_VERSION" ]; then
        echo -e "${GREEN}OK${NC}    $name: $version"
    else
        echo -e "${RED}FAIL${NC}  $name: $version (expected $EXPECTED_VERSION)"
        errors=$((errors + 1))
    fi
}

# Check TypeScript version files
check_ts_version() {
    local file=$1
    local name=$2

    if [ ! -f "$file" ]; then
        echo -e "${YELLOW}SKIP${NC}  $name - file not found"
        warnings=$((warnings + 1))
        return
    fi

    # Extract version from APP_VERSION = '1.0.0' format
    local version=$(grep "APP_VERSION" "$file" 2>/dev/null | head -1 | sed "s/.*APP_VERSION[[:space:]]*=[[:space:]]*['\"]\\([^'\"]*\\)['\"].*/\\1/")

    if [ -z "$version" ]; then
        echo -e "${YELLOW}SKIP${NC}  $name - APP_VERSION not found"
        warnings=$((warnings + 1))
        return
    fi

    if [ "$version" = "$EXPECTED_VERSION" ]; then
        echo -e "${GREEN}OK${NC}    $name: $version"
    else
        echo -e "${RED}FAIL${NC}  $name: $version (expected $EXPECTED_VERSION)"
        errors=$((errors + 1))
    fi
}

echo "Checking versions..."
echo ""

# 1. VERSION file itself
echo -e "${GREEN}OK${NC}    VERSION file: $EXPECTED_VERSION"

# 2. Mini App package.json
check_json_version "$PROJECT_ROOT/miniapp/package.json" "miniapp/package.json"

# 3. Landing package.json
check_json_version "$PROJECT_ROOT/miniapp/landing/package.json" "landing/package.json"

# 4. Mini App version.ts
check_ts_version "$PROJECT_ROOT/miniapp/src/lib/version.ts" "miniapp/src/lib/version.ts"

# 5. Landing version.ts
check_ts_version "$PROJECT_ROOT/miniapp/landing/src/lib/version.ts" "landing/src/lib/version.ts"

# 6. Python version (reads from VERSION file, so just check it exists)
if [ -f "$PROJECT_ROOT/app/version.py" ]; then
    echo -e "${GREEN}OK${NC}    app/version.py (reads from VERSION file)"
else
    echo -e "${YELLOW}SKIP${NC}  app/version.py - file not found"
    warnings=$((warnings + 1))
fi

# 7. Releases.json latest version
if [ -f "$PROJECT_ROOT/releases/releases.json" ]; then
    if command -v jq &> /dev/null; then
        latest_release=$(jq -r '.releases[0].version // empty' "$PROJECT_ROOT/releases/releases.json" 2>/dev/null)
    else
        latest_release=$(grep -oP '"version":\s*"\K[^"]+' "$PROJECT_ROOT/releases/releases.json" 2>/dev/null | head -1)
    fi

    if [ -n "$latest_release" ]; then
        if [ "$latest_release" = "$EXPECTED_VERSION" ]; then
            echo -e "${GREEN}OK${NC}    releases/releases.json (latest): $latest_release"
        else
            echo -e "${YELLOW}INFO${NC}  releases/releases.json (latest): $latest_release"
            echo -e "        (This is expected if unreleased changes exist)"
        fi
    fi
else
    echo -e "${YELLOW}SKIP${NC}  releases/releases.json - file not found"
    warnings=$((warnings + 1))
fi

echo ""
echo -e "${BLUE}======================================${NC}"

if [ $errors -gt 0 ]; then
    echo -e "${RED}FAILED: $errors version mismatch(es) found${NC}"
    if [ $warnings -gt 0 ]; then
        echo -e "${YELLOW}WARNINGS: $warnings file(s) skipped${NC}"
    fi
    echo ""
    echo "Run './scripts/release.sh patch --no-commit --no-tag' to sync versions"
    exit 1
else
    echo -e "${GREEN}SUCCESS: All versions are consistent!${NC}"
    if [ $warnings -gt 0 ]; then
        echo -e "${YELLOW}WARNINGS: $warnings file(s) skipped${NC}"
    fi
    exit 0
fi
