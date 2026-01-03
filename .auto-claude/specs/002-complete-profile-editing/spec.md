# Specification: Complete Profile Editing

## Overview

This task completes the partially implemented profile editing feature to enable users to fully manage their professional profiles, including bio, occupation, company, skills, interests, and social links. The implementation will persist all changes to Supabase and provide proper validation and error handling for a seamless user experience.

## Workflow Type

**Type**: feature

**Rationale**: This is a feature implementation task that completes existing partial functionality. It adds new capabilities (skills/interests tags, social links) while enhancing existing profile fields. The feature is essential for user engagement and professional networking within the community platform.

## Task Scope

### Services Involved
- **main** (primary) - React TypeScript frontend with Supabase backend integration

### This Task Will:
- [ ] Complete profile editing UI for display name, bio, occupation, and company
- [ ] Implement tag-based system for skills and interests with add/remove functionality
- [ ] Add social profile link fields (LinkedIn, GitHub, Telegram) with validation
- [ ] Integrate Telegram avatar sync for profile photo updates
- [ ] Persist all profile changes to Supabase database
- [ ] Implement comprehensive form validation with user-friendly error messages
- [ ] Ensure real-time state updates using Zustand and React Query

### Out of Scope:
- Authentication system changes (existing Telegram-based auth remains unchanged)
- Profile visibility settings or privacy controls
- Profile search or discovery features
- File upload for custom avatars (only Telegram avatar sync)
- Migration of existing profile data

## Service Context

### main

**Tech Stack:**
- Language: TypeScript
- Framework: React with Vite
- Styling: Tailwind CSS
- State Management: Zustand
- Data Fetching: @tanstack/react-query
- Database: Supabase (@supabase/supabase-js)
- UI Components: lucide-react icons
- Animations: framer-motion

**Entry Point:** `src/App.tsx`

**How to Run:**
```bash
npm run dev
```

**Port:** 3000

**Key Dependencies:**
- `@supabase/supabase-js` - Database operations
- `zustand` - Global state management
- `@tanstack/react-query` - Server state management and caching
- `react-router-dom` - Routing
- `lucide-react` - Icons
- `framer-motion` - Animations

## Files to Modify

> **Note**: The context gathering phase did not identify specific files. The implementation phase must first explore the codebase to locate existing profile editing components, then modify:

| File | Service | What to Change |
|------|---------|---------------|
| `src/pages/Profile.tsx` (or similar) | main | Add missing form fields for skills, interests, social links |
| `src/components/ProfileEditForm.tsx` (or similar) | main | Implement tag input components and social link validation |
| `src/lib/supabase.ts` (or similar) | main | Add API functions for profile updates |
| `src/stores/userStore.ts` (or similar) | main | Update Zustand store with new profile fields |
| `src/types/user.ts` (or similar) | main | Add TypeScript types for skills, interests, social links |

## Files to Reference

> **Note**: These are expected patterns based on the tech stack. Implementation phase should locate actual files:

| File | Pattern to Copy |
|------|----------------|
| Existing form components | Form layout, Tailwind styling patterns, validation approach |
| Supabase query hooks | React Query patterns for mutations and cache invalidation |
| Zustand store files | State management patterns and store structure |

## Patterns to Follow

### Form State Management with React Query

Expected pattern for profile updates:

```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

interface ProfileUpdateData {
  displayName?: string;
  bio?: string;
  occupation?: string;
  company?: string;
  skills?: string[];
  interests?: string[];
  socialLinks?: {
    linkedin?: string;
    github?: string;
    telegram?: string;
  };
}

const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: ProfileUpdateData) => {
      const { data: result, error } = await supabase
        .from('profiles')
        .update(data)
        .eq('user_id', userId);

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });
};
```

**Key Points:**
- Use React Query mutations for all database operations
- Invalidate relevant queries on success for cache updates
- Handle errors with proper TypeScript types
- Follow async/await patterns

### Tag Input Component Pattern

```typescript
interface TagInputProps {
  tags: string[];
  onTagsChange: (tags: string[]) => void;
  placeholder?: string;
  maxTags?: number;
}

const TagInput: React.FC<TagInputProps> = ({ tags, onTagsChange, placeholder, maxTags = 10 }) => {
  const [input, setInput] = useState('');

  const addTag = (tag: string) => {
    const trimmed = tag.trim();
    if (trimmed && !tags.includes(trimmed) && tags.length < maxTags) {
      onTagsChange([...tags, trimmed]);
      setInput('');
    }
  };

  const removeTag = (index: number) => {
    onTagsChange(tags.filter((_, i) => i !== index));
  };

  // Render tag badges with remove button
};
```

**Key Points:**
- Prevent duplicate tags
- Enforce max tag limits
- Use Tailwind for badge styling
- Include keyboard navigation (Enter to add, Backspace to remove)

### URL Validation Pattern

