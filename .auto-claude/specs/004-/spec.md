# Welcome Message Update Specification

## Overview

Update the welcome greeting message for new bot members to match the provided screenshot style with an "Открыть приложение" (Open App) button. The message should welcome users to M.AI.N - AI Community and encourage them to register through the Mini App.

## Workflow Type

**Type:** Feature (simple)

This is a straightforward feature update that modifies existing welcome message templates and adds an inline keyboard button.

## Task Scope

### Files to Modify
- `app/services/llm.py` - Update the fallback welcome message template (lines 265-286 and 337-357)
- `app/handlers/welcome.py` - Add inline keyboard button for "Открыть приложение"

### Change Details
Based on the screenshot reference, update the welcome message to:
1. Start with "Добро пожаловать!"
2. Include a brief description of M.AI.N - AI Community
3. Encourage users to press "Открыть приложение" to register and get updates
4. Add an InlineKeyboardButton with "Открыть приложение" linking to the Mini App

**New message structure:**
```
Добро пожаловать!

Добро пожаловать в M.AI.N - AI Community — активное сообщество профессионалов в области технологий, AI и инноваций!

Нажми «Открыть приложение», зарегистрируйся и получай всю информацию о мероприятиях в реальном времени.

[Кнопка: Открыть приложение]
```

### Technical Notes
- Mini App URL should be taken from config settings (webapp_url)
- Keep the LLM prompt for personalized greetings but update the fallback to match the new style
- Both welcome handlers (`on_new_chat_members` and `on_user_join`) should use the updated format

## Success Criteria

- [ ] New members receive updated welcome message with correct Russian text
- [ ] Message displays "Открыть приложение" button
- [ ] Button opens the Mini App using correct webapp URL from config
- [ ] Test passes with `/test_welcome` command
- [ ] Both `on_new_chat_members` and `on_user_join` handlers work correctly
- [ ] LLM personalization capability preserved (fallback updated, prompts intact)

## Verification

Test command: `/test_welcome`

Manual verification:
1. Confirm new message displays correctly with all text elements
2. Confirm button opens Mini App with correct URL
3. Test real new member join scenario in group chat
