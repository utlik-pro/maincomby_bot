#!/bin/bash
#
# MAIN Community Release Script
#
# Usage: ./scripts/release.sh <major|minor|patch> [options]
#
# Options:
#   --dry-run     Show what would be done without making changes
#   --no-tag      Don't create git tag
#   --no-commit   Don't create git commit
#   --notify      Send release notification to bot (requires running bot)
#
# Examples:
#   ./scripts/release.sh patch                    # 1.0.0 -> 1.0.1
#   ./scripts/release.sh minor --dry-run         # Preview minor release
#   ./scripts/release.sh major --notify          # Major release with notification

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Project paths
PROJECT_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
VERSION_FILE="$PROJECT_ROOT/VERSION"
CHANGELOG_FILE="$PROJECT_ROOT/CHANGELOG.md"
RELEASES_FILE="$PROJECT_ROOT/releases/releases.json"
MINIAPP_PKG="$PROJECT_ROOT/miniapp/package.json"
LANDING_PKG="$PROJECT_ROOT/miniapp/landing/package.json"
MINIAPP_VERSION_TS="$PROJECT_ROOT/miniapp/src/lib/version.ts"
LANDING_VERSION_TS="$PROJECT_ROOT/miniapp/landing/src/lib/version.ts"
LANDING_RELEASES_FILE="$PROJECT_ROOT/miniapp/landing/src/data/releases.json"

# Read current version
if [ -f "$VERSION_FILE" ]; then
    CURRENT_VERSION=$(cat "$VERSION_FILE" | tr -d '\n')
else
    CURRENT_VERSION="0.0.0"
fi

# Usage information
usage() {
    echo -e "${BLUE}MAIN Community Release Script${NC}"
    echo ""
    echo "Usage: $0 <major|minor|patch> [options]"
    echo ""
    echo "Options:"
    echo "  --dry-run     Show what would be done without making changes"
    echo "  --no-tag      Don't create git tag"
    echo "  --no-commit   Don't create git commit"
    echo "  --notify      Send release notification to bot"
    echo ""
    echo "Current version: ${GREEN}$CURRENT_VERSION${NC}"
    exit 1
}

# Bump version based on type
bump_version() {
    local version=$1
    local bump_type=$2

    IFS='.' read -ra parts <<< "$version"
    local major=${parts[0]}
    local minor=${parts[1]}
    local patch=${parts[2]}

    case $bump_type in
        major) echo "$((major + 1)).0.0" ;;
        minor) echo "$major.$((minor + 1)).0" ;;
        patch) echo "$major.$minor.$((patch + 1))" ;;
        *) echo "$version" ;;
    esac
}

# Generate changelog from git commits since last tag
generate_changelog_section() {
    local last_tag=$(git describe --tags --abbrev=0 2>/dev/null || echo "")
    local range=""

    if [ -n "$last_tag" ]; then
        range="$last_tag..HEAD"
        echo -e "${BLUE}Generating changelog from $last_tag to HEAD${NC}"
    else
        echo -e "${YELLOW}No previous tag found, including all commits${NC}"
    fi

    # Features (feat:)
    local features=$(git log $range --pretty=format:"%s" --grep="^feat" 2>/dev/null | sed 's/^feat[:(][^)]*[)]: */- /' | sed 's/^feat: */- /' | head -20)

    # Fixes (fix:)
    local fixes=$(git log $range --pretty=format:"%s" --grep="^fix" 2>/dev/null | sed 's/^fix[:(][^)]*[)]: */- /' | sed 's/^fix: */- /' | head -20)

    # Improvements (refactor:, perf:, chore:)
    local improvements=$(git log $range --pretty=format:"%s" --grep="^refactor\|^perf\|^chore" 2>/dev/null | sed 's/^[a-z]*[:(][^)]*[)]: */- /' | sed 's/^[a-z]*: */- /' | head -10)

    # Build the changelog section
    local section=""

    if [ -n "$features" ]; then
        section+="### Added\n$features\n\n"
    fi

    if [ -n "$fixes" ]; then
        section+="### Fixed\n$fixes\n\n"
    fi

    if [ -n "$improvements" ]; then
        section+="### Changed\n$improvements\n\n"
    fi

    if [ -z "$section" ]; then
        section="### Changed\n- Minor updates and improvements\n\n"
    fi

    echo -e "$section"
}

