# Нетворкинг (Matching) - Документация

## Обзор

Функционал нетворкинга позволяет участникам сообщества MAIN находить друг друга через систему свайпов (как в Tinder). При взаимном лайке создаётся "матч" и обоим участникам отправляются уведомления.

## Как работает

### Основной флоу

1. Пользователь открывает вкладку "Нетворкинг"
2. Загружаются профили других участников (исключая уже просвайпанных)
3. Пользователь видит первый профиль из списка
4. Свайп влево (X) = пропустить, свайп вправо (сердце) = лайк
5. После свайпа:
   - Сохраняется запись в `bot_swipes`
   - Если лайк - проверяется взаимность
   - Если взаимный лайк - создаётся матч в `bot_matches`
   - Отправляются уведомления (in-app + Telegram)
   - Профили перезагружаются (свайпнутый больше не появится)

### Фильтрация профилей

Функция `getApprovedProfiles()` в `supabase.ts`:

```typescript
export async function getApprovedProfiles(excludeUserId: number, city?: string) {
  // 1. Получаем список уже просвайпанных user_id
  const { data: swipedData } = await supabase
    .from('bot_swipes')
    .select('swiped_id')
    .eq('swiper_id', excludeUserId)

  const swipedIds = swipedData?.map(s => s.swiped_id) || []

  // 2. Запрашиваем профили с фильтрами:
  //    - is_visible = true (не скрыт для нетворкинга)
  //    - user_id != excludeUserId (не показываем себя)
  //    - опционально фильтр по городу

  // 3. Клиентская фильтрация уже просвайпанных
  return profiles.filter(p => !swipedIds.includes(p.user_id))
}
```

### Проверка взаимности

```typescript
export async function checkMutualLike(userId1: number, userId2: number) {
  // Проверяем, лайкнул ли второй пользователь первого
  const { data } = await supabase
    .from('bot_swipes')
    .select('id')
    .eq('swiper_id', userId2)
    .eq('swiped_id', userId1)
    .eq('action', 'like')
    .single()

  return !!data
}
```

## Таблицы в БД

### bot_swipes
| Поле | Тип | Описание |
|------|-----|----------|
| id | int | PK |
| swiper_id | int | Кто свайпнул (FK -> bot_users) |
| swiped_id | int | Кого свайпнули (FK -> bot_users) |
| action | text | 'like', 'skip', 'superlike' |
| created_at | timestamp | Время свайпа |

### bot_matches
| Поле | Тип | Описание |
|------|-----|----------|
| id | int | PK |
| user1_id | int | Первый пользователь |
| user2_id | int | Второй пользователь |
| created_at | timestamp | Время матча |

### bot_profiles.is_visible
Булево поле - если `false`, профиль не показывается в свайпах.

## Уведомления при матче

### In-app уведомления
Создаются записи в `app_notifications` для обоих пользователей:
```typescript
createNotification(userId, 'match', 'Новый матч!', `Вы понравились друг другу с ${name}!`, { matchedUserId })
```

### Telegram уведомления
Отправляются через API endpoint (чтобы обойти CORS):
```
POST https://iishnica.vercel.app/api/send-match-notification
{
  userTgId: number,      // Telegram ID получателя
  matchName: string,     // Имя того, с кем матч
  matchedUserId: number, // ID пользователя в системе
  userId: number         // ID получателя в системе
}
```

## Настройки пользователя

### Скрыть для нетворкинга
В настройках профиля есть toggle "Скрыть для нетворкинга":
- Устанавливает `is_visible = false` в `bot_profiles`
- Профиль не будет показываться другим в свайпах
- Сам пользователь может продолжать свайпать

## Лимиты свайпов

| Тариф | Лимит в день |
|-------|--------------|
| free | 5 |
| light | 20 |
| pro | Безлимит |

Проверяется перед каждым лайком. При превышении показывается toast с предложением Premium.

## Файлы

- `src/screens/NetworkScreen.tsx` - основной UI компонент
- `src/lib/supabase.ts` - функции работы с БД
- `src/components/NetworkingGuide.tsx` - статья "Как работает нетворкинг"
- `/api/send-match-notification.js` (iishnica) - API для Telegram уведомлений

## История изменений

### Январь 2026
- Убрана фильтрация по `moderation_status` - все пользователи miniapp могут мэтчиться
- Добавлен toggle "Скрыть для нетворкинга" в настройках
- Добавлена статья NetworkingGuide
- Упрощена логика свайпов (убраны анимации для стабильности)
- Исправлен баг с повторяющимися профилями
- Добавлены Telegram уведомления при матче
