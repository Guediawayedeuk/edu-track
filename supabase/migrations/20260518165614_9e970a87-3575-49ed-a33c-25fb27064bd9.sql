
-- ========== Schema ==========

-- Add class_id to students (kept alongside class_name for back-compat)
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS class_id uuid REFERENCES public.classes(id) ON DELETE SET NULL;

-- Exams
CREATE TABLE IF NOT EXISTS public.exams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  class_id uuid NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  subject_id uuid REFERENCES public.subjects(id) ON DELETE SET NULL,
  teacher_id uuid NOT NULL REFERENCES public.teachers(id) ON DELETE CASCADE,
  exam_date date NOT NULL,
  duration_minutes integer NOT NULL DEFAULT 60,
  max_grade numeric NOT NULL DEFAULT 20,
  status text NOT NULL DEFAULT 'planned' CHECK (status IN ('planned','graded','published')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.exams ENABLE ROW LEVEL SECURITY;

-- Grades
CREATE TABLE IF NOT EXISTS public.grades (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_id uuid NOT NULL REFERENCES public.exams(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  value numeric NOT NULL,
  comment text,
  graded_by uuid REFERENCES public.teachers(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (exam_id, student_id)
);
ALTER TABLE public.grades ENABLE ROW LEVEL SECURITY;

-- Attendance
CREATE TABLE IF NOT EXISTS public.attendance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  class_id uuid REFERENCES public.classes(id) ON DELETE SET NULL,
  subject_id uuid REFERENCES public.subjects(id) ON DELETE SET NULL,
  date date NOT NULL DEFAULT CURRENT_DATE,
  status text NOT NULL CHECK (status IN ('present','absent','late','excused')),
  recorded_by uuid REFERENCES public.teachers(id) ON DELETE SET NULL,
  note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS attendance_unique_idx
  ON public.attendance (student_id, date, COALESCE(subject_id, '00000000-0000-0000-0000-000000000000'::uuid));
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;

-- Payments
CREATE TABLE IF NOT EXISTS public.payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  amount numeric NOT NULL,
  amount_paid numeric NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','partial','paid','overdue')),
  due_date date,
  paid_date date,
  reference text,
  description text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- ========== Helpers (SECURITY DEFINER) ==========

CREATE OR REPLACE FUNCTION public.get_teacher_id(_user_id uuid)
RETURNS uuid LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT id FROM public.teachers WHERE user_id = _user_id LIMIT 1
$$;

CREATE OR REPLACE FUNCTION public.is_parent_of_student(_student_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.students WHERE id = _student_id AND parent_user_id = auth.uid())
$$;

CREATE OR REPLACE FUNCTION public.is_student_self(_student_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.students WHERE id = _student_id AND user_id = auth.uid())
$$;

CREATE OR REPLACE FUNCTION public.teacher_handles_class(_class_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.classes c
    WHERE c.id = _class_id AND c.main_teacher_id = public.get_teacher_id(auth.uid())
  ) OR EXISTS (
    SELECT 1 FROM public.exams e WHERE e.class_id = _class_id AND e.teacher_id = public.get_teacher_id(auth.uid())
  ) OR EXISTS (
    SELECT 1 FROM public.attendance a WHERE a.class_id = _class_id AND a.recorded_by = public.get_teacher_id(auth.uid())
  )
$$;

-- ========== Payments status trigger ==========
CREATE OR REPLACE FUNCTION public.compute_payment_status()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NEW.amount_paid >= NEW.amount THEN
    NEW.status := 'paid';
    IF NEW.paid_date IS NULL THEN NEW.paid_date := CURRENT_DATE; END IF;
  ELSIF NEW.amount_paid > 0 THEN
    NEW.status := 'partial';
  ELSIF NEW.due_date IS NOT NULL AND NEW.due_date < CURRENT_DATE THEN
    NEW.status := 'overdue';
  ELSE
    NEW.status := 'pending';
  END IF;
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_payments_status ON public.payments;
CREATE TRIGGER trg_payments_status BEFORE INSERT OR UPDATE ON public.payments
  FOR EACH ROW EXECUTE FUNCTION public.compute_payment_status();

-- Updated_at triggers
DROP TRIGGER IF EXISTS trg_exams_updated ON public.exams;
CREATE TRIGGER trg_exams_updated BEFORE UPDATE ON public.exams
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS trg_grades_updated ON public.grades;
CREATE TRIGGER trg_grades_updated BEFORE UPDATE ON public.grades
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS trg_attendance_updated ON public.attendance;
CREATE TRIGGER trg_attendance_updated BEFORE UPDATE ON public.attendance
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ========== RLS Policies ==========

-- EXAMS
DROP POLICY IF EXISTS "Admins manage exams" ON public.exams;
CREATE POLICY "Admins manage exams" ON public.exams FOR ALL TO authenticated
  USING (has_role(auth.uid(),'admin')) WITH CHECK (has_role(auth.uid(),'admin'));

DROP POLICY IF EXISTS "Teachers manage own exams" ON public.exams;
CREATE POLICY "Teachers manage own exams" ON public.exams FOR ALL TO authenticated
  USING (teacher_id = public.get_teacher_id(auth.uid()))
  WITH CHECK (teacher_id = public.get_teacher_id(auth.uid()));

DROP POLICY IF EXISTS "Parents/Students read relevant exams" ON public.exams;
CREATE POLICY "Parents/Students read relevant exams" ON public.exams FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.students s
      WHERE s.class_id = exams.class_id
        AND (s.parent_user_id = auth.uid() OR s.user_id = auth.uid())
    )
  );

-- GRADES
DROP POLICY IF EXISTS "Admins manage grades" ON public.grades;
CREATE POLICY "Admins manage grades" ON public.grades FOR ALL TO authenticated
  USING (has_role(auth.uid(),'admin')) WITH CHECK (has_role(auth.uid(),'admin'));

DROP POLICY IF EXISTS "Teachers manage grades they own" ON public.grades;
CREATE POLICY "Teachers manage grades they own" ON public.grades FOR ALL TO authenticated
  USING (
    graded_by = public.get_teacher_id(auth.uid())
    OR EXISTS (SELECT 1 FROM public.exams e WHERE e.id = grades.exam_id AND e.teacher_id = public.get_teacher_id(auth.uid()))
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.exams e WHERE e.id = grades.exam_id AND e.teacher_id = public.get_teacher_id(auth.uid()))
  );

