# Landing Page для MAIN Community

## Обзор
Создание продающего лендинга для Telegram Mini App "MAIN Community" — платформы нетворкинга для техсообщества.

## Ключевые решения
- **Архитектура**: Отдельный Next.js 14+ проект в `/landing`
- **Языки**: Русский + English с переключателем
- **CTA**: "Открыть в Telegram" + форма связи
- **Дизайн**: Тёмная тема (#0a0a0a) с лаймовым акцентом (#c8ff00)

---

## Структура проекта

```
maincomby_bot/landing/
├── app/
│   ├── [locale]/
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── layout.tsx
│   ├── globals.css
│   └── sitemap.ts
├── components/
│   ├── ui/
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   └── Badge.tsx
│   ├── sections/
│   │   ├── Hero.tsx
│   │   ├── Features.tsx
│   │   ├── HowItWorks.tsx
│   │   ├── Pricing.tsx
│   │   ├── Stats.tsx
│   │   ├── FAQ.tsx
│   │   ├── Contact.tsx
│   │   └── Footer.tsx
│   ├── Navigation.tsx
│   ├── LanguageSwitcher.tsx
│   └── PhoneMockup.tsx
├── lib/
│   └── i18n.ts
├── dictionaries/
│   ├── ru.json
│   └── en.json
├── public/
│   ├── logo.svg
│   ├── logo.png
│   └── mockups/
├── tailwind.config.ts
├── next.config.ts
└── package.json
```

---

## Секции лендинга

### 1. Hero
- Заголовок: "Нетворкинг нового поколения в Telegram"
- Подзаголовок: описание ценности
- CTA: "Открыть в Telegram" → `t.me/MainCommunityBot`
- Визуал: мокап телефона с приложением

### 2. Features (6 карточек)
| Фича | Иконка | Описание |
|------|--------|----------|
| Smart Matching | Heart | Свайп-мэтчинг профессионалов |
| Events | Calendar | QR-регистрация на ивенты |
| Gamification | Trophy | XP, ранги, достижения |
| Subscriptions | Crown | Free/Light/Pro тарифы |
| Profiles | User | Кастомизация аватаров |
| Community | Users | Волонтёры, спикеры, партнёры |

### 3. How It Works (3 шага)
1. Открой бота в Telegram
2. Заполни профиль
3. Начни нетворкинг

### 4. Pricing
| Free | Light $5/мес | Pro $15/мес |
|------|--------------|-------------|
| 5 свайпов/день | 20 свайпов | Безлимит |
| Базовый профиль | Кто лайкнул | Приоритет в ленте |
| Доступ к ивентам | 1 суперлайк | 5 суперлайков |

### 5. Statistics
- 500+ участников
- 50+ мероприятий
- 1000+ мэтчей

### 6. FAQ (аккордеон)
- Как присоединиться?
- Это бесплатно?
- Что такое XP и ранги?
- Как работает мэтчинг?

### 7. Contact Form
- Имя, Telegram, Email (опц.), Тип запроса, Сообщение
- Отправка в Supabase или mailto

### 8. Footer
- Лого, навигация, соцсети, legal

---

## Дизайн-система (из miniapp)

```typescript
// tailwind.config.ts
colors: {
  bg: { DEFAULT: '#0a0a0a', card: '#1a1a1a', hover: '#252525' },
  accent: { DEFAULT: '#c8ff00', dark: '#a8d900' },
  success: '#00d26a',
  danger: '#ff4757',
  warning: '#ffa502',
}
borderRadius: { card: '20px', button: '14px' }
fontFamily: { sans: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'] }
```

CSS классы:
- `.gradient-text` — градиент #c8ff00 → #00d26a
- `.card-hover` — hover эффект
- `.haptic` — нажатие scale(0.97)

---

## Технологии

| Пакет | Версия | Назначение |
|-------|--------|------------|
| next | 14.2+ | SSG, App Router |
| react | 18.3+ | UI |
| tailwindcss | 3.4+ | Стили |
| framer-motion | 11+ | Анимации |
| next-intl | 3.x | i18n |
| lucide-react | 0.468+ | Иконки |
| @vercel/analytics | latest | Аналитика |

---

## План реализации

### Шаг 1: Инициализация проекта
- [ ] `npx create-next-app@latest landing --typescript --tailwind --app`
- [ ] Настроить tailwind.config.ts (скопировать из miniapp)
- [ ] Создать globals.css с базовыми стилями
- [ ] Скопировать logo.svg, logo.png в public/

### Шаг 2: i18n настройка
- [ ] Установить next-intl
- [ ] Создать dictionaries/ru.json и en.json
- [ ] Настроить middleware для локалей
- [ ] Создать LanguageSwitcher компонент

### Шаг 3: UI компоненты
- [ ] Button (primary, secondary, outline)
- [ ] Card с hover эффектом
- [ ] Badge для тегов
- [ ] PhoneMockup для демонстрации

### Шаг 4: Секции лендинга
- [ ] Navigation (sticky header)
- [ ] Hero с анимациями
- [ ] Features grid
- [ ] HowItWorks steps
- [ ] Pricing cards
- [ ] Stats counters
- [ ] FAQ accordion
- [ ] Contact form
- [ ] Footer

### Шаг 5: Мокапы приложения
- [ ] Создать упрощённые компоненты экранов
- [ ] Home mockup
- [ ] Network mockup
- [ ] Events mockup
- [ ] Profile mockup

### Шаг 6: SEO и деплой
- [ ] Meta tags, OG images
- [ ] Sitemap.ts
- [ ] robots.txt
- [ ] vercel.json
- [ ] Деплой на Vercel

---

## Ключевые файлы miniapp для референса

- `/Users/admin/maincomby_bot/miniapp/tailwind.config.js` — дизайн-система
- `/Users/admin/maincomby_bot/miniapp/src/index.css` — глобальные стили
- `/Users/admin/maincomby_bot/miniapp/public/logo.svg` — логотип
- `/Users/admin/maincomby_bot/miniapp/src/components/ui/` — UI компоненты
- `/Users/admin/maincomby_bot/miniapp/src/types/index.ts` — типы подписок, рангов

---

## Ссылки
- Telegram бот: `https://t.me/MainCommunityBot`
- Deep links: `?startapp=events`, `?startapp=matches`

---

## Контент для секций (RU/EN)

### Hero
**RU:**
- Заголовок: "Профессиональный нетворкинг в Telegram"
- Подзаголовок: "Находи полезные контакты, посещай мероприятия, развивайся вместе с техсообществом MAIN"
- CTA Primary: "Открыть в Telegram"
- CTA Secondary: "Связаться с нами"

**EN:**
- Title: "Professional Networking in Telegram"
- Subtitle: "Find valuable connections, attend events, grow with MAIN tech community"
- CTA Primary: "Open in Telegram"
- CTA Secondary: "Contact Us"

### Features
**RU:**
1. **Умный мэтчинг** — Свайпай профили и находи людей с похожими интересами
2. **Мероприятия** — Регистрируйся на ивенты одним кликом, получай QR-билет
3. **Геймификация** — Зарабатывай XP, повышай ранг, открывай достижения
4. **Подписки** — Выбери тариф под свои потребности
5. **Профиль** — Настрой аватар, добавь соцсети, покажи экспертизу
6. **Комьюнити** — Становись волонтёром, спикером или партнёром

**EN:**
1. **Smart Matching** — Swipe profiles and find people with similar interests
2. **Events** — Register for events with one click, get QR ticket
3. **Gamification** — Earn XP, level up your rank, unlock achievements
4. **Subscriptions** — Choose a plan that fits your needs
5. **Profile** — Customize avatar, add social links, showcase expertise
6. **Community** — Become a volunteer, speaker, or partner
