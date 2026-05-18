import { supabase } from "@/integrations/supabase/client";

export type ExamRow = {
  id: string;
  title: string;
  class_id: string;
  subject_id: string | null;
  teacher_id: string;
  exam_date: string;
  duration_minutes: number;
  max_grade: number;
  status: "planned" | "graded" | "published";
  class?: { id: string; name: string } | null;
  subject?: { id: string; name: string; color: string | null } | null;
};

export async function listExams(filter?: { teacher_id?: string; class_id?: string }) {
  let q = supabase
    .from("exams")
    .select("*, class:classes(id,name), subject:subjects(id,name,color)")
    .order("exam_date", { ascending: false });
  if (filter?.teacher_id) q = q.eq("teacher_id", filter.teacher_id);
  if (filter?.class_id) q = q.eq("class_id", filter.class_id);
  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []) as unknown as ExamRow[];
}

export async function createExam(input: Omit<ExamRow, "id" | "class" | "subject">) {
  const { data, error } = await supabase.from("exams").insert(input).select().single();
  if (error) throw error;
  return data;
}
export async function updateExam(id: string, patch: Partial<Omit<ExamRow, "id" | "class" | "subject">>) {
  const { error } = await supabase.from("exams").update(patch).eq("id", id);
  if (error) throw error;
}
export async function deleteExam(id: string) {
  const { error } = await supabase.from("exams").delete().eq("id", id);
  if (error) throw error;
}

export async function getMyTeacherId(): Promise<string | null> {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return null;
  const { data } = await supabase.from("teachers").select("id").eq("user_id", userData.user.id).maybeSingle();
  return data?.id ?? null;
}
