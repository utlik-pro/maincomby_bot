import { BookOpen, Bot, Brain, Code, Cpu, FileText, Globe, GraduationCap, Laptop, Link as LinkIcon, Lock, MessageSquare, Rocket, Sparkles, Star, Terminal, Video, Zap } from 'lucide-react'

// Access tier determines which subscription level can access the course
export type AccessTier = 'free' | 'light' | 'pro'

export interface CourseData {
    id: string
    slug: string
    title: string
    titleEn: string
    subtitle: string
    subtitleEn: string
    description: string
    descriptionEn: string
    price: number
    currency: string
    difficulty: 'beginner' | 'intermediate' | 'advanced'
    duration: number // minutes
    lessonsCount: number
    icon: any
    color: string
    tags: string[]
    tagsEn: string[]
    isPublic?: boolean // If true, content is viewable on landing without auth
    accessTier: AccessTier // Minimum subscription tier required (can be purchased separately)
    learningOutcomes: string[]
    learningOutcomesEn: string[]
    program: {
        title: string
        titleEn: string
        duration: string
    }[]
}

export const coursesData: CourseData[] = [
    {
        id: 'prompt-engineering',
        slug: 'prompt-engineering',
        title: 'Prompt Engineering: Основы',
        titleEn: 'Prompt Engineering: Fundamentals',
        subtitle: 'Научись говорить с AI на одном языке',
        subtitleEn: 'Learn to speak the same language as AI',
        description: 'Фундаментальный курс по промпт-инжинирингу. От базовых принципов до продвинутых техник. Открытый доступ для всех.',
        descriptionEn: 'Fundamental prompt engineering course. From basic principles to advanced techniques. Open access for everyone.',
        price: 0,
        currency: 'XTR',
        difficulty: 'beginner',
        duration: 90,
        lessonsCount: 6,
        icon: Sparkles,
        color: '#c8ff00',
        tags: ['Бесплатно', 'Открытый доступ'],
        tagsEn: ['Free', 'Open Access'],
        isPublic: true, // This course is publicly accessible on the landing page
        accessTier: 'free',
        learningOutcomes: [
            'Структура эффективного промпта',
            'Ролевые модели и контекст',
            'Chain-of-Thought техника',
            'Few-shot и Zero-shot промптинг',
            'Итеративное улучшение ответов',
            'Практические примеры для работы'
        ],
        learningOutcomesEn: [
            'Effective prompt structure',
            'Role models and context',
            'Chain-of-Thought technique',
            'Few-shot and Zero-shot prompting',
            'Iterative response improvement',
            'Practical work examples'
        ],
        program: [
            { title: 'Почему AI не понимает тебя', titleEn: 'Why AI doesn\'t understand you', duration: '10 мин' },
            { title: 'Анатомия идеального промпта', titleEn: 'Anatomy of a perfect prompt', duration: '15 мин' },
            { title: 'Роли и персоны', titleEn: 'Roles and personas', duration: '15 мин' },
            { title: 'Chain-of-Thought: Думай шаг за шагом', titleEn: 'Chain-of-Thought: Think step by step', duration: '20 мин' },
            { title: 'Few-shot: Учим на примерах', titleEn: 'Few-shot: Learning by examples', duration: '15 мин' },
            { title: 'Практика: 10 готовых промптов', titleEn: 'Practice: 10 ready prompts', duration: '15 мин' }
        ]
    },
    {
        id: 'code-code',
        slug: 'code-code',
        title: 'Code-Code: Программирование с AI',
        titleEn: 'Code-Code: AI Programming',
        subtitle: 'Пиши код в 10 раз быстрее с помощью нейросетей',
        subtitleEn: 'Write code 10x faster with neural networks',
        description: 'Полное руководство по использованию AI-инструментов в разработке. От GitHub Copilot до создания собственных агентов.',
        descriptionEn: 'Complete guide to using AI tools in development. From GitHub Copilot to building your own agents.',
        price: 0,
        currency: 'XTR',
        difficulty: 'beginner',
        duration: 120,
        lessonsCount: 8,
        icon: Code,
        color: '#3b82f6',
        tags: ['Бесплатно', 'Популярное'],
        tagsEn: ['Free', 'Popular'],
        accessTier: 'free',
        learningOutcomes: [
            'Настройка GitHub Copilot и Codeium',
            'Генерация бойлерплейта и тестов',
            'Рефакторинг легаси кода с AI',
            'Поиск и исправление багов',
            'Создание документации за секунды'
        ],
        learningOutcomesEn: [
            'Setup GitHub Copilot and Codeium',
            'Generate boilerplate and tests',
            'Refactor legacy code with AI',
            'Find and fix bugs',
            'Create documentation in seconds'
        ],
        program: [
            { title: 'Введение в AI-кодинг', titleEn: 'Introduction to AI Coding', duration: '10 мин' },
            { title: 'Настройка окружения VS Code', titleEn: 'VS Code Environment Setup', duration: '15 мин' },
            { title: 'GitHub Copilot: Лучшие практики', titleEn: 'GitHub Copilot: Best Practices', duration: '20 мин' },
            { title: 'Рефакторинг кода', titleEn: 'Code Refactoring', duration: '15 мин' },
            { title: 'Написание тестов с AI', titleEn: 'Writing Tests with AI', duration: '20 мин' },
            { title: 'Отладка и поиск ошибок', titleEn: 'Debugging and Error Finding', duration: '15 мин' },
            { title: 'Документация и комментарии', titleEn: 'Documentation and Comments', duration: '10 мин' },
            { title: 'Финальный проект', titleEn: 'Final Project', duration: '15 мин' }
        ]
    },
    {
        id: 'n8n-automation',
        slug: 'n8n-automation',
        title: 'N8N: Мастер автоматизации',
        titleEn: 'N8N: Automation Master',
        subtitle: 'Создавай сложные рабочие процессы без кода',
        subtitleEn: 'Create complex workflows without code',
        description: 'Научись связывать Telegram, Google Sheets, OpenAI и CRM в единую систему. Экономь сотни часов ручной работы.',
        descriptionEn: 'Learn to connect Telegram, Google Sheets, OpenAI, and CRM into a unified system. Save hundreds of hours of manual work.',
        price: 50,
        currency: 'XTR',
        difficulty: 'intermediate',
        duration: 180,
        lessonsCount: 12,
        icon: Zap,
        color: '#f97316',
        tags: ['Автоматизация', 'No-Code'],
        tagsEn: ['Automation', 'No-Code'],
        accessTier: 'pro',
        learningOutcomes: [
            'Установка N8N на свой сервер',
            'Работа с Webhooks и API',
            'Интеграция с Telegram Bot API',
            'Подключение AI-агентов в цепочки',
            'Автоматизация обработки заявок'
        ],
        learningOutcomesEn: [
            'Install N8N on your server',
            'Work with Webhooks and APIs',
            'Integrate with Telegram Bot API',
            'Connect AI agents in chains',
            'Automate lead processing'
        ],
        program: [
            { title: 'Что такое N8N и зачем он нужен', titleEn: 'What is N8N and why use it', duration: '10 мин' },
            { title: 'Установка и интерфейс', titleEn: 'Installation and Interface', duration: '20 мин' },
            { title: 'Базовые ноды и триггеры', titleEn: 'Basic Nodes and Triggers', duration: '15 мин' },
            { title: 'Работа с JSON и данными', titleEn: 'Working with JSON and Data', duration: '20 мин' },
            { title: 'HTTP Request: Магия API', titleEn: 'HTTP Request: API Magic', duration: '25 мин' },
            { title: 'Telegram бот на N8N', titleEn: 'Telegram Bot on N8N', duration: '30 мин' },
            { title: 'Подключаем ChatGPT', titleEn: 'Connecting ChatGPT', duration: '20 мин' },
            { title: 'Ошибки и отладка', titleEn: 'Errors and Debugging', duration: '15 мин' },
            { title: 'Практика: Бот поддержки', titleEn: 'Practice: Support Bot', duration: '25 мин' }
        ]
    },
    {
        id: 'cursor-ide',
        slug: 'cursor-ide',
        title: 'Cursor IDE Pro',
        titleEn: 'Cursor IDE Pro',
        subtitle: 'Редактор кода будущего уже здесь',
        subtitleEn: 'The code editor of the future is here',
        description: 'Полный обзор Cursor IDE. Composer, Chat, Codebase indexing и другие фичи, которые меняют правила игры.',
        descriptionEn: 'Full overview of Cursor IDE. Composer, Chat, Codebase indexing and other game-changing features.',
        price: 30,
        currency: 'XTR',
        difficulty: 'intermediate',
        duration: 90,
        lessonsCount: 6,
        icon: Terminal,
        color: '#8b5cf6',
        tags: ['Dev Tools', 'AI First'],
        tagsEn: ['Dev Tools', 'AI First'],
        accessTier: 'light',
        learningOutcomes: [
            'Миграция с VS Code',
            'Использование Composer (Ctrl+I)',
            'Работа с кодовой базой (@Codebase)',
            'Промптинг для рефакторинга',
            'Создание приложений с нуля'
        ],
        learningOutcomesEn: [
            'Migrating from VS Code',
            'Using Composer (Ctrl+I)',
            'Working with codebase (@Codebase)',
            'Prompting for refactoring',
            'Building apps from scratch'
        ],
        program: [
            { title: 'Почему Cursor лучше VS Code', titleEn: 'Why Cursor beats VS Code', duration: '10 мин' },
            { title: 'Chat и контекст', titleEn: 'Chat and Context', duration: '15 мин' },
            { title: 'Магия Composer', titleEn: 'Composer Magic', duration: '20 мин' },
            { title: 'Индексация кодовой базы', titleEn: 'Codebase Indexing', duration: '15 мин' },
            { title: 'Создаем игру "Змейка" за 5 мин', titleEn: 'Create "Snake" game in 5 min', duration: '15 мин' },
            { title: 'Продвинутые настройки', titleEn: 'Advanced Settings', duration: '15 мин' }
        ]
    },
    {
        id: 'chatgpt-pro',
        slug: 'chatgpt-pro',
        title: 'ChatGPT Pro: Взлом реальности',
        titleEn: 'ChatGPT Pro: Reality Hack',
        subtitle: 'От простых вопросов к сложной аналитике',
        subtitleEn: 'From simple questions to complex analytics',
        description: 'Глубокое погружение в GPT-4o. Custom Instructions, Data Analysis, создание своих GPTs и промпт-инжиниринг.',
        descriptionEn: 'Deep dive into GPT-4o. Custom Instructions, Data Analysis, creating custom GPTs and prompt engineering.',
        price: 40,
        currency: 'XTR',
        difficulty: 'beginner',
        duration: 150,
        lessonsCount: 10,
        icon: Brain,
        color: '#10b981',
        tags: ['Prompting', 'ChatGPT'],
        tagsEn: ['Prompting', 'ChatGPT'],
        accessTier: 'light',
        learningOutcomes: [
            'Структура идеального промпта',
            'Анализ данных в CSV/Excel',
            'Создание Custom GPTs',
            'Генерация изображений DALL-E 3',
            'Многошаговые рассуждения'
        ],
        learningOutcomesEn: [
            'Perfect prompt structure',
            'Data analysis in CSV/Excel',
            'Creating Custom GPTs',
            'Image generation with DALL-E 3',
            'Multi-step reasoning'
        ],
        program: [
            { title: 'Основы промптинга', titleEn: 'Prompting Basics', duration: '15 мин' },
            { title: 'Ролевые модели', titleEn: 'Role Models', duration: '10 мин' },
            { title: 'Chain-of-Thought', titleEn: 'Chain-of-Thought', duration: '15 мин' },
            { title: 'Анализ файлов и данных', titleEn: 'File and Data Analysis', duration: '20 мин' },
            { title: 'Custom Instructions', titleEn: 'Custom Instructions', duration: '15 мин' },
            { title: 'Создаем своего GPT-ассистента', titleEn: 'Creating your GPT assistant', duration: '30 мин' },
            { title: 'Vision: работа с изображениями', titleEn: 'Vision: working with images', duration: '15 мин' },
            { title: 'Voice Mode', titleEn: 'Voice Mode', duration: '10 мин' },
            { title: 'Примеры использования в работе', titleEn: 'Work use cases', duration: '20 мин' }
        ]
    },
    {
        id: 'grok-xai',
        slug: 'grok-xai',
        title: 'Grok: AI без цензуры',
        titleEn: 'Grok: Uncensored AI',
        subtitle: 'Самый дерзкий AI от Илона Маска',
        subtitleEn: 'The boldest AI from Elon Musk',
        description: 'Обзор возможностей Grok. Работа с реальным временем через X (Twitter), отличия от GPT-4, доступ к API.',
        descriptionEn: 'Overview of Grok capabilities. Real-time work via X (Twitter), differences from GPT-4, API access.',
        price: 25,
        currency: 'XTR',
        difficulty: 'beginner',
        duration: 60,
        lessonsCount: 5,
        icon: Rocket,
        color: '#ec4899',
        tags: ['News', 'Real-time'],
        tagsEn: ['News', 'Real-time'],
        accessTier: 'light',
        learningOutcomes: [
            'Доступ к Grok в X.com',
            'Поиск новостей в реальном времени',
            'Генерация контента без цензуры',
            'Fun Mode vs Regular Mode',
            'API интеграция (база)'
        ],
        learningOutcomesEn: [
            'Accessing Grok on X.com',
            'Real-time news search',
            'Uncensored content generation',
            'Fun Mode vs Regular Mode',
            'API integration (basic)'
        ],
        program: [
            { title: 'Кто такой Grok', titleEn: 'Who is Grok', duration: '10 мин' },
            { title: 'Real-time доступ к данным', titleEn: 'Real-time data access', duration: '15 мин' },
            { title: 'Сравнение с ChatGPT', titleEn: 'Comparison with ChatGPT', duration: '10 мин' },
            { title: 'Генерация шуток и рофлов', titleEn: 'Jokes and roasts generation', duration: '10 мин' },
            { title: 'Будущее xAI', titleEn: 'Future of xAI', duration: '15 мин' }
        ]
    },
    {
        id: 'sora-video',
        slug: 'sora-video',
        title: 'Sora 2: Режиссер AI',
        titleEn: 'Sora 2: AI Director',
        subtitle: 'Создавай голливудские сцены из текста',
        subtitleEn: 'Create Hollywood scenes from text',
        description: 'Полный гид по генерации видео. Промпты для камеры, света, движения. Монтаж и пост-продакшн с помощью AI.',
        descriptionEn: 'Complete guide to video generation. Prompts for camera, light, motion. Editing and post-production with AI.',
        price: 60,
        currency: 'XTR',
        difficulty: 'advanced',
        duration: 120,
        lessonsCount: 8,
        icon: Video,
        color: '#f43f5e',
        tags: ['Video', 'Creative'],
        tagsEn: ['Video', 'Creative'],
        accessTier: 'pro',
        learningOutcomes: [
            'Физика и движение в Sora',
            'Управление камерой через промпт',
            'Сохранение персонажей (consistency)',
            'Стилизация видео',
            'Этические ограничения'
        ],
        learningOutcomesEn: [
            'Physics and motion in Sora',
            'Camera control via prompt',
            'Character consistency',
            'Video stylization',
            'Ethical restrictions'
        ],
        program: [
            { title: 'Введение в AI видео', titleEn: 'Intro to AI Video', duration: '15 мин' },
            { title: 'Анатомия видео-промпта', titleEn: 'Video Prompt Anatomy', duration: '20 мин' },
            { title: 'Управление камерой', titleEn: 'Camera Control', duration: '15 мин' },
            { title: 'Свет и атмосфера', titleEn: 'Light and Atmosphere', duration: '15 мин' },
            { title: 'Работа с референсами', titleEn: 'Working with references', duration: '20 мин' },
            { title: 'Монтаж сгенерированного', titleEn: 'Editing generated content', duration: '15 мин' },
            { title: 'Runway и Pika (сравнение)', titleEn: 'Runway and Pika (comparison)', duration: '10 мин' },
            { title: 'Создаем трейлер', titleEn: 'Creating a trailer', duration: '10 мин' }
        ]
    },
    {
        id: 'notebooklm',
        slug: 'notebooklm',
        title: 'NotebookLM: Твой Второй Мозг',
        titleEn: 'NotebookLM: Your Second Brain',
        subtitle: 'Анализируй гигабайты информации за минуты',
        subtitleEn: 'Analyze gigabytes of info in minutes',
        description: 'Как использовать NotebookLM для учебы и работы. Загрузка PDF, генерация подкастов, подготовка к экзаменам.',
        descriptionEn: 'How to use NotebookLM for study and work. Uploading PDFs, generating podcasts, exam preparation.',
        price: 0,
        currency: 'XTR',
        difficulty: 'beginner',
        duration: 45,
        lessonsCount: 5,
        icon: FileText,
        color: '#0ea5e9',
        tags: ['Research', 'Study'],
        tagsEn: ['Research', 'Study'],
        accessTier: 'free',
        learningOutcomes: [
            'Создание базы знаний',
            'Генерация аудио-подкастов (Audio Overview)',
            'Q&A по документам',
            'Совместная работа',
            'Сравнение источников'
        ],
        learningOutcomesEn: [
            'Creating knowledge base',
            'Generating Audio Overviews',
            'Q&A on documents',
            'Collaboration',
            'Source comparison'
        ],
        program: [
            { title: 'Загрузка источников', titleEn: 'Uploading sources', duration: '5 мин' },
            { title: 'Чат с документами', titleEn: 'Chat with documents', duration: '10 мин' },
            { title: 'Магия Audio Overview', titleEn: 'Audio Overview Magic', duration: '10 мин' },
            { title: 'Создание заметок и цитат', titleEn: 'Notes and citations', duration: '10 мин' },
            { title: 'Примеры для студентов', titleEn: 'Use cases for students', duration: '10 мин' }
        ]
    },
    {
        id: 'gmini-3',
        slug: 'gmini-3',
        title: 'Gemini 3: Экосистема Google',
        titleEn: 'Gemini 3: Google Ecosystem',
        subtitle: 'Максимум от интеграции с Workspace',
        subtitleEn: 'Max out Workspace integration',
        description: 'Использование Gemini в Docs, Sheets, Slides и Gmail. Мультимодальность на максималках.',
        descriptionEn: 'Using Gemini in Docs, Sheets, Slides and Gmail. Multimodality to the max.',
        price: 35,
        currency: 'XTR',
        difficulty: 'intermediate',
        duration: 100,
        lessonsCount: 7,
        icon: Star,
        color: '#4285F4',
        tags: ['Google', 'Business'],
        tagsEn: ['Google', 'Business'],
        accessTier: 'light',
        learningOutcomes: [
            'Gemini в Google Docs',
            'Анализ таблиц Sheets',
            'Генерация презентаций Slides',
            'Умные ответы в Gmail',
            'Мультимодальный анализ видео'
        ],
        learningOutcomesEn: [
            'Gemini in Google Docs',
            'Sheets table analysis',
            'Slides presentation generation',
            'Smart replies in Gmail',
            'Multimodal video analysis'
        ],
        program: [
            { title: 'Экосистема Google AI', titleEn: 'Google AI Ecosystem', duration: '10 мин' },
            { title: 'Пишем отчеты в Docs', titleEn: 'Writing reports in Docs', duration: '15 мин' },
            { title: 'Формулы в Sheets', titleEn: 'Formulas in Sheets', duration: '20 мин' },
            { title: 'Презентации за 5 минут', titleEn: 'Presentations in 5 mins', duration: '15 мин' },
            { title: 'Разбор видео с YouTube', titleEn: 'YouTube video analysis', duration: '15 мин' },
            { title: 'Gemini Advanced фишки', titleEn: 'Gemini Advanced features', duration: '15 мин' },
            { title: 'Сравнение с GPT-4', titleEn: 'Comparison with GPT-4', duration: '10 мин' }
        ]
    },
    {
        id: 'nano-banano',
        slug: 'nano-banano',
        title: 'Nano-Banano Pro 🍌',
        titleEn: 'Nano-Banano Pro 🍌',
        subtitle: 'Секретный курс для избранных',
        subtitleEn: 'Secret course for the chosen ones',
        description: 'Самые передовые, экспериментальные и безумные техники использования AI. Только для тех, кто готов выйти за рамки.',
        descriptionEn: 'Most advanced, experimental and crazy AI techniques. Only for those ready to break boundaries.',
        price: 100,
        currency: 'XTR',
        difficulty: 'advanced',
        duration: 200,
        lessonsCount: 15,
        icon: Zap,
        color: '#FACC15',
        tags: ['Experimental', 'Exclusive'],
        tagsEn: ['Experimental', 'Exclusive'],
        accessTier: 'pro',
        learningOutcomes: [
            'Взлом системных промптов',
            'Автономные AI-агенты',
            'Генерация музыки и голоса',
            'Свой LLM на домашнем ПК',
            'Будущее AGI'
        ],
        learningOutcomesEn: [
            'System prompt hacking',
            'Autonomous AI agents',
            'Music and voice generation',
            'Self-hosted LLM',
            'Future of AGI'
        ],
        program: [
            { title: 'Добро пожаловать в кроличью нору', titleEn: 'Welcome to the rabbit hole', duration: '10 мин' },
            { title: 'Локальные LLM (Ollama)', titleEn: 'Local LLMs (Ollama)', duration: '30 мин' },
            { title: 'Fine-tuning моделей', titleEn: 'Model Fine-tuning', duration: '30 мин' },
            { title: 'AI-агенты с AutoGen', titleEn: 'AI Agents with AutoGen', duration: '30 мин' },
            { title: 'Клонирование голоса', titleEn: 'Voice Cloning', duration: '20 мин' },
            { title: 'Suno AI: Хиты', titleEn: 'Suno AI: Hits', duration: '20 мин' },
            { title: 'Stable Diffusion XL', titleEn: 'Stable Diffusion XL', duration: '25 мин' },
            { title: 'Философия AGI', titleEn: 'Philosophy of AGI', duration: '35 мин' }
        ]
    }
]
