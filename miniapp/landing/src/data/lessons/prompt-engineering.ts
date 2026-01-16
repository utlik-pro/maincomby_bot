import type { CourseData, Lesson, ContentBlock } from '@/components/course/types'

export const promptEngineeringCourse: CourseData = {
    slug: 'prompt-engineering',
    title: 'Основы промптинга',
    titleEn: 'Prompt Engineering Fundamentals',
    lessons: [
        // Lesson 1
        {
            id: 1,
            slug: 'why-ai-doesnt-understand',
            title: 'Почему AI не понимает тебя',
            titleEn: 'Why AI Doesn\'t Understand You',
            duration: '10 мин',
            objectives: [
                'Разрушить миф о "чтении мыслей" AI',
                'Понять, как языковые модели обрабатывают текст',
                'Осознать главную ошибку при работе с AI',
                'Увидеть разницу между плохим и хорошим промптом'
            ],
            objectivesEn: [
                'Debunk the myth that AI "reads minds"',
                'Understand how language models process text',
                'Recognize the main mistake when working with AI',
                'See the difference between bad and good prompts'
            ],
            content: [
                { type: 'heading', text: 'Миф: AI читает мысли', textEn: 'Myth: AI Reads Minds' },
                { type: 'text', text: 'Многие думают, что достаточно написать "сделай красиво" или "напиши хорошо", и AI поймёт, что они имеют в виду.', textEn: 'Many people think that writing "make it nice" or "write well" is enough, and AI will understand what they mean.' },
                { type: 'alert', variant: 'danger', title: 'Реальность', titleEn: 'Reality', text: 'AI не читает мысли. Он видит только текст, который вы написали. Ничего больше.', textEn: 'AI doesn\'t read minds. It only sees the text you wrote. Nothing more.' },

                { type: 'heading', text: 'Как на самом деле работает AI', textEn: 'How AI Actually Works' },
                { type: 'text', text: 'Языковая модель (LLM) — это система, которая предсказывает следующее слово на основе предыдущих. Когда вы пишете запрос, AI читает ваш текст буквально, ищет паттерны из обучающих данных и генерирует наиболее вероятное продолжение.', textEn: 'A language model (LLM) is a system that predicts the next word based on previous ones. When you write a prompt, AI reads your text literally, looks for patterns from training data, and generates the most likely continuation.' },
                { type: 'alert', variant: 'info', title: 'Ключевой инсайт', titleEn: 'Key Insight', text: 'AI не понимает контекст вашей жизни, работы или намерений. Он работает только с тем текстом, который вы ему дали.', textEn: 'AI doesn\'t understand the context of your life, work, or intentions. It only works with the text you gave it.' },

                { type: 'heading', text: 'Главная ошибка', textEn: 'The Main Mistake' },
                {
                    type: 'comparison',
                    bad: { label: 'Как мы думаем', labelEn: 'How We Think', text: '"Я напишу коротко, AI сам разберётся" — "Напиши текст про маркетинг"', textEn: '"I\'ll write briefly, AI will figure it out" — "Write text about marketing"' },
                    good: { label: 'Что видит AI', labelEn: 'What AI Sees', text: '"Какой-то текст. Про маркетинг. Непонятно: какой стиль? для кого? какая длина?"', textEn: '"Some text. About marketing. Unclear: what style? for whom? what length?"' }
                },
                { type: 'alert', variant: 'warning', title: 'Ошибка', titleEn: 'Mistake', text: 'Мы предполагаем, что AI знает контекст. Но он его не знает!', textEn: 'We assume AI knows the context. But it doesn\'t!' },

                { type: 'heading', text: 'Пример: один запрос — разные результаты', textEn: 'Example: One Request — Different Results' },
                { type: 'prompt-example', label: 'Плохой промпт', labelEn: 'Bad Prompt', code: 'Напиши текст про маркетинг', good: false },
                { type: 'prompt-example', label: 'Хороший промпт', labelEn: 'Good Prompt', code: `Ты — маркетолог с 10-летним опытом в B2B SaaS.

Напиши пост для LinkedIn о 3 главных трендах B2B маркетинга в 2025 году.

Требования:
- Длина: 200-250 слов
- Стиль: профессиональный, но живой (без корпоративного языка)
- Добавь 1-2 emoji для акцентов
- В конце задай вопрос для вовлечения аудитории`, good: true },

                { type: 'heading', text: 'Формула эффективного промпта', textEn: 'Effective Prompt Formula' },
                { type: 'alert', variant: 'success', title: 'Хороший промпт = Контекст + Задача + Формат', titleEn: 'Good Prompt = Context + Task + Format', text: 'Чем больше деталей вы даёте, тем точнее ответ. Это правило работает в 100% случаев.', textEn: 'The more details you give, the more accurate the response. This rule works 100% of the time.' }
            ],
            quiz: {
                question: 'Почему AI даёт неточные ответы на короткие запросы?',
                questionEn: 'Why does AI give inaccurate answers to short requests?',
                options: [
                    { text: 'Потому что AI глупый и не понимает русский язык', textEn: 'Because AI is stupid and doesn\'t understand Russian', correct: false },
                    { text: 'Потому что AI не знает контекст и работает только с данным текстом', textEn: 'Because AI doesn\'t know the context and works only with the given text', correct: true },
                    { text: 'Потому что нужно платить за премиум версию', textEn: 'Because you need to pay for the premium version', correct: false },
                    { text: 'Потому что AI специально даёт плохие ответы', textEn: 'Because AI deliberately gives bad answers', correct: false }
                ]
            },
            summary: [
                'AI не читает мысли — он работает только с текстом, который вы написали',
                'Контекст не подразумевается — его нужно явно указывать',
                'Детали = качество — чем больше информации, тем точнее результат',
                'Формула успеха: Контекст + Задача + Формат'
            ],
            summaryEn: [
                'AI doesn\'t read minds — it only works with the text you wrote',
                'Context is not implied — it must be explicitly stated',
                'Details = quality — more information means more accurate results',
                'Success formula: Context + Task + Format'
            ]
        },

        // Lesson 2
        {
            id: 2,
            slug: 'prompt-anatomy',
            title: 'Анатомия идеального промпта',
            titleEn: 'Anatomy of the Perfect Prompt',
            duration: '15 мин',
            badge: 'RISEN Framework',
            badgeEn: 'RISEN Framework',
            objectives: [
                'Изучить структуру идеального промпта',
                'Освоить фреймворк RISEN',
                'Научиться комбинировать компоненты',
                'Понять, когда какой компонент использовать'
            ],
            objectivesEn: [
                'Learn the structure of an ideal prompt',
                'Master the RISEN framework',
                'Learn to combine components',
                'Understand when to use which component'
            ],
            content: [
                { type: 'heading', text: '5 компонентов идеального промпта', textEn: '5 Components of the Perfect Prompt' },
                { type: 'text', text: 'Фреймворк RISEN помогает структурировать промпты для максимальной эффективности. Не обязательно использовать все 5 компонентов — выбирайте нужные для конкретной задачи.', textEn: 'The RISEN framework helps structure prompts for maximum effectiveness. You don\'t have to use all 5 components — choose what\'s needed for your specific task.' },

                {
                    type: 'card',
                    title: 'R — Role (Роль)',
                    titleEn: 'R — Role',
                    color: '#FF6B6B',
                    children: [
                        { type: 'text', text: 'Кем должен быть AI? Эксперт, помощник, критик, учитель?', textEn: 'Who should AI be? Expert, assistant, critic, teacher?' },
                        { type: 'prompt-example', label: 'Пример', labelEn: 'Example', code: 'Ты — опытный UX-дизайнер с 10 годами работы в e-commerce' }
                    ]
                },
                {
                    type: 'card',
                    title: 'I — Instructions (Инструкции)',
                    titleEn: 'I — Instructions',
                    color: '#4ECDC4',
                    children: [
                        { type: 'text', text: 'Что конкретно нужно сделать? Чёткая формулировка задачи.', textEn: 'What exactly needs to be done? Clear task formulation.' },
                        { type: 'prompt-example', label: 'Пример', labelEn: 'Example', code: 'Проанализируй главную страницу сайта и предложи 5 улучшений' }
                    ]
                },
                {
                    type: 'card',
                    title: 'S — Steps (Шаги)',
                    titleEn: 'S — Steps',
                    color: '#FFE66D',
                    children: [
                        { type: 'text', text: 'В каком порядке выполнять задачу? Пошаговый план.', textEn: 'In what order to complete the task? Step-by-step plan.' },
                        { type: 'prompt-example', label: 'Пример', labelEn: 'Example', code: '1. Оцени текущий UX\n2. Найди проблемные места\n3. Предложи решения\n4. Приоритезируй по важности' }
                    ]
                },
                {
                    type: 'card',
                    title: 'E — End goal (Конечная цель)',
                    titleEn: 'E — End goal',
                    color: '#A78BFA',
                    children: [
                        { type: 'text', text: 'Какой результат вы хотите получить? Критерии успеха.', textEn: 'What result do you want? Success criteria.' },
                        { type: 'prompt-example', label: 'Пример', labelEn: 'Example', code: 'Результат должен увеличить конверсию добавления в корзину' }
                    ]
                },
                {
                    type: 'card',
                    title: 'N — Narrowing (Ограничения)',
                    titleEn: 'N — Narrowing',
                    color: '#F472B6',
                    children: [
                        { type: 'text', text: 'Какие есть ограничения? Чего делать НЕ нужно?', textEn: 'What are the constraints? What NOT to do?' },
                        { type: 'prompt-example', label: 'Пример', labelEn: 'Example', code: 'НЕ предлагай изменения в header — он уже утверждён\nБюджет на реализацию: до 20 часов разработки' }
                    ]
                },

                { type: 'heading', text: 'Полный пример с RISEN', textEn: 'Full Example with RISEN' },
                { type: 'prompt-example', label: 'Промпт по RISEN', labelEn: 'RISEN Prompt', code: `[R] Ты — опытный UX-дизайнер с 10 годами работы в e-commerce.

[I] Проанализируй страницу товара интернет-магазина электроники и предложи улучшения.

[S] Выполни анализ по шагам:
1. Оцени текущую структуру страницы
2. Найди проблемы с юзабилити
3. Предложи конкретные решения
4. Приоритезируй по влиянию на конверсию

[E] Цель: увеличить конверсию "Добавить в корзину" на 15-20%

[N] Ограничения:
- Не меняй header и footer
- Решения должны быть реализуемы за 2 спринта
- Фокус на мобильную версию (70% трафика)`, good: true }
            ],
            quiz: {
                question: 'Какой компонент RISEN отвечает за то, чего делать НЕ нужно?',
                questionEn: 'Which RISEN component is responsible for what NOT to do?',
                options: [
                    { text: 'Role (Роль)', textEn: 'Role', correct: false },
                    { text: 'Instructions (Инструкции)', textEn: 'Instructions', correct: false },
                    { text: 'End goal (Конечная цель)', textEn: 'End goal', correct: false },
                    { text: 'Narrowing (Ограничения)', textEn: 'Narrowing', correct: true }
                ]
            },
            summary: [
                'RISEN = Role, Instructions, Steps, End goal, Narrowing',
                'Не обязательно использовать все 5 компонентов',
                'Роль задаёт экспертизу AI',
                'Ограничения помогают избежать ненужных результатов'
            ],
            summaryEn: [
                'RISEN = Role, Instructions, Steps, End goal, Narrowing',
                'You don\'t have to use all 5 components',
                'Role sets AI\'s expertise',
                'Constraints help avoid unwanted results'
            ]
        },

        // Lesson 3
        {
            id: 3,
            slug: 'roles-and-personas',
            title: 'Роли и персоны',
            titleEn: 'Roles and Personas',
            duration: '15 мин',
            objectives: [
                'Понять силу назначения ролей',
                'Изучить популярные роли для разных задач',
                'Научиться создавать кастомные персоны',
                'Избежать типичных ошибок с ролями'
            ],
            objectivesEn: [
                'Understand the power of assigning roles',
                'Learn popular roles for different tasks',
                'Learn to create custom personas',
                'Avoid typical mistakes with roles'
            ],
            content: [
                { type: 'heading', text: 'Зачем нужны роли?', textEn: 'Why Do We Need Roles?' },
                { type: 'text', text: 'Роль — это "маска", которую вы надеваете на AI. Она определяет стиль ответа, уровень экспертизы и фокус внимания.', textEn: 'A role is a "mask" you put on AI. It determines the response style, expertise level, and focus.' },
                { type: 'alert', variant: 'info', title: 'Важно', titleEn: 'Important', text: 'Одна и та же задача с разными ролями даст совершенно разные результаты.', textEn: 'The same task with different roles will give completely different results.' },

                { type: 'heading', text: 'Популярные роли', textEn: 'Popular Roles' },
                {
                    type: 'table',
                    headers: ['Роль', 'Когда использовать', 'Пример задачи'],
                    headersEn: ['Role', 'When to use', 'Example task'],
                    rows: [
                        ['Эксперт в [области]', 'Нужен глубокий анализ', 'Анализ кода, аудит безопасности'],
                        ['Копирайтер', 'Написание текстов', 'Посты, статьи, рекламные тексты'],
                        ['Критик', 'Нужна обратная связь', 'Ревью идеи, проверка плана'],
                        ['Учитель', 'Объяснение сложного', 'Обучение новой теме'],
                        ['Ассистент', 'Рутинные задачи', 'Форматирование, перевод, саммари']
                    ],
                    rowsEn: [
                        ['Expert in [field]', 'Deep analysis needed', 'Code review, security audit'],
                        ['Copywriter', 'Writing content', 'Posts, articles, ad copy'],
                        ['Critic', 'Feedback needed', 'Idea review, plan check'],
                        ['Teacher', 'Explaining complex things', 'Learning new topic'],
                        ['Assistant', 'Routine tasks', 'Formatting, translation, summary']
                    ]
                },

                { type: 'heading', text: 'Как создать персону', textEn: 'How to Create a Persona' },
                { type: 'prompt-example', label: 'Шаблон персоны', labelEn: 'Persona Template', code: `Ты — [профессия] с [X] годами опыта в [области].

Твой стиль общения: [формальный/неформальный/дружелюбный]
Твоя главная сила: [аналитика/креатив/практичность]
Твой подход: [детальный/краткий/пошаговый]

При ответах ты всегда [особенность поведения].`, good: true },

                { type: 'heading', text: 'Ошибки с ролями', textEn: 'Common Role Mistakes' },
                { type: 'alert', variant: 'danger', title: 'Ошибка 1', titleEn: 'Mistake 1', text: 'Слишком общая роль: "Ты эксперт" — непонятно в чём именно.', textEn: 'Too generic role: "You\'re an expert" — unclear in what exactly.' },
                { type: 'alert', variant: 'danger', title: 'Ошибка 2', titleEn: 'Mistake 2', text: 'Противоречивая роль: "Ты строгий критик, который всегда хвалит" — нелогично.', textEn: 'Contradictory role: "You\'re a strict critic who always praises" — illogical.' },
                { type: 'alert', variant: 'success', title: 'Правильно', titleEn: 'Correct', text: 'Конкретная роль с ясной экспертизой: "Ты — senior Python-разработчик, специализирующийся на FastAPI и микросервисах"', textEn: 'Specific role with clear expertise: "You\'re a senior Python developer specializing in FastAPI and microservices"' }
            ],
            quiz: {
                question: 'Какая роль лучше для написания рекламного текста?',
                questionEn: 'Which role is better for writing ad copy?',
                options: [
                    { text: 'Ты — эксперт', textEn: 'You\'re an expert', correct: false },
                    { text: 'Ты — копирайтер с 5-летним опытом в digital-маркетинге', textEn: 'You\'re a copywriter with 5 years of digital marketing experience', correct: true },
                    { text: 'Напиши рекламу', textEn: 'Write an ad', correct: false },
                    { text: 'Ты — AI', textEn: 'You\'re an AI', correct: false }
                ]
            },
            summary: [
                'Роль определяет стиль и экспертизу ответа',
                'Чем конкретнее роль, тем лучше результат',
                'Избегайте противоречий в описании роли',
                'Добавляйте релевантный опыт и специализацию'
            ],
            summaryEn: [
                'Role determines response style and expertise',
                'The more specific the role, the better the result',
                'Avoid contradictions in role description',
                'Add relevant experience and specialization'
            ]
        },

        // Lesson 4
        {
            id: 4,
            slug: 'chain-of-thought',
            title: 'Chain-of-Thought: Думай шаг за шагом',
            titleEn: 'Chain-of-Thought: Think Step by Step',
            duration: '20 мин',
            badge: 'Продвинутая техника',
            badgeEn: 'Advanced Technique',
            objectives: [
                'Понять, что такое Chain-of-Thought',
                'Научиться применять пошаговое рассуждение',
                'Узнать, когда CoT даёт лучший результат',
                'Изучить триггерные фразы для CoT'
            ],
            objectivesEn: [
                'Understand what Chain-of-Thought is',
                'Learn to apply step-by-step reasoning',
                'Know when CoT gives better results',
                'Learn trigger phrases for CoT'
            ],
            content: [
                { type: 'heading', text: 'Что такое Chain-of-Thought?', textEn: 'What is Chain-of-Thought?' },
                { type: 'text', text: 'Chain-of-Thought (CoT) — это техника, при которой AI "думает вслух", показывая каждый шаг рассуждения. Это значительно улучшает качество ответов на сложные задачи.', textEn: 'Chain-of-Thought (CoT) is a technique where AI "thinks aloud", showing each reasoning step. This significantly improves response quality for complex tasks.' },

                { type: 'heading', text: 'Пример без CoT vs с CoT', textEn: 'Example Without vs With CoT' },
                { type: 'prompt-example', label: 'Без CoT', labelEn: 'Without CoT', code: 'В кафе было 23 человека. 5 ушли, потом пришли 12. Сколько человек в кафе?\n\nОтвет: 30', good: false },
                { type: 'prompt-example', label: 'С CoT', labelEn: 'With CoT', code: `В кафе было 23 человека. 5 ушли, потом пришли 12. Сколько человек в кафе?
Подумай шаг за шагом.

Решение:
1. Изначально в кафе: 23 человека
2. 5 человек ушли: 23 - 5 = 18 человек
3. 12 человек пришли: 18 + 12 = 30 человек

Ответ: 30 человек`, good: true },

                { type: 'heading', text: 'Триггерные фразы для CoT', textEn: 'CoT Trigger Phrases' },
                {
                    type: 'list',
                    title: 'Используйте эти фразы:',
                    titleEn: 'Use these phrases:',
                    items: [
                        '"Подумай шаг за шагом"',
                        '"Покажи ход рассуждений"',
                        '"Объясни логику решения"',
                        '"Разбери задачу по шагам"',
                        '"Let\'s think step by step"'
                    ],
                    itemsEn: [
                        '"Think step by step"',
                        '"Show your reasoning"',
                        '"Explain the solution logic"',
                        '"Break down the task step by step"',
                        '"Let\'s think step by step"'
                    ]
                },

                { type: 'heading', text: 'Когда использовать CoT?', textEn: 'When to Use CoT?' },
                { type: 'alert', variant: 'success', title: 'Используйте CoT для:', titleEn: 'Use CoT for:', text: 'Математических задач, логических головоломок, анализа данных, планирования, принятия решений, отладки кода.', textEn: 'Math problems, logic puzzles, data analysis, planning, decision making, code debugging.' },
                { type: 'alert', variant: 'info', title: 'Не нужен CoT для:', titleEn: 'CoT not needed for:', text: 'Простых вопросов, перевода, генерации креатива, форматирования текста.', textEn: 'Simple questions, translation, creative generation, text formatting.' }
            ],
            quiz: {
                question: 'Какая фраза НЕ является триггером для Chain-of-Thought?',
                questionEn: 'Which phrase is NOT a Chain-of-Thought trigger?',
                options: [
                    { text: '"Подумай шаг за шагом"', textEn: '"Think step by step"', correct: false },
                    { text: '"Покажи ход рассуждений"', textEn: '"Show your reasoning"', correct: false },
                    { text: '"Напиши красиво"', textEn: '"Write nicely"', correct: true },
                    { text: '"Let\'s think step by step"', textEn: '"Let\'s think step by step"', correct: false }
                ]
            },
            summary: [
                'CoT заставляет AI показывать ход мыслей',
                'Улучшает качество на сложных задачах',
                'Используйте триггерные фразы',
                'Не нужен для простых задач'
            ],
            summaryEn: [
                'CoT makes AI show its thought process',
                'Improves quality on complex tasks',
                'Use trigger phrases',
                'Not needed for simple tasks'
            ]
        },

        // Lesson 5
        {
            id: 5,
            slug: 'few-shot-learning',
            title: 'Few-shot: Учим на примерах',
            titleEn: 'Few-shot: Learning by Examples',
            duration: '15 мин',
            objectives: [
                'Понять разницу между zero-shot и few-shot',
                'Научиться создавать качественные примеры',
                'Узнать, когда примеры критически важны',
                'Освоить форматирование few-shot промптов'
            ],
            objectivesEn: [
                'Understand the difference between zero-shot and few-shot',
                'Learn to create quality examples',
                'Know when examples are critical',
                'Master few-shot prompt formatting'
            ],
            content: [
                { type: 'heading', text: 'Zero-shot vs Few-shot', textEn: 'Zero-shot vs Few-shot' },
                {
                    type: 'comparison',
                    bad: { label: 'Zero-shot', labelEn: 'Zero-shot', text: 'Даём задачу без примеров. AI опирается только на свои знания.', textEn: 'Give task without examples. AI relies only on its knowledge.' },
                    good: { label: 'Few-shot', labelEn: 'Few-shot', text: 'Даём 2-5 примеров желаемого результата перед задачей.', textEn: 'Give 2-5 examples of desired result before the task.' }
                },

                { type: 'heading', text: 'Когда нужны примеры?', textEn: 'When Are Examples Needed?' },
                {
                    type: 'list',
                    title: 'Примеры критически важны когда:',
                    titleEn: 'Examples are critical when:',
                    items: [
                        'Нужен специфический формат ответа',
                        'Задача нестандартная или уникальная',
                        'AI не понимает с первого раза',
                        'Требуется определённый стиль/тон'
                    ],
                    itemsEn: [
                        'Specific response format needed',
                        'Task is non-standard or unique',
                        'AI doesn\'t understand the first time',
                        'Specific style/tone required'
                    ]
                },

                { type: 'heading', text: 'Пример Few-shot промпта', textEn: 'Few-shot Prompt Example' },
                { type: 'prompt-example', label: 'Few-shot классификация', labelEn: 'Few-shot classification', code: `Классифицируй отзыв как "позитивный", "негативный" или "нейтральный".

Примеры:
Отзыв: "Отличный сервис, доставили за 2 часа!"
Классификация: позитивный

Отзыв: "Товар пришёл сломанный, деньги не вернули"
Классификация: негативный

Отзыв: "Доставка в указанный срок, упаковка стандартная"
Классификация: нейтральный

Теперь классифицируй:
Отзыв: "Качество хорошее, но цена завышена"
Классификация:`, good: true },

                { type: 'heading', text: 'Правила хороших примеров', textEn: 'Good Examples Rules' },
                { type: 'alert', variant: 'success', title: 'Правило 1', titleEn: 'Rule 1', text: 'Примеры должны быть разнообразными — покажите разные случаи.', textEn: 'Examples should be diverse — show different cases.' },
                { type: 'alert', variant: 'success', title: 'Правило 2', titleEn: 'Rule 2', text: 'Формат примеров = формат ожидаемого ответа.', textEn: 'Example format = expected response format.' },
                { type: 'alert', variant: 'success', title: 'Правило 3', titleEn: 'Rule 3', text: '2-5 примеров обычно достаточно, больше не значит лучше.', textEn: '2-5 examples are usually enough, more doesn\'t mean better.' }
            ],
            quiz: {
                question: 'Сколько примеров обычно достаточно для few-shot промпта?',
                questionEn: 'How many examples are usually enough for a few-shot prompt?',
                options: [
                    { text: '1 пример', textEn: '1 example', correct: false },
                    { text: '2-5 примеров', textEn: '2-5 examples', correct: true },
                    { text: '10-15 примеров', textEn: '10-15 examples', correct: false },
                    { text: 'Чем больше, тем лучше', textEn: 'The more the better', correct: false }
                ]
            },
            summary: [
                'Few-shot = примеры перед задачей',
                'Используйте для специфичных форматов и стилей',
                '2-5 разнообразных примеров достаточно',
                'Формат примеров = формат ответа'
            ],
            summaryEn: [
                'Few-shot = examples before the task',
                'Use for specific formats and styles',
                '2-5 diverse examples are enough',
                'Example format = response format'
            ]
        },

        // Lesson 6
        {
            id: 6,
            slug: 'ready-prompts',
            title: '10 готовых промптов',
            titleEn: '10 Ready-to-Use Prompts',
            duration: '15 мин',
            objectives: [
                'Получить 10 проверенных промптов',
                'Научиться адаптировать шаблоны под себя',
                'Создать свою библиотеку промптов'
            ],
            objectivesEn: [
                'Get 10 proven prompts',
                'Learn to adapt templates for yourself',
                'Create your own prompt library'
            ],
            content: [
                { type: 'heading', text: 'Библиотека промптов', textEn: 'Prompt Library' },
                { type: 'text', text: 'Эти промпты проверены на практике и готовы к использованию. Адаптируйте их под свои задачи.', textEn: 'These prompts are battle-tested and ready to use. Adapt them for your tasks.' },

                { type: 'prompt-example', label: '1. Универсальный редактор', labelEn: '1. Universal Editor', code: `Ты — профессиональный редактор. Отредактируй текст:
- Исправь грамматические ошибки
- Улучши читаемость
- Сохрани авторский стиль
- НЕ меняй смысл

Текст: [вставить текст]` },

                { type: 'prompt-example', label: '2. Генератор идей', labelEn: '2. Idea Generator', code: `Сгенерируй 10 идей для [тема].

Критерии:
- Реалистичные для реализации
- Разнообразные подходы
- От простых к сложным

Формат: нумерованный список с кратким описанием (1-2 предложения)` },

                { type: 'prompt-example', label: '3. Саммаризатор', labelEn: '3. Summarizer', code: `Создай краткое резюме текста:

Формат:
- Главная мысль (1 предложение)
- Ключевые пункты (3-5 буллетов)
- Вывод (1 предложение)

Текст: [вставить текст]` },

                { type: 'prompt-example', label: '4. Код-ревьюер', labelEn: '4. Code Reviewer', code: `Ты — senior разработчик. Проведи код-ревью:

1. Найди баги и потенциальные проблемы
2. Предложи улучшения производительности
3. Проверь читаемость кода
4. Оцени соответствие best practices

Код: [вставить код]` },

                { type: 'prompt-example', label: '5. Объяснятор сложного', labelEn: '5. Complex Explainer', code: `Объясни [тема] простыми словами.

Целевая аудитория: человек без технического образования
Используй: аналогии из повседневной жизни
Длина: 3-5 абзацев
Избегай: жаргона и сложных терминов` },

                { type: 'alert', variant: 'info', title: 'Совет', titleEn: 'Tip', text: 'Сохраняйте работающие промпты в отдельный документ. Со временем у вас будет персональная библиотека.', textEn: 'Save working prompts in a separate document. Over time you\'ll have a personal library.' }
            ],
            quiz: {
                question: 'Что нужно делать с готовыми промптами?',
                questionEn: 'What should you do with ready-made prompts?',
                options: [
                    { text: 'Использовать как есть, не меняя', textEn: 'Use as is, without changes', correct: false },
                    { text: 'Адаптировать под свои задачи', textEn: 'Adapt for your tasks', correct: true },
                    { text: 'Никогда не использовать чужие промпты', textEn: 'Never use others\' prompts', correct: false },
                    { text: 'Переписывать полностью каждый раз', textEn: 'Rewrite completely each time', correct: false }
                ]
            },
            summary: [
                'Готовые промпты — отправная точка, не финал',
                'Адаптируйте шаблоны под свой контекст',
                'Создавайте свою библиотеку промптов',
                'Тестируйте и улучшайте промпты'
            ],
            summaryEn: [
                'Ready prompts are a starting point, not the finish',
                'Adapt templates to your context',
                'Create your own prompt library',
                'Test and improve prompts'
            ]
        }
    ]
}

// Helper function to get lesson by ID
export function getLessonById(id: number): Lesson | undefined {
    return promptEngineeringCourse.lessons.find(l => l.id === id)
}

// Helper function to get next/prev lessons
export function getAdjacentLessons(currentId: number) {
    const lessons = promptEngineeringCourse.lessons
    const currentIndex = lessons.findIndex(l => l.id === currentId)

    return {
        prev: currentIndex > 0 ? lessons[currentIndex - 1] : undefined,
        next: currentIndex < lessons.length - 1 ? lessons[currentIndex + 1] : undefined
    }
}
