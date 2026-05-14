import AdminPageShell from "./AdminPageShell";
import { Button } from "@/components/ui/button";
import { Upload, FileText, Download } from "lucide-react";

const docs = [
  { nom: "Règlement intérieur 2026.pdf", taille: "1.2 MB", date: "01/09/2026" },
  { nom: "Liste fournitures 6ème.pdf", taille: "340 KB", date: "15/08/2026" },
  { nom: "Calendrier scolaire.pdf", taille: "210 KB", date: "10/08/2026" },
  { nom: "Charte numérique.pdf", taille: "560 KB", date: "01/09/2026" },
];

const AdminDocuments = () => (
  <AdminPageShell
    title="Gestion des documents"
    subtitle="Bibliothèque administrative"
    actions={<Button className="gradient-primary text-primary-foreground"><Upload className="mr-2 h-4 w-4" /> Téléverser</Button>}
  >
    <div className="grid gap-3 md:grid-cols-2">
      {docs.map((d) => (
        <div key={d.nom} className="glass-card p-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <FileText className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-foreground truncate">{d.nom}</p>
            <p className="text-xs text-muted-foreground">{d.taille} · {d.date}</p>
          </div>
          <Button size="icon" variant="ghost"><Download className="h-4 w-4" /></Button>
        </div>
      ))}
    </div>
  </AdminPageShell>
);

export default AdminDocuments;
