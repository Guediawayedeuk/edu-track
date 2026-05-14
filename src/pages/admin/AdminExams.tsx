import AdminPageShell from "./AdminPageShell";
import { Button } from "@/components/ui/button";
import { Plus, FileText } from "lucide-react";

const exams = [
  { titre: "Brevet blanc - Maths", date: "12 juin 2026", classe: "3ème", statut: "Planifié" },
  { titre: "Composition Français", date: "20 juin 2026", classe: "5ème", statut: "Notes saisies" },
  { titre: "Sciences - Trimestre 3", date: "25 juin 2026", classe: "4ème", statut: "Planifié" },
];

const AdminExams = () => (
  <AdminPageShell
    title="Examens et notes"
    subtitle="Calendrier des évaluations et suivi des notes"
    actions={<Button className="gradient-primary text-primary-foreground"><Plus className="mr-2 h-4 w-4" /> Nouvel examen</Button>}
  >
    <div className="grid gap-3">
      {exams.map((e) => (
        <div key={e.titre} className="glass-card p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg gradient-primary text-primary-foreground">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">{e.titre}</h3>
              <p className="text-xs text-muted-foreground">{e.classe} · {e.date}</p>
            </div>
          </div>
          <span className="rounded-full bg-secondary/15 px-3 py-1 text-xs text-secondary">{e.statut}</span>
        </div>
      ))}
    </div>
  </AdminPageShell>
);

export default AdminExams;
