
-- 1. Messages: remove direct INSERT, force usage of send_user_message RPC
DROP POLICY IF EXISTS "Users send messages" ON public.messages;

-- 2. Notifications: restrict UPDATE to read_at only via trigger + WITH CHECK
DROP POLICY IF EXISTS "Users update own notifications" ON public.notifications;

CREATE POLICY "Users update read state on own notifications"
ON public.notifications
FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE OR REPLACE FUNCTION public.prevent_notification_field_changes()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.user_id IS DISTINCT FROM OLD.user_id
     OR NEW.type IS DISTINCT FROM OLD.type
     OR NEW.title IS DISTINCT FROM OLD.title
     OR NEW.body IS DISTINCT FROM OLD.body
     OR NEW.link IS DISTINCT FROM OLD.link
     OR NEW.metadata IS DISTINCT FROM OLD.metadata
     OR NEW.created_at IS DISTINCT FROM OLD.created_at THEN
    RAISE EXCEPTION 'Only read_at can be modified on notifications';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS notifications_restrict_update ON public.notifications;
CREATE TRIGGER notifications_restrict_update
BEFORE UPDATE ON public.notifications
FOR EACH ROW
WHEN (NOT public.has_role(auth.uid(), 'admin'::app_role))
EXECUTE FUNCTION public.prevent_notification_field_changes();

-- 3. Students: scope teacher reads to classes they handle
DROP POLICY IF EXISTS "Teachers read students" ON public.students;

CREATE POLICY "Teachers read students in handled classes"
ON public.students
FOR SELECT
TO authenticated
USING (
  class_id IS NOT NULL
  AND public.get_teacher_id(auth.uid()) IS NOT NULL
  AND public.teacher_handles_class(class_id)
);
