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

export type MessageAttachment = {
  id: string;
  message_id: string;
  uploader_id: string;
  storage_path: string;
  file_name: string;
  mime_type: string | null;
  size_bytes: number | null;
  created_at: string;
};

export const ATTACHMENT_BUCKET = "message-attachments";
export const ATTACHMENT_MAX_BYTES = 10 * 1024 * 1024; // 10MB
export const ATTACHMENT_ALLOWED = ["application/pdf", "image/png", "image/jpeg", "image/jpg", "image/webp", "image/gif"];

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
  const { data, error } = await supabase.rpc("send_user_message", {
    _recipient_id: input.recipient_id,
    _body: input.body,
    _subject: input.subject ?? null,
    _student_id: input.student_id ?? null,
    _parent_message_id: input.parent_message_id ?? null,
  });
  if (error) throw error;
  return { id: data as string } as Pick<Message, "id">;
}

export async function markMessageRead(id: string) {
  const { error } = await supabase.rpc("mark_message_read", { _message_id: id });
  if (error) throw error;
}

export async function listContacts() {
  const { data: profiles } = await supabase.from("profiles").select("user_id, first_name, last_name");
  const { data: roles } = await supabase.from("user_roles").select("user_id, role");
  return (profiles ?? []).map((p: any) => ({
    user_id: p.user_id,
    name: `${p.first_name ?? ""} ${p.last_name ?? ""}`.trim() || "Utilisateur",
    role: roles?.find((r: any) => r.user_id === p.user_id)?.role ?? null,
  }));
}

export async function uploadMessageAttachments(message_id: string, files: File[]) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Non authentifié");
  const uploaded: MessageAttachment[] = [];
  for (const file of files) {
    if (file.size > ATTACHMENT_MAX_BYTES) throw new Error(`"${file.name}" dépasse 10 Mo`);
    if (!ATTACHMENT_ALLOWED.includes(file.type)) throw new Error(`Type non autorisé : ${file.type || "inconnu"}`);
    const safeName = file.name.replace(/[^\w.\-]+/g, "_");
    const path = `${message_id}/${crypto.randomUUID()}-${safeName}`;
    const up = await supabase.storage.from(ATTACHMENT_BUCKET).upload(path, file, { contentType: file.type, upsert: false });
    if (up.error) throw up.error;
    const { data, error } = await supabase.from("message_attachments").insert({
      message_id, uploader_id: user.id, storage_path: path, file_name: file.name, mime_type: file.type, size_bytes: file.size,
    }).select().single();
    if (error) {
      await supabase.storage.from(ATTACHMENT_BUCKET).remove([path]);
      throw error;
    }
    uploaded.push(data as MessageAttachment);
  }
  return uploaded;
}

export async function listAttachmentsForMessages(message_ids: string[]) {
  if (message_ids.length === 0) return [] as MessageAttachment[];
  const { data, error } = await supabase
    .from("message_attachments")
    .select("*")
    .in("message_id", message_ids)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data ?? []) as MessageAttachment[];
}

export async function getAttachmentUrl(storage_path: string, download = false) {
  const { data, error } = await supabase.storage
    .from(ATTACHMENT_BUCKET)
    .createSignedUrl(storage_path, 60 * 10, download ? { download: true } : undefined);
  if (error) throw error;
  return data.signedUrl;
}
