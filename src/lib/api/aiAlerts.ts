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
};

export async function listAlertsForStudent(student_id: string) {
  const { data, error } = await supabase
    .from("ai_alerts")
    .select("*")
    .eq("student_id", student_id)
    .order("generated_at", { ascending: false })
    .limit(10);
  if (error) throw error;
  return (data ?? []) as AIAlert[];
}

export async function requestAIAnalysis(student_id: string) {
  const { data, error } = await supabase.functions.invoke("ai-student-analysis", {
    body: { student_id },
  });
  if (error) throw error;
  return data;
}
