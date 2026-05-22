import { supabase } from "@/integrations/supabase/client";

export type AIAlert = {
  id: string;
  student_id: string;
  severity: "info" | "warning" | "critical";
  summary: string;
  recommendations: Array<{ title: string; description: string }>;
  current_average: number | null;
  predicted_average: number | null;
  trend: "up" | "stable" | "down" | null;
  generated_at: string;
  handled_at: string | null;
  handled_by: string | null;
  recommendations_state: Record<string, boolean>;
};

export async function listAlertsForStudent(student_id: string) {
  const { data, error } = await supabase
    .from("ai_alerts")
    .select("*")
    .eq("student_id", student_id)
    .order("generated_at", { ascending: false })
    .limit(20);
  if (error) throw error;
  return (data ?? []) as unknown as AIAlert[];
}

export async function requestAIAnalysis(student_id: string) {
  const { data, error } = await supabase.functions.invoke("ai-student-analysis", {
    body: { student_id },
  });
  if (error) throw error;
  return data;
}

export async function markAlertHandled(alert_id: string, handled = true) {
  const { error } = await supabase.rpc("mark_alert_handled" as any, {
    _alert_id: alert_id,
    _handled: handled,
  });
  if (error) throw error;
}

export async function toggleAlertRecommendation(alert_id: string, key: string, done: boolean) {
  const { error } = await supabase.rpc("toggle_alert_recommendation" as any, {
    _alert_id: alert_id,
    _key: key,
    _done: done,
  });
  if (error) throw error;
}
