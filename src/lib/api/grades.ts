import { supabase } from "@/integrations/supabase/client";

export type GradeRow = {
  id: string;
  exam_id: string;
  student_id: string;
  value: number;
  comment: string | null;
  graded_by: string | null;
};

export async function listGradesByExam(exam_id: string): Promise<GradeRow[]> {
  const { data, error } = await supabase.from("grades").select("*").eq("exam_id", exam_id);
  if (error) throw error;
  return (data ?? []) as GradeRow[];
}

export async function listGradesByStudent(student_id: string) {
  const { data, error } = await supabase
    .from("grades")
    .select("*, exam:exams(id,title,exam_date,max_grade,subject:subjects(id,name,color))")
    .eq("student_id", student_id);
  if (error) throw error;
  return data ?? [];
}

export async function upsertGrades(
  rows: Array<{ exam_id: string; student_id: string; value: number; comment?: string | null; graded_by: string }>,
) {
  if (!rows.length) return;
  const { error } = await supabase.from("grades").upsert(rows, { onConflict: "exam_id,student_id" });
  if (error) throw error;
}
