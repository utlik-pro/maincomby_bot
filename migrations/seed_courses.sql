-- Seed data for courses table
-- Generated based on src/data/courses.ts

INSERT INTO courses (
    slug, title, title_en, subtitle, subtitle_en, 
    description, description_en, price, currency, 
    difficulty, duration_minutes, lessons_count, 
    color, icon_name, is_enabled, sort_order,
    learning_outcomes, learning_outcomes_en, program
) VALUES
(
    'code-code',
    'Code-Code: Программирование с AI',
    'Code-Code: AI Programming',
    'Пиши код в 10 раз быстрее с помощью нейросетей',
    'Write code 10x faster with neural networks',
    'Полное руководство по использованию AI-инструментов в разработке. От GitHub Copilot до создания собственных агентов.',
    'Complete guide to using AI tools in development. From GitHub Copilot to building your own agents.',
    0, 'XTR', 'beginner', 120, 8, '#3b82f6', 'Code', true, 10,
    '["Настройка GitHub Copilot и Codeium", "Генерация бойлерплейта и тестов", "Рефакторинг легаси кода с AI", "Поиск и исправление багов", "Создание документации за секунды"]',
    '["Setup GitHub Copilot and Codeium", "Generate boilerplate and tests", "Refactor legacy code with AI", "Find and fix bugs", "Create documentation in seconds"]',
    '[{"title": "Введение в AI-кодинг", "titleEn": "Introduction to AI Coding", "duration": "10 мин"}, {"title": "Настройка окружения VS Code", "titleEn": "VS Code Environment Setup", "duration": "15 мин"}, {"title": "GitHub Copilot: Лучшие практики", "titleEn": "GitHub Copilot: Best Practices", "duration": "20 мин"}, {"title": "Рефакторинг кода", "titleEn": "Code Refactoring", "duration": "15 мин"}, {"title": "Написание тестов с AI", "titleEn": "Writing Tests with AI", "duration": "20 мин"}, {"title": "Отладка и поиск ошибок", "titleEn": "Debugging and Error Finding", "duration": "15 мин"}, {"title": "Документация и комментарии", "titleEn": "Documentation and Comments", "duration": "10 мин"}, {"title": "Финальный проект", "titleEn": "Final Project", "duration": "15 мин"}]'
),
(
    'n8n-automation',
    'N8N: Мастер автоматизации',
    'N8N: Automation Master',
    'Создавай сложные рабочие процессы без кода',
    'Create complex workflows without code',
    'Научись связывать Telegram, Google Sheets, OpenAI и CRM в единую систему. Экономь сотни часов ручной работы.',
    'Learn to connect Telegram, Google Sheets, OpenAI, and CRM into a unified system. Save hundreds of hours of manual work.',
    50, 'XTR', 'intermediate', 180, 12, '#f97316', 'Zap', true, 20,
    '["Установка N8N на свой сервер", "Работа с Webhooks и API", "Интеграция с Telegram Bot API", "Подключение AI-агентов в цепочки", "Автоматизация обработки заявок"]',
    '["Install N8N on your server", "Work with Webhooks and APIs", "Integrate with Telegram Bot API", "Connect AI agents in chains", "Automate lead processing"]',
    '[{"title": "Что такое N8N и зачем он нужен", "titleEn": "What is N8N and why use it", "duration": "10 мин"}, {"title": "Установка и интерфейс", "titleEn": "Installation and Interface", "duration": "20 мин"}, {"title": "Базовые ноды и триггеры", "titleEn": "Basic Nodes and Triggers", "duration": "15 мин"}, {"title": "Работа с JSON и данными", "titleEn": "Working with JSON and Data", "duration": "20 мин"}, {"title": "HTTP Request: Магия API", "titleEn": "HTTP Request: API Magic", "duration": "25 мин"}, {"title": "Telegram бот на N8N", "titleEn": "Telegram Bot on N8N", "duration": "30 мин"}, {"title": "Подключаем ChatGPT", "titleEn": "Connecting ChatGPT", "duration": "20 мин"}, {"title": "Ошибки и отладка", "titleEn": "Errors and Debugging", "duration": "15 мин"}, {"title": "Практика: Бот поддержки", "titleEn": "Practice: Support Bot", "duration": "25 мин"}]'
),
(
    'cursor-ide',
    'Cursor IDE Pro',
    'Cursor IDE Pro',
    'Редактор кода будущего уже здесь',
    'The code editor of the future is here',
    'Полный обзор Cursor IDE. Composer, Chat, Codebase indexing и другие фичи, которые меняют правила игры.',
    'Full overview of Cursor IDE. Composer, Chat, Codebase indexing and other game-changing features.',
    30, 'XTR', 'intermediate', 90, 6, '#8b5cf6', 'Terminal', true, 30,
    '["Миграция с VS Code", "Использование Composer (Ctrl+I)", "Работа с кодовой базой (@Codebase)", "Промптинг для рефакторинга", "Создание приложений с нуля"]',
    '["Migrating from VS Code", "Using Composer (Ctrl+I)", "Working with codebase (@Codebase)", "Prompting for refactoring", "Building apps from scratch"]',
    '[{"title": "Почему Cursor лучше VS Code", "titleEn": "Why Cursor beats VS Code", "duration": "10 мин"}, {"title": "Chat и контекст", "titleEn": "Chat and Context", "duration": "15 мин"}, {"title": "Магия Composer", "titleEn": "Composer Magic", "duration": "20 мин"}, {"title": "Индексация кодовой базы", "titleEn": "Codebase Indexing", "duration": "15 мин"}, {"title": "Создаем игру \"Змейка\" за 5 мин", "titleEn": "Create \"Snake\" game in 5 min", "duration": "15 мин"}, {"title": "Продвинутые настройки", "titleEn": "Advanced Settings", "duration": "15 мин"}]'
),
(
    'chatgpt-pro',
    'ChatGPT Pro: Взлом реальности',
    'ChatGPT Pro: Reality Hack',
    'От простых вопросов к сложной аналитике',
    'From simple questions to complex analytics',
    'Глубокое погружение в GPT-4o. Custom Instructions, Data Analysis, создание своих GPTs и промпт-инжиниринг.',
    'Deep dive into GPT-4o. Custom Instructions, Data Analysis, creating custom GPTs and prompt engineering.',
    40, 'XTR', 'beginner', 150, 10, '#10b981', 'Brain', true, 40,
    '["Структура идеального промпта", "Анализ данных в CSV/Excel", "Создание Custom GPTs", "Генерация изображений DALL-E 3", "Многошаговые рассуждения"]',
    '["Perfect prompt structure", "Data analysis in CSV/Excel", "Creating Custom GPTs", "Image generation with DALL-E 3", "Multi-step reasoning"]',
    '[{"title": "Основы промптинга", "titleEn": "Prompting Basics", "duration": "15 мин"}, {"title": "Ролевые модели", "titleEn": "Role Models", "duration": "10 мин"}, {"title": "Chain-of-Thought", "titleEn": "Chain-of-Thought", "duration": "15 мин"}, {"title": "Анализ файлов и данных", "titleEn": "File and Data Analysis", "duration": "20 мин"}, {"title": "Custom Instructions", "titleEn": "Custom Instructions", "duration": "15 мин"}, {"title": "Создаем своего GPT-ассистента", "titleEn": "Creating your GPT assistant", "duration": "30 мин"}, {"title": "Vision: работа с изображениями", "titleEn": "Vision: working with images", "duration": "15 мин"}, {"title": "Voice Mode", "titleEn": "Voice Mode", "duration": "10 мин"}, {"title": "Примеры использования в работе", "titleEn": "Work use cases", "duration": "20 мин"}]'
),
(
    'grok-xai',
    'Grok: AI без цензуры',
    'Grok: Uncensored AI',
    'Самый дерзкий AI от Илона Маска',
    'The boldest AI from Elon Musk',
    'Обзор возможностей Grok. Работа с реальным временем через X (Twitter), отличия от GPT-4, доступ к API.',
    'Overview of Grok capabilities. Real-time work via X (Twitter), differences from GPT-4, API access.',
    25, 'XTR', 'beginner', 60, 5, '#ec4899', 'Rocket', true, 50,
    '["Доступ к Grok в X.com", "Поиск новостей в реальном времени", "Генерация контента без цензуры", "Fun Mode vs Regular Mode", "API интеграция (база)"]',
    '["Accessing Grok on X.com", "Real-time news search", "Uncensored content generation", "Fun Mode vs Regular Mode", "API integration (basic)"]',
    '[{"title": "Кто такой Grok", "titleEn": "Who is Grok", "duration": "10 мин"}, {"title": "Real-time доступ к данным", "titleEn": "Real-time data access", "duration": "15 мин"}, {"title": "Сравнение с ChatGPT", "titleEn": "Comparison with ChatGPT", "duration": "10 мин"}, {"title": "Генерация шуток и рофлов", "titleEn": "Jokes and roasts generation", "duration": "10 мин"}, {"title": "Будущее xAI", "titleEn": "Future of xAI", "duration": "15 мин"}]'
),
(
    'sora-video',
    'Sora 2: Режиссер AI',
    'Sora 2: AI Director',
    'Создавай голливудские сцены из текста',
    'Create Hollywood scenes from text',
    'Полный гид по генерации видео. Промпты для камеры, света, движения. Монтаж и пост-продакшн с помощью AI.',
    'Complete guide to video generation. Prompts for camera, light, motion. Editing and post-production with AI.',
    60, 'XTR', 'advanced', 120, 8, '#f43f5e', 'Video', true, 60,
    '["Физика и движение в Sora", "Управление камерой через промпт", "Сохранение персонажей (consistency)", "Стилизация видео", "Этические ограничения"]',
    '["Physics and motion in Sora", "Camera control via prompt", "Character consistency", "Video stylization", "Ethical restrictions"]',
    '[{"title": "Введение в AI видео", "titleEn": "Intro to AI Video", "duration": "15 мин"}, {"title": "Анатомия видео-промпта", "titleEn": "Video Prompt Anatomy", "duration": "20 мин"}, {"title": "Управление камерой", "titleEn": "Camera Control", "duration": "15 мин"}, {"title": "Свет и атмосфера", "titleEn": "Light and Atmosphere", "duration": "15 мин"}, {"title": "Работа с референсами", "titleEn": "Working with references", "duration": "20 мин"}, {"title": "Монтаж сгенерированного", "titleEn": "Editing generated content", "duration": "15 мин"}, {"title": "Runway и Pika (сравнение)", "titleEn": "Runway and Pika (comparison)", "duration": "10 мин"}, {"title": "Создаем трейлер", "titleEn": "Creating a trailer", "duration": "10 мин"}]'
),
(
    'notebooklm',
    'NotebookLM: Твой Второй Мозг',
    'NotebookLM: Your Second Brain',
    'Анализируй гигабайты информации за минуты',
    'Analyze gigabytes of info in minutes',
    'Как использовать NotebookLM для учебы и работы. Загрузка PDF, генерация подкастов, подготовка к экзаменам.',
    'How to use NotebookLM for study and work. Uploading PDFs, generating podcasts, exam preparation.',
    0, 'XTR', 'beginner', 45, 5, '#0ea5e9', 'FileText', true, 70,
    '["Создание базы знаний", "Генерация аудио-подкастов (Audio Overview)", "Q&A по документам", "Совместная работа", "Сравнение источников"]',
    '["Creating knowledge base", "Generating Audio Overviews", "Q&A on documents", "Collaboration", "Source comparison"]',
    '[{"title": "Загрузка источников", "titleEn": "Uploading sources", "duration": "5 мин"}, {"title": "Чат с документами", "titleEn": "Chat with documents", "duration": "10 мин"}, {"title": "Магия Audio Overview", "titleEn": "Audio Overview Magic", "duration": "10 мин"}, {"title": "Создание заметок и цитат", "titleEn": "Notes and citations", "duration": "10 мин"}, {"title": "Примеры для студентов", "titleEn": "Use cases for students", "duration": "10 мин"}]'
),
(
    'gmini-3',
    'Gemini 3: Экосистема Google',
    'Gemini 3: Google Ecosystem',
    'Максимум от интеграции с Workspace',
    'Max out Workspace integration',
    'Использование Gemini в Docs, Sheets, Slides и Gmail. Мультимодальность на максималках.',
    'Using Gemini in Docs, Sheets, Slides and Gmail. Multimodality to the max.',
    35, 'XTR', 'intermediate', 100, 7, '#4285F4', 'Star', true, 80,
    '["Gemini в Google Docs", "Анализ таблиц Sheets", "Генерация презентаций Slides", "Умные ответы в Gmail", "Мультимодальный анализ видео"]',
    '["Gemini in Google Docs", "Sheets table analysis", "Slides presentation generation", "Smart replies in Gmail", "Multimodal video analysis"]',
    '[{"title": "Экосистема Google AI", "titleEn": "Google AI Ecosystem", "duration": "10 мин"}, {"title": "Пишем отчеты в Docs", "titleEn": "Writing reports in Docs", "duration": "15 мин"}, {"title": "Формулы в Sheets", "titleEn": "Formulas in Sheets", "duration": "20 мин"}, {"title": "Презентации за 5 минут", "titleEn": "Presentations in 5 mins", "duration": "15 мин"}, {"title": "Разбор видео с YouTube", "titleEn": "YouTube video analysis", "duration": "15 мин"}, {"title": "Gemini Advanced фишки", "titleEn": "Gemini Advanced features", "duration": "15 мин"}, {"title": "Сравнение с GPT-4", "titleEn": "Comparison with GPT-4", "duration": "10 мин"}]'
),
(
    'nano-banano',
    'Nano-Banano Pro 🍌',
    'Nano-Banano Pro 🍌',
    'Секретный курс для избранных',
    'Secret course for the chosen ones',
    'Самые передовые, экспериментальные и безумные техники использования AI. Только для тех, кто готов выйти за рамки.',
    'Most advanced, experimental and crazy AI techniques. Only for those ready to break boundaries.',
    100, 'XTR', 'advanced', 200, 15, '#FACC15', 'Zap', true, 90,
    '["Взлом системных промптов", "Автономные AI-агенты", "Генерация музыки и голоса", "Свой LLM на домашнем ПК", "Будущее AGI"]',
    '["System prompt hacking", "Autonomous AI agents", "Music and voice generation", "Self-hosted LLM", "Future of AGI"]',
    '[{"title": "Добро пожаловать в кроличью нору", "titleEn": "Welcome to the rabbit hole", "duration": "10 мин"}, {"title": "Локальные LLM (Ollama)", "titleEn": "Local LLMs (Ollama)", "duration": "30 мин"}, {"title": "Fine-tuning моделей", "titleEn": "Model Fine-tuning", "duration": "30 мин"}, {"title": "AI-агенты с AutoGen", "titleEn": "AI Agents with AutoGen", "duration": "30 мин"}, {"title": "Клонирование голоса", "titleEn": "Voice Cloning", "duration": "20 мин"}, {"title": "Suno AI: Хиты", "titleEn": "Suno AI: Hits", "duration": "20 мин"}, {"title": "Stable Diffusion XL", "titleEn": "Stable Diffusion XL", "duration": "25 мин"}, {"title": "Философия AGI", "titleEn": "Philosophy of AGI", "duration": "35 мин"}]'
)
ON CONFLICT (slug) DO UPDATE SET
    title = EXCLUDED.title,
    title_en = EXCLUDED.title_en,
    subtitle = EXCLUDED.subtitle,
    subtitle_en = EXCLUDED.subtitle_en,
    description = EXCLUDED.description,
    description_en = EXCLUDED.description_en,
    price = EXCLUDED.price,
    lessons_count = EXCLUDED.lessons_count,
    learning_outcomes = EXCLUDED.learning_outcomes,
    learning_outcomes_en = EXCLUDED.learning_outcomes_en,
    program = EXCLUDED.program;
