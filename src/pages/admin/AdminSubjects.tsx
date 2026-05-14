import AdminPageShell from "./AdminPageShell";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

const subjects = [
  { nom: "Mathématiques", coef: 4, profs: 3, color: "from-blue-500 to-indigo-500" },
  { nom: "Français", coef: 4, profs: 3, color: "from-rose-500 to-pink-500" },
  { nom: "Histoire-Géo", coef: 3, profs: 2, color: "from-amber-500 to-orange-500" },
  { nom: "Sciences", coef: 3, profs: 4, color: "from-emerald-500 to-teal-500" },
  { nom: "Anglais", coef: 3, profs: 2, color: "from-violet-500 to-purple-500" },
  { nom: "EPS", coef: 1, profs: 2, color: "from-cyan-500 to-sky-500" },
];

const AdminSubjects = () => (
  <AdminPageShell
    title="Gestion des matières"
    subtitle="Coefficients et enseignants assignés"
    actions={<Button className="gradient-primary text-primary-foreground"><Plus className="mr-2 h-4 w-4" /> Nouvelle matière</Button>}
  >
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {subjects.map((s) => (
        <div key={s.nom} className="glass-card overflow-hidden">
          <div className={`h-2 bg-gradient-to-r ${s.color}`} />
          <div className="p-5">
            <h3 className="font-bold text-foreground">{s.nom}</h3>
            <div className="mt-3 flex gap-4 text-sm text-muted-foreground">
              <span>Coef. <strong className="text-foreground">{s.coef}</strong></span>
              <span>{s.profs} enseignants</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  </AdminPageShell>
);

export default AdminSubjects;
