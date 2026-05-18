import { supabase } from "@/integrations/supabase/client";
import { listGradesByStudent } from "./grades";
import { attendanceStats } from "./attendance";

export type BulletinSubject = {
  subject: string;
  color: string | null;
  average: number;
  count: number;
};

export type BulletinData = {
  student: { id: string; first_name: string; last_name: string; class_name: string };
  subjects: BulletinSubject[];
  overallAverage: number;
  attendance: { present: number; absent: number; late: number; excused: number };
  period: string;
};

export async function getBulletinData(student_id: string, period = "Trimestre en cours"): Promise<BulletinData> {
  const { data: s, error } = await supabase
    .from("students")
    .select("id, user_id, class_name")
    .eq("id", student_id)
    .maybeSingle();
  if (error || !s) throw new Error("Élève introuvable");

  const { data: prof } = await supabase
    .from("profiles")
    .select("first_name, last_name")
    .eq("id", s.user_id)
    .maybeSingle();

  const grades = await listGradesByStudent(student_id);
  const attendance = await attendanceStats(student_id);

  const bySubject = new Map<string, { color: string | null; sum: number; weight: number; count: number }>();
  grades.forEach((g: any) => {
    const subj = g.exam?.subject;
    const max = Number(g.exam?.max_grade ?? 20);
    const scaled = (Number(g.value) / max) * 20;
    const key = subj?.name ?? "Autre";
    const cur = bySubject.get(key) ?? { color: subj?.color ?? null, sum: 0, weight: 0, count: 0 };
    cur.sum += scaled;
    cur.weight += 1;
    cur.count += 1;
    bySubject.set(key, cur);
  });

  const subjects: BulletinSubject[] = Array.from(bySubject.entries()).map(([name, v]) => ({
    subject: name,
    color: v.color,
    average: v.weight ? v.sum / v.weight : 0,
    count: v.count,
  }));
  const overallAverage = subjects.length ? subjects.reduce((a, b) => a + b.average, 0) / subjects.length : 0;

  return {
    student: {
      id: s.id,
      first_name: prof?.first_name ?? "",
      last_name: prof?.last_name ?? "",
      class_name: s.class_name,
    },
    subjects,
    overallAverage,
    attendance,
    period,
  };
}

export async function generateBulletinPDF(data: BulletinData) {
  const { default: jsPDF } = await import("jspdf");
  const autoTable = (await import("jspdf-autotable")).default;
  const doc = new jsPDF();

  doc.setFontSize(18);
  doc.text("Bulletin Scolaire", 14, 20);
  doc.setFontSize(11);
  doc.text(`Élève : ${data.student.first_name} ${data.student.last_name}`, 14, 30);
  doc.text(`Classe : ${data.student.class_name}`, 14, 36);
  doc.text(`Période : ${data.period}`, 14, 42);

  autoTable(doc, {
    startY: 50,
    head: [["Matière", "Moyenne /20", "Évaluations"]],
    body: data.subjects.map((s) => [s.subject, s.average.toFixed(2), String(s.count)]),
    headStyles: { fillColor: [99, 102, 241] },
  });

  const afterTableY = (doc as any).lastAutoTable?.finalY ?? 60;
  doc.setFontSize(13);
  doc.text(`Moyenne générale : ${data.overallAverage.toFixed(2)} / 20`, 14, afterTableY + 12);

  doc.setFontSize(11);
  doc.text("Assiduité", 14, afterTableY + 24);
  autoTable(doc, {
    startY: afterTableY + 28,
    head: [["Présences", "Absences", "Retards", "Excusés"]],
    body: [[data.attendance.present, data.attendance.absent, data.attendance.late, data.attendance.excused]],
    headStyles: { fillColor: [99, 102, 241] },
  });

  doc.save(`bulletin-${data.student.last_name}-${data.student.first_name}.pdf`);
}
