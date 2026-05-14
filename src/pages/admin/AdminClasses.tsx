import AdminPageShell from "./AdminPageShell";
import { Button } from "@/components/ui/button";
import { Plus, Users } from "lucide-react";

const classes = [
  { nom: "6ème A", niveau: "6ème", eleves: 28, prof: "Mme. Dupont" },
  { nom: "6ème B", niveau: "6ème", eleves: 26, prof: "M. Martin" },
  { nom: "5ème A", niveau: "5ème", eleves: 30, prof: "Mme. Leroy" },
  { nom: "4ème A", niveau: "4ème", eleves: 27, prof: "M. Bernard" },
  { nom: "3ème C", niveau: "3ème", eleves: 25, prof: "Mme. Dupont" },
];

const AdminClasses = () => (
  <AdminPageShell
    title="Gestion des classes"
    subtitle="Composition et professeurs principaux"
    actions={<Button className="gradient-primary text-primary-foreground"><Plus className="mr-2 h-4 w-4" /> Nouvelle classe</Button>}
  >
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {classes.map((c) => (
        <div key={c.nom} className="glass-card p-5">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className="text-lg font-bold text-foreground">{c.nom}</h3>
              <p className="text-xs text-muted-foreground">Niveau {c.niveau}</p>
            </div>
            <span className="rounded-full bg-secondary/15 px-3 py-1 text-xs font-medium text-secondary">{c.eleves} élèves</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="h-4 w-4" /> Prof. principal : {c.prof}
          </div>
        </div>
      ))}
    </div>
  </AdminPageShell>
);

export default AdminClasses;
