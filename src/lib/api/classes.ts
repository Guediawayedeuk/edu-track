import { supabase } from "@/integrations/supabase/client";

export type ClassRow = { id: string; name: string; level: string | null; room: string | null; main_teacher_id: string | null };

export async function listClasses(): Promise<ClassRow[]> {
  const { data, error } = await supabase.from("classes").select("*").order("name");
  if (error) throw error;
  return data ?? [];
}
export async function createClass(input: Omit<ClassRow, "id">) {
  const { error } = await supabase.from("classes").insert(input);
  if (error) throw error;
}
export async function updateClass(id: string, patch: Partial<Omit<ClassRow, "id">>) {
  const { error } = await supabase.from("classes").update(patch).eq("id", id);
  if (error) throw error;
}
export async function deleteClass(id: string) {
  const { error } = await supabase.from("classes").delete().eq("id", id);
  if (error) throw error;
}
