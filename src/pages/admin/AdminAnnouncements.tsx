import AdminPageShell from "./AdminPageShell";
import { Button } from "@/components/ui/button";
import { Plus, Megaphone } from "lucide-react";

const announcements = [
  { titre: "Réunion parents-profs", date: "15 juin 2026", cible: "Tous", contenu: "La réunion se tiendra de 17h à 20h dans le préau." },
  { titre: "Sortie scolaire annulée", date: "10 juin 2026", cible: "5ème B", contenu: "La sortie au musée du Louvre est reportée." },
  { titre: "Inscriptions 2026-27", date: "05 juin 2026", cible: "Parents", contenu: "Les inscriptions ouvrent le 1er juillet sur le portail." },
];

const AdminAnnouncements = () => (
  <AdminPageShell
    title="Gestion des annonces"
    subtitle="Communications officielles de l'établissement"
    actions={<Button className="gradient-primary text-primary-foreground"><Plus className="mr-2 h-4 w-4" /> Nouvelle annonce</Button>}
  >
    <div className="grid gap-3">
      {announcements.map((a) => (
        <div key={a.titre} className="glass-card p-5">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg gradient-accent text-secondary-foreground">
              <Megaphone className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-semibold text-foreground">{a.titre}</h3>
                <span className="text-xs text-muted-foreground">{a.date}</span>
              </div>
              <p className="text-sm text-muted-foreground mb-2">{a.contenu}</p>
              <span className="rounded-full bg-primary/10 px-3 py-1 text-xs text-primary">Cible : {a.cible}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  </AdminPageShell>
);

export default AdminAnnouncements;