# Sync versions to all files
sync_versions() {
    local new_version=$1

    echo -e "${YELLOW}Syncing version $new_version to all components...${NC}"

    # Update VERSION file
    echo "$new_version" > "$VERSION_FILE"
    echo -e "  ${GREEN}✓${NC} VERSION"

    # Update miniapp/package.json
    if [ -f "$MINIAPP_PKG" ]; then
        if [[ "$OSTYPE" == "darwin"* ]]; then
            sed -i '' "s/\"version\": \"[^\"]*\"/\"version\": \"$new_version\"/" "$MINIAPP_PKG"
        else
            sed -i "s/\"version\": \"[^\"]*\"/\"version\": \"$new_version\"/" "$MINIAPP_PKG"
        fi
        echo -e "  ${GREEN}✓${NC} miniapp/package.json"
    fi

    # Update landing/package.json
    if [ -f "$LANDING_PKG" ]; then
        if [[ "$OSTYPE" == "darwin"* ]]; then
            sed -i '' "s/\"version\": \"[^\"]*\"/\"version\": \"$new_version\"/" "$LANDING_PKG"
        else
            sed -i "s/\"version\": \"[^\"]*\"/\"version\": \"$new_version\"/" "$LANDING_PKG"
        fi
        echo -e "  ${GREEN}✓${NC} miniapp/landing/package.json"
    fi

    # Update miniapp/src/lib/version.ts
    if [ -f "$MINIAPP_VERSION_TS" ]; then
        if [[ "$OSTYPE" == "darwin"* ]]; then
            sed -i '' "s/APP_VERSION = '[^']*'/APP_VERSION = '$new_version'/" "$MINIAPP_VERSION_TS"
            # Increment CURRENT_APP_VERSION
            local current_app_version=$(grep "CURRENT_APP_VERSION = " "$MINIAPP_VERSION_TS" | grep -o "[0-9]*")
            local new_app_version=$((current_app_version + 1))
            sed -i '' "s/CURRENT_APP_VERSION = [0-9]*/CURRENT_APP_VERSION = $new_app_version/" "$MINIAPP_VERSION_TS"
        else
            sed -i "s/APP_VERSION = '[^']*'/APP_VERSION = '$new_version'/" "$MINIAPP_VERSION_TS"
            local current_app_version=$(grep "CURRENT_APP_VERSION = " "$MINIAPP_VERSION_TS" | grep -o "[0-9]*")
            local new_app_version=$((current_app_version + 1))
            sed -i "s/CURRENT_APP_VERSION = [0-9]*/CURRENT_APP_VERSION = $new_app_version/" "$MINIAPP_VERSION_TS"
        fi
        echo -e "  ${GREEN}✓${NC} miniapp/src/lib/version.ts (APP_VERSION=$new_version, CURRENT_APP_VERSION=$new_app_version)"
    fi

    # Update landing version.ts
    if [ -f "$LANDING_VERSION_TS" ]; then
        if [[ "$OSTYPE" == "darwin"* ]]; then
            sed -i '' "s/APP_VERSION = '[^']*'/APP_VERSION = '$new_version'/" "$LANDING_VERSION_TS"
        else
            sed -i "s/APP_VERSION = '[^']*'/APP_VERSION = '$new_version'/" "$LANDING_VERSION_TS"
        fi
        echo -e "  ${GREEN}✓${NC} miniapp/landing/src/lib/version.ts"
    fi
}

# Update LATEST_RELEASE in version.ts
update_latest_release() {
    local new_version=$1
    local today=$2
    local bump_type=$3

    echo -e "${YELLOW}Updating LATEST_RELEASE in version.ts...${NC}"

    # Get commit messages since last tag
    local last_tag=$(git describe --tags --abbrev=0 2>/dev/null || echo "")
    local range=""
    if [ -n "$last_tag" ]; then
        range="$last_tag..HEAD"
    fi

    # Parse features and fixes from commits
    local features=$(git log $range --pretty=format:"%s" --grep="^feat" 2>/dev/null | sed 's/^feat[:(][^)]*[)]: *//' | sed 's/^feat: *//' | head -3)
    local fixes=$(git log $range --pretty=format:"%s" --grep="^fix" 2>/dev/null | sed 's/^fix[:(][^)]*[)]: *//' | sed 's/^fix: *//' | head -3)

    # Generate summary based on bump type
    local summary=""
    case $bump_type in
        major) summary="Мажорное обновление v$new_version" ;;
        minor) summary="Новые возможности в v$new_version" ;;
        patch) summary="Исправления и улучшения v$new_version" ;;
    esac

    # Use Python to update the LATEST_RELEASE object
    python3 << PYEOF
import re

version = "$new_version"
date = "$today"
summary = "$summary"
features_raw = """$features"""
fixes_raw = """$fixes"""

