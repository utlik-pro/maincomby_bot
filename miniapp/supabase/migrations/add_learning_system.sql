-- Learning System Tables
-- Курсы и уроки с возможностью управления через админку

-- Курсы
CREATE TABLE IF NOT EXISTS courses (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  icon TEXT DEFAULT 'BookOpen',
  color TEXT DEFAULT '#c8ff00',
  is_enabled BOOLEAN DEFAULT true,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Уроки
CREATE TABLE IF NOT EXISTS lessons (
  id TEXT PRIMARY KEY,
  course_id TEXT REFERENCES courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  duration_minutes INT DEFAULT 5,
  content JSONB NOT NULL,
  is_enabled BOOLEAN DEFAULT true,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Прогресс пользователей
CREATE TABLE IF NOT EXISTS user_lesson_progress (
  id SERIAL PRIMARY KEY,
  user_id BIGINT REFERENCES bot_users(id) ON DELETE CASCADE,
  lesson_id TEXT REFERENCES lessons(id) ON DELETE CASCADE,
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, lesson_id)
);

-- RLS policies
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_lesson_progress ENABLE ROW LEVEL SECURITY;

-- Все могут читать курсы (фильтрация is_enabled в приложении)
CREATE POLICY "Anyone can read courses" ON courses
  FOR SELECT USING (true);

CREATE POLICY "Anyone can update courses" ON courses
  FOR UPDATE USING (true);

-- Все могут читать уроки
CREATE POLICY "Anyone can read lessons" ON lessons
  FOR SELECT USING (true);

CREATE POLICY "Anyone can update lessons" ON lessons
  FOR UPDATE USING (true);

-- Пользователи могут управлять своим прогрессом
CREATE POLICY "Users can manage own progress" ON user_lesson_progress
  FOR ALL USING (true);

-- Индексы
CREATE INDEX IF NOT EXISTS idx_lessons_course_id ON lessons(course_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_user_id ON user_lesson_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_courses_enabled ON courses(is_enabled);
CREATE INDEX IF NOT EXISTS idx_lessons_enabled ON lessons(is_enabled);

-- =====================================================
-- SEED DATA: Курс "Основы промптинга"
-- =====================================================

INSERT INTO courses (id, title, description, icon, color, sort_order)
VALUES (
  'prompting-basics',
  'Основы промптинга',
  'Научись эффективно работать с AI за 40 минут',
  'Sparkles',
  '#c8ff00',
  1
) ON CONFLICT (id) DO NOTHING;

-- Урок 1: Что такое промпт
INSERT INTO lessons (id, course_id, title, duration_minutes, content, sort_order)
VALUES (
  'what-is-prompt',
  'prompting-basics',
  'Что такое промпт',
  5,
  '[
    {"type": "heading", "content": "Что такое промпт?"},
    {"type": "text", "content": "Промпт (prompt) — это текстовая инструкция, которую вы даёте AI-модели. Это ваш способ общения с искусственным интеллектом."},
    {"type": "tip", "content": "Качество ответа AI напрямую зависит от качества вашего промпта. Чем точнее инструкция — тем лучше результат."},
    {"type": "heading", "content": "Почему это важно?"},
    {"type": "text", "content": "AI-модели не читают ваши мысли. Они работают только с тем контекстом, который вы им даёте. Размытый запрос = размытый ответ."},
    {"type": "heading", "content": "Пример"},
    {"type": "example", "content": "Напиши текст", "good": false},
    {"type": "text", "content": "Слишком общий запрос. AI не знает: какой текст, для кого, какой длины, какой стиль."},
    {"type": "example", "content": "Напиши короткое описание (2-3 предложения) для карточки товара — беспроводные наушники. Целевая аудитория: молодёжь 18-25 лет. Стиль: дружелюбный, современный.", "good": true},
    {"type": "text", "content": "Конкретный запрос с контекстом, аудиторией и требованиями к формату."}
  ]'::jsonb,
  1
) ON CONFLICT (id) DO NOTHING;

-- Урок 2: Анатомия промпта
INSERT INTO lessons (id, course_id, title, duration_minutes, content, sort_order)
VALUES (
  'prompt-anatomy',
  'prompting-basics',
  'Анатомия промпта',
  8,
  '[
    {"type": "heading", "content": "4 ключевых компонента промпта"},
    {"type": "text", "content": "Хороший промпт состоит из четырёх частей. Не обязательно использовать все сразу, но знание этой структуры поможет создавать эффективные запросы."},
    {"type": "list", "content": "Компоненты:", "items": ["Роль — кем должен быть AI (эксперт, помощник, редактор)", "Контекст — фоновая информация для задачи", "Инструкция — что именно нужно сделать", "Формат — как должен выглядеть ответ"]},
    {"type": "heading", "content": "Пример полного промпта"},
    {"type": "example", "content": "Роль: Ты опытный маркетолог с 10-летним стажем.\n\nКонтекст: Компания продаёт онлайн-курсы по Python для начинающих. Целевая аудитория — люди 25-40 лет, которые хотят сменить профессию.\n\nИнструкция: Напиши 3 заголовка для email-рассылки, которые мотивируют открыть письмо.\n\nФормат: Список с коротким пояснением (1 предложение) для каждого заголовка.", "good": true},
    {"type": "heading", "content": "Фреймворк RISEN"},
    {"type": "text", "content": "Популярный фреймворк для структурирования промптов:"},
    {"type": "list", "content": "RISEN:", "items": ["R — Role (роль)", "I — Instructions (инструкции)", "S — Steps (шаги выполнения)", "E — End goal (конечная цель)", "N — Narrowing (ограничения и уточнения)"]},
    {"type": "tip", "content": "Не нужно использовать все компоненты каждый раз. Для простых задач достаточно инструкции + формата."}
  ]'::jsonb,
  2
) ON CONFLICT (id) DO NOTHING;

