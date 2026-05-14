import AdminPageShell from "./AdminPageShell";
import { Button } from "@/components/ui/button";
import { Plus, Shield } from "lucide-react";

const roles = [
  { nom: "Super Administrateur", users: 1, perms: ["Tous accès", "Gestion roles", "Sécurité"] },
  { nom: "Administrateur", users: 3, perms: ["Utilisateurs", "Classes", "Paiements"] },
  { nom: "Enseignant", users: 32, perms: ["Notes", "Présences", "Devoirs"] },
  { nom: "Parent / Élève", users: 487, perms: ["Lecture seule"] },
];

const AdminRoles = () => (
  <AdminPageShell
    title="Rôles et permissions"
    subtitle="Contrôle granulaire des accès"
    actions={<Button className="gradient-primary text-primary-foreground"><Plus className="mr-2 h-4 w-4" /> Nouveau rôle</Button>}
  >
    <div className="grid gap-4 md:grid-cols-2">
      {roles.map((r) => (
        <div key={r.nom} className="glass-card p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg gradient-primary text-primary-foreground">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-foreground">{r.nom}</h3>
              <p className="text-xs text-muted-foreground">{r.users} utilisateur(s)</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {r.perms.map((p) => (
              <span key={p} className="rounded-full bg-secondary/15 px-3 py-1 text-xs text-secondary">{p}</span>
            ))}
          </div>
        </div>
      ))}
    </div>
  </AdminPageShell>
);

export default AdminRoles;
