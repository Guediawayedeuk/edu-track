import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import TeacherPageShell from "./TeacherPageShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Check, X, Clock, CalendarOff } from "lucide-react";
import { toast } from "sonner";
import { getMyTeacherId } from "@/lib/api/exams";
import { listClasses } from "@/lib/api/classes";
import { listAttendanceByClassDate, upsertAttendance, type AttendanceStatus } from "@/lib/api/attendance";
import { supabase } from "@/integrations/supabase/client";

type Row = { id: string; name: string; status: AttendanceStatus };

const TeacherAttendance = () => {
  const teacherQ = useQuery({ queryKey: ["my-teacher-id"], queryFn: getMyTeacherId });
  const teacherId = teacherQ.data ?? null;
  const classesQ = useQuery({ queryKey: ["classes"], queryFn: listClasses });

  const [classId, setClassId] = useState<string>("");
  const [date, setDate] = useState<string>(new Date().toISOString().slice(0, 10));

  const studentsQ = useQuery({
    queryKey: ["class-students", classId],
    queryFn: async () => {
      const { data: ss } = await supabase.from("students").select("id, user_id").eq("class_id", classId);
      const ids = (ss ?? []).map((s) => s.user_id);
      const { data: profs } = ids.length
        ? await supabase.from("profiles").select("id, first_name, last_name").in("id", ids)
        : { data: [] };
      return (ss ?? []).map((s) => {
        const p = profs?.find((x: any) => x.id === s.user_id);
        return { id: s.id, name: `${p?.first_name ?? ""} ${p?.last_name ?? ""}`.trim() || "Élève" };
      });
    },
    enabled: !!classId,
  });

  const existingQ = useQuery({
    queryKey: ["attendance", classId, date],
    queryFn: () => listAttendanceByClassDate(classId, date),
    enabled: !!classId && !!date,
  });

  const [rows, setRows] = useState<Row[]>([]);
  useEffect(() => {
    if (studentsQ.data) {
      setRows(studentsQ.data.map((s) => ({
        id: s.id,
        name: s.name,
        status: (existingQ.data?.find((a) => a.student_id === s.id)?.status as AttendanceStatus) ?? "present",
      })));
    }
  }, [studentsQ.data, existingQ.data]);

  const set = (id: string, status: AttendanceStatus) => setRows((p) => p.map((r) => (r.id === id ? { ...r, status } : r)));

  const save = async () => {
    if (!teacherId || !classId) return;
    try {
      await upsertAttendance(rows.map((r) => ({
        student_id: r.id, class_id: classId, subject_id: null, date, status: r.status, recorded_by: teacherId,
      })));
      toast.success("Présences enregistrées");
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const stats = useMemo(() => {
    const s = { present: 0, absent: 0, late: 0, excused: 0 };
    rows.forEach((r) => s[r.status]++);
    return s;
  }, [rows]);

  return (
    <TeacherPageShell
      title="Gestion des présences"
      subtitle="Faites l'appel de votre classe"
      actions={<Button onClick={save} disabled={!classId || !rows.length}>Enregistrer</Button>}
    >
      <Card className="glass-card mb-4">
        <CardContent className="pt-6 grid gap-3 sm:grid-cols-2">
          <div>
            <Label>Classe</Label>
            <Select value={classId} onValueChange={setClassId}>
              <SelectTrigger><SelectValue placeholder="Sélectionner" /></SelectTrigger>
              <SelectContent>{classesQ.data?.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div>
            <Label>Date</Label>
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
        </CardContent>
      </Card>

      {classId && (
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-lg">
              Liste d'appel — {stats.present}P / {stats.absent}A / {stats.late}R / {stats.excused}E
            </CardTitle>
          </CardHeader>
          <CardContent className="divide-y divide-border">
            {studentsQ.isLoading ? <Skeleton className="h-40" /> : rows.length === 0 ? (
              <p className="py-6 text-center text-muted-foreground">Aucun élève dans cette classe</p>
            ) : rows.map((s) => (
              <div key={s.id} className="flex items-center justify-between py-3">
                <p className="font-medium">{s.name}</p>
                <div className="flex gap-1">
                  <Button size="sm" variant={s.status === "present" ? "default" : "ghost"} onClick={() => set(s.id, "present")}><Check className="h-4 w-4" /></Button>
                  <Button size="sm" variant={s.status === "late" ? "default" : "ghost"} onClick={() => set(s.id, "late")}><Clock className="h-4 w-4" /></Button>
                  <Button size="sm" variant={s.status === "excused" ? "default" : "ghost"} onClick={() => set(s.id, "excused")}><CalendarOff className="h-4 w-4" /></Button>
                  <Button size="sm" variant={s.status === "absent" ? "destructive" : "ghost"} onClick={() => set(s.id, "absent")}><X className="h-4 w-4" /></Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </TeacherPageShell>
  );
};

export default TeacherAttendance;