-- Урок 3: Техники промптинга
INSERT INTO lessons (id, course_id, title, duration_minutes, content, sort_order)
VALUES (
  'prompting-techniques',
  'prompting-basics',
  'Техники промптинга',
  10,
  '[
    {"type": "heading", "content": "Zero-shot vs Few-shot"},
    {"type": "text", "content": "Zero-shot — даём задачу без примеров. Few-shot — показываем 2-3 примера желаемого результата перед задачей."},
    {"type": "heading", "content": "Когда использовать Few-shot?"},
    {"type": "list", "content": "Few-shot помогает когда:", "items": ["Нужен специфический формат ответа", "Задача нестандартная", "AI не понимает что вы хотите с первого раза"]},
    {"type": "heading", "content": "Пример Few-shot"},
    {"type": "example", "content": "Классифицируй отзыв как позитивный или негативный.\n\nПримеры:\n\"Отличный сервис, доставили быстро\" → позитивный\n\"Ждал 3 недели, товар пришёл сломанный\" → негативный\n\nОтзыв для классификации: \"Качество хорошее, но упаковка помятая\"", "good": true},
    {"type": "heading", "content": "Chain-of-Thought (CoT)"},
    {"type": "text", "content": "Техника пошагового рассуждения. Просим AI думать шаг за шагом, что улучшает качество для сложных задач."},
    {"type": "list", "content": "Ключевые фразы для CoT:", "items": ["\"Давай разберём пошагово\"", "\"Объясни ход рассуждений\"", "\"Покажи каждый шаг расчёта\""]},
    {"type": "heading", "content": "Пример CoT"},
    {"type": "example", "content": "Задача: Компания заработала 100,000 в январе. В феврале выручка выросла на 20%, в марте упала на 15% от февраля. Какая выручка в марте?\n\nРеши пошагово, показывая каждый расчёт.", "good": true},
    {"type": "heading", "content": "Итеративный промптинг"},
    {"type": "text", "content": "Один промпт редко даёт идеальный результат. Уточняйте и корректируйте в диалоге:"},
    {"type": "list", "content": "Примеры уточнений:", "items": ["\"Сделай короче\"", "\"Добавь примеры\"", "\"Измени тон на более формальный\"", "\"Убери технический жаргон\""]}
  ]'::jsonb,
  3
) ON CONFLICT (id) DO NOTHING;

