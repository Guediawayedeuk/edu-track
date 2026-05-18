import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import TeacherPageShell from "./TeacherPageShell";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, FileText, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { createExam, deleteExam, getMyTeacherId, listExams, type ExamRow } from "@/lib/api/exams";
import { listClasses } from "@/lib/api/classes";
import { listSubjects } from "@/lib/api/subjects";

const TeacherExams = () => {
  const qc = useQueryClient();
  const teacherQ = useQuery({ queryKey: ["my-teacher-id"], queryFn: getMyTeacherId });
  const teacherId = teacherQ.data ?? null;

  const examsQ = useQuery({
    queryKey: ["teacher-exams", teacherId],
    queryFn: () => listExams({ teacher_id: teacherId! }),
    enabled: !!teacherId,
  });
  const classesQ = useQuery({ queryKey: ["classes"], queryFn: listClasses });
  const subjectsQ = useQuery({ queryKey: ["subjects"], queryFn: listSubjects });

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: "", class_id: "", subject_id: "", exam_date: "", duration_minutes: 60, max_grade: 20 });

  const createM = useMutation({
    mutationFn: async () => {
      if (!teacherId) throw new Error("Profil enseignant introuvable");
      await createExam({ ...form, teacher_id: teacherId, status: "planned", subject_id: form.subject_id || null });
    },
    onSuccess: () => {
      toast.success("Examen créé");
      qc.invalidateQueries({ queryKey: ["teacher-exams"] });
      setOpen(false);
      setForm({ title: "", class_id: "", subject_id: "", exam_date: "", duration_minutes: 60, max_grade: 20 });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const delM = useMutation({
    mutationFn: deleteExam,
    onSuccess: () => { toast.success("Supprimé"); qc.invalidateQueries({ queryKey: ["teacher-exams"] }); },
  });

  return (
    <TeacherPageShell
      title="Examens"
      subtitle="Créez et gérez vos évaluations"
      actions={
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button><Plus className="h-4 w-4" /> Nouvel examen</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Nouvel examen</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label>Titre</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
              <div><Label>Classe</Label>
                <Select value={form.class_id} onValueChange={(v) => setForm({ ...form, class_id: v })}>
                  <SelectTrigger><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                  <SelectContent>{classesQ.data?.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Matière</Label>
                <Select value={form.subject_id} onValueChange={(v) => setForm({ ...form, subject_id: v })}>
                  <SelectTrigger><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                  <SelectContent>{subjectsQ.data?.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div><Label>Date</Label><Input type="date" value={form.exam_date} onChange={(e) => setForm({ ...form, exam_date: e.target.value })} /></div>
                <div><Label>Durée (min)</Label><Input type="number" value={form.duration_minutes} onChange={(e) => setForm({ ...form, duration_minutes: +e.target.value })} /></div>
                <div><Label>Note max</Label><Input type="number" value={form.max_grade} onChange={(e) => setForm({ ...form, max_grade: +e.target.value })} /></div>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={() => createM.mutate()} disabled={!form.title || !form.class_id || !form.exam_date || createM.isPending}>Créer</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      }
    >
      {examsQ.isLoading ? (
        <div className="grid gap-4 md:grid-cols-2"><Skeleton className="h-32" /><Skeleton className="h-32" /></div>
      ) : (examsQ.data ?? []).length === 0 ? (
        <Card className="glass-card"><CardContent className="py-12 text-center text-muted-foreground">Aucun examen pour le moment</CardContent></Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {examsQ.data!.map((e) => (
            <Card key={e.id} className="glass-card">
              <CardHeader>
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary text-secondary-foreground"><FileText className="h-5 w-5" /></div>
                  <div className="flex-1">
                    <CardTitle className="text-lg">{e.title}</CardTitle>
                    <CardDescription>{e.class?.name} {e.subject ? `· ${e.subject.name}` : ""}</CardDescription>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => delM.mutate(e.id)}><Trash2 className="h-4 w-4" /></Button>
                </div>
              </CardHeader>
              <CardContent className="grid grid-cols-3 gap-2 text-sm">
                <div><p className="text-muted-foreground">Date</p><p className="font-semibold">{new Date(e.exam_date).toLocaleDateString("fr-FR")}</p></div>
                <div><p className="text-muted-foreground">Durée</p><p className="font-semibold">{e.duration_minutes} min</p></div>
                <div><p className="text-muted-foreground">Statut</p><p className="font-semibold text-primary capitalize">{e.status}</p></div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </TeacherPageShell>
  );
};

export default TeacherExams;
