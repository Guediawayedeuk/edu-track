
-- 1. User notification preferences
CREATE TABLE IF NOT EXISTS public.user_notification_prefs (
  user_id uuid PRIMARY KEY,
  grade_enabled boolean NOT NULL DEFAULT true,
  attendance_enabled boolean NOT NULL DEFAULT true,
  payment_enabled boolean NOT NULL DEFAULT true,
  message_enabled boolean NOT NULL DEFAULT true,
  ai_enabled boolean NOT NULL DEFAULT true,
  quiet_hours_start time,
  quiet_hours_end time,
  paused_until timestamptz,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.user_notification_prefs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own prefs" ON public.user_notification_prefs
FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE POLICY "Users upsert own prefs" ON public.user_notification_prefs
FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users update own prefs" ON public.user_notification_prefs
FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins manage prefs" ON public.user_notification_prefs
FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- 2. Helper: should we deliver notification of given type to user
CREATE OR REPLACE FUNCTION public.should_notify(_user_id uuid, _type text)
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE p public.user_notification_prefs%ROWTYPE; n_time time; enabled boolean;
BEGIN
  SELECT * INTO p FROM public.user_notification_prefs WHERE user_id = _user_id;
  IF NOT FOUND THEN RETURN true; END IF;
  IF p.paused_until IS NOT NULL AND p.paused_until > now() THEN RETURN false; END IF;
  enabled := CASE _type
    WHEN 'grade' THEN p.grade_enabled
    WHEN 'attendance' THEN p.attendance_enabled
    WHEN 'payment' THEN p.payment_enabled
    WHEN 'message' THEN p.message_enabled
    WHEN 'ai' THEN p.ai_enabled
    ELSE true
  END;
  IF NOT enabled THEN RETURN false; END IF;
  IF p.quiet_hours_start IS NOT NULL AND p.quiet_hours_end IS NOT NULL THEN
    n_time := (now() AT TIME ZONE 'UTC')::time;
    IF p.quiet_hours_start <= p.quiet_hours_end THEN
      IF n_time >= p.quiet_hours_start AND n_time < p.quiet_hours_end THEN RETURN false; END IF;
    ELSE
      IF n_time >= p.quiet_hours_start OR n_time < p.quiet_hours_end THEN RETURN false; END IF;
    END IF;
  END IF;
  RETURN true;
END;
$$;

-- 3. Update trigger functions to honor prefs
CREATE OR REPLACE FUNCTION public.notify_on_grade()
 RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $function$
DECLARE v_parent UUID; v_student_user UUID; v_exam_title TEXT; v_max NUMERIC;
BEGIN
  SELECT parent_user_id, user_id INTO v_parent, v_student_user FROM public.students WHERE id = NEW.student_id;
  SELECT title, max_grade INTO v_exam_title, v_max FROM public.exams WHERE id = NEW.exam_id;
  IF v_parent IS NOT NULL AND public.should_notify(v_parent, 'grade') THEN
    INSERT INTO public.notifications(user_id, type, title, body, link, metadata)
    VALUES (v_parent, 'grade', 'Nouvelle note', COALESCE(v_exam_title,'Évaluation')||' : '||NEW.value||'/'||COALESCE(v_max,20), '/parent', jsonb_build_object('student_id', NEW.student_id, 'exam_id', NEW.exam_id, 'value', NEW.value));
  END IF;
  IF v_student_user IS NOT NULL AND v_student_user <> COALESCE(v_parent,'00000000-0000-0000-0000-000000000000'::uuid) AND public.should_notify(v_student_user, 'grade') THEN
    INSERT INTO public.notifications(user_id, type, title, body, link, metadata)
    VALUES (v_student_user, 'grade', 'Nouvelle note', COALESCE(v_exam_title,'Évaluation')||' : '||NEW.value||'/'||COALESCE(v_max,20), '/parent', jsonb_build_object('student_id', NEW.student_id, 'exam_id', NEW.exam_id, 'value', NEW.value));
  END IF;
  RETURN NEW;
END;$function$;

CREATE OR REPLACE FUNCTION public.notify_on_attendance()
 RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $function$
DECLARE v_parent UUID; v_label TEXT;
BEGIN
  IF NEW.status NOT IN ('absent','late') THEN RETURN NEW; END IF;
  SELECT parent_user_id INTO v_parent FROM public.students WHERE id = NEW.student_id;
  IF v_parent IS NULL OR NOT public.should_notify(v_parent, 'attendance') THEN RETURN NEW; END IF;
  v_label := CASE NEW.status WHEN 'absent' THEN 'Absence signalée' WHEN 'late' THEN 'Retard signalé' END;
  INSERT INTO public.notifications(user_id, type, title, body, link, metadata)
  VALUES (v_parent, 'attendance', v_label, 'Date : '||NEW.date::text, '/parent', jsonb_build_object('student_id', NEW.student_id, 'status', NEW.status, 'date', NEW.date));
  RETURN NEW;
END;$function$;

CREATE OR REPLACE FUNCTION public.notify_on_payment()
 RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $function$
DECLARE v_parent UUID;
BEGIN
  IF TG_OP = 'UPDATE' AND NEW.status = OLD.status THEN RETURN NEW; END IF;
  SELECT parent_user_id INTO v_parent FROM public.students WHERE id = NEW.student_id;
  IF v_parent IS NULL OR NOT public.should_notify(v_parent, 'payment') THEN RETURN NEW; END IF;
  INSERT INTO public.notifications(user_id, type, title, body, link, metadata)
  VALUES (v_parent, 'payment', 'Mise à jour paiement', COALESCE(NEW.description,'Paiement')||' — statut : '||NEW.status, '/parent', jsonb_build_object('payment_id', NEW.id, 'status', NEW.status));
  RETURN NEW;
END;$function$;

CREATE OR REPLACE FUNCTION public.send_user_message(_recipient_id uuid, _body text, _subject text DEFAULT NULL::text, _student_id uuid DEFAULT NULL::uuid, _parent_message_id uuid DEFAULT NULL::uuid)
 RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $function$
DECLARE _sender uuid := auth.uid(); _new_id uuid;
BEGIN
  IF _sender IS NULL THEN RAISE EXCEPTION 'not authenticated'; END IF;
  IF _body IS NULL OR length(btrim(_body)) = 0 THEN RAISE EXCEPTION 'message body required'; END IF;
  INSERT INTO public.messages (sender_id, recipient_id, subject, body, student_id, parent_message_id)
  VALUES (_sender, _recipient_id, _subject, _body, _student_id, _parent_message_id)
  RETURNING id INTO _new_id;
  IF public.should_notify(_recipient_id, 'message') THEN
    INSERT INTO public.notifications (user_id, type, title, body, link, metadata)
    VALUES (_recipient_id, 'message', COALESCE(_subject, 'Nouveau message'), left(_body, 120), '/messages',
            jsonb_build_object('message_id', _new_id, 'sender_id', _sender));
  END IF;
  RETURN _new_id;
END;
$function$;

-- 4. AI Alerts: handled + checklist state
ALTER TABLE public.ai_alerts
  ADD COLUMN IF NOT EXISTS handled_at timestamptz,
  ADD COLUMN IF NOT EXISTS handled_by uuid,
  ADD COLUMN IF NOT EXISTS recommendations_state jsonb NOT NULL DEFAULT '{}'::jsonb;

CREATE OR REPLACE FUNCTION public.mark_alert_handled(_alert_id uuid, _handled boolean DEFAULT true)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _uid uuid := auth.uid(); _sid uuid;
BEGIN
  IF _uid IS NULL THEN RAISE EXCEPTION 'not authenticated'; END IF;
  SELECT student_id INTO _sid FROM public.ai_alerts WHERE id = _alert_id;
  IF _sid IS NULL THEN RAISE EXCEPTION 'alert not found'; END IF;
  IF NOT (
    public.has_role(_uid, 'admin'::app_role)
    OR public.is_parent_of_student(_sid)
    OR public.is_student_self(_sid)
    OR EXISTS (SELECT 1 FROM public.students s WHERE s.id = _sid AND public.teacher_handles_class(s.class_id))
  ) THEN RAISE EXCEPTION 'forbidden'; END IF;
  UPDATE public.ai_alerts
     SET handled_at = CASE WHEN _handled THEN now() ELSE NULL END,
         handled_by = CASE WHEN _handled THEN _uid ELSE NULL END
   WHERE id = _alert_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.toggle_alert_recommendation(_alert_id uuid, _key text, _done boolean)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _uid uuid := auth.uid(); _sid uuid;
BEGIN
  IF _uid IS NULL THEN RAISE EXCEPTION 'not authenticated'; END IF;
  SELECT student_id INTO _sid FROM public.ai_alerts WHERE id = _alert_id;
  IF _sid IS NULL THEN RAISE EXCEPTION 'alert not found'; END IF;
  IF NOT (
    public.has_role(_uid, 'admin'::app_role)
    OR public.is_parent_of_student(_sid)
    OR public.is_student_self(_sid)
    OR EXISTS (SELECT 1 FROM public.students s WHERE s.id = _sid AND public.teacher_handles_class(s.class_id))
  ) THEN RAISE EXCEPTION 'forbidden'; END IF;
  UPDATE public.ai_alerts
     SET recommendations_state = recommendations_state || jsonb_build_object(_key, _done)
   WHERE id = _alert_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.set_notification_pref(
  _grade boolean DEFAULT NULL, _attendance boolean DEFAULT NULL,
  _payment boolean DEFAULT NULL, _message boolean DEFAULT NULL, _ai boolean DEFAULT NULL,
  _quiet_start time DEFAULT NULL, _quiet_end time DEFAULT NULL,
  _paused_until timestamptz DEFAULT NULL,
  _clear_pause boolean DEFAULT false,
  _clear_quiet boolean DEFAULT false
) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _uid uuid := auth.uid();
BEGIN
  IF _uid IS NULL THEN RAISE EXCEPTION 'not authenticated'; END IF;
  INSERT INTO public.user_notification_prefs (user_id) VALUES (_uid)
  ON CONFLICT (user_id) DO NOTHING;
  UPDATE public.user_notification_prefs SET
    grade_enabled = COALESCE(_grade, grade_enabled),
    attendance_enabled = COALESCE(_attendance, attendance_enabled),
    payment_enabled = COALESCE(_payment, payment_enabled),
    message_enabled = COALESCE(_message, message_enabled),
    ai_enabled = COALESCE(_ai, ai_enabled),
    quiet_hours_start = CASE WHEN _clear_quiet THEN NULL ELSE COALESCE(_quiet_start, quiet_hours_start) END,
    quiet_hours_end   = CASE WHEN _clear_quiet THEN NULL ELSE COALESCE(_quiet_end,   quiet_hours_end) END,
    paused_until = CASE WHEN _clear_pause THEN NULL ELSE COALESCE(_paused_until, paused_until) END,
    updated_at = now()
  WHERE user_id = _uid;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.should_notify(uuid, text) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.set_notification_pref(boolean, boolean, boolean, boolean, boolean, time, time, timestamptz, boolean, boolean) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.set_notification_pref(boolean, boolean, boolean, boolean, boolean, time, time, timestamptz, boolean, boolean) TO authenticated;
REVOKE EXECUTE ON FUNCTION public.mark_alert_handled(uuid, boolean) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.mark_alert_handled(uuid, boolean) TO authenticated;
REVOKE EXECUTE ON FUNCTION public.toggle_alert_recommendation(uuid, text, boolean) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.toggle_alert_recommendation(uuid, text, boolean) TO authenticated;