# Parse features and fixes - clean up quotes
features = [f.strip().replace("'", "\\'") for f in features_raw.strip().split('\n') if f.strip()]
fixes = [f.strip().replace("'", "\\'") for f in fixes_raw.strip().split('\n') if f.strip()]

# Generate highlights (first 3 features or generic)
if features:
    highlights = [(f[:25] + '...' if len(f) > 25 else f) for f in features[:3]]
else:
    highlights = ["Обновление системы", "Улучшения", "Исправления"]

# Build the new LATEST_RELEASE content
highlights_lines = []
for h in highlights:
    highlights_lines.append(f"    {{ title: '{h}', description: 'Подробнее в changelog' }},")
highlights_str = "\n".join(highlights_lines)

features_lines = []
for f in (features if features else ["Мелкие улучшения"]):
    features_lines.append(f"    '{f}',")
features_str = "\n".join(features_lines)

fixes_lines = []
for f in fixes:
    fixes_lines.append(f"    '{f}',")
fixes_str = "\n".join(fixes_lines) if fixes_lines else ""

new_release = f'''// Latest release information for "What's New" modal
// NOTE: This is updated automatically by release.sh
export const LATEST_RELEASE: ReleaseNote = {{
  version: '{version}',
  date: '{date}',
  summary: '{summary}',
  highlights: [
{highlights_str}
  ],
  features: [
{features_str}
  ],
  fixes: [
{fixes_str}
  ],
}}'''

# Read the file
with open("$MINIAPP_VERSION_TS", "r") as f:
    content = f.read()

# Find start and end of LATEST_RELEASE block
start_marker = "// Latest release information for"
end_marker = "// Release history for changelog"

start_idx = content.find(start_marker)
end_idx = content.find(end_marker)

if start_idx != -1 and end_idx != -1:
    # Replace the block between markers
    new_content = content[:start_idx] + new_release + "\n\n" + content[end_idx:]

    with open("$MINIAPP_VERSION_TS", "w") as f:
        f.write(new_content)
    print("  \033[32m✓\033[0m LATEST_RELEASE updated")
else:
    print("  \033[33m!\033[0m Could not find LATEST_RELEASE markers")
PYEOF
}

# Update CHANGELOG.md
update_changelog() {
    local new_version=$1
    local today=$2
    local changelog_section=$3

    echo -e "${YELLOW}Updating CHANGELOG.md...${NC}"

    # Create temp file with new content
    local temp_file=$(mktemp)

    # Add header
    echo "# Changelog" > "$temp_file"
    echo "" >> "$temp_file"
    echo "All notable changes to MAIN Community will be documented in this file." >> "$temp_file"
    echo "" >> "$temp_file"
    echo "The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/)," >> "$temp_file"
    echo "and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html)." >> "$temp_file"
    echo "" >> "$temp_file"
    echo "## [Unreleased]" >> "$temp_file"
    echo "" >> "$temp_file"
    echo "## [$new_version] - $today" >> "$temp_file"
    echo "" >> "$temp_file"
    echo -e "$changelog_section" >> "$temp_file"

    # Append old changelog content (skip header and unreleased section)
    if [ -f "$CHANGELOG_FILE" ]; then
        # Find line number where first version starts (## [x.y.z])
        local start_line=$(grep -n "^## \[[0-9]" "$CHANGELOG_FILE" | head -1 | cut -d: -f1)
        if [ -n "$start_line" ]; then
            tail -n +$start_line "$CHANGELOG_FILE" >> "$temp_file"
        fi
    fi

    mv "$temp_file" "$CHANGELOG_FILE"
    echo -e "  ${GREEN}✓${NC} CHANGELOG.md updated"
}

# Update releases.json
update_releases_json() {
    local new_version=$1
    local today=$2
    local bump_type=$3

    echo -e "${YELLOW}Updating releases.json...${NC}"

    # This is a simplified update - in production you might want to use jq
    # For now, we'll create a Python script to do the JSON manipulation

    python3 << EOF
import json
from pathlib import Path

releases_file = Path("$RELEASES_FILE")
data = json.loads(releases_file.read_text())

new_release = {
    "version": "$new_version",
    "date": "$today",
    "tag": "v$new_version",
    "type": "$bump_type",
    "summary": "Release v$new_version",
    "highlights": [],
    "features": [],
    "fixes": [],
    "breaking": []
}

# Insert at the beginning of releases array
data["releases"].insert(0, new_release)

releases_file.write_text(json.dumps(data, indent=2))
print("  \033[32m✓\033[0m releases/releases.json updated")
EOF

    # Sync to landing folder
    if [ -f "$RELEASES_FILE" ]; then
        cp "$RELEASES_FILE" "$LANDING_RELEASES_FILE"
        echo -e "  ${GREEN}✓${NC} Synced to miniapp/landing/src/data/releases.json"
    fi
}

