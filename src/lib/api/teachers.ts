import { supabase } from "@/integrations/supabase/client";

export type TeacherRow = {
  id: string;
  user_id: string;
  subject: string;
  hire_date: string;
  profile: { id: string; first_name: string | null; last_name: string | null } | null;
};

export async function listTeachers(): Promise<TeacherRow[]> {
  const { data: teachers, error } = await supabase
    .from("teachers")
    .select("id, user_id, subject, hire_date")
    .order("created_at", { ascending: false });
  if (error) throw error;

  const profileIds = (teachers ?? []).map((t) => t.user_id);
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, first_name, last_name")
    .in("id", profileIds.length ? profileIds : ["00000000-0000-0000-0000-000000000000"]);

  return (teachers ?? []).map((t) => ({
    ...t,
    profile: profiles?.find((p) => p.id === t.user_id) ?? null,
  }));
}

export async function updateTeacherSubject(id: string, subject: string) {
  const { error } = await supabase.from("teachers").update({ subject }).eq("id", id);
  if (error) throw error;
}

export async function deleteTeacherUser(teacherUserProfileId: string) {
  // delete auth user via edge function — need auth user id (profiles.user_id)
  const { data: prof } = await supabase.from("profiles").select("user_id").eq("id", teacherUserProfileId).maybeSingle();
  if (!prof) throw new Error("Profil introuvable");
  const { data, error } = await supabase.functions.invoke("admin-delete-user", { body: { user_id: prof.user_id } });
  if (error) throw error;
  if ((data as any)?.error) throw new Error((data as any).error);
}

export async function createTeacher(input: { email: string; first_name: string; last_name: string; subject: string }) {
  const { data, error } = await supabase.functions.invoke("admin-create-user", {
    body: { ...input, role: "teacher" },
  });
  if (error) throw error;
  if ((data as any)?.error) throw new Error((data as any).error);
  return data as { user_id: string; email: string; password: string };
}
