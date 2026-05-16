import { supabase } from "@/integrations/supabase/client";

export type StudentRow = {
  id: string;
  user_id: string;
  class_name: string;
  parent_user_id: string | null;
  enrollment_date: string;
  profile: { id: string; first_name: string | null; last_name: string | null } | null;
  parent_profile: { id: string; first_name: string | null; last_name: string | null } | null;
};

export async function listStudents(): Promise<StudentRow[]> {
  const { data: students, error } = await supabase
    .from("students")
    .select("id, user_id, class_name, parent_user_id, enrollment_date")
    .order("created_at", { ascending: false });
  if (error) throw error;

  const ids = new Set<string>();
  (students ?? []).forEach((s) => {
    ids.add(s.user_id);
    if (s.parent_user_id) ids.add(s.parent_user_id);
  });
  const idArr = Array.from(ids);
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, first_name, last_name")
    .in("id", idArr.length ? idArr : ["00000000-0000-0000-0000-000000000000"]);

  return (students ?? []).map((s) => ({
    ...s,
    profile: profiles?.find((p) => p.id === s.user_id) ?? null,
    parent_profile: s.parent_user_id ? profiles?.find((p) => p.id === s.parent_user_id) ?? null : null,
  }));
}

export async function updateStudent(id: string, patch: Partial<{ class_name: string; parent_user_id: string | null }>) {
  const { error } = await supabase.from("students").update(patch).eq("id", id);
  if (error) throw error;
}

export async function deleteStudent(id: string) {
  const { data: s } = await supabase.from("students").select("user_id").eq("id", id).maybeSingle();
  if (!s) throw new Error("Élève introuvable");
  const { data: prof } = await supabase.from("profiles").select("user_id").eq("id", s.user_id).maybeSingle();
  if (!prof) throw new Error("Profil introuvable");
  const { data, error } = await supabase.functions.invoke("admin-delete-user", { body: { user_id: prof.user_id } });
  if (error) throw error;
  if ((data as any)?.error) throw new Error((data as any).error);
}

export async function createStudent(input: { email: string; first_name: string; last_name: string; class_name: string; parent_user_id?: string | null }) {
  const { data, error } = await supabase.functions.invoke("admin-create-student", { body: input });
  if (error) throw error;
  if ((data as any)?.error) throw new Error((data as any).error);
  return data as { user_id: string; email: string; password: string };
}
