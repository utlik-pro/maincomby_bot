-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Create a function to process admin actions via Edge Function
CREATE OR REPLACE FUNCTION trigger_process_admin_actions()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  supabase_url text := 'https://ndpkxustvcijykzxqxrn.supabase.co';
  service_key text := current_setting('app.settings.service_role_key', true);
BEGIN
  -- Call the Edge Function
  PERFORM net.http_post(
    url := supabase_url || '/functions/v1/process-admin-actions',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || COALESCE(service_key, '')
    ),
    body := '{}'::jsonb
  );
END;
$$;

-- Schedule the job to run every minute
-- Note: pg_cron jobs run as the postgres user
SELECT cron.schedule(
  'process-admin-actions-job',
  '* * * * *',
  'SELECT trigger_process_admin_actions();'
);

-- Also create a database trigger to call the function when a new pending action is inserted
-- This provides immediate processing without waiting for cron
CREATE OR REPLACE FUNCTION notify_new_admin_action()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Only trigger for pending gift_pro actions
  IF NEW.status = 'pending' AND NEW.action = 'gift_pro' THEN
    PERFORM trigger_process_admin_actions();
  END IF;
  RETURN NEW;
END;
$$;

-- Create trigger (drop first if exists to make migration idempotent)
DROP TRIGGER IF EXISTS on_admin_action_insert ON bot_admin_actions;
CREATE TRIGGER on_admin_action_insert
  AFTER INSERT ON bot_admin_actions
  FOR EACH ROW
  EXECUTE FUNCTION notify_new_admin_action();

COMMENT ON FUNCTION trigger_process_admin_actions() IS 'Calls the process-admin-actions Edge Function to handle pending admin actions like gift_pro';