```typescript
const validateSocialUrl = (platform: 'linkedin' | 'github' | 'telegram', url: string): boolean => {
  const patterns = {
    linkedin: /^https?:\/\/(www\.)?linkedin\.com\/in\/[\w-]+\/?$/,
    github: /^https?:\/\/(www\.)?github\.com\/[\w-]+\/?$/,
    telegram: /^https?:\/\/(www\.)?t\.me\/[\w-]+\/?$/,
  };

  return patterns[platform].test(url);
};
```

**Key Points:**
- Validate URLs against platform-specific patterns
- Provide clear error messages for invalid formats
- Optional but validated when provided

## Requirements

### Functional Requirements

1. **Basic Profile Information**
   - Description: Users can edit display name (max 50 chars) and bio (max 500 chars)
   - Acceptance: Changes persist to database and display immediately without page refresh

2. **Professional Details**
   - Description: Users can update occupation and company fields (each max 100 chars)
   - Acceptance: Fields are optional but validated for length when provided

3. **Skills and Interests Tags**
   - Description: Users can add/remove skills and interests using a tag interface (max 10 tags each, max 30 chars per tag)
   - Acceptance: Tags are stored as arrays, duplicates prevented, UI provides add/remove actions

4. **Social Profile Links**
   - Description: Users can link LinkedIn, GitHub, and Telegram profiles with URL validation
   - Acceptance: Only valid URLs for each platform are accepted, links are clickable in view mode

5. **Profile Photo Sync**
   - Description: Users can sync their Telegram avatar to their profile photo
   - Acceptance: Clicking sync button fetches latest Telegram avatar and updates profile

6. **Form Validation**
   - Description: All inputs are validated with clear error messages
   - Acceptance: Field-level errors appear on blur, form-level errors prevent submission

7. **Data Persistence**
   - Description: All changes are saved to Supabase profiles table
   - Acceptance: Data survives page refresh and is consistent across sessions

### Edge Cases

1. **Empty Bio/Occupation** - Allow empty values (optional fields), clear previous data
2. **Special Characters in Tags** - Sanitize input, prevent HTML/script injection
3. **Invalid Social URLs** - Show specific error (e.g., "Must be a valid LinkedIn profile URL")
4. **Telegram Avatar Sync Failure** - Handle API errors gracefully, show retry option
5. **Concurrent Edits** - Use optimistic updates with rollback on error
6. **Max Length Exceeded** - Show character count, prevent submission over limit
7. **Network Errors** - Show retry button, don't lose user's unsaved changes

## Implementation Notes

### DO
- Follow existing form component patterns in the codebase
- Reuse Tailwind utility classes for consistent styling
- Use Zustand for local profile state, React Query for server state
- Implement optimistic UI updates for better UX
- Add loading states for all async operations
- Use TypeScript strict mode for type safety
- Follow existing naming conventions for files and components
- Add proper error boundaries around profile components

### DON'T
- Create new state management patterns when Zustand exists
- Bypass Supabase client for direct database access
- Store sensitive data in client-side state longer than needed
- Create custom validation when platform patterns exist
- Ignore accessibility (add proper labels, ARIA attributes)
- Hardcode text (prepare for i18n if pattern exists)

## Development Environment

### Start Services

```bash
# Install dependencies (if needed)
npm install

# Start development server
npm run dev
```

### Service URLs
- Frontend: http://localhost:3000

### Required Environment Variables
- `VITE_SUPABASE_URL`: https://ndpkxustvcijykzxqxrn.supabase.co
- `VITE_SUPABASE_ANON_KEY`: (required, from .env.production)
- `TELEGRAM_BOT_TOKEN`: (required for avatar sync)

### Database Schema Requirements

Expected Supabase `profiles` table structure:

