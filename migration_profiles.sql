-- ==================== PROFILES ====================
-- Total: 4 profiles

INSERT INTO bot_profiles (id, user_id, bio, occupation, looking_for, can_help_with, needs_help_with, photo_file_id, city, moderation_status, is_visible, created_at, updated_at)
VALUES (1, 422, 'Студентка 1 курса БГУИР, изучаю бизнес-анализ, ИИ и IT-шку в целом!) Ищу своё направление с горящими глазами 🔥🔥🔥', 'Студент', 'Единомышленников,  будущих партнёров и менторов', 'помогу запустить свой первый проект', 'консультация по старту в бизнес-аналитике', NULL, 'Минск', 'approved', TRUE, '2025-12-16 13:50:41.115678', '2025-12-16 14:37:54.434183')
ON CONFLICT (user_id) DO UPDATE SET bio = EXCLUDED.bio, occupation = EXCLUDED.occupation;

INSERT INTO bot_profiles (id, user_id, bio, occupation, looking_for, can_help_with, needs_help_with, photo_file_id, city, moderation_status, is_visible, created_at, updated_at)
VALUES (2, 449, 'Я специалист по продажам в IT компании. Занимаюсь боксом и катаюсь на фиксе.', 'специалист по продажам в IT', 'Ищу единомышленников', 'консультация по аутстаф продажам', 'хочу расширить нетворкинг', 'AgACAgIAAxkBAAIqxGlDtLK1jRKSbv7l6vyii141NvzsAAKKDmsb4XwZSvvV3qkOTk6EAQADAgADeQADNgQ', 'Минск', 'approved', TRUE, '2025-12-18 08:00:54.854129', '2025-12-18 08:06:12.708086')
ON CONFLICT (user_id) DO UPDATE SET bio = EXCLUDED.bio, occupation = EXCLUDED.occupation;

INSERT INTO bot_profiles (id, user_id, bio, occupation, looking_for, can_help_with, needs_help_with, photo_file_id, city, moderation_status, is_visible, created_at, updated_at)
VALUES (3, 7, 'Эксперт по публичным выступлениям. Менеджер по развитию комьюнити. СЕО бренда детской оверсайз одежды', 'Предприниматель', 'Ментора по ИИ (создание уникального контента)', 'Подготовка к выступлению, продвижение личного бренда через публичные выступления.', 'Ищу ментора по ИИ', 'AgACAgIAAxkBAAIq6WlDwQylj9Qw5AtIHgAB2x2BsDH7FAAC7wxrG0u8IUptk5tcOOcoCQEAAwIAA3kAAzYE', 'Минск', 'approved', TRUE, '2025-12-18 08:53:34.868569', '2025-12-18 09:09:14.799591')
ON CONFLICT (user_id) DO UPDATE SET bio = EXCLUDED.bio, occupation = EXCLUDED.occupation;

INSERT INTO bot_profiles (id, user_id, bio, occupation, looking_for, can_help_with, needs_help_with, photo_file_id, city, moderation_status, is_visible, created_at, updated_at)
VALUES (4, 180, 'Я криптоман. Торгую фьючерсы.', 'Трейдер. BD в Web3 Community Belarus @W3Belarus. Веду @PROBTRADING', 'Единорога', 'Вместе лудоманить на фьючерсах будем', 'В деньгах нуждаюсь', 'AgACAgIAAxkBAAIrr2lEHGf7JS_Zpq--fB7ThWQjy95lAAIlEWsbltYhSrKCdBm-P8bAAQADAgADdwADNgQ', 'Минск', 'approved', TRUE, '2025-12-18 15:23:23.077992', '2025-12-18 15:32:05.852583')
ON CONFLICT (user_id) DO UPDATE SET bio = EXCLUDED.bio, occupation = EXCLUDED.occupation;


