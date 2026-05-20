import { supabase } from "@/integrations/supabase/client";

export type Message = {
  id: string;
  sender_id: string;
  recipient_id: string;
  student_id: string | null;
  subject: string | null;
  body: string;
  parent_message_id: string | null;
  read_at: string | null;
  created_at: string;
};

export async function listMyMessages() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];
  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as Message[];
}

export async function sendMessage(input: { recipient_id: string; subject?: string; body: string; student_id?: string | null; parent_message_id?: string | null }) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Non authentifié");
  const { data, error } = await supabase.from("messages").insert({
    sender_id: user.id,
    recipient_id: input.recipient_id,
    subject: input.subject ?? null,
    body: input.body,
    student_id: input.student_id ?? null,
    parent_message_id: input.parent_message_id ?? null,
  }).select().single();
  if (error) throw error;

  // notify recipient
  await supabase.from("notifications").insert({
    user_id: input.recipient_id,
    type: "message",
    title: input.subject || "Nouveau message",
    body: input.body.slice(0, 120),
    link: "/messages",
    metadata: { message_id: data.id, sender_id: user.id },
  });
  return data as Message;
}

export async function markMessageRead(id: string) {
  await supabase.from("messages").update({ read_at: new Date().toISOString() }).eq("id", id);
}

export async function listContacts() {
  // Return profiles with role label, so users can pick a recipient
  const { data: profiles } = await supabase.from("profiles").select("user_id, first_name, last_name");
  const { data: roles } = await supabase.from("user_roles").select("user_id, role");
  return (profiles ?? []).map((p: any) => ({
    user_id: p.user_id,
    name: `${p.first_name ?? ""} ${p.last_name ?? ""}`.trim() || "Utilisateur",
    role: roles?.find((r: any) => r.user_id === p.user_id)?.role ?? null,
  }));
}
