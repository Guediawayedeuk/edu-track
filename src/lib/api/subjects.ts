import { supabase } from "@/integrations/supabase/client";

export type SubjectRow = { id: string; name: string; code: string | null; color: string | null };

export async function listSubjects(): Promise<SubjectRow[]> {
  const { data, error } = await supabase.from("subjects").select("*").order("name");
  if (error) throw error;
  return data ?? [];
}
export async function createSubject(input: Omit<SubjectRow, "id">) {
  const { error } = await supabase.from("subjects").insert(input);
  if (error) throw error;
}
export async function updateSubject(id: string, patch: Partial<Omit<SubjectRow, "id">>) {
  const { error } = await supabase.from("subjects").update(patch).eq("id", id);
  if (error) throw error;
}
export async function deleteSubject(id: string) {
  const { error } = await supabase.from("subjects").delete().eq("id", id);
  if (error) throw error;
}