-- Урок 4: Промпты для разных задач
INSERT INTO lessons (id, course_id, title, duration_minutes, content, sort_order)
VALUES (
  'prompts-for-tasks',
  'prompting-basics',
  'Промпты для задач',
  8,
  '[
    {"type": "heading", "content": "Текстовые задачи"},
    {"type": "list", "content": "Что указывать:", "items": ["Написание: стиль, длина, целевая аудитория", "Редактирование: что именно исправить (грамматика, стиль, структура)", "Перевод: контекст и желаемый стиль перевода"]},
    {"type": "example", "content": "Отредактируй текст: исправь грамматические ошибки, сохрани авторский стиль, не меняй структуру.", "good": true},
    {"type": "heading", "content": "Анализ и структурирование"},
    {"type": "list", "content": "Ключевые моменты:", "items": ["Резюмирование: указать длину и фокус", "Классификация: дать чёткие категории", "Извлечение данных: указать формат (JSON, таблица, список)"]},
    {"type": "example", "content": "Проанализируй отзывы клиентов и выдели:\n1. Топ-3 похвалы\n2. Топ-3 жалобы\n3. Предложения по улучшению\n\nФормат: таблица с колонками [Категория, Описание, Частота упоминания]", "good": true},
    {"type": "heading", "content": "Мультимодальность"},
    {"type": "text", "content": "Современные AI (GPT-4o, Claude) умеют работать с изображениями:"},
    {"type": "list", "content": "Возможности:", "items": ["Анализ скриншотов и диаграмм", "Извлечение текста из фото", "Описание изображений", "Генерация изображений (детали важнее общих описаний)"]},
    {"type": "tip", "content": "При генерации изображений будьте максимально конкретны: цвета, стиль, композиция, настроение."}
  ]'::jsonb,
  4
) ON CONFLICT (id) DO NOTHING;

-- Урок 5: Ошибки и лучшие практики
INSERT INTO lessons (id, course_id, title, duration_minutes, content, sort_order)
VALUES (
  'errors-best-practices',
  'prompting-basics',
  'Ошибки и практики',
  5,
  '[
    {"type": "heading", "content": "Типичные ошибки"},
    {"type": "list", "content": "Чего избегать:", "items": ["Слишком размытые инструкции (\"напиши что-нибудь интересное\")", "Отсутствие контекста", "Ожидание идеального результата с первого раза", "Не проверять факты в ответах AI"]},
    {"type": "heading", "content": "Лучшие практики"},
    {"type": "list", "content": "Что делать:", "items": ["Будьте конкретны — цифры, примеры, ограничения", "Указывайте чего НЕ делать", "Просите альтернативы: \"Дай 3 варианта\"", "Проверяйте факты, особенно даты и цифры"]},
    {"type": "example", "content": "Напиши пост для LinkedIn (до 200 слов) о преимуществах удалённой работы. Тон: профессиональный, но не сухой. НЕ используй: клише, восклицательные знаки, эмодзи.", "good": true},
    {"type": "heading", "content": "Безопасность"},
    {"type": "list", "content": "Важно помнить:", "items": ["Не вводите конфиденциальные данные (пароли, номера карт)", "AI может \"галлюцинировать\" — всегда проверяйте важную информацию", "Указывайте источники при использовании AI-контента в работе", "Разные модели имеют разные ограничения"]},
    {"type": "tip", "content": "Если AI уверенно говорит неправду — это называется \"галлюцинация\". Особенно проверяйте даты, статистику и цитаты."}
  ]'::jsonb,
  5
) ON CONFLICT (id) DO NOTHING;

-- Урок 6: Заключение
INSERT INTO lessons (id, course_id, title, duration_minutes, content, sort_order)
VALUES (
  'conclusion',
  'prompting-basics',
  'Заключение',
  4,
  '[
    {"type": "heading", "content": "Чек-лист хорошего промпта"},
    {"type": "list", "content": "Проверьте:", "items": ["☐ Есть роль или контекст", "☐ Чёткая инструкция", "☐ Указан желаемый формат", "☐ Есть ограничения (длина, стиль)", "☐ Примеры (если нужно)"]},
    {"type": "heading", "content": "Ресурсы для практики"},
    {"type": "list", "content": "Бесплатные платформы:", "items": ["ChatGPT — chat.openai.com", "Claude — claude.ai", "Google AI Studio — aistudio.google.com", "Perplexity — perplexity.ai"]},
    {"type": "heading", "content": "Следующие шаги"},
    {"type": "list", "content": "Рекомендации:", "items": ["Практикуйтесь каждый день", "Сохраняйте удачные промпты в библиотеку", "Экспериментируйте с разными моделями", "Изучайте продвинутые техники (ReAct, Tree of Thoughts)"]},
    {"type": "tip", "content": "Промпт-инжиниринг — это навык, который развивается с практикой. Чем больше экспериментируете, тем лучше понимаете как \"думают\" AI-модели."},
    {"type": "text", "content": "Поздравляем! Вы завершили курс \"Основы промптинга\". Теперь у вас есть фундамент для эффективной работы с AI."}
  ]'::jsonb,
  6
) ON CONFLICT (id) DO NOTHING;