# Parse arguments
BUMP_TYPE=""
DRY_RUN=false
NO_TAG=false
NO_COMMIT=false
NOTIFY=false

for arg in "$@"; do
    case $arg in
        major|minor|patch) BUMP_TYPE=$arg ;;
        --dry-run) DRY_RUN=true ;;
        --no-tag) NO_TAG=true ;;
        --no-commit) NO_COMMIT=true ;;
        --notify) NOTIFY=true ;;
        -h|--help) usage ;;
        *) echo -e "${RED}Unknown option: $arg${NC}"; usage ;;
    esac
done

# Require bump type
[ -z "$BUMP_TYPE" ] && usage

# Calculate new version
NEW_VERSION=$(bump_version "$CURRENT_VERSION" "$BUMP_TYPE")
TODAY=$(date +%Y-%m-%d)

echo ""
echo -e "${GREEN}======================================${NC}"
echo -e "${GREEN}  MAIN Community Release${NC}"
echo -e "${GREEN}======================================${NC}"
echo ""
echo -e "  Version: ${YELLOW}$CURRENT_VERSION${NC} -> ${GREEN}$NEW_VERSION${NC}"
echo -e "  Type:    ${BLUE}$BUMP_TYPE${NC}"
echo -e "  Date:    $TODAY"
echo ""

# Generate changelog section
CHANGELOG_SECTION=$(generate_changelog_section)

if [ "$DRY_RUN" = true ]; then
    echo -e "${YELLOW}[DRY RUN] Would generate the following changelog:${NC}"
    echo ""
    echo -e "$CHANGELOG_SECTION"
    echo ""
    echo -e "${YELLOW}[DRY RUN] No changes made.${NC}"
    exit 0
fi

# Confirm with user
echo -e "${YELLOW}Changelog preview:${NC}"
echo -e "$CHANGELOG_SECTION"
echo ""
read -p "Proceed with release? (y/N) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${RED}Release cancelled.${NC}"
    exit 1
fi

# Perform release steps
echo ""
echo -e "${BLUE}Performing release...${NC}"
echo ""

# 1. Sync versions
sync_versions "$NEW_VERSION"

# 2. Update CHANGELOG.md
update_changelog "$NEW_VERSION" "$TODAY" "$CHANGELOG_SECTION"

# 3. Update releases.json
update_releases_json "$NEW_VERSION" "$TODAY" "$BUMP_TYPE"

# 4. Update LATEST_RELEASE in version.ts
update_latest_release "$NEW_VERSION" "$TODAY" "$BUMP_TYPE"

# 5. Git operations
if [ "$NO_COMMIT" = false ]; then
    echo ""
    echo -e "${YELLOW}Creating git commit...${NC}"
    git add -A
    git commit -m "chore(release): v$NEW_VERSION

Release v$NEW_VERSION ($BUMP_TYPE)

$(echo -e "$CHANGELOG_SECTION" | head -20)"
    echo -e "  ${GREEN}✓${NC} Git commit created"
fi

if [ "$NO_TAG" = false ] && [ "$NO_COMMIT" = false ]; then
    echo -e "${YELLOW}Creating git tag...${NC}"
    git tag -a "v$NEW_VERSION" -m "Release v$NEW_VERSION"
    echo -e "  ${GREEN}✓${NC} Git tag v$NEW_VERSION created"
fi

# 5. Optional: Send notification
if [ "$NOTIFY" = true ]; then
    echo ""
    echo -e "${YELLOW}Sending release notification...${NC}"
    # This would call a webhook or script to notify the bot
    # For now, just print instructions
    echo -e "  ${BLUE}ℹ${NC}  To notify users, run: python -m app.services.release_notifier --version=$NEW_VERSION"
fi

echo ""
echo -e "${GREEN}======================================${NC}"
echo -e "${GREEN}  Release v$NEW_VERSION complete!${NC}"
echo -e "${GREEN}======================================${NC}"
echo ""
echo -e "Next steps:"
echo -e "  1. Review changes: ${BLUE}git log -1${NC}"
echo -e "  2. Push to remote: ${BLUE}git push && git push --tags${NC}"
echo -e "  3. Deploy updates"
echo ""
