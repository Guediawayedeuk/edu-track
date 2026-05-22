import { supabase } from "@/integrations/supabase/client";

export type NotificationPrefs = {
  user_id: string;
  grade_enabled: boolean;
  attendance_enabled: boolean;
  payment_enabled: boolean;
  message_enabled: boolean;
  ai_enabled: boolean;
  quiet_hours_start: string | null;
  quiet_hours_end: string | null;
  paused_until: string | null;
};

const DEFAULTS: Omit<NotificationPrefs, "user_id"> = {
  grade_enabled: true,
  attendance_enabled: true,
  payment_enabled: true,
  message_enabled: true,
  ai_enabled: true,
  quiet_hours_start: null,
  quiet_hours_end: null,
  paused_until: null,
};

export async function getMyNotificationPrefs(): Promise<NotificationPrefs> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  const { data, error } = await supabase
    .from("user_notification_prefs" as any)
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();
  if (error) throw error;
  return { user_id: user.id, ...DEFAULTS, ...(data ?? {}) } as NotificationPrefs;
}

export async function updateNotificationPrefs(input: {
  grade?: boolean;
  attendance?: boolean;
  payment?: boolean;
  message?: boolean;
  ai?: boolean;
  quietStart?: string | null;
  quietEnd?: string | null;
  pausedUntil?: string | null;
  clearPause?: boolean;
  clearQuiet?: boolean;
}) {
  const { error } = await supabase.rpc("set_notification_pref" as any, {
    _grade: input.grade ?? null,
    _attendance: input.attendance ?? null,
    _payment: input.payment ?? null,
    _message: input.message ?? null,
    _ai: input.ai ?? null,
    _quiet_start: input.quietStart ?? null,
    _quiet_end: input.quietEnd ?? null,
    _paused_until: input.pausedUntil ?? null,
    _clear_pause: input.clearPause ?? false,
    _clear_quiet: input.clearQuiet ?? false,
  });
  if (error) throw error;
}