```sql
-- profiles table (verify/create during implementation)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name VARCHAR(50),
  bio TEXT,
  occupation VARCHAR(100),
  company VARCHAR(100),
  skills TEXT[], -- Array of strings
  interests TEXT[], -- Array of strings
  social_links JSONB, -- { linkedin, github, telegram }
  avatar_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

## Success Criteria

The task is complete when:

1. [ ] Users can edit display name and bio with character limits enforced
2. [ ] Users can update occupation and company fields
3. [ ] Users can add/remove skills tags (max 10, with duplicate prevention)
4. [ ] Users can add/remove interests tags (max 10, with duplicate prevention)
5. [ ] Users can enter and validate LinkedIn, GitHub, and Telegram profile URLs
6. [ ] Profile photo can be synced from Telegram avatar
7. [ ] All changes persist to Supabase profiles table
8. [ ] Form shows validation errors for invalid inputs
9. [ ] Profile updates are reflected immediately (optimistic UI)
10. [ ] No console errors during profile editing operations
11. [ ] Existing tests still pass (if tests exist)
12. [ ] Manual browser testing confirms all functionality works end-to-end

## QA Acceptance Criteria

**CRITICAL**: These criteria must be verified by the QA Agent before sign-off.

### Unit Tests

| Test | File | What to Verify |
|------|------|----------------|
| Profile update mutation | `src/hooks/useUpdateProfile.test.ts` | Mutation calls Supabase correctly, handles errors |
| Tag input component | `src/components/TagInput.test.tsx` | Add/remove tags, prevent duplicates, max limit |
| URL validation | `src/utils/validation.test.ts` | Validates LinkedIn, GitHub, Telegram URLs correctly |
| Form validation logic | `src/components/ProfileEditForm.test.tsx` | Required fields, character limits, error messages |

### Integration Tests

| Test | Services | What to Verify |
|------|----------|----------------|
| Profile CRUD operations | main ↔ Supabase | Create, read, update profile data flows correctly |
| State synchronization | Zustand ↔ React Query | Local and server state stay in sync |
| Avatar sync flow | main ↔ Telegram API | Fetches and updates avatar from Telegram |

### End-to-End Tests

| Flow | Steps | Expected Outcome |
|------|-------|------------------|
| Complete profile editing | 1. Navigate to profile<br>2. Click edit<br>3. Fill all fields<br>4. Add skills/interests tags<br>5. Add social links<br>6. Submit | All fields save, display in view mode, persist on refresh |
| Tag management | 1. Add 3 skills tags<br>2. Remove middle tag<br>3. Add duplicate tag<br>4. Save | Tags update correctly, duplicate rejected |
| Validation errors | 1. Enter bio > 500 chars<br>2. Enter invalid GitHub URL<br>3. Try to submit | Errors display, submission prevented |
| Avatar sync | 1. Click sync avatar button<br>2. Wait for response | Avatar updates from Telegram, shows loading state |

### Browser Verification

| Page/Component | URL | Checks |
|----------------|-----|--------|
| Profile page | `http://localhost:3000/profile` | Edit mode toggles, all fields editable |
| Tag inputs | Profile edit form | Tags render as badges, add/remove buttons work |
| Social links | Profile view | Links are clickable, open in new tab |
| Form validation | Profile edit form | Errors appear on blur, clear on valid input |

### Database Verification

| Check | Query/Command | Expected |
|-------|---------------|----------|
| Profile table exists | Check Supabase dashboard | `profiles` table with correct schema |
| Profile update | Update profile, query database | Changes reflected in database immediately |
| Array fields | Check skills/interests | Stored as PostgreSQL arrays, not JSON strings |
| JSONB field | Check social_links | Stored as JSONB with correct structure |

### Supabase Schema Verification

```sql
-- Run in Supabase SQL Editor to verify schema
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'profiles';
```

Expected columns: `id`, `user_id`, `display_name`, `bio`, `occupation`, `company`, `skills`, `interests`, `social_links`, `avatar_url`, `created_at`, `updated_at`

### QA Sign-off Requirements

- [ ] All unit tests pass (or new tests created if none exist)
- [ ] All integration tests pass
- [ ] All E2E tests pass
- [ ] Browser verification complete on Chrome and Safari
- [ ] Database state verified in Supabase dashboard
- [ ] No regressions in existing functionality
- [ ] Code follows established TypeScript and React patterns
- [ ] No security vulnerabilities (XSS prevention in bio/tags)
- [ ] No console errors or warnings
- [ ] Form is accessible (keyboard navigation, screen reader friendly)
- [ ] Loading and error states are user-friendly
- [ ] Optimistic updates work correctly with rollback on error

## Implementation Strategy

### Phase 1: Discovery & Schema
1. Explore codebase to locate existing profile components
2. Verify Supabase profiles table schema
3. Identify existing form patterns and validation utilities
4. Document current vs. missing functionality

### Phase 2: Foundation
1. Update TypeScript types for new profile fields
2. Update Supabase API functions for profile CRUD
3. Update Zustand store with new fields
4. Add validation utilities

### Phase 3: UI Components
1. Create/update TagInput component for skills and interests
2. Create/update SocialLinksInput component with validation
3. Update ProfileEditForm with new fields
4. Add loading and error states

### Phase 4: Integration
1. Wire up form to Supabase mutations
2. Implement optimistic UI updates
3. Add Telegram avatar sync functionality
4. Test error scenarios

### Phase 5: Polish & QA
1. Add comprehensive validation and error messages
2. Improve accessibility
3. Add animations with framer-motion
4. Manual testing across all flows
5. Fix bugs and edge cases
6. QA verification

## Risk Mitigation

### Database Schema Unknown
- **Risk**: Profiles table may not exist or have different structure
- **Mitigation**: First task is schema verification; create migration if needed

### Partial Implementation Unclear
- **Risk**: Unknown what's already built vs. what's missing
- **Mitigation**: Discovery phase maps existing functionality before coding

### Telegram API Integration
- **Risk**: Avatar sync may require backend changes
- **Mitigation**: Investigate existing Telegram integration patterns early

### Data Migration
- **Risk**: Existing profiles may need data transformation
- **Mitigation**: Handle null/undefined gracefully, add default values where needed
