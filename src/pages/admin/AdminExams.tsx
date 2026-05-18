import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import AdminPageShell from "./AdminPageShell";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { FileText, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { deleteExam, listExams } from "@/lib/api/exams";

const AdminExams = () => {
  const qc = useQueryClient();
  const examsQ = useQuery({ queryKey: ["admin-exams"], queryFn: () => listExams() });
  const delM = useMutation({
    mutationFn: deleteExam,
    onSuccess: () => { toast.success("Supprimé"); qc.invalidateQueries({ queryKey: ["admin-exams"] }); },
  });

  return (
    <AdminPageShell title="Examens et notes" subtitle="Vue globale des évaluations">
      {examsQ.isLoading ? <Skeleton className="h-40" /> : (examsQ.data ?? []).length === 0 ? (
        <div className="glass-card p-12 text-center text-muted-foreground">Aucun examen</div>
      ) : (
        <div className="grid gap-3">
          {examsQ.data!.map((e) => (
            <div key={e.id} className="glass-card p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg gradient-primary text-primary-foreground"><FileText className="h-5 w-5" /></div>
                <div>
                  <h3 className="font-semibold text-foreground">{e.title}</h3>
                  <p className="text-xs text-muted-foreground">{e.class?.name} {e.subject ? `· ${e.subject.name}` : ""} · {new Date(e.exam_date).toLocaleDateString("fr-FR")}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="rounded-full bg-secondary/15 px-3 py-1 text-xs text-secondary capitalize">{e.status}</span>
                <Button variant="ghost" size="icon" onClick={() => delM.mutate(e.id)}><Trash2 className="h-4 w-4" /></Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </AdminPageShell>
  );
};

export default AdminExams;
