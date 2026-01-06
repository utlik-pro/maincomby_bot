-- Проверка и установка роли core для @yana_martynen

-- 1. ПРОВЕРКА: Посмотреть текущую роль Яны
SELECT 
    id,
    tg_user_id,
    username,
    first_name,
    last_name,
    team_role,
    active_skin_id
FROM bot_users
WHERE username = 'yana_martynen' 
   OR first_name ILIKE '%yana%' 
   OR first_name ILIKE '%яна%';

-- 2. УСТАНОВКА РОЛИ (раскомментируйте после проверки выше)
-- UPDATE bot_users
-- SET team_role = 'core'
-- WHERE username = 'yana_martynen';

-- 3. ПРОВЕРКА: После установки роли проверить что триггер сработал
-- SELECT 
--     u.id,
--     u.first_name,
--     u.team_role,
--     u.active_skin_id,
--     s.name as active_skin_name,
--     uas.awarded_reason
-- FROM bot_users u
-- LEFT JOIN avatar_skins s ON u.active_skin_id = s.id
-- LEFT JOIN user_avatar_skins uas ON uas.user_id = u.id AND uas.skin_id = s.id
-- WHERE u.username = 'yana_martynen';

-- 4. ПРОВЕРКА: Посмотреть все скины Яны
-- SELECT 
--     uas.id,
--     s.name,
--     s.slug,
--     uas.awarded_reason,
--     uas.awarded_at,
--     uas.user_id = u.id as is_users_skin,
--     u.active_skin_id = s.id as is_active
-- FROM user_avatar_skins uas
-- JOIN avatar_skins s ON uas.skin_id = s.id
-- JOIN bot_users u ON uas.user_id = u.id
-- WHERE u.username = 'yana_martynen';
