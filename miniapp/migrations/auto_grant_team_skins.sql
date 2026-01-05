-- Trigger to automatically grant Core Team skin and send notification when role is assigned
CREATE OR REPLACE FUNCTION on_user_role_change()
RETURNS TRIGGER AS $$
DECLARE
    skin_uuid UUID;
BEGIN
    -- If role changed to 'core'
    IF (NEW.team_role = 'core' AND (OLD.team_role IS NULL OR OLD.team_role != 'core')) THEN
        
        -- 1. Find the core_team skin ID
        SELECT id INTO skin_uuid FROM avatar_skins WHERE slug = 'core_team' LIMIT 1;
        
        IF skin_uuid IS NOT NULL THEN
            -- 2. Grant the skin to the user (ignore if already has it)
            INSERT INTO user_avatar_skins (user_id, skin_id, awarded_reason)
            VALUES (NEW.id, skin_uuid, 'Назначена роль Core Team')
            ON CONFLICT (user_id, skin_id) DO NOTHING;
            
            -- 3. Set it as active if not already having an active skin
            UPDATE bot_users
            SET active_skin_id = skin_uuid
            WHERE id = NEW.id AND active_skin_id IS NULL;
        END IF;

        -- 4. Create an internal app notification
        INSERT INTO app_notifications (user_id, type, title, message)
        VALUES (
            NEW.id, 
            'achievement', 
            'Добро пожаловать в команду!', 
            'Вам назначен статус Core Team. Теперь вам доступен специальный бейдж и скин аватара.'
        );

    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_user_role_change ON bot_users;
CREATE TRIGGER tr_user_role_change
AFTER UPDATE OF team_role ON bot_users
FOR EACH ROW
EXECUTE FUNCTION on_user_role_change();

-- Also ensure Yana (and others who already have the role) get the skin now
DO $$
DECLARE
    skin_uuid UUID;
    user_record RECORD;
BEGIN
    SELECT id INTO skin_uuid FROM avatar_skins WHERE slug = 'core_team' LIMIT 1;
    
    IF skin_uuid IS NOT NULL THEN
        FOR user_record IN SELECT id FROM bot_users WHERE team_role = 'core' LOOP
            INSERT INTO user_avatar_skins (user_id, skin_id, awarded_reason)
            VALUES (user_record.id, skin_uuid, 'Назначена роль Core Team')
            ON CONFLICT (user_id, skin_id) DO NOTHING;
            
            UPDATE bot_users
            SET active_skin_id = skin_uuid
            WHERE id = user_record.id AND active_skin_id IS NULL;
        END LOOP;
    END IF;
END $$;
