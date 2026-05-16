import { supabase } from "@/integrations/supabase/client";

export type ParentRow = {
  profile_id: string;
  user_id: string;
  first_name: string | null;
  last_name: string | null;
  children_count: number;
};

export async function listParents(): Promise<ParentRow[]> {
  const { data: roles, error } = await supabase.from("user_roles").select("user_id").eq("role", "parent");
  if (error) throw error;
  const userIds = (roles ?? []).map((r) => r.user_id);
  if (!userIds.length) return [];
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, user_id, first_name, last_name")
    .in("user_id", userIds);
  const profileIds = (profiles ?? []).map((p) => p.id);
  const { data: students } = await supabase
    .from("students")
    .select("parent_user_id")
    .in("parent_user_id", profileIds.length ? profileIds : ["00000000-0000-0000-0000-000000000000"]);
  return (profiles ?? []).map((p) => ({
    profile_id: p.id,
    user_id: p.user_id,
    first_name: p.first_name,
    last_name: p.last_name,
    children_count: (students ?? []).filter((s) => s.parent_user_id === p.id).length,
  }));
}

export async function createParent(input: { email: string; first_name: string; last_name: string }) {
  const { data, error } = await supabase.functions.invoke("admin-create-user", { body: { ...input, role: "parent" } });
  if (error) throw error;
  if ((data as any)?.error) throw new Error((data as any).error);
  return data as { user_id: string; email: string; password: string };
}

export async function deleteParent(authUserId: string) {
  const { data, error } = await supabase.functions.invoke("admin-delete-user", { body: { user_id: authUserId } });
  if (error) throw error;
  if ((data as any)?.error) throw new Error((data as any).error);
}
