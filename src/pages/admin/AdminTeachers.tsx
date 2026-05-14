import AdminPageShell from "./AdminPageShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Pencil, Trash2, Mail } from "lucide-react";

const teachers = [
  { id: 1, nom: "Mme. Dupont", matiere: "Mathématiques", email: "dupont@edutrack.fr", classes: 4 },
  { id: 2, nom: "M. Martin", matiere: "Français", email: "martin@edutrack.fr", classes: 5 },
  { id: 3, nom: "Mme. Leroy", matiere: "Histoire-Géo", email: "leroy@edutrack.fr", classes: 6 },
  { id: 4, nom: "M. Bernard", matiere: "Sciences", email: "bernard@edutrack.fr", classes: 3 },
];

const AdminTeachers = () => (
  <AdminPageShell
    title="Gestion des enseignants"
    subtitle="Ajouter, modifier ou supprimer le personnel enseignant"
    actions={
      <Button className="gradient-primary text-primary-foreground">
        <Plus className="mr-2 h-4 w-4" /> Nouvel enseignant
      </Button>
    }
  >
    <div className="glass-card p-4 mb-4 flex items-center gap-3">
      <Search className="h-4 w-4 text-muted-foreground" />
      <Input placeholder="Rechercher un enseignant..." className="border-0 bg-transparent focus-visible:ring-0" />
    </div>
    <div className="glass-card overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-muted/40 text-left text-muted-foreground">
          <tr>
            <th className="px-4 py-3">Nom</th>
            <th className="px-4 py-3">Matière</th>
            <th className="px-4 py-3">Email</th>
            <th className="px-4 py-3">Classes</th>
            <th className="px-4 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {teachers.map((t) => (
            <tr key={t.id} className="border-t border-border hover:bg-muted/30">
              <td className="px-4 py-3 font-medium text-foreground">{t.nom}</td>
              <td className="px-4 py-3">{t.matiere}</td>
              <td className="px-4 py-3 text-muted-foreground">{t.email}</td>
              <td className="px-4 py-3">{t.classes}</td>
              <td className="px-4 py-3">
                <div className="flex justify-end gap-2">
                  <Button size="icon" variant="ghost"><Mail className="h-4 w-4" /></Button>
                  <Button size="icon" variant="ghost"><Pencil className="h-4 w-4" /></Button>
                  <Button size="icon" variant="ghost"><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </AdminPageShell>
);

export default AdminTeachers;
