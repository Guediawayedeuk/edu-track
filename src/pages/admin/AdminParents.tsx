import AdminPageShell from "./AdminPageShell";
import { Button } from "@/components/ui/button";
import { Plus, Mail, Phone } from "lucide-react";

const parents = [
  { id: 1, nom: "M. Petit", email: "petit@mail.fr", tel: "06 12 34 56 78", enfants: ["Lucas Petit"] },
  { id: 2, nom: "Mme. Moreau", email: "moreau@mail.fr", tel: "06 23 45 67 89", enfants: ["Emma Moreau", "Tom Moreau"] },
  { id: 3, nom: "M. Garcia", email: "garcia@mail.fr", tel: "06 34 56 78 90", enfants: ["Hugo Garcia"] },
];

const AdminParents = () => (
  <AdminPageShell
    title="Gestion des parents"
    subtitle="Comptes parents et liens familiaux"
    actions={<Button className="gradient-primary text-primary-foreground"><Plus className="mr-2 h-4 w-4" /> Nouveau parent</Button>}
  >
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {parents.map((p) => (
        <div key={p.id} className="glass-card p-5 space-y-3">
          <div>
            <h3 className="font-semibold text-foreground">{p.nom}</h3>
            <p className="text-xs text-muted-foreground">{p.enfants.length} enfant(s) inscrit(s)</p>
          </div>
          <div className="space-y-1.5 text-sm text-muted-foreground">
            <div className="flex items-center gap-2"><Mail className="h-4 w-4" /> {p.email}</div>
            <div className="flex items-center gap-2"><Phone className="h-4 w-4" /> {p.tel}</div>
          </div>
          <div className="flex flex-wrap gap-2 pt-2 border-t border-border">
            {p.enfants.map((e) => (
              <span key={e} className="rounded-full bg-primary/10 px-3 py-1 text-xs text-primary">{e}</span>
            ))}
          </div>
        </div>
      ))}
    </div>
  </AdminPageShell>
);

export default AdminParents;
