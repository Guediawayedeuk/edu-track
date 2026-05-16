
-- Tables classes et matières
CREATE TABLE public.classes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  level text,
  room text,
  main_teacher_id uuid REFERENCES public.teachers(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.subjects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  code text,
  color text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.teacher_subjects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id uuid NOT NULL REFERENCES public.teachers(id) ON DELETE CASCADE,
  subject_id uuid NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
  UNIQUE (teacher_id, subject_id)
);

-- RLS
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teacher_subjects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage classes" ON public.classes
  FOR ALL TO authenticated
  USING (has_role(auth.uid(),'admin')) WITH CHECK (has_role(auth.uid(),'admin'));
CREATE POLICY "Authenticated read classes" ON public.classes
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins manage subjects" ON public.subjects
  FOR ALL TO authenticated
  USING (has_role(auth.uid(),'admin')) WITH CHECK (has_role(auth.uid(),'admin'));
CREATE POLICY "Authenticated read subjects" ON public.subjects
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins manage teacher_subjects" ON public.teacher_subjects
  FOR ALL TO authenticated
  USING (has_role(auth.uid(),'admin')) WITH CHECK (has_role(auth.uid(),'admin'));
CREATE POLICY "Authenticated read teacher_subjects" ON public.teacher_subjects
  FOR SELECT TO authenticated USING (true);

-- Allow admins to view all profiles & roles (needed for management UIs)
CREATE POLICY "Admins view all profiles" ON public.profiles
  FOR SELECT TO authenticated USING (has_role(auth.uid(),'admin'));
CREATE POLICY "Admins update all profiles" ON public.profiles
  FOR UPDATE TO authenticated USING (has_role(auth.uid(),'admin'));
CREATE POLICY "Admins delete profiles" ON public.profiles
  FOR DELETE TO authenticated USING (has_role(auth.uid(),'admin'));

CREATE POLICY "Admins view all roles" ON public.user_roles
  FOR SELECT TO authenticated USING (has_role(auth.uid(),'admin'));

-- Triggers updated_at
CREATE TRIGGER trg_classes_updated BEFORE UPDATE ON public.classes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_subjects_updated BEFORE UPDATE ON public.subjects
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
