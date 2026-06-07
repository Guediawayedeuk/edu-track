
-- 1) Restrict self-assignment of roles to 'parent' only (admins manage others)
DROP POLICY IF EXISTS "Users can insert own non-admin role on signup" ON public.user_roles;
CREATE POLICY "Users can self-assign parent role on signup"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (
  user_id = auth.uid()
  AND role = 'parent'::app_role
  AND NOT EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid())
);

-- 2) Close the circular escalation: a teacher must not gain class access merely
--    by having recorded an attendance row for that class. Authority now flows
--    only from admin-assigned class ownership (classes.main_teacher_id) or
--    admin-assigned exams (exams are admin-managed for the teacher_handles
--    check; teachers can still manage their own exams via their own policy).
CREATE OR REPLACE FUNCTION public.teacher_handles_class(_class_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.classes c
    WHERE c.id = _class_id AND c.main_teacher_id = public.get_teacher_id(auth.uid())
  )
$function$;

-- 3) Allow authenticated users to read basic profile info so the messaging
--    recipient picker works (names/avatars only; profiles table holds no
--    sensitive PII beyond first_name/last_name/avatar_url).
CREATE POLICY "Authenticated read profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (true);
