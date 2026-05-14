import AdminPageShell from "./AdminPageShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Pencil, Trash2 } from "lucide-react";

const students = [
  { id: 1, nom: "Lucas Petit", classe: "6ème A", parent: "M. Petit", moyenne: 14.2 },
  { id: 2, nom: "Emma Moreau", classe: "5ème B", parent: "Mme. Moreau", moyenne: 15.8 },
  { id: 3, nom: "Hugo Garcia", classe: "4ème A", parent: "M. Garcia", moyenne: 11.5 },
  { id: 4, nom: "Léa Roux", classe: "3ème C", parent: "Mme. Roux", moyenne: 16.1 },
  { id: 5, nom: "Noah Blanc", classe: "6ème B", parent: "M. Blanc", moyenne: 12.7 },
];

const AdminStudents = () => (
  <AdminPageShell
    title="Gestion des élèves"
    subtitle="Liste complète des élèves inscrits"
    actions={<Button className="gradient-primary text-primary-foreground"><Plus className="mr-2 h-4 w-4" /> Nouvel élève</Button>}
  >
    <div className="glass-card p-4 mb-4 flex items-center gap-3">
      <Search className="h-4 w-4 text-muted-foreground" />
      <Input placeholder="Rechercher un élève..." className="border-0 bg-transparent focus-visible:ring-0" />
    </div>
    <div className="glass-card overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-muted/40 text-left text-muted-foreground">
          <tr>
            <th className="px-4 py-3">Nom</th>
            <th className="px-4 py-3">Classe</th>
            <th className="px-4 py-3">Parent</th>
            <th className="px-4 py-3">Moyenne</th>
            <th className="px-4 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {students.map((s) => (
            <tr key={s.id} className="border-t border-border hover:bg-muted/30">
              <td className="px-4 py-3 font-medium text-foreground">{s.nom}</td>
              <td className="px-4 py-3">{s.classe}</td>
              <td className="px-4 py-3 text-muted-foreground">{s.parent}</td>
              <td className="px-4 py-3 font-semibold">{s.moyenne}/20</td>
              <td className="px-4 py-3">
                <div className="flex justify-end gap-2">
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

export default AdminStudents;
