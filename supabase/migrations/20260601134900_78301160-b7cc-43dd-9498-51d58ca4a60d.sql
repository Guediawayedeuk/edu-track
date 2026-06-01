-- 1) Tighten attendance teacher policy to require they handle the class/student
DROP POLICY IF EXISTS "Teachers manage attendance they record" ON public.attendance;

CREATE POLICY "Teachers manage attendance they record"
ON public.attendance
FOR ALL
TO authenticated
USING (
  recorded_by = public.get_teacher_id(auth.uid())
  AND (
    (class_id IS NOT NULL AND public.teacher_handles_class(class_id))
    OR EXISTS (
      SELECT 1 FROM public.students s
      WHERE s.id = attendance.student_id
        AND s.class_id IS NOT NULL
        AND public.teacher_handles_class(s.class_id)
    )
  )
)
WITH CHECK (
  recorded_by = public.get_teacher_id(auth.uid())
  AND (
    (class_id IS NOT NULL AND public.teacher_handles_class(class_id))
    OR EXISTS (
      SELECT 1 FROM public.students s
      WHERE s.id = attendance.student_id
        AND s.class_id IS NOT NULL
        AND public.teacher_handles_class(s.class_id)
    )
  )
);

-- 2) Block direct INSERT on notifications by non-admin authenticated users.
-- Triggers and SECURITY DEFINER functions (notify_on_*, send_user_message) bypass RLS.
-- The existing "Admins manage notifications" ALL policy still allows admin inserts.
CREATE POLICY "Block direct notification inserts"
ON public.notifications
AS RESTRICTIVE
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));
