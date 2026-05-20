
-- NOTIFICATIONS
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT,
  link TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_notifications_user_unread ON public.notifications(user_id, read_at);
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own notifications" ON public.notifications
  FOR SELECT TO authenticated USING (user_id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Users update own notifications" ON public.notifications
  FOR UPDATE TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Admins manage notifications" ON public.notifications
  FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "System insert notifications" ON public.notifications
  FOR INSERT TO authenticated WITH CHECK (true);

-- MESSAGES
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID NOT NULL,
  recipient_id UUID NOT NULL,
  student_id UUID,
  subject TEXT,
  body TEXT NOT NULL,
  parent_message_id UUID REFERENCES public.messages(id) ON DELETE CASCADE,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_messages_recipient ON public.messages(recipient_id, created_at DESC);
CREATE INDEX idx_messages_sender ON public.messages(sender_id, created_at DESC);
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own messages" ON public.messages
  FOR SELECT TO authenticated USING (sender_id = auth.uid() OR recipient_id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Users send messages" ON public.messages
  FOR INSERT TO authenticated WITH CHECK (sender_id = auth.uid());
CREATE POLICY "Recipient updates read state" ON public.messages
  FOR UPDATE TO authenticated USING (recipient_id = auth.uid());
CREATE POLICY "Admins manage messages" ON public.messages
  FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- AI ALERTS
CREATE TABLE public.ai_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL,
  severity TEXT NOT NULL DEFAULT 'info',
  summary TEXT NOT NULL,
  recommendations JSONB NOT NULL DEFAULT '[]'::jsonb,
  current_average NUMERIC,
  predicted_average NUMERIC,
  trend TEXT,
  generated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_ai_alerts_student ON public.ai_alerts(student_id, generated_at DESC);
ALTER TABLE public.ai_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Parents/Students read own ai alerts" ON public.ai_alerts
  FOR SELECT TO authenticated USING (is_parent_of_student(student_id) OR is_student_self(student_id));
CREATE POLICY "Teachers read ai alerts for their students" ON public.ai_alerts
  FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM public.students s WHERE s.id = ai_alerts.student_id AND teacher_handles_class(s.class_id))
  );
CREATE POLICY "Admins manage ai alerts" ON public.ai_alerts
  FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "System inserts ai alerts" ON public.ai_alerts
  FOR INSERT TO authenticated WITH CHECK (true);

-- TRIGGER: notify on grade insert/update
CREATE OR REPLACE FUNCTION public.notify_on_grade()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_parent UUID; v_student_user UUID; v_exam_title TEXT; v_max NUMERIC;
BEGIN
  SELECT parent_user_id, user_id INTO v_parent, v_student_user FROM public.students WHERE id = NEW.student_id;
  SELECT title, max_grade INTO v_exam_title, v_max FROM public.exams WHERE id = NEW.exam_id;
  IF v_parent IS NOT NULL THEN
    INSERT INTO public.notifications(user_id, type, title, body, link, metadata)
    VALUES (v_parent, 'grade', 'Nouvelle note', COALESCE(v_exam_title,'Évaluation')||' : '||NEW.value||'/'||COALESCE(v_max,20), '/parent', jsonb_build_object('student_id', NEW.student_id, 'exam_id', NEW.exam_id, 'value', NEW.value));
  END IF;
  IF v_student_user IS NOT NULL AND v_student_user <> COALESCE(v_parent,'00000000-0000-0000-0000-000000000000'::uuid) THEN
    INSERT INTO public.notifications(user_id, type, title, body, link, metadata)
    VALUES (v_student_user, 'grade', 'Nouvelle note', COALESCE(v_exam_title,'Évaluation')||' : '||NEW.value||'/'||COALESCE(v_max,20), '/parent', jsonb_build_object('student_id', NEW.student_id, 'exam_id', NEW.exam_id, 'value', NEW.value));
  END IF;
  RETURN NEW;
END;$$;
CREATE TRIGGER trg_notify_grade
AFTER INSERT OR UPDATE ON public.grades
FOR EACH ROW EXECUTE FUNCTION public.notify_on_grade();

-- TRIGGER: notify absence/late
CREATE OR REPLACE FUNCTION public.notify_on_attendance()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_parent UUID; v_label TEXT;
BEGIN
  IF NEW.status NOT IN ('absent','late') THEN RETURN NEW; END IF;
  SELECT parent_user_id INTO v_parent FROM public.students WHERE id = NEW.student_id;
  IF v_parent IS NULL THEN RETURN NEW; END IF;
  v_label := CASE NEW.status WHEN 'absent' THEN 'Absence signalée' WHEN 'late' THEN 'Retard signalé' END;
  INSERT INTO public.notifications(user_id, type, title, body, link, metadata)
  VALUES (v_parent, 'attendance', v_label, 'Date : '||NEW.date::text, '/parent', jsonb_build_object('student_id', NEW.student_id, 'status', NEW.status, 'date', NEW.date));
  RETURN NEW;
END;$$;
CREATE TRIGGER trg_notify_attendance
AFTER INSERT OR UPDATE ON public.attendance
FOR EACH ROW EXECUTE FUNCTION public.notify_on_attendance();

-- TRIGGER: notify payment status change
CREATE OR REPLACE FUNCTION public.notify_on_payment()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_parent UUID;
BEGIN
  IF TG_OP = 'UPDATE' AND NEW.status = OLD.status THEN RETURN NEW; END IF;
  SELECT parent_user_id INTO v_parent FROM public.students WHERE id = NEW.student_id;
  IF v_parent IS NULL THEN RETURN NEW; END IF;
  INSERT INTO public.notifications(user_id, type, title, body, link, metadata)
  VALUES (v_parent, 'payment', 'Mise à jour paiement', COALESCE(NEW.description,'Paiement')||' — statut : '||NEW.status, '/parent', jsonb_build_object('payment_id', NEW.id, 'status', NEW.status));
  RETURN NEW;
END;$$;
CREATE TRIGGER trg_notify_payment
AFTER INSERT OR UPDATE ON public.payments
FOR EACH ROW EXECUTE FUNCTION public.notify_on_payment();
