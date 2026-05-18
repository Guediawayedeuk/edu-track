import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import TeacherPageShell from "./TeacherPageShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { getMyTeacherId, listExams } from "@/lib/api/exams";
import { listGradesByExam, upsertGrades } from "@/lib/api/grades";
import { supabase } from "@/integrations/supabase/client";

type Student = { id: string; user_id: string; first_name: string; last_name: string };

const TeacherGrades = () => {
  const teacherQ = useQuery({ queryKey: ["my-teacher-id"], queryFn: getMyTeacherId });
  const teacherId = teacherQ.data ?? null;

  const examsQ = useQuery({
    queryKey: ["teacher-exams", teacherId],
    queryFn: () => listExams({ teacher_id: teacherId! }),
    enabled: !!teacherId,
  });

  const [examId, setExamId] = useState<string>("");
  const exam = useMemo(() => examsQ.data?.find((e) => e.id === examId) ?? null, [examsQ.data, examId]);

  const studentsQ = useQuery({
    queryKey: ["class-students", exam?.class_id],
    queryFn: async (): Promise<Student[]> => {
      const { data: ss, error } = await supabase.from("students").select("id, user_id").eq("class_id", exam!.class_id);
      if (error) throw error;
      const ids = (ss ?? []).map((s) => s.user_id);
      if (!ids.length) return [];
      const { data: profs } = await supabase.from("profiles").select("id, first_name, last_name").in("id", ids);
      return (ss ?? []).map((s) => ({
        id: s.id,
        user_id: s.user_id,
        first_name: profs?.find((p) => p.id === s.user_id)?.first_name ?? "",
        last_name: profs?.find((p) => p.id === s.user_id)?.last_name ?? "",
      }));
    },
    enabled: !!exam,
  });

  const gradesQ = useQuery({
    queryKey: ["grades", examId],
    queryFn: () => listGradesByExam(examId),
    enabled: !!examId,
  });

  const [values, setValues] = useState<Record<string, string>>({});
  useEffect(() => {
    if (gradesQ.data && studentsQ.data) {
      const init: Record<string, string> = {};
      studentsQ.data.forEach((s) => {
        const g = gradesQ.data.find((x) => x.student_id === s.id);
        init[s.id] = g ? String(g.value) : "";
      });
      setValues(init);
    }
  }, [gradesQ.data, studentsQ.data]);

  const save = async () => {
    if (!exam || !teacherId) return;
    const rows = Object.entries(values)
      .filter(([, v]) => v !== "")
      .map(([student_id, v]) => ({ exam_id: exam.id, student_id, value: Number(v), graded_by: teacherId }));
    try {
      await upsertGrades(rows);
      toast.success("Notes enregistrées");
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  return (
    <TeacherPageShell
      title="Gestion des notes"
      subtitle="Sélectionnez un examen et saisissez les notes"
      actions={<Button onClick={save} disabled={!exam}>Enregistrer</Button>}
    >
      <Card className="glass-card mb-4">
        <CardContent className="pt-6 grid gap-3 sm:grid-cols-2">
          <div>
            <Label>Examen</Label>
            <Select value={examId} onValueChange={setExamId}>
              <SelectTrigger><SelectValue placeholder="Sélectionner un examen" /></SelectTrigger>
              <SelectContent>
                {examsQ.data?.map((e) => (
                  <SelectItem key={e.id} value={e.id}>{e.title} — {e.class?.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {exam && <div className="flex items-end text-sm text-muted-foreground">Note max : {exam.max_grade}</div>}
        </CardContent>
      </Card>

      {exam && (
        <Card className="glass-card">
          <CardHeader><CardTitle className="text-lg">Élèves de {exam.class?.name}</CardTitle></CardHeader>
          <CardContent className="divide-y divide-border">
            {studentsQ.isLoading ? (
              <Skeleton className="h-32" />
            ) : (studentsQ.data ?? []).length === 0 ? (
              <p className="py-6 text-center text-muted-foreground">Aucun élève dans cette classe</p>
            ) : (
              studentsQ.data!.map((s) => (
                <div key={s.id} className="flex items-center justify-between gap-4 py-3">
                  <p className="font-medium">{s.first_name} {s.last_name}</p>
                  <Input
                    type="number" min={0} max={exam.max_grade} step={0.25} placeholder="—"
                    value={values[s.id] ?? ""}
                    onChange={(e) => setValues((p) => ({ ...p, [s.id]: e.target.value }))}
                    className="w-24 text-right"
                  />
                </div>
              ))
            )}
          </CardContent>
        </Card>
      )}
    </TeacherPageShell>
  );
};

export default TeacherGrades;
