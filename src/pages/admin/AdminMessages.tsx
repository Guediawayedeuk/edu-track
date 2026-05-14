import AdminPageShell from "./AdminPageShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send } from "lucide-react";

const threads = [
  { nom: "Mme. Dupont", last: "Bonjour, à propos du conseil de classe...", unread: 2 },
  { nom: "M. Martin", last: "Merci pour les bulletins.", unread: 0 },
  { nom: "Mme. Leroy", last: "Une question sur l'emploi du temps.", unread: 1 },
];

const AdminMessages = () => (
  <AdminPageShell title="Messagerie interne" subtitle="Communications avec le personnel">
    <div className="glass-card grid grid-cols-1 md:grid-cols-3 overflow-hidden h-[560px]">
      <div className="border-r border-border overflow-y-auto">
        {threads.map((t, i) => (
          <div key={t.nom} className={`p-4 border-b border-border cursor-pointer hover:bg-muted/30 ${i === 0 ? "bg-muted/40" : ""}`}>
            <div className="flex justify-between items-center mb-1">
              <h4 className="font-semibold text-foreground">{t.nom}</h4>
              {t.unread > 0 && <span className="rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">{t.unread}</span>}
            </div>
            <p className="text-sm text-muted-foreground truncate">{t.last}</p>
          </div>
        ))}
      </div>
      <div className="md:col-span-2 flex flex-col">
        <div className="flex-1 p-4 space-y-3 overflow-y-auto">
          <div className="max-w-[70%] rounded-2xl rounded-tl-sm bg-muted p-3 text-sm">Bonjour, à propos du conseil de classe de jeudi...</div>
          <div className="ml-auto max-w-[70%] rounded-2xl rounded-tr-sm gradient-primary p-3 text-sm text-primary-foreground">Bonjour, oui je confirme 18h en salle B12.</div>
        </div>
        <div className="border-t border-border p-3 flex gap-2">
          <Input placeholder="Écrire un message..." />
          <Button className="gradient-primary text-primary-foreground"><Send className="h-4 w-4" /></Button>
        </div>
      </div>
    </div>
  </AdminPageShell>
);

export default AdminMessages;