DROP POLICY IF EXISTS "Parents/Students read own grades" ON public.grades;
CREATE POLICY "Parents/Students read own grades" ON public.grades FOR SELECT TO authenticated
  USING (public.is_parent_of_student(student_id) OR public.is_student_self(student_id));

-- ATTENDANCE
DROP POLICY IF EXISTS "Admins manage attendance" ON public.attendance;
CREATE POLICY "Admins manage attendance" ON public.attendance FOR ALL TO authenticated
  USING (has_role(auth.uid(),'admin')) WITH CHECK (has_role(auth.uid(),'admin'));

DROP POLICY IF EXISTS "Teachers manage attendance they record" ON public.attendance;
CREATE POLICY "Teachers manage attendance they record" ON public.attendance FOR ALL TO authenticated
  USING (recorded_by = public.get_teacher_id(auth.uid()))
  WITH CHECK (recorded_by = public.get_teacher_id(auth.uid()));

DROP POLICY IF EXISTS "Parents/Students read own attendance" ON public.attendance;
CREATE POLICY "Parents/Students read own attendance" ON public.attendance FOR SELECT TO authenticated
  USING (public.is_parent_of_student(student_id) OR public.is_student_self(student_id));

-- PAYMENTS
DROP POLICY IF EXISTS "Admins manage payments" ON public.payments;
CREATE POLICY "Admins manage payments" ON public.payments FOR ALL TO authenticated
  USING (has_role(auth.uid(),'admin')) WITH CHECK (has_role(auth.uid(),'admin'));

DROP POLICY IF EXISTS "Parents/Students read own payments" ON public.payments;
CREATE POLICY "Parents/Students read own payments" ON public.payments FOR SELECT TO authenticated
  USING (public.is_parent_of_student(student_id) OR public.is_student_self(student_id));

-- STUDENTS — additional read policies
DROP POLICY IF EXISTS "Teachers read students" ON public.students;
CREATE POLICY "Teachers read students" ON public.students FOR SELECT TO authenticated
  USING (public.get_teacher_id(auth.uid()) IS NOT NULL);

DROP POLICY IF EXISTS "Parents read own children" ON public.students;
CREATE POLICY "Parents read own children" ON public.students FOR SELECT TO authenticated
  USING (parent_user_id = auth.uid() OR user_id = auth.uid());

-- TEACHERS — authenticated directory read
DROP POLICY IF EXISTS "Authenticated read teachers" ON public.teachers;
CREATE POLICY "Authenticated read teachers" ON public.teachers FOR SELECT TO authenticated USING (true);
