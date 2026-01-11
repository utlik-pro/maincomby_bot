---
description: Create a new release with version bump and changelog
argument-hint: [patch|minor|major] [summary]
allowed-tools: Bash(*), Read, Edit, Write, Grep
---

# Release Command for MAIN Community

Create a new release by bumping version and updating changelog.

## Arguments
- `$1`: Version bump type - **required** (patch | minor | major)
- `$2+`: Release summary - optional, will be added to releases.json

## Examples
```
/release patch
/release minor
/release major "Complete redesign of matching system"
```

## Workflow

1. **Verify current state**
   ```bash
   ./scripts/check-versions.sh
   ```

2. **Run release script** (interactive, will ask for confirmation)
   ```bash
   ./scripts/release.sh $1
   ```

3. **If summary provided**, update the latest release in `releases/releases.json`:
   - Set `summary` field to "$2"

4. **Sync to landing**
   ```bash
   cp releases/releases.json miniapp/landing/src/data/releases.json
   ```

5. **Push changes**
   ```bash
   git push && git push --tags
   ```

6. **Report success** with:
   - New version number
   - Link to changelog
   - Reminder to verify deployment

## What gets updated automatically

| File | Change |
|------|--------|
| `VERSION` | New version number |
| `CHANGELOG.md` | New section from git commits |
| `releases/releases.json` | New release entry |
| `miniapp/package.json` | version field |
| `miniapp/src/lib/version.ts` | APP_VERSION + CURRENT_APP_VERSION++ |
| `landing/package.json` | version field |
| `landing/src/lib/version.ts` | APP_VERSION |
| `landing/src/data/releases.json` | Synced copy |

## Notifications triggered

After deployment:
- **Mini App**: ChangelogSheet appears for users (CURRENT_APP_VERSION incremented)
- **Landing**: UpdateBanner shows new version notification
