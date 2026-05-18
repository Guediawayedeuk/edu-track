import { supabase } from "@/integrations/supabase/client";

export type AttendanceStatus = "present" | "absent" | "late" | "excused";
export type AttendanceRow = {
  id: string;
  student_id: string;
  class_id: string | null;
  subject_id: string | null;
  date: string;
  status: AttendanceStatus;
  note: string | null;
  recorded_by: string | null;
};

export async function listAttendanceByClassDate(class_id: string, date: string) {
  const { data, error } = await supabase
    .from("attendance")
    .select("*")
    .eq("class_id", class_id)
    .eq("date", date);
  if (error) throw error;
  return (data ?? []) as AttendanceRow[];
}

export async function listAttendanceByStudent(student_id: string) {
  const { data, error } = await supabase
    .from("attendance")
    .select("*")
    .eq("student_id", student_id)
    .order("date", { ascending: false });
  if (error) throw error;
  return (data ?? []) as AttendanceRow[];
}

export async function upsertAttendance(
  rows: Array<Omit<AttendanceRow, "id" | "note"> & { note?: string | null }>,
) {
  if (!rows.length) return;
  // Manual upsert: delete existing for (student_id, date, subject_id), then insert
  for (const r of rows) {
    await supabase
      .from("attendance")
      .delete()
      .match({
        student_id: r.student_id,
        date: r.date,
        ...(r.subject_id ? { subject_id: r.subject_id } : {}),
      });
  }
  const { error } = await supabase.from("attendance").insert(rows);
  if (error) throw error;
}

export async function attendanceStats(student_id: string) {
  const rows = await listAttendanceByStudent(student_id);
  const stats = { present: 0, absent: 0, late: 0, excused: 0 };
  rows.forEach((r) => { stats[r.status]++; });
  return stats;
}

export async function attendanceSummaryByClass(date: string) {
  const { data, error } = await supabase.from("attendance").select("class_id, status").eq("date", date);
  if (error) throw error;
  const map = new Map<string, { present: number; absent: number; late: number; excused: number }>();
  (data ?? []).forEach((r: any) => {
    const k = r.class_id ?? "none";
    if (!map.has(k)) map.set(k, { present: 0, absent: 0, late: 0, excused: 0 });
    map.get(k)![r.status as AttendanceStatus]++;
  });
  return map;
}
