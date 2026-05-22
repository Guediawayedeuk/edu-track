
-- 1. Remove overly permissive INSERT policies (service role + SECURITY DEFINER triggers still work)
DROP POLICY IF EXISTS "System inserts ai alerts" ON public.ai_alerts;
DROP POLICY IF EXISTS "System insert notifications" ON public.notifications;

-- 2. Replace recipient UPDATE policy with a tight one + dedicated RPC for marking read
DROP POLICY IF EXISTS "Recipient updates read state" ON public.messages;

CREATE OR REPLACE FUNCTION public.mark_message_read(_message_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.messages
     SET read_at = now()
   WHERE id = _message_id
     AND recipient_id = auth.uid()
     AND read_at IS NULL;
END;
$$;

REVOKE ALL ON FUNCTION public.mark_message_read(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.mark_message_read(uuid) TO authenticated;

-- 3. Server-side helper to send a message + notification atomically
CREATE OR REPLACE FUNCTION public.send_user_message(
  _recipient_id uuid,
  _body text,
  _subject text DEFAULT NULL,
  _student_id uuid DEFAULT NULL,
  _parent_message_id uuid DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _sender uuid := auth.uid();
  _new_id uuid;
BEGIN
  IF _sender IS NULL THEN
    RAISE EXCEPTION 'not authenticated';
  END IF;
  IF _body IS NULL OR length(btrim(_body)) = 0 THEN
    RAISE EXCEPTION 'message body required';
  END IF;

  INSERT INTO public.messages (sender_id, recipient_id, subject, body, student_id, parent_message_id)
  VALUES (_sender, _recipient_id, _subject, _body, _student_id, _parent_message_id)
  RETURNING id INTO _new_id;

  INSERT INTO public.notifications (user_id, type, title, body, link, metadata)
  VALUES (
    _recipient_id,
    'message',
    COALESCE(_subject, 'Nouveau message'),
    left(_body, 120),
    '/messages',
    jsonb_build_object('message_id', _new_id, 'sender_id', _sender)
  );

  RETURN _new_id;
END;
$$;

REVOKE ALL ON FUNCTION public.send_user_message(uuid, text, text, uuid, uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.send_user_message(uuid, text, text, uuid, uuid) TO authenticated;

-- 4. Prevent self-assignment of the admin role on signup
DROP POLICY IF EXISTS "Users can insert own role on signup" ON public.user_roles;

CREATE POLICY "Users can insert own non-admin role on signup"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (
  user_id = auth.uid()
  AND role <> 'admin'::app_role
  AND NOT EXISTS (
    SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid()
  )
);

-- 5. Lock down internal SECURITY DEFINER functions so only postgres/service role can call them directly
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.notify_on_grade() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.notify_on_attendance() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.notify_on_payment() FROM PUBLIC, anon, authenticated;
